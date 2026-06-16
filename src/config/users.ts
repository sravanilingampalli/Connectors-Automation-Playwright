import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export type UserRole = 'appManager' | 'endUser';

export interface UserCredentials {
  role: UserRole;
  userId?: string;
  email: string;
  password: string;
}

export const users: Record<UserRole, UserCredentials> = {
  appManager: {
    role: 'appManager',
    userId: process.env.APP_MANAGER_USER_ID ?? 'f5d45f54-1f52-48d8-8b17-3efa0767e500',
    email: process.env.APP_MANAGER_EMAIL ?? 'developer@simpplr.com',
    password: process.env.APP_MANAGER_PASSWORD ?? '',
  },
  endUser: {
    role: 'endUser',
    email: process.env.END_USER_EMAIL ?? 'sravani.lingampalli+standarduser@simpplr.com',
    password: process.env.END_USER_PASSWORD ?? '',
  },
};

export function getUser(role: UserRole): UserCredentials {
  return users[role];
}
