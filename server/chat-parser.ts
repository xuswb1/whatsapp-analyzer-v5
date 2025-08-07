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
  
  const lines = chatText.split('\n');
  const messages: Message[] = [];
  
  // WhatsApp message regex pattern
  const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:[AP]M)?\s*-\s*([^:]+):\s*(.*)$/i;
  
  for (const line of lines) {
    const match = line.match(messageRegex);
    if (match) {
      const [, date, time, sender, content] = match;
      
      // Parse date and time
      const [month, day, year] = date.split('/');
      const fullYear = year.length === 2 ? `20${year}` : year;
      const timestamp = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${time}`);
      
      if (!isNaN(timestamp.getTime())) {
        messages.push({
          timestamp,
          sender: sender.trim(),
          content: content.trim()
        });
      }
    }
  }
  
  console.log(`Parsed ${messages.length} messages`);
  
  if (messages.length === 0) {
    throw new Error('No valid messages found in the chat file');
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
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = message.content.match(emojiRegex) || [];
    emojis.forEach(emoji => {
      emojiStats[emoji] = (emojiStats[emoji] || 0) + 1;
    });
    
    // Word analysis
    const words = message.content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    words.forEach(word => {
      wordStats[word] = (wordStats[word] || 0) + 1;
    });
  }
  
  // Generate insights
  const insights = generateInsights(messagesByPerson, emojiStats, wordStats, participants);
  
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
    roles[sortedParticipants[0]] = "Chat Champion 🏆";
    
    const topParticipant = sortedParticipants[0];
    const secondParticipant = sortedParticipants[1];
    
    if (messagesByPerson[topParticipant] > messagesByPerson[secondParticipant] * 2) {
      roles[topParticipant] = "Double Texter 💬";
    }
  }
  
  // Find emoji overuser
  const topEmojiUser = Object.keys(emojiStats).reduce((a, b) => emojiStats[a] > emojiStats[b] ? a : b, '');
  if (Object.keys(emojiStats).length > 0) {
    dynamics.push(`${topEmojiUser} is the top emoji!`);
  }
  
  // Find common words
  const commonWords = ['haha', 'lol', 'sorry', 'okay', 'yeah', 'omg'];
  const foundWords = commonWords.filter(word => wordStats[word] > 5);
  if (foundWords.length > 0) {
    dynamics.push(`Most used casual words: ${foundWords.join(', ')}`);
  }
  
  // Top emojis
  const topEmojis = Object.entries(emojiStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([emoji, count]) => ({ emoji, count }));
  
  // Top words
  const topWords = Object.entries(wordStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
  
  return {
    roles,
    dynamics,
    topEmojis,
    topWords
  };
}
