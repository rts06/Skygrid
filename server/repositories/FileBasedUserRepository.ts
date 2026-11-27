import fs from 'fs/promises';
import path from 'path';
import type { UserRecord } from '../types.js';
import type { UserRepository } from './UserRepository.js';

export class FileBasedUserRepository implements UserRepository {
  private readonly filePath: string;

  constructor(dataFilePath?: string) {
    this.filePath =
      dataFilePath ?? path.resolve(process.cwd(), 'server', 'data', 'users.json');
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    const raw = await fs.readFile(this.filePath, 'utf-8');
    const users = JSON.parse(raw) as UserRecord[];
    if (!Array.isArray(users)) {
      return null;
    }
    const normalized = username.trim().toLowerCase();
    return (
      users.find((u) => u.username.toLowerCase() === normalized) ?? null
    );
  }
}
