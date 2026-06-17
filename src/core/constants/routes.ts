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
