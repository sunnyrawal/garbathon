// src/server.js
import app from './app.js';
import { config } from './config/env.js';
import { initDataFile, complaintsFilePath, directoryFilePath } from './utils/storage.js';
import { readJsonFile } from './utils/storage.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  // Initialize data files
  const defaultComplaints = { complaints: [] };
  await initDataFile(complaintsFilePath(), defaultComplaints);

  // Verify municipal directory exists
  const dir = await readJsonFile(directoryFilePath());
  if (!dir) {
    console.error('[Server] CRITICAL: municipal-directory.json not found. Server cannot start.');
    process.exit(1);
  }

  const port = config.port;
  app.listen(port, () => {
    console.log(`\n🏛️  CivicSaathi AI Server running on http://localhost:${port}`);
    console.log(`📡 API: http://localhost:${port}/api/health`);
    console.log(`🎭 Demo Mode: ${config.demoMode || !config.geminiApiKey ? 'ENABLED' : 'DISABLED (Live AI)'}`);
    console.log(`🌍 CORS origin: ${config.frontendUrl}\n`);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[Server] Unhandled rejection:', reason);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
