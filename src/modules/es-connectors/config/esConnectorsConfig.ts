import { environment } from '@core/config/environment';
import { getUser } from '@core/config/users';

export function getEsConnectorsConfig() {
  const appManager = getUser('appManager');
  const standardUser = getUser('endUser');

  return {
    tenantUrl: environment.baseUrl,
    timeout: environment.timeout,
    appManager: {
      email: appManager.email,
      password: appManager.password,
    },
    standardUser: {
      email: standardUser.email,
      password: standardUser.password,
    },
    confluence: {
      connectorName: process.env.CONFLUENCE_CONNECTOR_NAME ?? '',
      cloudEmail: process.env.CONFLUENCE_CLOUD_EMAIL ?? '',
      apiToken: process.env.CONFLUENCE_API_TOKEN ?? '',
      urlLabel: process.env.CONFLUENCE_URL_LABEL ?? '',
    },
  };
}
