import dropboxDefaults from './dropbox.connector.data.json';
import { DropboxConnectorConfig } from '../../types/connector.types';

export type { DropboxConnectorConfig };

export function getDropboxConnectorConfig(): DropboxConnectorConfig {
  const uniqueSuffix = Date.now();

  return {
    connectorName:
      process.env.DROPBOX_CONNECTOR_NAME ||
      dropboxDefaults.connectorName ||
      `Dropbox-Auto-${uniqueSuffix}`,
    appKey:
      process.env.DROPBOX_APP_KEY ||
      dropboxDefaults.appKey ||
      `auto-app-key-${uniqueSuffix}`,
    appSecret:
      process.env.DROPBOX_APP_SECRET ||
      dropboxDefaults.appSecret ||
      `auto-app-secret-${uniqueSuffix}`,
    refreshToken:
      process.env.DROPBOX_REFRESH_TOKEN ||
      dropboxDefaults.refreshToken ||
      `auto-refresh-token-${uniqueSuffix}`,
  };
}
