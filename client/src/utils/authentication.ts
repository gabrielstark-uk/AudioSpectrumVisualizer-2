import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '1h';

// Configuration
const USERS_DB_PATH = join(__dirname, 'users.db');

// User session storage
const activeSessions = new Map<string, Session>();

interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'user' | 'admin';
}

interface Session {
  userId: string;
  token: string;
  lastActivity: Date;
}

// Initialize users database
if (!existsSync(USERS_DB_PATH)) {
  mkdirSync(join(__dirname), { recursive: true });
  writeFileSync(USERS_DB_PATH, JSON.stringify([]));
}

// Create a new user
export async function createUser(username: string, password: string, role: 'user' | 'admin' = 'user'): Promise<User> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user: User = {
    id: uuidv4(),
    username,
    passwordHash,
    role
  };

  // Save user to database
  const users = JSON.parse(readFileSync(USERS_DB_PATH, 'utf-8'));
  users.push(user);
  writeFileSync(USERS_DB_PATH, JSON.stringify(users));

  return user;
}

// Authenticate user
export async function authenticate(username: string, password: string): Promise<string | null> {
  // In a real application, this would fetch from a database
  const users = JSON.parse(readFileSync(USERS_DB_PATH, 'utf-8'));
  const user = users.find((u: User) => u.username === username);
  if (!user) return null;

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) return null;

  // Create JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  // Store session
  activeSessions.set(user.id, {
    userId: user.id,
    token,
    lastActivity: new Date()
  });

  return token;
}

// Verify JWT token
export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Logout user
export function logout(userId: string): void {
  activeSessions.delete(userId);
}

// Check session activity
export function checkSessionActivity(userId: string): boolean {
  const session = activeSessions.get(userId);
  if (!session) return false;

  // Check if session is expired
  const now = new Date();
  const diff = now.getTime() - session.lastActivity.getTime();
  return diff < 3600000; // 1 hour
}

