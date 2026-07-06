import path from 'path';

export const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
export const TEST_RESULTS_DIR = path.join(PROJECT_ROOT, 'test-results');
export const AUTH_DIR = path.join(PROJECT_ROOT, 'playwright', '.auth');
