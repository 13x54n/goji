export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.0.82:4000';

// API Endpoints
export const API_ENDPOINTS = {
  PASSKEYS: {
    CREATE: `${API_BASE_URL}/api/passkeys/create`,
    VERIFY: `${API_BASE_URL}/api/passkeys/verify`,
    GET_USER: (email: string) => `${API_BASE_URL}/api/passkeys/user/${email}`,
    DELETE: (credentialId: string) => `${API_BASE_URL}/api/passkeys/${credentialId}`,
  },
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGIN_PASSKEY: `${API_BASE_URL}/api/auth/login/passkey`,
    PASSWORD: `${API_BASE_URL}/api/auth/password`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
  },
  EMAIL: {
    SEND_CODE: `${API_BASE_URL}/api/email/send-code`,
    VERIFY_CODE: `${API_BASE_URL}/api/email/verify-code`,
    RESEND_CODE: `${API_BASE_URL}/api/email/resend-code`,
    TEST: `${API_BASE_URL}/api/email/test`,
  },
  HEALTH: `${API_BASE_URL}/health`,
};
