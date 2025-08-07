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
    responseDelays: Record<string, number[]>;
  };
  insights: {
    roles: Record<string, string>;
    dynamics: string[];
    topEmojis: Array<{ emoji: string; count: number }>;
    topWords: Array<{ word: string; count: number }>;
    analysis: {
      language: string;
      activityAnalysis: string;
      responseAnalysis: string;
      languageAnalysis: string;
      emojiAnalysis: string;
      timeAnalysis: string;
      dynamicsAnalysis: string;
      redFlags: string[];
      standoutMoments: string[];
    };
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
  const responseDelays: Record<string, number[]> = {};
  
  // Initialize counters
  participants.forEach(p => {
    messagesByPerson[p] = 0;
    responseDelays[p] = [];
  });
  
  // Sort messages by timestamp
  messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    messagesByPerson[message.sender]++;
    
    // Calculate response delays
    if (i > 0) {
      const prevMessage = messages[i - 1];
      if (prevMessage.sender !== message.sender) {
        const delay = (message.timestamp.getTime() - prevMessage.timestamp.getTime()) / (1000 * 60); // minutes
        responseDelays[message.sender].push(delay);
      }
    }
    
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
    const systemMessages = ['message deleted', 'messages and calls are end-to-end encrypted', 'you deleted this message', 'nachricht gelöscht', 'nachrichten und anrufe sind mit einer', 'diese nachricht wurde gelöscht'];
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
  
  // Generate insights with sophisticated analysis
  const insights = generateAdvancedInsights(
    messages, 
    messagesByPerson, 
    emojiStats, 
    wordStats, 
    responseDelays, 
    hourlyActivity, 
    monthlyActivity, 
    participants
  );
  
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
      monthlyActivity,
      responseDelays
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
      monthlyActivity: {},
      responseDelays: {}
    },
    insights: {
      roles: {},
      dynamics: [],
      topEmojis: [],
      topWords: [],
      analysis: {
        language: '',
        activityAnalysis: '',
        responseAnalysis: '',
        languageAnalysis: '',
        emojiAnalysis: '',
        timeAnalysis: '',
        dynamicsAnalysis: '',
        redFlags: [],
        standoutMoments: []
      }
    }
  };
  
  let allMessages: Message[] = [];
  
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
    
    Object.entries(analysis.timeStats.responseDelays).forEach(([person, delays]) => {
      if (!merged.timeStats.responseDelays[person]) {
        merged.timeStats.responseDelays[person] = [];
      }
      merged.timeStats.responseDelays[person].push(...delays);
    });
  }
  
  // Generate merged insights
  merged.insights = generateAdvancedInsights(
    allMessages,
    merged.messagesByPerson, 
    merged.emojiStats, 
    merged.wordStats, 
    merged.timeStats.responseDelays,
    merged.timeStats.hourlyActivity,
    merged.timeStats.monthlyActivity,
    merged.participants
  );
  
  // Add multi-file specific analysis
  merged.insights.analysis.activityAnalysis = `Combined analysis from ${analyses.length} chat exports reveals comprehensive communication patterns across multiple conversations. ${merged.insights.analysis.activityAnalysis}`;
  
  console.log('Merge complete:', {
    totalMessages: merged.totalMessages,
    participants: merged.participants.length,
    fileCount: analyses.length
  });
  
  return merged;
}

function detectLanguage(messages: Message[]): string {
  const sampleTexts = messages.slice(0, 100).map(m => m.content.toLowerCase()).join(' ');
  
  // German indicators
  const germanWords = ['und', 'ich', 'ist', 'das', 'der', 'die', 'mit', 'auf', 'für', 'nicht', 'aber', 'habe', 'bin', 'sind', 'haben', 'wird', 'war', 'auch', 'nur', 'noch', 'schon', 'jetzt', 'dann', 'wenn', 'oder'];
  const englishWords = ['the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they', 'this', 'have', 'from', 'had', 'but', 'what', 'can', 'out', 'other', 'were', 'all', 'your', 'when', 'said', 'there', 'use'];
  
  const germanScore = germanWords.reduce((score, word) => score + (sampleTexts.split(word).length - 1), 0);
  const englishScore = englishWords.reduce((score, word) => score + (sampleTexts.split(word).length - 1), 0);
  
  return germanScore > englishScore ? 'German' : 'English';
}

function generateAdvancedInsights(
  messages: Message[],
  messagesByPerson: Record<string, number>,
  emojiStats: Record<string, number>,
  wordStats: Record<string, number>,
  responseDelays: Record<string, number[]>,
  hourlyActivity: Record<string, number>,
  monthlyActivity: Record<string, number>,
  participants: string[]
) {
  const roles: Record<string, string> = {};
  const dynamics: string[] = [];
  
  // Language detection
  const language = messages.length > 0 ? detectLanguage(messages) : 'English';
  const isGerman = language === 'German';
  
  // Sort participants by message count
  const sortedParticipants = participants.sort((a, b) => messagesByPerson[b] - messagesByPerson[a]);
  const totalMessages = Object.values(messagesByPerson).reduce((sum, count) => sum + count, 0);
  
  // Advanced role assignment
  participants.forEach((participant, index) => {
    const messageCount = messagesByPerson[participant];
    const percentage = messageCount / totalMessages;
    const avgResponseTime = responseDelays[participant]?.length > 0 
      ? responseDelays[participant].reduce((sum, delay) => sum + delay, 0) / responseDelays[participant].length 
      : 0;
    
    // Emoji usage analysis
    const participantMessages = messages.filter(m => m.sender === participant);
    const participantEmojis = participantMessages.reduce((count, m) => {
      const emojis = m.content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu) || [];
      return count + emojis.length;
    }, 0);
    const emojiRatio = participantEmojis / messageCount;
    
    // Question analysis
    const questionCount = participantMessages.filter(m => m.content.includes('?')).length;
    const questionRatio = questionCount / messageCount;
    
    // Assign sophisticated roles
    if (index === 0 && percentage > 0.6) {
      roles[participant] = isGerman ? "Gesprächs-Dominator 👑" : "Chat Dominator 👑";
    } else if (percentage > 0.4) {
      roles[participant] = isGerman ? "Vielschreiber 💬" : "Heavy Texter 💬";
    } else if (avgResponseTime > 60) {
      roles[participant] = isGerman ? "Bedächtiger Antworter ⏰" : "Thoughtful Responder ⏰";
    } else if (avgResponseTime < 2 && avgResponseTime > 0) {
      roles[participant] = isGerman ? "Schnell-Antworter ⚡" : "Speed Responder ⚡";
    } else if (emojiRatio > 0.3) {
      roles[participant] = isGerman ? "Emoji-Enthusiast 😍" : "Emoji Enthusiast 😍";
    } else if (questionRatio > 0.2) {
      roles[participant] = isGerman ? "Fragesteller 🤔" : "Question Master 🤔";
    } else if (percentage < 0.1) {
      roles[participant] = isGerman ? "Stiller Beobachter 👻" : "Silent Observer 👻";
    } else {
      roles[participant] = isGerman ? "Ausgeglichener Chatter ✨" : "Balanced Chatter ✨";
    }
  });
  
  // Generate comprehensive analysis
  const analysis = {
    language,
    activityAnalysis: generateActivityAnalysis(messagesByPerson, totalMessages, participants, isGerman),
    responseAnalysis: generateResponseAnalysis(responseDelays, participants, isGerman),
    languageAnalysis: generateLanguageAnalysis(wordStats, isGerman),
    emojiAnalysis: generateEmojiAnalysis(emojiStats, totalMessages, isGerman),
    timeAnalysis: generateTimeAnalysis(hourlyActivity, monthlyActivity, isGerman),
    dynamicsAnalysis: generateDynamicsAnalysis(messages, participants, isGerman),
    redFlags: detectRedFlags(messages, responseDelays, messagesByPerson, isGerman),
    standoutMoments: findStandoutMoments(messages, hourlyActivity, monthlyActivity, isGerman)
  };
  
  // Top emojis and words
  const topEmojis = Object.entries(emojiStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([emoji, count]) => ({ emoji, count }));
  
  const topWords = Object.entries(wordStats)
    .filter(([word, count]) => count > 2 && word.length > 3)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([word, count]) => ({ word, count }));
  
  return {
    roles,
    dynamics,
    topEmojis,
    topWords,
    analysis
  };
}

function generateActivityAnalysis(messagesByPerson: Record<string, number>, totalMessages: number, participants: string[], isGerman: boolean): string {
  const sortedParticipants = participants.sort((a, b) => messagesByPerson[b] - messagesByPerson[a]);
  const topParticipant = sortedParticipants[0];
  const topPercentage = Math.round((messagesByPerson[topParticipant] / totalMessages) * 100);
  
  if (isGerman) {
    if (topPercentage > 70) {
      return `${topParticipant} dominiert die Unterhaltung mit ${topPercentage}% aller Nachrichten – ein echter Monolog-Meister. Die anderen Teilnehmer scheinen eher als stille Zuhörer zu fungieren, was interessante Dynamiken über die Gesprächsführung aufzeigt.`;
    } else if (topPercentage > 50) {
      return `${topParticipant} führt das Gespräch mit ${topPercentage}% der Nachrichten an, lässt aber noch Raum für andere Stimmen. Eine gesunde Balance zwischen aktivem Austausch und gelegentlicher Führung.`;
    } else {
      return `Die Gesprächsaktivität ist relativ ausgeglichen verteilt, mit ${topParticipant} als aktivstem Teilnehmer (${topPercentage}%). Dies deutet auf eine demokratische Gesprächskultur hin, in der jeder zu Wort kommt.`;
    }
  } else {
    if (topPercentage > 70) {
      return `${topParticipant} dominates the conversation with ${topPercentage}% of all messages – a true monologue master. Other participants seem to function more as silent listeners, revealing interesting dynamics about conversation leadership.`;
    } else if (topPercentage > 50) {
      return `${topParticipant} leads the conversation with ${topPercentage}% of messages while still leaving room for other voices. A healthy balance between active exchange and occasional leadership.`;
    } else {
      return `Conversation activity is relatively well-balanced, with ${topParticipant} as the most active participant (${topPercentage}%). This suggests a democratic chat culture where everyone gets their say.`;
    }
  }
}

function generateResponseAnalysis(responseDelays: Record<string, number[]>, participants: string[], isGerman: boolean): string {
  const avgDelays = Object.entries(responseDelays).map(([person, delays]) => ({
    person,
    avgDelay: delays.length > 0 ? delays.reduce((sum, delay) => sum + delay, 0) / delays.length : 0
  })).sort((a, b) => a.avgDelay - b.avgDelay);
  
  const fastest = avgDelays[0];
  const slowest = avgDelays[avgDelays.length - 1];
  
  if (isGerman) {
    if (fastest && fastest.avgDelay < 2) {
      return `${fastest.person} antwortet blitzschnell (durchschnittlich ${fastest.avgDelay.toFixed(1)} Minuten) – ein wahrer Speed-Chatter. ${slowest?.person} hingegen lässt sich Zeit (${slowest.avgDelay.toFixed(0)} Minuten), was entweder Bedachtsamkeit oder andere Prioritäten signalisiert.`;
    } else {
      return `Die Antwortzeiten bewegen sich in einem gemäßigten Rahmen, was auf eine entspannte Gesprächsatmosphäre ohne Zeitdruck hindeutet. Jeder antwortet in seinem eigenen Tempo.`;
    }
  } else {
    if (fastest && fastest.avgDelay < 2) {
      return `${fastest.person} responds lightning-fast (averaging ${fastest.avgDelay.toFixed(1)} minutes) – a true speed-chatter. ${slowest?.person}, however, takes their time (${slowest.avgDelay.toFixed(0)} minutes), signaling either thoughtfulness or other priorities.`;
    } else {
      return `Response times move at a moderate pace, indicating a relaxed conversation atmosphere without time pressure. Everyone responds at their own rhythm.`;
    }
  }
}

function generateLanguageAnalysis(wordStats: Record<string, number>, isGerman: boolean): string {
  const topWords = Object.entries(wordStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
  
  // Detect emotional tone
  const positiveWords = isGerman 
    ? ['toll', 'super', 'schön', 'gut', 'perfekt', 'freue', 'liebe', 'danke', 'gern', 'haha']
    : ['great', 'awesome', 'good', 'perfect', 'love', 'thanks', 'happy', 'nice', 'haha', 'lol'];
  
  const negativeWords = isGerman
    ? ['schlecht', 'scheiße', 'mist', 'ärgerlich', 'dumm', 'nervt', 'stress', 'problem']
    : ['bad', 'shit', 'damn', 'annoying', 'stupid', 'stress', 'problem', 'hate'];
  
  const positiveCount = positiveWords.reduce((count, word) => count + (wordStats[word] || 0), 0);
  const negativeCount = negativeWords.reduce((count, word) => count + (wordStats[word] || 0), 0);
  
  if (isGerman) {
    const toneText = positiveCount > negativeCount * 2 
      ? "Der Tonfall ist überwiegend positiv und freundlich"
      : positiveCount < negativeCount 
      ? "Es herrscht eine eher kritische oder frustrierte Stimmung vor"
      : "Die emotionale Balance ist ausgeglichen";
    
    return `${toneText}. Die häufigsten Wörter (${topWords.join(', ')}) verraten viel über die Gesprächsthemen und den charakteristischen Sprachstil der Gruppe.`;
  } else {
    const toneText = positiveCount > negativeCount * 2 
      ? "The tone is predominantly positive and friendly"
      : positiveCount < negativeCount 
      ? "There's a rather critical or frustrated atmosphere"
      : "The emotional balance is well-balanced";
    
    return `${toneText}. The most frequent words (${topWords.join(', ')}) reveal a lot about conversation topics and the group's characteristic language style.`;
  }
}

function generateEmojiAnalysis(emojiStats: Record<string, number>, totalMessages: number, isGerman: boolean): string {
  const totalEmojis = Object.values(emojiStats).reduce((sum, count) => sum + count, 0);
  const emojiRatio = totalEmojis / totalMessages;
  const topEmojis = Object.entries(emojiStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([emoji]) => emoji);
  
  if (isGerman) {
    if (emojiRatio > 0.5) {
      return `Eine wahre Emoji-Party! Mit ${emojiRatio.toFixed(1)} Emojis pro Nachricht wird hier emotional und bildlich kommuniziert. Die Favoriten ${topEmojis.join(' ')} dominieren und verleihen dem Chat eine lebendige, ausdrucksstarke Atmosphäre.`;
    } else if (emojiRatio > 0.2) {
      return `Emojis werden gezielt und effektiv eingesetzt (${emojiRatio.toFixed(1)} pro Nachricht). Die Top-Auswahl ${topEmojis.join(' ')} zeigt eine ausgewogene Mischung aus Emotionen und unterstreicht die wichtigsten Botschaften.`;
    } else {
      return `Hier wird eher textlastig kommuniziert – Emojis sind die Ausnahme statt die Regel. Das deutet auf einen sachlicheren oder formelleren Gesprächsstil hin.`;
    }
  } else {
    if (emojiRatio > 0.5) {
      return `A true emoji party! With ${emojiRatio.toFixed(1)} emojis per message, communication here is emotional and visual. The favorites ${topEmojis.join(' ')} dominate and give the chat a lively, expressive atmosphere.`;
    } else if (emojiRatio > 0.2) {
      return `Emojis are used strategically and effectively (${emojiRatio.toFixed(1)} per message). The top selection ${topEmojis.join(' ')} shows a balanced mix of emotions and emphasizes key messages.`;
    } else {
      return `Communication here is more text-heavy – emojis are the exception rather than the rule. This suggests a more factual or formal conversation style.`;
    }
  }
}

function generateTimeAnalysis(hourlyActivity: Record<string, number>, monthlyActivity: Record<string, number>, isGerman: boolean): string {
  const peakHour = Object.entries(hourlyActivity).sort(([,a], [,b]) => b - a)[0];
  const peakMonth = Object.entries(monthlyActivity).sort(([,a], [,b]) => b - a)[0];
  
  const hourText = parseInt(peakHour[0]) < 6 
    ? (isGerman ? "Nachteulen" : "night owls")
    : parseInt(peakHour[0]) < 12 
    ? (isGerman ? "Frühaufsteher" : "early birds")
    : parseInt(peakHour[0]) < 18 
    ? (isGerman ? "Nachmittags-Chatter" : "afternoon chatters")
    : (isGerman ? "Abend-Gesellschaft" : "evening socializers");
  
  if (isGerman) {
    return `Die Gruppe besteht hauptsächlich aus ${hourText} – Peak-Zeit ist ${peakHour[0]}:00 Uhr. Der aktivste Monat war ${new Date(peakMonth[0] + '-01').toLocaleDateString('de', { month: 'long' })}, was möglicherweise mit besonderen Ereignissen oder Lebensphasen zusammenhängt.`;
  } else {
    return `The group consists mainly of ${hourText} – peak time is ${peakHour[0]}:00. The most active month was ${new Date(peakMonth[0] + '-01').toLocaleDateString('en', { month: 'long' })}, possibly coinciding with special events or life phases.`;
  }
}

function generateDynamicsAnalysis(messages: Message[], participants: string[], isGerman: boolean): string {
  // Analyze conversation patterns
  const conversationStarters = participants.reduce((acc, p) => {
    acc[p] = 0;
    return acc;
  }, {} as Record<string, number>);
  
  for (let i = 1; i < messages.length; i++) {
    const currentMessage = messages[i];
    const prevMessage = messages[i - 1];
    
    // If there's a significant time gap (> 2 hours), consider it a new conversation
    const timeDiff = (currentMessage.timestamp.getTime() - prevMessage.timestamp.getTime()) / (1000 * 60 * 60);
    if (timeDiff > 2) {
      conversationStarters[currentMessage.sender]++;
    }
  }
  
  const topStarter = Object.entries(conversationStarters).sort(([,a], [,b]) => b - a)[0];
  
  if (isGerman) {
    return `${topStarter[0]} ist der natürliche Gesprächs-Initiator mit ${topStarter[1]} neuen Themen. Die Gruppendynamik zeigt ${participants.length > 2 ? 'eine lebhafte Multi-Person-Unterhaltung' : 'einen intensiven Dialog'}, bei dem ${participants.length > 2 ? 'jeder seine Rolle findet' : 'beide Seiten aktiv partizipieren'}.`;
  } else {
    return `${topStarter[0]} is the natural conversation initiator with ${topStarter[1]} new topics. Group dynamics show ${participants.length > 2 ? 'a lively multi-person conversation' : 'an intense dialogue'} where ${participants.length > 2 ? 'everyone finds their role' : 'both sides actively participate'}.`;
  }
}

function detectRedFlags(messages: Message[], responseDelays: Record<string, number[]>, messagesByPerson: Record<string, number>, isGerman: boolean): string[] {
  const redFlags: string[] = [];
  
  // Check for extremely unbalanced conversations
  const totalMessages = Object.values(messagesByPerson).reduce((sum, count) => sum + count, 0);
  const maxPercentage = Math.max(...Object.values(messagesByPerson)) / totalMessages;
  
  if (maxPercentage > 0.8) {
    redFlags.push(isGerman 
      ? "Extrem unausgewogene Gesprächsverteilung - jemand redet, alle anderen schweigen"
      : "Extremely unbalanced conversation distribution - one person talks, everyone else stays silent"
    );
  }
  
  // Check for very long response delays
  const avgDelays = Object.values(responseDelays).flat();
  if (avgDelays.some(delay => delay > 24 * 60)) { // More than 24 hours
    redFlags.push(isGerman
      ? "Sehr lange Antwortzeiten deuten auf nachlassendes Interesse hin"
      : "Very long response times suggest waning interest"
    );
  }
  
  // Check for declining activity over time
  const messagesByMonth = messages.reduce((acc, msg) => {
    const monthKey = `${msg.timestamp.getFullYear()}-${String(msg.timestamp.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const months = Object.keys(messagesByMonth).sort();
  if (months.length > 2) {
    const recentActivity = messagesByMonth[months[months.length - 1]];
    const peakActivity = Math.max(...Object.values(messagesByMonth));
    if (recentActivity < peakActivity * 0.3) {
      redFlags.push(isGerman
        ? "Stark rückläufige Aktivität - das Interesse schwindet"
        : "Sharply declining activity - interest is waning"
      );
    }
  }
  
  return redFlags;
}

function findStandoutMoments(messages: Message[], hourlyActivity: Record<string, number>, monthlyActivity: Record<string, number>, isGerman: boolean): string[] {
  const moments: string[] = [];
  
  // Find peak activity days
  const dailyActivity: Record<string, number> = {};
  messages.forEach(msg => {
    const dateKey = msg.timestamp.toDateString();
    dailyActivity[dateKey] = (dailyActivity[dateKey] || 0) + 1;
  });
  
  const peakDay = Object.entries(dailyActivity).sort(([,a], [,b]) => b - a)[0];
  if (peakDay && peakDay[1] > Object.values(dailyActivity).reduce((sum, count) => sum + count, 0) / Object.keys(dailyActivity).length * 3) {
    moments.push(isGerman
      ? `${new Date(peakDay[0]).toLocaleDateString('de')} war ein Chat-Marathon mit ${peakDay[1]} Nachrichten`
      : `${new Date(peakDay[0]).toLocaleDateString('en')} was a chat marathon with ${peakDay[1]} messages`
    );
  }
  
  // Find unusual time activity
  const nightMessages = (hourlyActivity[0] || 0) + (hourlyActivity[1] || 0) + (hourlyActivity[2] || 0) + (hourlyActivity[3] || 0) + (hourlyActivity[4] || 0) + (hourlyActivity[5] || 0);
  if (nightMessages > messages.length * 0.1) {
    moments.push(isGerman
      ? "Bemerkenswerte Nachteulen-Aktivität - wichtige Gespräche passieren nach Mitternacht"
      : "Notable night owl activity - important conversations happen after midnight"
    );
  }
  
  // Find longest conversation streak
  let maxStreak = 0;
  let currentStreak = 0;
  let lastSender = '';
  
  messages.forEach(msg => {
    if (msg.sender === lastSender) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
      lastSender = msg.sender;
    }
  });
  
  if (maxStreak > 10) {
    moments.push(isGerman
      ? `Längste Nachrichtenserie: ${maxStreak} aufeinanderfolgende Nachrichten - jemand hatte viel zu sagen`
      : `Longest message streak: ${maxStreak} consecutive messages - someone had a lot to say`
    );
  }
  
  return moments;
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
  const englishStopWords = [
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could',
    'can', 'may', 'might', 'must', 'shall', 'not', 'no', 'yes', 'all', 'any',
    'some', 'few', 'more', 'most', 'other', 'another', 'such', 'what', 'which',
    'who', 'when', 'where', 'why', 'how', 'get', 'got', 'see', 'saw', 'come',
    'came', 'take', 'took', 'give', 'gave', 'make', 'made', 'know', 'knew'
  ];
  
  const germanStopWords = [
    'der', 'die', 'das', 'und', 'ich', 'ist', 'mit', 'auf', 'für', 'von', 'zu', 'im', 'am',
    'ein', 'eine', 'einen', 'einer', 'einem', 'eines', 'aber', 'oder', 'wenn', 'dann',
    'auch', 'nur', 'noch', 'schon', 'jetzt', 'hier', 'dort', 'war', 'sind', 'haben',
    'hatte', 'wird', 'wurde', 'werden', 'kann', 'könnte', 'soll', 'sollte', 'muss',
    'nicht', 'nein', 'ja', 'alle', 'alles', 'viele', 'mehr', 'wenig', 'andere',
    'was', 'wer', 'wie', 'wo', 'wann', 'warum', 'welche', 'welcher', 'welches'
  ];
  
  return englishStopWords.includes(word.toLowerCase()) || germanStopWords.includes(word.toLowerCase());
}
