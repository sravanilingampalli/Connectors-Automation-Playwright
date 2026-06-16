import confluenceDefaults from './confluence.connector.data.json';

export interface ConfluenceApiTokenConfig {
  connectorName: string;
  expirationDays: number;
  requiredScopes: string[];
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
