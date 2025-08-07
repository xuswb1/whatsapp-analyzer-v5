import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import path from 'path';

interface ChatAnalysis {
  id: number;
  session_id: string;
  file_name: string;
  total_messages: number;
  participants: string;
  message_stats: string;
  emoji_stats: string;
  time_stats: string;
  insights: string;
  created_at: string;
}

interface DatabaseSchema {
  chat_analyses: ChatAnalysis;
}

const dataDirectory = process.env.DATA_DIRECTORY || './data';
const databasePath = path.join(dataDirectory, 'database.sqlite');

const sqliteDb = new Database(databasePath);

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error']
});
