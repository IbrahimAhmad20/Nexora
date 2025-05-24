// API Service
class ApiService {
    constructor() {
        this.baseUrl = window.API_BASE_URL + '/api';
    }

    // Generic request method
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const token = localStorage.getItem('token');
            options.headers = options.headers || {};
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                ...options,
                headers: options.headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Product endpoints
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/products?${queryString}`);
    }

    async getProduct(id) {
        return this.request(`/products/${id}`);
    }

    async searchProducts(query) {
        return this.request(`/products/search?q=${encodeURIComponent(query)}`);
    }

    async createProduct(formData) {
        const response = await fetch(`${this.baseUrl}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error creating product');
        }

        return response.json();
    }

    async updateProduct(productId, formData) {
        const response = await fetch(`${this.baseUrl}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error updating product');
        }

        return response.json();
    }

    async deleteProduct(productId) {
        const response = await fetch(`${this.baseUrl}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        return await response.json();
    }
    async deleteVendor(vendorId) {
        const url = `/vendor/admin/vendors/${vendorId}`;
        const headers = { 'Content-Type': 'application/json' };
        console.log('[api] deleteVendor url:', url);
        try {
            const res = await this.request(url, {
                method: 'DELETE',
                headers
            });
            console.log('[api] deleteVendor response:', res);
            return res;
        } catch (err) {
            console.error('[api] deleteVendor error:', err);
            throw err;
        }
    }
    // Cart endpoints
    async getCart() {
        const token = localStorage.getItem('token');
        const res = await fetch(window.API_BASE_URL + '/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await res.json();
    }

    async addToCart(productId, quantity = 1) {
        return this.request('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    }

    async updateCartItem(productId, quantity) {
        return this.request(`/cart/items/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    }

    async removeFromCart(productId) {
        return this.request(`/cart/items/${productId}`, {
            method: 'DELETE'
        });
    }

    async getCartCount() {
        return this.request('/cart/count');
    }

    // Order endpoints
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders() {
        return this.request('/orders');
    }

    async getOrder(id) {
        return this.request(`/orders/${id}`);
    }

    async updateOrderStatus(id, status) {
        return this.request(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Vendor endpoints
    async getVendorProfile() {
        return this.request('/vendor/profile');
    }

    async updateVendorProfile(profileData) {
        return this.request('/vendor/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async getVendorProducts() {
        const response = await fetch(`${this.baseUrl}/products/vendor`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error fetching vendor products');
        }

        return response.json();
    }

    async getVendorOrders() {
        return this.request('/vendor/orders');
    }

    // Admin endpoints
    async getAllUsers() {
        return this.request('/admin/users');
    }

    async updateUser(userId, data) {
        return this.request(`/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteUser(userId) {
        return this.request(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
    }

    async bulkDeleteUsers(userIds) {
        return this.request('/admin/users/bulk-delete', {
            method: 'POST',
            body: JSON.stringify({ userIds })
        });
    }

    async getDashboardAnalytics() {
        return this.request('/admin/dashboard/analytics');
    }

    async updateUserRole(userId, role) {
        return this.request(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    }

    async getAllVendors() {
        return this.request('/vendor/admin/vendors');
    }
    async getAllProducts() {
        return this.request('/admin/products');
    }
    async updateVendorStatus(vendorId, status) {
        const body = { status };
        const url = `/vendor/admin/vendors/${vendorId}/status`;
        const headers = { 'Content-Type': 'application/json' };
        console.log('[api] updateVendorStatus payload:', body);
        console.log('[api] updateVendorStatus url:', url);
        console.log('[api] updateVendorStatus headers:', headers);
        try {
            const res = await this.request(url, {
                method: 'PUT',
                headers,
                body: JSON.stringify(body)
            });
            console.log('[api] updateVendorStatus response:', res);
            return res;
        } catch (err) {
            console.error('[api] updateVendorStatus error:', err);
            throw err;
        }
    }

    // Category endpoints
    async getCategories() {
        return this.request('/categories');
    }

    async getCategory(id) {
        return this.request(`/categories/${id}`);
    }

    async getCategoryProducts(id) {
        return this.request(`/categories/${id}/products`);
    }

    // Auth endpoints
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
    }

    async register(email, password, role) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, role })
        });
    }

    async addVendor(data) {
        const url = '/vendor/admin/vendors';
        const headers = { 'Content-Type': 'application/json' };
        console.log('[api] addVendor url:', url, 'data:', data);
        try {
            const res = await this.request(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            });
            console.log('[api] addVendor response:', res);
            return res;
        } catch (err) {
            console.error('[api] addVendor error:', err);
            throw err;
        }
    }

    // User Profile endpoints
    async getUserProfile() {
        return this.request('/users/profile');
    }

    async updateUserProfile(profileData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async updateUserAvatar(formData) {
        // Note: formData does not need Content-Type header, browser sets it automatically
        return this.request('/users/profile/avatar', {
            method: 'POST',
            body: formData
        });
    }

    async getAddresses() {
        return this.request('/users/addresses');
    }

    async addAddress(addressData) {
         return this.request('/users/addresses', {
             method: 'POST',
             body: JSON.stringify(addressData),
             headers: { 'Content-Type': 'application/json' }
         });
    }

    async updateAddress(addressId, addressData) {
         return this.request(`/users/addresses/${addressId}`, {
             method: 'PUT',
             body: JSON.stringify(addressData),
             headers: { 'Content-Type': 'application/json' }
         });
    }

    async deleteAddress(addressId) {
         return this.request(`/users/addresses/${addressId}`, {
             method: 'DELETE'
         });
    }

    async getPaymentMethods() {
        return this.request('/users/payment-methods');
    }

    async addPaymentMethod(paymentMethodData) {
         return this.request('/users/payment-methods', {
             method: 'POST',
             body: JSON.stringify(paymentMethodData),
             headers: { 'Content-Type': 'application/json' }
         });
    }

    async deletePaymentMethod(methodId) {
         return this.request(`/users/payment-methods/${methodId}`, {
             method: 'DELETE'
         });
    }

     // Assuming a separate endpoint for notification preferences
    async updateNotificationPreferences(prefsData) {
         return this.request('/users/notification-preferences', {
             method: 'PUT',
             body: JSON.stringify(prefsData),
             headers: { 'Content-Type': 'application/json' }
         });
    }

    // 2FA endpoints
    async get2faStatus() {
        return this.request('/auth/2fa-status');
    }

    async toggle2fa(enable) {
        return this.request('/auth/toggle-2fa', {
            method: 'PUT',
            body: JSON.stringify({ enable }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async setup2fa() {
        return this.request('/auth/2fa/setup', {
            method: 'POST'
        });
    }

    async verify2faSetup(code) {
        return this.request('/auth/2fa/verify-setup', {
            method: 'POST',
            body: JSON.stringify({ code }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async disable2fa() {
        return this.request('/auth/2fa/disable', {
            method: 'POST'
        });
    }
}

// Create global API instance
const api = new ApiService();

// Export API instance to window
window.api = api; // Export to window for global access 