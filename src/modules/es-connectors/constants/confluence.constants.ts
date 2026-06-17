export const CONFLUENCE = {
  connectorName: 'Atlassian Confluence Cloud',
  apiTokenMenu: 'API tokens',
  createTokenButton: 'Create API token',
  copyTokenButton: 'Copy',
  generateTokenButton: 'Generate',
  expirationMinDays: 1,
  expirationMaxDays: 365,
  showInResults: /show in (search )?results/i,
  showInResultsStatus: /enabled|disabled/i,
} as const;

export const CONFLUENCE_MESSAGES = {
  tokenGeneratedSuccess: /token.*generated|API token created/i,
  scopesVisible: /scope|permission/i,
  apiTokenRequired: /api token|fill out this field|required|enter.*token|this field is required/i,
} as const;
