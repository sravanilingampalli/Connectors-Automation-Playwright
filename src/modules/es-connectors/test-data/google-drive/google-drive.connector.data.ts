import fs from 'fs';
import path from 'path';
import googleDriveDefaults from './google-drive.connector.data.json';
import googleDriveSyncDefaults from './google-drive.sync.data.json';
import googleDriveAudienceDefaults from './google-drive.audience.data.json';
import {
  GoogleDrive2AudienceFilterConfig,
  GoogleDriveConnectorConfig,
  GoogleDriveSyncConfig,
} from '@es-connectors/types/connectorTypes';
import { ENTERPRISE_SEARCH } from '@es-connectors/constants';

export type { GoogleDrive2AudienceFilterConfig, GoogleDriveConnectorConfig, GoogleDriveSyncConfig };

const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'google-drive.service-account.json');

function loadServiceAccountJson(): string {
  const envValue = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON?.trim();
  if (envValue) {
    return envValue;
  }

  if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf-8')) as Record<string, unknown>;
    return JSON.stringify(serviceAccount);
  }

  return '';
}

export function getGoogleDriveConnectorConfig(): GoogleDriveConnectorConfig {
  const envValue = (key: string): string | undefined => {
    const value = process.env[key]?.trim();
    return value || undefined;
  };

  return {
    connectorName:
      envValue('GOOGLE_DRIVE_CONNECTOR_NAME') ||
      `GoogleDrive-Auto-${Date.now()}`,
    adminEmail:
      envValue('GOOGLE_DRIVE_ADMIN_EMAIL') ||
      googleDriveDefaults.adminEmail ||
      '',
    serviceAccountJson: loadServiceAccountJson(),
  };
}

export function hasGoogleDriveConnectorCredentials(config: GoogleDriveConnectorConfig): boolean {
  return Boolean(config.adminEmail && config.serviceAccountJson);
}

export function getGoogleDriveSyncConfig(): GoogleDriveSyncConfig {
  const envValue = (key: string): string | undefined => {
    const value = process.env[key]?.trim();
    return value || undefined;
  };

  return {
    statusTab: googleDriveSyncDefaults.statusTab || ENTERPRISE_SEARCH.statusTab,
    syncMenuButton: googleDriveSyncDefaults.syncMenuButton || ENTERPRISE_SEARCH.syncMenuButton,
    syncOptionsMenuButton:
      googleDriveSyncDefaults.syncOptionsMenuButton || 'Open menu',
    syncType:
      envValue('GOOGLE_DRIVE_SYNC_TYPE') ||
      googleDriveSyncDefaults.syncType ||
      'Start full sync',
    incrementalSyncType:
      googleDriveSyncDefaults.incrementalSyncType || 'Start incremental sync (faster)',
    syncTypeShort: googleDriveSyncDefaults.syncTypeShort || 'Full',
    startSyncButton: googleDriveSyncDefaults.startSyncButton || ENTERPRISE_SEARCH.startSyncButton,
    resumeSyncButton: googleDriveSyncDefaults.resumeSyncButton || ENTERPRISE_SEARCH.resumeSyncButton,
    syncNotInitiatedStatus:
      googleDriveSyncDefaults.syncNotInitiatedStatus || 'Sync not initiated',
    syncCompleteStatus: googleDriveSyncDefaults.syncCompleteStatus || 'Sync complete',
    flow: {
      enableShowInResults:
        googleDriveSyncDefaults.flow?.enableShowInResults ||
        'enable Show in results on Configuration tab',
      navigateToStatus:
        googleDriveSyncDefaults.flow?.navigateToStatus || 'navigate to Status tab',
      clickSyncDropdown:
        googleDriveSyncDefaults.flow?.clickSyncDropdown || 'click Sync down arrow to open menu',
      selectFullSync:
        googleDriveSyncDefaults.flow?.selectFullSync || 'select Start full sync',
      clickStartSync: googleDriveSyncDefaults.flow?.clickStartSync || 'click Start sync',
      waitForSyncComplete:
        googleDriveSyncDefaults.flow?.waitForSyncComplete ||
        'wait until sync completes successfully',
    },
  };
}

export function getGoogleDriveAudienceFilterConfig(): GoogleDrive2AudienceFilterConfig {
  const envValue = (key: string): string | undefined => {
    const value = process.env[key]?.trim();
    return value || undefined;
  };

  const filterMode =
    (envValue('GOOGLE_DRIVE_AUDIENCE_FILTER_MODE') as GoogleDrive2AudienceFilterConfig['filterMode']) ||
    (googleDriveAudienceDefaults.filterMode as GoogleDrive2AudienceFilterConfig['filterMode']) ||
    'include';

  return {
    parentAudienceName:
      envValue('GOOGLE_DRIVE_AUDIENCE_PARENT_NAME') ||
      googleDriveAudienceDefaults.parentAudienceName ||
      'test',
    audienceName:
      envValue('GOOGLE_DRIVE_AUDIENCE_NAME') ||
      googleDriveAudienceDefaults.audienceName ||
      'outlook',
    filterMode: filterMode === 'exclude' ? 'exclude' : 'include',
  };
}
