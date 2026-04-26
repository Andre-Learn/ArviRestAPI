import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'src', 'users.json');
const KEYS_PATH = path.join(process.cwd(), 'src', 'apikeys.json');
const USAGE_PATH = path.join(process.cwd(), 'src', 'usage.json');

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  apiKey: string;
  plan: 'free' | 'basic' | 'pro' | 'premium';
  createdAt: string;
  expiredAt: string | null;
}

export interface UsageRecord {
  userId: string;
  date: string;
  count: number;
}

export const PLANS: Record<string, { limit: number; delay: number; label: string; price: string }> = {
  free:    { limit: 500,  delay: 5000, label: 'Free',    price: 'Gratis' },
  basic:   { limit: 1500, delay: 4000, label: 'Basic',   price: 'Rp10.000' },
  pro:     { limit: 3500, delay: 3000, label: 'Pro',     price: 'Rp15.000' },
  premium: { limit: 5000, delay: 2000, label: 'Premium', price: 'Rp25.000' },
};

function readDB(): User[] {
  if (!fs.existsSync(DB_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); } catch { return []; }
}

function writeDB(users: User[]) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

function readUsage(): UsageRecord[] {
  if (!fs.existsSync(USAGE_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(USAGE_PATH, 'utf-8')); } catch { return []; }
}

function writeUsage(records: UsageRecord[]) {
  fs.writeFileSync(USAGE_PATH, JSON.stringify(records, null, 2));
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'zfloryn_salt_2026').digest('hex');
}

export function generateApiKey(): string {
  return 'zf_' + crypto.randomBytes(24).toString('hex');
}

export function generateToken(userId: string): string {
  const payload = userId + ':' + Date.now() + ':' + Math.random().toString(36);
  return Buffer.from(payload).toString('base64url');
}

export function createUser(username: string, email: string, password: string): User | null {
  const users = readDB();
  if (users.find(u => u.email === email || u.username === username)) return null;
  const user: User = {
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash: hashPassword(password),
    apiKey: generateApiKey(),
    plan: 'free',
    createdAt: new Date().toISOString(),
    expiredAt: null,
  };
  users.push(user);
  writeDB(users);
  return user;
}

export function loginUser(emailOrUsername: string, password: string): User | null {
  const users = readDB();
  const hash = hashPassword(password);
  return users.find(u => (u.email === emailOrUsername || u.username === emailOrUsername) && u.passwordHash === hash) || null;
}

export function getUserById(id: string): User | null {
  return readDB().find(u => u.id === id) || null;
}

export function getUserByApiKey(key: string): User | null {
  return readDB().find(u => u.apiKey === key) || null;
}

export function regenerateApiKey(userId: string): string | null {
  const users = readDB();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx].apiKey = generateApiKey();
  writeDB(users);
  return users[idx].apiKey;
}

export function getTodayUsage(userId: string): number {
  const today = new Date().toISOString().slice(0, 10);
  const records = readUsage();
  return records.find(r => r.userId === userId && r.date === today)?.count || 0;
}

export function incrementUsage(userId: string): number {
  const today = new Date().toISOString().slice(0, 10);
  const records = readUsage();
  const idx = records.findIndex(r => r.userId === userId && r.date === today);
  if (idx === -1) {
    records.push({ userId, date: today, count: 1 });
    writeUsage(records);
    return 1;
  }
  records[idx].count++;
  writeUsage(records);
  return records[idx].count;
}

// Simple session store (in-memory + file backup)
const sessions = new Map<string, { userId: string; expiresAt: number }>();

export function createSession(userId: string): string {
  const token = generateToken(userId);
  sessions.set(token, { userId, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return token;
}

export function getSession(token: string): string | null {
  const s = sessions.get(token);
  if (!s || Date.now() > s.expiresAt) { sessions.delete(token); return null; }
  return s.userId;
}

export function deleteSession(token: string) {
  sessions.delete(token);
}
