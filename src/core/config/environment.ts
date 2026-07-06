import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export type EnvironmentName = 'local' | 'staging' | 'production';

export interface EnvironmentConfig {
  name: EnvironmentName;
  baseUrl: string;
  timeout: number;
}

const envName = (process.env.ENV ?? 'local') as EnvironmentName;

const environments: Record<EnvironmentName, EnvironmentConfig> = {
  local: {
    name: 'local',
    baseUrl: process.env.LOCAL_BASE_URL ?? 'https://zeus-test-sen.test.simpplr.xyz',
    timeout: Number(process.env.TIMEOUT ?? 60_000),
  },
  staging: {
    name: 'staging',
    baseUrl: process.env.STAGING_BASE_URL ?? '',
    timeout: Number(process.env.TIMEOUT ?? 60_000),
  },
  production: {
    name: 'production',
    baseUrl: process.env.PROD_BASE_URL ?? '',
    timeout: Number(process.env.TIMEOUT ?? 60_000),
  },
};

export const environment = environments[envName] ?? environments.local;
