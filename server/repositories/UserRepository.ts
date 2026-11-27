import type { UserRecord } from '../types.js';

export interface UserRepository {
  findByUsername(username: string): Promise<UserRecord | null>;
}
