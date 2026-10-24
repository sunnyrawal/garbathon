// src/utils/storage.js
// Atomic JSON file storage with concurrency-safe writes
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple mutex for serializing writes
class Mutex {
  constructor() {
    this._queue = [];
    this._locked = false;
  }
  lock() {
    return new Promise((resolve) => {
      if (!this._locked) {
        this._locked = true;
        resolve();
      } else {
        this._queue.push(resolve);
      }
    });
  }
  unlock() {
    if (this._queue.length > 0) {
      const next = this._queue.shift();
      next();
    } else {
      this._locked = false;
    }
  }
}

const mutexes = new Map();

function getMutex(filePath) {
  if (!mutexes.has(filePath)) {
    mutexes.set(filePath, new Mutex());
  }
  return mutexes.get(filePath);
}

export async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    if (!content || content.trim() === '') return null;
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    if (err instanceof SyntaxError) {
      console.error(`[Storage] Malformed JSON in ${filePath}, returning null`);
      return null;
    }
    throw err;
  }
}

export async function writeJsonFile(filePath, data) {
  const mutex = getMutex(filePath);
  await mutex.lock();
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    const tmpPath = `${filePath}.tmp`;
    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(tmpPath, json, 'utf-8');
    await fs.rename(tmpPath, filePath);
  } finally {
    mutex.unlock();
  }
}

export async function initDataFile(filePath, defaultData) {
  try {
    await fs.access(filePath);
  } catch {
    await writeJsonFile(filePath, defaultData);
  }
}

// Path helpers
export const DATA_DIR = path.resolve(__dirname, '../data');
export const complaintsFilePath = () => path.join(DATA_DIR, 'complaints.json');
export const directoryFilePath = () => path.join(DATA_DIR, 'municipal-directory.json');
