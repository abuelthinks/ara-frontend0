/**
 * Centralized Configuration
 * Update API_BASE_URL for different environments
 */

const CONFIG = {
  // Environment: 'development' or 'production'
  ENV: 'development',
  
  // Django REST API Base URL
  // LOCAL: http://localhost:8000
  // PRODUCTION: https://your-domain.com
  API_BASE_URL: 'http://localhost:8000/api',
  
  // API Endpoints
  ENDPOINTS: {
    AUTH_LOGIN: '/auth/login/',
    AUTH_LOGOUT: '/auth/logout/',
    CHILDREN: '/children/',
    IEP: '/iep/',
    ASSESSMENTS: '/assessments/',
    PROGRESS: '/progress/',
    USERS: '/users/',
  },
  
  // Token keys
  TOKEN_KEY: 'ara_auth_token',
  USER_KEY: 'ara_current_user',
  
  // Features
  FEATURES: {
    AUTO_LOGOUT_MINUTES: 30,
    REFRESH_TOKEN_ENABLED: false,
  }
};

window.CONFIG = CONFIG;