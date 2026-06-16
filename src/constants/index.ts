export const APP = {
  name: 'Zeus Test Sen',
  baseUrl: 'https://zeus-test-sen.test.simpplr.xyz',
} as const;

export const ROUTES = {
  home: '/home',
  login: '/login',
  loginAuthenticate: '/login/authenticate',
  applicationSettings: '/nav-application-settings',
  enterpriseSearchSources: '/manage/enterpriseSearch/sources/apps',
} as const;

export const TIMEOUTS = {
  short: 5_000,
  medium: 15_000,
  long: 60_000,
} as const;

export * from './enterprise-search.constants';
export * from './confluence.constants';
