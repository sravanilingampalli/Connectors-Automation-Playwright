export const ENTERPRISE_SEARCH = {
  manageMenuItem: 'Manage',
  enterpriseSearchLink: 'Enterprise search',
  addSourceButton: 'Add source',
  saveConfigurationButton: 'Save configuration',
  saveAndSyncButton: 'Save and sync',
  confirmIngestionButton: 'Confirm',
  startSyncButton: 'Start sync',
  resumeSyncButton: 'Resume Sync',
  statusTab: 'Status',
  dataFiltersTab: 'Data filters',
  configurationTab: 'Configuration',
  dropboxConnector: 'Dropbox',
  boxConnector: 'Box',
  sourcesHeading: 'Sources',
} as const;

export const CONNECTOR_FIELDS = {
  connectorName: 'Connection name',
  appKey: 'App Key',
  appSecret: 'App Secret',
  refreshToken: 'Refresh Token',
  clientId: 'Client ID',
  clientSecret: 'Client secret',
  enterpriseId: 'Enterprise ID',
} as const;

export const MESSAGES = {
  configurationSavedSuccess: /Saved Dropbox/i,
  boxConfigurationSavedSuccess: /Saved Box/i,
  fullSyncStarted: /full sync|syncing|sync started|initial sync|sync in progress|started sync|sync initiation|ingesting data|sync progress/i,
  syncInProgress: /sync in progress|syncing|full sync|sync initiated/i,
  syncComplete: /sync complete/i,
  syncNotInitiated: /sync not initiated/i,
  documentsIngested: /documents ingested|Total items:/i,
  twoYearIngestionFilter: /Exclude data files that were last modified before/i,
  usersIngested: /user(s)? ingested|user index|users synced/i,
  pendingConfiguration: /pending configuration/i,
  confirmConnectorCreation: /confirm|create connector|save configuration/i,
  invalidCredentialFormat: /please fill out this field|invalid|invalid format|format is invalid|enter a valid/i,
} as const;
