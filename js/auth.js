/**
 * auth.js - Authentication with Role-Based Routing (JWT version)
 * Uses custom login endpoint that returns access+refresh tokens and user data
 */

const Auth = (() => {
  const ACCESS_KEY = 'ara_jwt_access';
  const REFRESH_KEY = 'ara_jwt_refresh';
  const USER_KEY = 'ara_current_user';

  return {
    /**
     * Login user, store tokens, redirect by role
     */
    login: async (username, password) => {
      try {
        console.log('[Auth] Attempting login with username:', username);

        const url = `${CONFIG.API_BASE_URL}/auth/login/`;
        console.log('[Auth] Login URL:', url);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        console.log('[Auth] Response status:', response.status);
        const data = await response.json();
        console.log('[Auth] Response data:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        // Expect JWT: { access, refresh, user }
        if (!data.access || !data.refresh || !data.user) {
          console.error('[Auth] Invalid response structure. Expected {access,refresh,user}, got:', data);
          throw new Error('Invalid login response from server');
        }

        // Store both tokens and user info
        localStorage.setItem(ACCESS_KEY, data.access);
        localStorage.setItem(REFRESH_KEY, data.refresh);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));

        console.log(`[Auth] Login successful: ${data.user.username} (${data.user.role})`);

        // Redirect user based on role
        Auth.redirectToDashboard(data.user.role);

        return data;
      } catch (error) {
        console.error('[Auth] Login error:', error.message);
        throw error;
      }
    },

    /**
     * Redirect user by role
     */
    redirectToDashboard: (role) => {
      const redirectMap = {
        'PARENT': 'pages/parent.html',
        'TEACHER': 'pages/teacher.html',
        'SPECIALIST': 'pages/specialist.html',
        'ADMIN': 'pages/admin.html',
      };

      const redirectUrl = redirectMap[role] || 'pages/parent.html';
      console.log(`[Auth] Redirecting ${role} to ${redirectUrl}`);
      window.location.href = redirectUrl;
    },

    /**
     * Logout user (blacklist refresh token on backend), clear storage, redirect
     */
    logout: async () => {
      try {
        const access = localStorage.getItem(ACCESS_KEY);
        const refresh = localStorage.getItem(REFRESH_KEY);
        if (refresh) {
          await fetch(`${CONFIG.API_BASE_URL}/auth/logout/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${access}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh }),
          });
        }
      } catch (error) {
        console.error('[Auth] Logout error:', error);
      } finally {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = '/index.html';
      }
    },

    /**
     * Get current user info
     */
    getCurrentUser: () => {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    },

    /**
     * Get JWT tokens
     */
    getAccessToken: () => localStorage.getItem(ACCESS_KEY),
    getRefreshToken: () => localStorage.getItem(REFRESH_KEY),

    /**
     * Check authentication
     */
    isAuthenticated: () => {
      return !!localStorage.getItem(ACCESS_KEY) && !!localStorage.getItem(USER_KEY);
    },

    /**
     * Role checks
     */
    hasRole: (requiredRole) => {
      const user = Auth.getCurrentUser();
      return user && user.role === requiredRole;
    },

    hasAnyRole: (roles) => {
      const user = Auth.getCurrentUser();
      return user && roles.includes(user.role);
    },

    /**
     * Require specific role pages
     */
    requireRole: (requiredRole) => {
      if (!Auth.isAuthenticated()) {
        console.warn('[Auth] Not authenticated, redirecting to login');
        window.location.href = 'index.html';
        return false;
      }

      const user = Auth.getCurrentUser();
      if (user.role !== requiredRole) {
        console.error(`[Auth] User ${user.username} (${user.role}) tried to access ${requiredRole} page`);
        alert(`Access denied. This page is for ${requiredRole}s only.`);
        Auth.redirectToDashboard(user.role);
        return false;
      }

      return true;
    },

    requireAnyRole: (roles) => {
      if (!Auth.isAuthenticated()) {
        console.warn('[Auth] Not authenticated, redirecting to login');
        window.location.href = 'index.html';
        return false;
      }

      const user = Auth.getCurrentUser();
      if (!roles.includes(user.role)) {
        console.error(`[Auth] User ${user.username} (${user.role}) tried to access restricted page`);
        alert(`Access denied. This page is for ${roles.join(', ')} only.`);
        Auth.redirectToDashboard(user.role);
        return false;
      }

      return true;
    },
  };
})();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}
