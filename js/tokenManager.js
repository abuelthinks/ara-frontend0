const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000; // Refresh every 4 minutes (before 5 min expiry)

let refreshTimer = null;

export const startTokenRefreshTimer = (refreshToken) => {
    // Clear any existing timer
    if (refreshTimer) clearInterval(refreshTimer);
    
    // Auto-refresh token every 4 minutes
    refreshTimer = setInterval(async () => {
        try {
            const response = await fetch('https://ara-test1-ca0b96725df3.herokuapp.com/api/token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshToken }),
            });
            
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access);
                console.log('Token refreshed automatically');
            } else {
                // Refresh failed, user needs to login again
                logout();
            }
        } catch (error) {
            console.error('Token refresh error:', error);
        }
    }, TOKEN_REFRESH_INTERVAL);
};

export const stopTokenRefreshTimer = () => {
    if (refreshTimer) clearInterval(refreshTimer);
};
