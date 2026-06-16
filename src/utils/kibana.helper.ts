import { APIRequestContext, expect } from '@playwright/test';

export async function verifyKibanaUserIndexIfConfigured(request: APIRequestContext): Promise<void> {
  const kibanaUrl = process.env.KIBANA_URL?.trim();
  const kibanaUser = process.env.KIBANA_USERNAME?.trim();
  const kibanaPassword = process.env.KIBANA_PASSWORD?.trim();

  if (!kibanaUrl) {
    return;
  }

  const headers: Record<string, string> = { 'kbn-xsrf': 'true' };
  if (kibanaUser && kibanaPassword) {
    headers.Authorization = `Basic ${Buffer.from(`${kibanaUser}:${kibanaPassword}`).toString('base64')}`;
  }

  const response = await request.get(`${kibanaUrl.replace(/\/$/, '')}/api/status`, { headers });
  expect(response.ok(), 'Kibana should be reachable for user index verification').toBeTruthy();
}
