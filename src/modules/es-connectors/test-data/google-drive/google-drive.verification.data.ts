import googleDriveDefaults from './google-drive.connector.data.json';
import googleDriveVerificationDefaults from './google-drive.verification.data.json';

export interface GoogleDriveVerificationConfig {
  folderName: string;
  preferredSearchFile?: string;
  excludedSearchFile?: string;
  connectorSourceName: string;
}

export interface GoogleDriveWebCredentials {
  email: string;
  password: string;
}

export function getGoogleDriveVerificationConfig(): GoogleDriveVerificationConfig {
  const envValue = (key: string): string | undefined => {
    const value = process.env[key]?.trim();
    return value || undefined;
  };

  return {
    folderName: envValue('GOOGLE_DRIVE_FOLDER_NAME') || googleDriveVerificationDefaults.folderName,
    preferredSearchFile:
      envValue('GOOGLE_DRIVE_SEARCH_FILE') || googleDriveVerificationDefaults.preferredSearchFile,
    excludedSearchFile:
      envValue('GOOGLE_DRIVE_EXCLUDED_SEARCH_FILE') || googleDriveVerificationDefaults.excludedSearchFile,
    connectorSourceName:
      envValue('GOOGLE_DRIVE_SOURCE_NAME') || googleDriveVerificationDefaults.connectorSourceName,
  };
}

export function getGoogleDriveWebCredentials(): GoogleDriveWebCredentials {
  const envValue = (key: string): string | undefined => {
    const value = process.env[key]?.trim();
    return value || undefined;
  };

  return {
    email:
      envValue('GOOGLE_DRIVE_WEB_EMAIL') ||
      envValue('GOOGLE_DRIVE_ADMIN_EMAIL') ||
      googleDriveDefaults.adminEmail ||
      '',
    password: envValue('GOOGLE_DRIVE_WEB_PASSWORD') || '',
  };
}
