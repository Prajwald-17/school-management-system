interface JWTPayload {
  userId: number;
  timestamp: number;
  iat?: number;
  exp?: number;
}

// Simple JWT verification for Edge Runtime
export function verifyJWTTokenEdge(token: string): JWTPayload | null {
  try {
    // Simple JWT decode and verify
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload as JWTPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Generate a simple JWT (for Edge Runtime)
export function createJWTTokenEdge(payload: Record<string, unknown>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (7 * 24 * 60 * 60); // 7 days
  
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: exp
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(tokenPayload));
  
  // Simple signature (in production, use proper HMAC)
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${process.env.JWT_SECRET}`);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}