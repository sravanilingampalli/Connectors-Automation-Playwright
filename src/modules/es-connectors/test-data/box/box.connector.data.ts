import boxDefaults from './box.connector.data.json';
import boxInvalidDefaults from './box.invalid.connector.data.json';
import { BoxConnectorConfig } from '@es-connectors/types/connectorTypes';

export type { BoxConnectorConfig };

export function getBoxConnectorConfig(): BoxConnectorConfig {
  const uniqueSuffix = Date.now();
  const envValue = (key: string): string | undefined => {
    const value = process.env[key]?.trim();
    return value || undefined;
  };

  return {
    connectorName:
      envValue('BOX_CONNECTOR_NAME') ||
      boxDefaults.connectorName ||
      `Box-Auto-${uniqueSuffix}`,
    clientId:
      envValue('BOX_CLIENT_ID') ||
      boxDefaults.clientId ||
      '',
    clientSecret:
      envValue('BOX_CLIENT_SECRET') ||
      boxDefaults.clientSecret ||
      '',
    enterpriseId:
      envValue('BOX_ENTERPRISE_ID') ||
      String(boxDefaults.enterpriseId ?? '') ||
      '',
  };
}

export function hasBoxConnectorCredentials(config: BoxConnectorConfig): boolean {
  return Boolean(config.clientId && config.clientSecret && config.enterpriseId);
}

export function getBoxInvalidConnectorConfig(): BoxConnectorConfig {
  const uniqueSuffix = Date.now();

  return {
    connectorName: `${boxInvalidDefaults.connectorName}-${uniqueSuffix}`,
    clientId: boxInvalidDefaults.clientId,
    clientSecret: boxInvalidDefaults.clientSecret,
    enterpriseId: boxInvalidDefaults.enterpriseId,
  };
}
