import crypto from 'crypto';
import type { UserRepository } from '../repositories/UserRepository.js';
import type { AuthenticatedUser } from '../types.js';
import { signJwt } from '../utils/jwt.js';

export interface LoginResult {
  token: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthenticatedUser;
}

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hashHex] = storedHash.split(':');
    if (!salt || !hashHex) {
      return false;
    }
    const derived = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(hashHex, 'hex');
    if (derived.length !== storedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(derived, storedBuf);
  }

  async login(username: string, password: string): Promise<LoginResult | null> {
    const user = await this.userRepository.findByUsername(username);
    if (!user || !this.verifyPassword(password, user.passwordHash)) {
      return null;
    }

    const expiresIn = 3600;
    const token = signJwt(
      {
        sub: user.username,
        fullName: user.fullName,
        role: user.role,
      },
      expiresIn
    );

    return {
      token,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
