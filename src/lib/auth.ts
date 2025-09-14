import bcrypt from 'bcryptjs';
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

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash OTP for storage
export async function hashOTP(otp: string): Promise<string> {
  console.log('Hashing OTP:', otp);
  const hashed = await bcrypt.hash(otp, 12);
  console.log('OTP hashed successfully, length:', hashed.length);
  return hashed;
}

// Verify OTP with detailed logging
export async function verifyOTP(otp: string, hashedOTP: string): Promise<boolean> {
  try {
    console.log('=== BCRYPT VERIFY ===');
    console.log('1. Plain OTP:', otp);
    console.log('2. Hashed OTP:', hashedOTP);
    console.log('3. Plain OTP type:', typeof otp);
    console.log('4. Hashed OTP type:', typeof hashedOTP);
    
    const result = await bcrypt.compare(otp, hashedOTP);
    console.log('5. Bcrypt compare result:', result);
    
    return result;
  } catch (error) {
    console.error('6. Bcrypt compare error:', error);
    return false;
  }
}

// Get user by email
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

// Create user
export async function createUser(email: string): Promise<User | null> {
  try {
    const pool = await getConnection();
    const [result] = await pool.query(
      'INSERT INTO users (email, is_verified) VALUES (?, TRUE)',
      [email]
    );
    const { insertId } = result as any;
    return { id: insertId, email, is_verified: true };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

// Store OTP with detailed logging
export async function storeOTP(email: string, otp: string): Promise<boolean> {
  try {
    console.log('storeOTP called with email:', email, 'OTP:', otp);
    const pool = await getConnection();
    console.log('Database connection established');
    
    const hashedOTP = await hashOTP(otp);
    console.log('OTP hashed successfully');
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log('Expiry time set:', expiresAt);
    
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

// Verify stored OTP with detailed logging
export async function verifyStoredOTP(email: string, otp: string): Promise<boolean> {
  try {
    console.log('=== VERIFY STORED OTP FUNCTION CALLED ===');
    console.log('1. Email:', email);
    console.log('2. Entered OTP:', otp);
    console.log('3. OTP type:', typeof otp);
    console.log('4. OTP length:', otp.length);
    
    const pool = await getConnection();
    console.log('5. Database connection established');
    
    const [rows] = await pool.query(
      'SELECT * FROM otps WHERE email = ? AND is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    
    console.log('6. Database query executed');
    console.log('7. Query result rows length:', (rows as any[]).length);
    console.log('8. Query result:', rows);
    
    const otps = rows as OTP[];
    if (otps.length === 0) {
      console.log('9. No valid OTP found in database');
      return false;
    }
    
    const storedOTP = otps[0];
    console.log('10. Found OTP in database:');
    console.log('   - ID:', storedOTP.id);
    console.log('   - Email:', storedOTP.email);
    console.log('   - Stored hash:', storedOTP.otp_code);
    console.log('   - Expires at:', storedOTP.expires_at);
    console.log('   - Is used:', storedOTP.is_used);
    
    console.log('11. About to call verifyOTP (bcrypt compare)...');
    const isValid = await verifyOTP(otp, storedOTP.otp_code);
    console.log('12. Bcrypt comparison result:', isValid);
    
    if (isValid) {
      console.log('13. OTP is valid, marking as used...');
      await pool.query('UPDATE otps SET is_used = TRUE WHERE id = ?', [storedOTP.id]);
      console.log('14. OTP marked as used');
      return true;
    }
    
    console.log('13. OTP is invalid');
    return false;
  } catch (error) {
    console.error('=== VERIFY STORED OTP ERROR ===');
    console.error('Error verifying OTP:', error);
    return false;
  }
}

// Create session (using the simple JWT from jwt.ts)
export async function createSession(userId: number): Promise<string | null> {
  try {
    const pool = await getConnection();
    
    // Import here to avoid Edge Runtime issues
    const jwt = require('jsonwebtoken');
    const sessionToken = jwt.sign(
      { userId, timestamp: Date.now() },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
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

// Verify session (for API routes - Node.js runtime)
export async function verifySession(sessionToken: string): Promise<User | null> {
  try {
    const jwt = require('jsonwebtoken');
    
    // Verify JWT token
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
    
    const results = rows as any[];
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}
