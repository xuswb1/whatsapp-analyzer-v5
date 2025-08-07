interface Message {
  timestamp: Date;
  sender: string;
  content: string;
}

interface ChatStats {
  totalMessages: number;
  participants: string[];
  messagesByPerson: Record<string, number>;
  emojiStats: Record<string, number>;
  wordStats: Record<string, number>;
  timeStats: {
    hourlyActivity: Record<string, number>;
    monthlyActivity: Record<string, number>;
  };
  insights: {
    roles: Record<string, string>;
    dynamics: string[];
    topEmojis: Array<{ emoji: string; count: number }>;
    topWords: Array<{ word: string; count: number }>;
  };
}

export function parseWhatsAppChat(chatText: string): ChatStats {
  console.log('Starting chat parsing...');
  console.log('Chat text preview:', chatText.substring(0, 500));
  
  const lines = chatText.split('\n').filter(line => line.trim().length > 0);
  console.log('Total lines to process:', lines.length);
  
  const messages: Message[] = [];
  
  // Multiple regex patterns to handle different WhatsApp export formats
  const messagePatterns = [
    // Format: DD/MM/YYYY, HH:MM - Name: Message
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*([^:]+):\s*(.*)$/,
    
    // Format: DD/MM/YYYY, HH:MM AM/PM - Name: Message
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*([AP]M)\s*-\s*([^:]+):\s*(.*)$/,
    
    // Format: MM/DD/YYYY, HH:MM - Name: Message (US format)
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*([^:]+):\s*(.*)$/,
    
    // Format: [DD/MM/YYYY, HH:MM:SS] Name: Message
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}:\d{2})\]\s*([^:]+):\s*(.*)$/,
    
    // Format: DD.MM.YY, HH:MM - Name: Message (German format)
    /^(\d{1,2}\.\d{1,2}\.\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*([^:]+):\s*(.*)$/,
    
    // Format: DD-MM-YYYY HH:MM - Name: Message
    /^(\d{1,2}-\d{1,2}-\d{2,4})\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*([^:]+):\s*(.*)$/,
    
    // Format: YYYY-MM-DD HH:MM:SS - Name: Message
    /^(\d{4}-\d{1,2}-\d{1,2})\s+(\d{1,2}:\d{2}:\d{2})\s*-\s*([^:]+):\s*(.*)$/
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matchFound = false;
    
    for (const pattern of messagePatterns) {
      const match = line.match(pattern);
      if (match) {
        try {
          let date, time, sender, content, ampm = '';
          
          if (match.length === 5 && pattern.toString().includes('[AP]M')) {
            // Pattern with AM/PM
            [, date, time, ampm, sender, content] = match;
          } else if (match.length === 5) {
            // Standard pattern without AM/PM
            [, date, time, sender, content] = match;
          } else if (match.length === 6) {
            // Pattern with AM/PM as separate group
            [, date, time, ampm, sender, content] = match;
          } else {
            continue;
          }
          
          const timestamp = parseDateTime(date, time, ampm);
          
          if (timestamp && !isNaN(timestamp.getTime())) {
            messages.push({
              timestamp,
              sender: sender.trim(),
              content: content.trim()
            });
            matchFound = true;
            break;
          }
        } catch (error) {
          console.log(`Error parsing line ${i + 1}: ${line}`, error);
          continue;
        }
      }
    }
    
    if (!matchFound && i < 10) {
      console.log(`No match for line ${i + 1}: ${line}`);
    }
  }
  
  console.log(`Parsed ${messages.length} messages from ${lines.length} lines`);
  
  if (messages.length === 0) {
    console.log('Sample lines for debugging:');
    lines.slice(0, 10).forEach((line, index) => {
      console.log(`Line ${index + 1}: ${line}`);
    });
    throw new Error('No valid messages found in the chat file. Please ensure this is a WhatsApp chat export file.');
  }
  
  // Analyze messages
  const participants = [...new Set(messages.map(m => m.sender))];
  const messagesByPerson: Record<string, number> = {};
  const emojiStats: Record<string, number> = {};
  const wordStats: Record<string, number> = {};
  const hourlyActivity: Record<string, number> = {};
  const monthlyActivity: Record<string, number> = {};
  
  // Initialize counters
  participants.forEach(p => messagesByPerson[p] = 0);
  
  for (const message of messages) {
    messagesByPerson[message.sender]++;
    
    // Time analysis
    const hour = message.timestamp.getHours();
    const monthYear = `${message.timestamp.getFullYear()}-${String(message.timestamp.getMonth() + 1).padStart(2, '0')}`;
    
    hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    monthlyActivity[monthYear] = (monthlyActivity[monthYear] || 0) + 1;
    
    // Emoji analysis
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu;
    const emojis = message.content.match(emojiRegex) || [];
    emojis.forEach(emoji => {
      emojiStats[emoji] = (emojiStats[emoji] || 0) + 1;
    });
    
    // Word analysis - filter out common stop words and system messages
    const systemMessages = ['message deleted', 'messages and calls are end-to-end encrypted', 'you deleted this message'];
    const isSystemMessage = systemMessages.some(sys => message.content.toLowerCase().includes(sys));
    
    if (!isSystemMessage) {
      const words = message.content.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !isStopWord(word));
      
      words.forEach(word => {
        wordStats[word] = (wordStats[word] || 0) + 1;
      });
    }
  }
  
  // Generate insights
  const insights = generateInsights(messagesByPerson, emojiStats, wordStats, participants);
  
  console.log('Analysis complete:', {
    totalMessages: messages.length,
    participants: participants.length,
    topEmojis: Object.keys(emojiStats).length,
    topWords: Object.keys(wordStats).length
  });
  
  return {
    totalMessages: messages.length,
    participants,
    messagesByPerson,
    emojiStats,
    wordStats,
    timeStats: {
      hourlyActivity,
      monthlyActivity
    },
    insights
  };
}

export function mergeChatAnalyses(analyses: ChatStats[]): ChatStats {
  console.log(`Merging ${analyses.length} chat analyses`);
  
  const merged: ChatStats = {
    totalMessages: 0,
    participants: [],
    messagesByPerson: {},
    emojiStats: {},
    wordStats: {},
    timeStats: {
      hourlyActivity: {},
      monthlyActivity: {}
    },
    insights: {
      roles: {},
      dynamics: [],
      topEmojis: [],
      topWords: []
    }
  };
  
  // Merge all data
  for (const analysis of analyses) {
    merged.totalMessages += analysis.totalMessages;
    
    // Merge participants
    analysis.participants.forEach(p => {
      if (!merged.participants.includes(p)) {
        merged.participants.push(p);
      }
    });
    
    // Merge message stats
    Object.entries(analysis.messagesByPerson).forEach(([person, count]) => {
      merged.messagesByPerson[person] = (merged.messagesByPerson[person] || 0) + count;
    });
    
    // Merge emoji stats
    Object.entries(analysis.emojiStats).forEach(([emoji, count]) => {
      merged.emojiStats[emoji] = (merged.emojiStats[emoji] || 0) + count;
    });
    
    // Merge word stats
    Object.entries(analysis.wordStats).forEach(([word, count]) => {
      merged.wordStats[word] = (merged.wordStats[word] || 0) + count;
    });
    
    // Merge time stats
    Object.entries(analysis.timeStats.hourlyActivity).forEach(([hour, count]) => {
      merged.timeStats.hourlyActivity[hour] = (merged.timeStats.hourlyActivity[hour] || 0) + count;
    });
    
    Object.entries(analysis.timeStats.monthlyActivity).forEach(([month, count]) => {
      merged.timeStats.monthlyActivity[month] = (merged.timeStats.monthlyActivity[month] || 0) + count;
    });
  }
  
  // Generate merged insights
  merged.insights = generateInsights(
    merged.messagesByPerson, 
    merged.emojiStats, 
    merged.wordStats, 
    merged.participants
  );
  
  // Add multi-file specific dynamics
  merged.insights.dynamics.unshift(`Combined data from ${analyses.length} chat exports! 📊`);
  
  console.log('Merge complete:', {
    totalMessages: merged.totalMessages,
    participants: merged.participants.length,
    fileCount: analyses.length
  });
  
  return merged;
}

function parseDateTime(dateStr: string, timeStr: string, ampm: string = ''): Date | null {
  try {
    let parsedDate: Date | null = null;
    
    // Handle different date formats
    if (dateStr.includes('/')) {
      // MM/DD/YYYY or DD/MM/YYYY format
      const [part1, part2, part3] = dateStr.split('/');
      const year = part3.length === 2 ? `20${part3}` : part3;
      
      // Try both DD/MM/YYYY and MM/DD/YYYY
      const date1 = new Date(`${year}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`);
      const date2 = new Date(`${year}-${part1.padStart(2, '0')}-${part2.padStart(2, '0')}`);
      
      // Use the date that makes more sense (day <= 12 could be either format)
      if (!isNaN(date1.getTime()) && (parseInt(part1) <= 12 || parseInt(part2) > 12)) {
        parsedDate = date1;
      } else if (!isNaN(date2.getTime())) {
        parsedDate = date2;
      } else {
        parsedDate = date1; // Default to first format
      }
    } else if (dateStr.includes('.')) {
      // DD.MM.YYYY format (German)
      const [day, month, year] = dateStr.split('.');
      const fullYear = year.length === 2 ? `20${year}` : year;
      parsedDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    } else if (dateStr.includes('-')) {
      // DD-MM-YYYY or YYYY-MM-DD format
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD format
        parsedDate = new Date(dateStr);
      } else {
        // DD-MM-YYYY format
        const [day, month, year] = parts;
        const fullYear = year.length === 2 ? `20${year}` : year;
        parsedDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      }
    }
    
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      return null;
    }
    
    // Parse time
    let [hours, minutes, seconds = '0'] = timeStr.split(':');
    let hourNum = parseInt(hours);
    
    // Handle AM/PM
    if (ampm.toLowerCase() === 'pm' && hourNum !== 12) {
      hourNum += 12;
    } else if (ampm.toLowerCase() === 'am' && hourNum === 12) {
      hourNum = 0;
    }
    
    parsedDate.setHours(hourNum, parseInt(minutes), parseInt(seconds));
    
    return parsedDate;
  } catch (error) {
    console.log('Error parsing date/time:', { dateStr, timeStr, ampm }, error);
    return null;
  }
}

function isStopWord(word: string): boolean {
  const stopWords = [
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could',
    'can', 'may', 'might', 'must', 'shall', 'not', 'no', 'yes', 'all', 'any',
    'some', 'few', 'more', 'most', 'other', 'another', 'such', 'what', 'which',
    'who', 'when', 'where', 'why', 'how', 'get', 'got', 'see', 'saw', 'come',
    'came', 'take', 'took', 'give', 'gave', 'make', 'made', 'know', 'knew'
  ];
  return stopWords.includes(word.toLowerCase());
}

function generateInsights(
  messagesByPerson: Record<string, number>,
  emojiStats: Record<string, number>,
  wordStats: Record<string, number>,
  participants: string[]
) {
  const roles: Record<string, string> = {};
  const dynamics: string[] = [];
  
  // Sort participants by message count
  const sortedParticipants = participants.sort((a, b) => messagesByPerson[b] - messagesByPerson[a]);
  
  // Assign roles
  if (sortedParticipants.length >= 2) {
    const topParticipant = sortedParticipants[0];
    const secondParticipant = sortedParticipants[1];
    
    roles[topParticipant] = "Chat Champion 🏆";
    
    if (messagesByPerson[topParticipant] > messagesByPerson[secondParticipant] * 2) {
      roles[topParticipant] = "Double Texter 💬";
    }
    
    // Assign roles to other participants
    if (sortedParticipants.length > 2) {
      const totalMessages = Object.values(messagesByPerson).reduce((sum, count) => sum + count, 0);
      
      for (let i = 1; i < Math.min(sortedParticipants.length, 5); i++) {
        const participant = sortedParticipants[i];
        const messageCount = messagesByPerson[participant];
        const percentage = messageCount / totalMessages;
        
        if (percentage < 0.05) {
          roles[participant] = "Lurker 👻";
        } else if (percentage > 0.3) {
          roles[participant] = "Chatty One 🗣️";
        } else {
          roles[participant] = "Squad Member ✨";
        }
      }
    }
  }
  
  // Generate dynamics
  const totalMessages = Object.values(messagesByPerson).reduce((sum, count) => sum + count, 0);
  
  if (Object.keys(emojiStats).length > 0) {
    const topEmoji = Object.entries(emojiStats).sort(([,a], [,b]) => b - a)[0];
    dynamics.push(`${topEmoji[0]} is the most loved emoji with ${topEmoji[1]} uses!`);
  }
  
  // Find common casual words
  const casualWords = ['haha', 'lol', 'lmao', 'omg', 'wow', 'yeah', 'yep', 'nah', 'tbh', 'btw'];
  const foundCasualWords = casualWords.filter(word => wordStats[word] && wordStats[word] > 3);
  if (foundCasualWords.length > 0) {
    dynamics.push(`Most used casual expressions: ${foundCasualWords.slice(0, 3).join(', ')}`);
  }
  
  // Check for active vs quiet periods
  if (participants.length > 1) {
    const avgMessagesPerPerson = totalMessages / participants.length;
    const activeParticipants = participants.filter(p => messagesByPerson[p] > avgMessagesPerPerson);
    if (activeParticipants.length === 1) {
      dynamics.push(`${activeParticipants[0]} carries most conversations`);
    }
  }
  
  // Top emojis
  const topEmojis = Object.entries(emojiStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([emoji, count]) => ({ emoji, count }));
  
  // Top words - filter out very common words
  const topWords = Object.entries(wordStats)
    .filter(([word, count]) => count > 2 && word.length > 3)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([word, count]) => ({ word, count }));
  
  return {
    roles,
    dynamics,
    topEmojis,
    topWords
  };
}
