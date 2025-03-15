// Type definitions for Electron API
interface ElectronAPI {
  getAppPath: () => Promise<string>;
}

// Check if running in Electron
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && window.electron !== undefined;
};

// Get the Electron API if available
export const getElectronAPI = (): ElectronAPI | undefined => {
  if (isElectron()) {
    return (window as any).electron as ElectronAPI;
  }
  return undefined;
};

// Get user data path (for storing app data)
export const getUserDataPath = async (): Promise<string | null> => {
  const api = getElectronAPI();
  if (api) {
    return await api.getAppPath();
  }
  return null;
};

// Helper to determine if we should use local API or remote API
export const getApiBaseUrl = (): string => {
  if (isElectron()) {
    // In Electron production, use local server
    if (import.meta.env.PROD) {
      return 'http://localhost:3000';
    }
  }

  // In development or web version, use the provided API URL
  return import.meta.env.VITE_API_URL || '/api';
};