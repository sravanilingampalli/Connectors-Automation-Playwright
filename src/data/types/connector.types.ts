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
