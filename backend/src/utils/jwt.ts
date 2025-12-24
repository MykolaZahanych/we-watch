import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  userId: number;
  email: string;
  nickname: string;
}

/**
 * Generate a JWT token for a user
 * @param payload - User data to include in the token
 * @param expiresIn - Token expiration time (default: '7d')
 * @returns JWT token string
 */
export function generateToken(payload: TokenPayload, expiresIn: string | number = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}

