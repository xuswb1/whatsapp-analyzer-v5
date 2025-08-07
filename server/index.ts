import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { setupStaticServing } from './static-serve.js';
import { db } from './database.js';
import { parseWhatsAppChat, mergeChatAnalyses } from './chat-parser.js';
import { randomUUID } from 'crypto';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload setup - allow multiple files
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  }
});

// Upload and analyze chat endpoint - support multiple files
app.post('/api/upload-chat', upload.array('chatFiles', 10), async (req, res) => {
  try {
    console.log('Received file upload request');
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const files = req.files as Express.Multer.File[];
    console.log(`Processing ${files.length} files`);
    
    const chatAnalyses = [];
    const fileNames = [];
    
    // Process each ZIP file
    for (const file of files) {
      console.log(`Processing file: ${file.originalname}`);
      
      // Extract ZIP file
      const zip = new AdmZip(file.buffer);
      const entries = zip.getEntries();
      
      // Find chat.txt file
      const chatEntry = entries.find(entry => 
        entry.entryName.toLowerCase().includes('chat') && 
        entry.entryName.endsWith('.txt')
      );
      
      if (!chatEntry) {
        console.warn(`No chat.txt file found in ${file.originalname}`);
        continue;
      }
      
      console.log(`Found chat file: ${chatEntry.entryName}`);
      
      const chatContent = chatEntry.getData().toString('utf8');
      
      // Parse chat content
      const analysis = parseWhatsAppChat(chatContent);
      chatAnalyses.push(analysis);
      fileNames.push(file.originalname);
    }
    
    if (chatAnalyses.length === 0) {
      return res.status(400).json({ error: 'No valid chat files found in uploaded ZIP files' });
    }
    
    // Merge analyses if multiple files
    const finalAnalysis = chatAnalyses.length === 1 
      ? chatAnalyses[0] 
      : mergeChatAnalyses(chatAnalyses);
    
    console.log('Chat analysis completed');
    
    // Generate session ID
    const sessionId = randomUUID();
    
    // Save to database
    await db.insertInto('chat_analyses').values({
      session_id: sessionId,
      file_name: fileNames.join(', '),
      total_messages: finalAnalysis.totalMessages,
      participants: JSON.stringify(finalAnalysis.participants),
      message_stats: JSON.stringify(finalAnalysis.messagesByPerson),
      emoji_stats: JSON.stringify(finalAnalysis.emojiStats),
      time_stats: JSON.stringify(finalAnalysis.timeStats),
      insights: JSON.stringify({
        ...finalAnalysis.insights,
        isMultiFile: chatAnalyses.length > 1,
        fileCount: chatAnalyses.length
      })
    }).execute();
    
    console.log(`Saved analysis with session ID: ${sessionId}`);
    
    res.json({ 
      sessionId,
      fileCount: chatAnalyses.length,
      message: `Chat analysis completed successfully for ${chatAnalyses.length} file(s)`
    });
    
  } catch (error) {
    console.error('Error processing chat files:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat files' });
  }
});

// Get analysis results endpoint
app.get('/api/analysis/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`Fetching analysis for session: ${sessionId}`);
    
    const result = await db
      .selectFrom('chat_analyses')
      .selectAll()
      .where('session_id', '=', sessionId)
      .executeTakeFirst();
    
    if (!result) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    const analysis = {
      sessionId: result.session_id,
      fileName: result.file_name,
      totalMessages: result.total_messages,
      participants: JSON.parse(result.participants),
      messageStats: JSON.parse(result.message_stats),
      emojiStats: JSON.parse(result.emoji_stats),
      timeStats: JSON.parse(result.time_stats),
      insights: JSON.parse(result.insights),
      createdAt: result.created_at
    };
    
    res.json(analysis);
    
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// Export a function to start the server
export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting server...');
  startServer(process.env.PORT || 3001);
}
