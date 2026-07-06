import dropboxDefaults from './dropbox.connector.data.json';
import { DropboxConnectorConfig } from '@es-connectors/types/connectorTypes';

export type { DropboxConnectorConfig };

export function getDropboxConnectorConfig(): DropboxConnectorConfig {
  const uniqueSuffix = Date.now();
  const envValue = (key: string): string | undefined => {
    const value = process.env[key]?.trim();
    return value || undefined;
  };

  return {
    connectorName:
      envValue('DROPBOX_CONNECTOR_NAME') ||
      dropboxDefaults.connectorName ||
      `Dropbox-Auto-${uniqueSuffix}`,
    appKey:
      envValue('DROPBOX_APP_KEY') ||
      dropboxDefaults.appKey ||
      `auto-app-key-${uniqueSuffix}`,
    appSecret:
      envValue('DROPBOX_APP_SECRET') ||
      dropboxDefaults.appSecret ||
      `auto-app-secret-${uniqueSuffix}`,
    refreshToken:
      envValue('DROPBOX_REFRESH_TOKEN') ||
      dropboxDefaults.refreshToken ||
      `auto-refresh-token-${uniqueSuffix}`,
  };
}

export function hasDropboxConnectorCredentials(config: DropboxConnectorConfig): boolean {
  return Boolean(config.appKey && config.appSecret && config.refreshToken);
}
