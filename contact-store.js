import { mkdir, readFile, writeFile, stat } from 'fs/promises';
import os from 'os';
import path from 'path';

const dataFile = path.resolve(process.cwd(), 'data', 'contacts.json');
const tmpDir = path.join(os.tmpdir(), 'genc-balisha');
const tmpFile = path.join(tmpDir, 'contacts.json');

let initialized = false;
let entries = [];

const readJson = async (filePath) => {
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content);
};

const ensureTmpFile = async () => {
  try {
    await stat(tmpDir);
  } catch {
    await mkdir(tmpDir, { recursive: true });
  }
  try {
    await stat(tmpFile);
  } catch {
    await writeFile(tmpFile, '[]');
  }
};

const loadInitialEntries = async () => {
  try {
    await stat(tmpFile);
    entries = await readJson(tmpFile);
  } catch {
    try {
      entries = await readJson(dataFile);
    } catch {
      entries = [];
    }
  }
};

export const initStore = async () => {
  if (initialized) return;
  try {
    await ensureTmpFile();
  } catch {
    // ignore if tmp directory cannot be created
  }
  await loadInitialEntries();
  initialized = true;
};

export const getEntries = async () => {
  await initStore();
  return entries;
};

export const addEntry = async (entry) => {
  await initStore();
  entries.push(entry);
  try {
    await ensureTmpFile();
    await writeFile(tmpFile, JSON.stringify(entries, null, 2));
  } catch {
    // if tmp not writable, ignore
  }
  return entries;
};
