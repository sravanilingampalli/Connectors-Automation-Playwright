export interface DropboxConnectorConfig {
  connectorName: string;
  appKey: string;
  appSecret: string;
  refreshToken: string;
}

export interface BoxConnectorConfig {
  connectorName: string;
  clientId: string;
  clientSecret: string;
  enterpriseId: string;
}

export interface ConfluenceConnectorConfig {
  connectorName: string;
  cloudEmail: string;
  apiToken: string;
  urlLabel: string;
}
