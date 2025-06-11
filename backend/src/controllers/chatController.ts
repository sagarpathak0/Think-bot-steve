import { Request, Response } from 'express';

import { askGemini } from '../gemini.js';
import {
  insertConversation,
  getLastSummary,
  getUsername,
  getConversationHistory,
  insertSummary,
  getMemoryHistory,
  getTodayHistory
} from '../queries/chatQueries.js';

export const chat = async (req: Request, res: Response) => {
  const user_id = (req as any).user.user_id;
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'No message provided' });
    return;
  }
  await insertConversation(user_id, 'user', message);
  let lastSummary = await getLastSummary(user_id);
  let geminiPrompt = '';
  if (lastSummary && lastSummary.trim() && lastSummary !== 'No conversation history yet.') {
    geminiPrompt = `You have access to the following summary of the user's past conversations. Use this summary as your memory and context. Do NOT say you have no memory or that you are a new instance. Instead, use the summary to provide helpful, context-aware responses.\n\nSummary:\n${lastSummary}\n\nUser: ${message}`;
  } else {
    geminiPrompt = message;
  }
  const reply = await askGemini(geminiPrompt, process.env.GEMINI_API_KEY!);
  await insertConversation(user_id, 'bot', reply);
  let username = await getUsername(user_id);
  const convoRows = await getConversationHistory(user_id);
  const convoText = convoRows.map((r: { speaker: any; message: any; }) => `${r.speaker}: ${r.message}`).join('\n');
  let summary = '';
  if (!convoText.trim()) {
    summary = 'No conversation history yet.';
  } else {
    try {
      const prompt = `You are an expert conversation summarizer. The user's username is: ${username}. Read the following full conversation between this user and an AI assistant. Write a concise summary that captures the main points, topics discussed, and any key decisions or facts mentioned. The summary should be clear, informative, and suitable for use as context in future conversations. Do NOT simply repeat the conversation line by line. Instead, synthesize the main ideas, topics, and any key decisions or facts mentioned. This summary will be used as context for future conversations, so make it as informative and clear as possible.\n\n${convoText}\n\nSummary:`;
      const apiKey2 = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY || "";
      summary = await askGemini(prompt, apiKey2);
    } catch (e) {
      summary = '';
    }
  }
  await insertSummary(user_id, summary);
  res.json({ reply });
};

export const getMemory = async (req: Request, res: Response) => {
  const user_id = (req as any).user.user_id;
  const rows = await getMemoryHistory(user_id);
  let summary = await getLastSummary(user_id);
  if (!summary) summary = 'No conversation history yet.';
  res.json({ conversation: rows, summary, objects: {} });
};

export const getStats = async (req: Request, res: Response) => {
  const user_id = (req as any).user.user_id;
  const today = new Date().toISOString().slice(0, 10);
  const rows = await getTodayHistory(user_id, today);
  let summary = await getLastSummary(user_id);
  if (!summary) summary = 'No conversation history yet.';
  const mood_timeline = rows.map((r: { message: string; timestamp: any; speaker: any; }) => {
    let mood = 0;
    const text = r.message || '';
    if (/happy|great|good|awesome|love|nice|excellent|fantastic|amazing/i.test(text)) mood = 1;
    else if (/sad|bad|angry|hate|terrible|awful|upset|horrible|worst/i.test(text)) mood = -1;
    return { timestamp: r.timestamp, speaker: r.speaker, mood };
  });
  const mood_score_total = mood_timeline.reduce((sum: any, m: { mood: any; }) => sum + m.mood, 0);
  const mood_count = mood_timeline.length;
  const avg_mood = mood_count ? mood_score_total / mood_count : 0;
  res.json({ summary, mood_timeline, avg_mood, count: mood_count });
};
