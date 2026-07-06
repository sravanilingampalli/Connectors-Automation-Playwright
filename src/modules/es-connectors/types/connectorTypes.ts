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

export interface GoogleDriveConnectorConfig {
  connectorName: string;
  adminEmail: string;
  serviceAccountJson: string;
}

export interface GoogleDriveSyncFlowSteps {
  enableShowInResults: string;
  navigateToStatus: string;
  clickSyncDropdown: string;
  selectFullSync: string;
  clickStartSync: string;
  waitForSyncComplete: string;
}

export interface GoogleDriveSyncConfig {
  statusTab: string;
  syncMenuButton: string;
  syncOptionsMenuButton: string;
  syncType: string;
  incrementalSyncType: string;
  syncTypeShort: string;
  startSyncButton: string;
  resumeSyncButton: string;
  syncNotInitiatedStatus: string;
  syncCompleteStatus: string;
  flow: GoogleDriveSyncFlowSteps;
}

export interface GoogleDrive2ConnectorConfig {
  connectorName: string;
  adminEmail: string;
  serviceAccountJson: string;
}

export interface GoogleDrive2SyncFlowSteps {
  enableShowInResults: string;
  navigateToStatus: string;
  clickSyncDropdown: string;
  selectFullSync: string;
  clickStartSync: string;
  waitForSyncComplete: string;
}

export interface GoogleDrive2SyncConfig {
  statusTab: string;
  syncMenuButton: string;
  syncOptionsMenuButton: string;
  syncType: string;
  incrementalSyncType: string;
  syncTypeShort: string;
  startSyncButton: string;
  resumeSyncButton: string;
  syncNotInitiatedStatus: string;
  syncCompleteStatus: string;
  flow: GoogleDrive2SyncFlowSteps;
}

export interface GoogleDrive2AudienceFilterConfig {
  parentAudienceName: string;
  audienceName: string;
  filterMode: 'include' | 'exclude';
}

export interface SyncHistoryEntry {
  timestamp: string;
  status: string;
  syncType: string;
  itemsSynced: number;
}
