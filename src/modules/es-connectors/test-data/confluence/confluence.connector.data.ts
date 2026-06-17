import confluenceDefaults from './confluence.connector.data.json';
import { ConfluenceConnectorConfig } from '@es-connectors/types/connectorTypes';

export interface ConfluenceApiTokenConfig {
  connectorName: string;
  expirationDays: number;
  requiredScopes: string[];
}

export type { ConfluenceConnectorConfig };

export function getConfluenceConnectorConfig(): ConfluenceConnectorConfig {
  const uniqueSuffix = Date.now();

  return {
    connectorName:
      process.env.CONFLUENCE_CONNECTOR_NAME ||
      confluenceDefaults.connectorName ||
      `Confluence-Auto-${uniqueSuffix}`,
    cloudEmail:
      process.env.CONFLUENCE_CLOUD_EMAIL ||
      confluenceDefaults.cloudEmail ||
      `auto-cloud-email-${uniqueSuffix}@example.com`,
    apiToken:
      process.env.CONFLUENCE_API_TOKEN ||
      confluenceDefaults.apiToken ||
      `auto-api-token-${uniqueSuffix}`,
    urlLabel:
      process.env.CONFLUENCE_URL_LABEL ||
      confluenceDefaults.urlLabel ||
      `https://auto-url-label-${uniqueSuffix}.atlassian.net`,
  };
}

export function getConfluenceApiTokenConfig(): ConfluenceApiTokenConfig {
  const expirationDays = Number(
    process.env.CONFLUENCE_TOKEN_EXPIRY_DAYS ?? confluenceDefaults.expirationDays ?? 90,
  );

  return {
    connectorName:
      process.env.CONFLUENCE_CONNECTOR_NAME ||
      confluenceDefaults.connectorName ||
      `Confluence-Auto-${Date.now()}`,
    expirationDays,
    requiredScopes: confluenceDefaults.requiredScopes,
  };
}
