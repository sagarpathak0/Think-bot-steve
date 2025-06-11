// --- Ensure DB tables exist at startup ---



import fs from 'fs';
import path from 'path';
import { pool } from './db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureTables() {
  try {
    const initSql = fs.readFileSync(path.resolve(__dirname, '../init.sql'), 'utf-8');
    await pool.query(initSql);
    console.log('Table initiated (summaries table ensured)');
  } catch (err) {
    console.error('Error ensuring tables:', err);
  }
}

pool.connect()
  .then(() => {
    console.log('DB connected');
    ensureTables();
  })
  .catch((err) => {
    console.error('DB connection error:', err);
  });
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Node backend for chat, login, memory, and stats is running.');
});



import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

app.use(authRoutes);
app.use(chatRoutes);
app.use(systemRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
