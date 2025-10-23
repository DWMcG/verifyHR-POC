// src/utils/utils.ts
import crypto from 'crypto';

export function hashPersonalInfo(userInfo: { fullName: string; dateOfBirth: string; email: string }): string {
  const data = `${userInfo.fullName}|${userInfo.dateOfBirth}|${userInfo.email}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function generateUniqueHash(): string {
  return crypto.randomBytes(16).toString('hex');
}
