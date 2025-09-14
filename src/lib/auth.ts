import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getConnection } from './db';

export interface User {
  id: number;
  email: string;
  is_verified: boolean;
}

export interface OTP {
  id: number;
  email: string;
  otp_code: string;
  expires_at: Date;
  is_used: boolean;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashOTP(otp: string): Promise<string> {
  console.log('Hashing OTP:', otp);
  const hashed = await bcrypt.hash(otp, 12);
  console.log('OTP hashed successfully, length:', hashed.length);
  return hashed;
}

export async function verifyOTP(otp: string, hashedOTP: string): Promise<boolean> {
  try {
    console.log('=== BCRYPT VERIFY ===');
    console.log('1. Plain OTP:', otp);
    console.log('2. Hashed OTP:', hashedOTP);
    
    const result = await bcrypt.compare(otp, hashedOTP);
    console.log('5. Bcrypt compare result:', result);
    
    return result;
  } catch (_error) {
    console.error('6. Bcrypt compare error:', _error);
    return false;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const pool = await getConnection();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function createUser(email: string): Promise<User | null> {
  try {
    const pool = await getConnection();
    const [result] = await pool.query(
      'INSERT INTO users (email, is_verified) VALUES (?, TRUE)',
      [email]
    );
    const { insertId } = result as { insertId: number };
    return { id: insertId, email, is_verified: true };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function storeOTP(email: string, otp: string): Promise<boolean> {
  try {
    console.log('storeOTP called with email:', email, 'OTP:', otp);
    const pool = await getConnection();
    
    const hashedOTP = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    const [result] = await pool.query(
      'INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)',
      [email, hashedOTP, expiresAt]
    );
    console.log('OTP inserted into database:', result);
    
    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    return false;
  }
}

export async function verifyStoredOTP(email: string, otp: string): Promise<boolean> {
  try {
    const pool = await getConnection();
    
    const [rows] = await pool.query(
      'SELECT * FROM otps WHERE email = ? AND is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    
    console.log('7. Query result rows length:', (rows as unknown[]).length);
    
    const otps = rows as OTP[];
    if (otps.length === 0) {
      return false;
    }
    
    const storedOTP = otps[0];
    const isValid = await verifyOTP(otp, storedOTP.otp_code);
    
    if (isValid) {
      await pool.query('UPDATE otps SET is_used = TRUE WHERE id = ?', [storedOTP.id]);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
}

export async function createSession(userId: number): Promise<string | null> {
  try {
    const pool = await getConnection();
    
    const sessionToken = jwt.sign(
      { userId, timestamp: Date.now() },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await pool.query(
      'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)',
      [userId, sessionToken, expiresAt]
    );
    
    return sessionToken;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

export async function verifySession(sessionToken: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET!);
    if (!decoded) return null;

    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT u.*, s.expires_at 
       FROM users u 
       JOIN user_sessions s ON u.id = s.user_id 
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    );
    
    const results = rows as User[];
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}
