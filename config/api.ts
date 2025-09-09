// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

// API Endpoints
export const API_ENDPOINTS = {
  PASSKEYS: {
    CREATE: `${API_BASE_URL}/api/passkeys/create`,
    VERIFY: `${API_BASE_URL}/api/passkeys/verify`,
    GET_USER: (email: string) => `${API_BASE_URL}/api/passkeys/user/${email}`,
    DELETE: (credentialId: string) => `${API_BASE_URL}/api/passkeys/${credentialId}`,
  },
  AUTH: {
    LOGIN_PASSKEY: `${API_BASE_URL}/api/auth/login/passkey`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
  },
  EMAIL: {
    SEND_CODE: `${API_BASE_URL}/api/email/send-code`,
    VERIFY_CODE: `${API_BASE_URL}/api/email/verify-code`,
    RESEND_CODE: `${API_BASE_URL}/api/email/resend-code`,
    TEST: `${API_BASE_URL}/api/email/test`,
  },
  HEALTH: `${API_BASE_URL}/health`,
  WALLETS: `${API_BASE_URL}/api/wallets`,
  WALLETS_FOR_USER: (email: string) => `${API_BASE_URL}/api/wallets/user/${email}`,
  WALLET_BALANCE: (userId: string) => `${API_BASE_URL}/api/wallets/wallets/${userId}/balance`,
  WALLET_TRANSACTIONS: (walletId: string) => `${API_BASE_URL}/api/wallets/wallets/${walletId}/transactions`,
};
