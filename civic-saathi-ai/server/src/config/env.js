// src/config/env.js
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  demoMode: process.env.DEMO_MODE === 'true' || !process.env.GEMINI_API_KEY,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  maxImageSizeMB: 10,
  requestTimeoutMs: 30000,
};

export const isDemoMode = () => config.demoMode || !config.geminiApiKey;
