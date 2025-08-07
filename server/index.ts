import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { setupStaticServing } from './static-serve.js';
import { db } from './database.js';
import { parseWhatsAppChat } from './chat-parser.js';
import { randomUUID } from 'crypto';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload setup
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  }
});

// Upload and analyze chat endpoint
app.post('/api/upload-chat', upload.single('chatFile'), async (req, res) => {
  try {
    console.log('Received file upload request');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log(`Processing file: ${req.file.originalname}`);
    
    // Extract ZIP file
    const zip = new AdmZip(req.file.buffer);
    const entries = zip.getEntries();
    
    // Find chat.txt file
    const chatEntry = entries.find(entry => 
      entry.entryName.toLowerCase().includes('chat') && 
      entry.entryName.endsWith('.txt')
    );
    
    if (!chatEntry) {
      return res.status(400).json({ error: 'No chat.txt file found in ZIP' });
    }
    
    console.log(`Found chat file: ${chatEntry.entryName}`);
    
    const chatContent = chatEntry.getData().toString('utf8');
    
    // Parse chat content
    const analysis = parseWhatsAppChat(chatContent);
    console.log('Chat analysis completed');
    
    // Generate session ID
    const sessionId = randomUUID();
    
    // Save to database
    await db.insertInto('chat_analyses').values({
      session_id: sessionId,
      file_name: req.file.originalname,
      total_messages: analysis.totalMessages,
      participants: JSON.stringify(analysis.participants),
      message_stats: JSON.stringify(analysis.messagesByPerson),
      emoji_stats: JSON.stringify(analysis.emojiStats),
      time_stats: JSON.stringify(analysis.timeStats),
      insights: JSON.stringify(analysis.insights)
    }).execute();
    
    console.log(`Saved analysis with session ID: ${sessionId}`);
    
    res.json({ 
      sessionId,
      message: 'Chat analysis completed successfully'
    });
    
  } catch (error) {
    console.error('Error processing chat file:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat file' });
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
