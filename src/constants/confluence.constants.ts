export const CONFLUENCE = {
  connectorName: 'Atlassian Confluence Cloud',
  apiTokenMenu: 'API tokens',
  createTokenButton: 'Create API token',
  copyTokenButton: 'Copy',
  generateTokenButton: 'Generate',
  expirationMinDays: 1,
  expirationMaxDays: 365,
} as const;

export const CONFLUENCE_MESSAGES = {
  tokenGeneratedSuccess: /token.*generated|API token created/i,
  scopesVisible: /scope|permission/i,
} as const;
