// Authentication Functions
class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        this.isAuthenticated = false;
    }

    // Initialize auth state
    async init() {
        if (this.token) {
            await this.verifyToken();
        } else {
            this.logout();
        }
        this.updateUI();
    }

    // Verify token with backend
    async verifyToken() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.user = await response.json();
                this.isAuthenticated = true;
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            this.logout();
        }
    }

    // Login user
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.token;
                this.user = data.user;
                this.isAuthenticated = true;
                localStorage.setItem('token', this.token);
                this.updateUI();
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    // Register new user
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.token;
                this.user = data.user;
                this.isAuthenticated = true;
                localStorage.setItem('token', this.token);
                this.updateUI();
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    // Logout user
    logout() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('token');
        this.updateUI();
    }

    // Update UI based on auth state
    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');

        if (this.isAuthenticated && this.user) {
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            if (userName) {
                userName.textContent = this.user.name;
            }
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    // Get user role
    getUserRole() {
        return this.user ? this.user.role : null;
    }

    // Check if user is admin
    isAdmin() {
        return this.getUserRole() === 'admin';
    }

    // Check if user is vendor
    isVendor() {
        return this.getUserRole() === 'vendor';
    }

    // Get auth headers for API requests
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`
        };
    }
}

// Create global auth instance
const auth = new Auth();

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
});

