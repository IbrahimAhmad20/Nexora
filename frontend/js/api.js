// API Service
class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api';
    }

    // Generic request method
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };

            // Add auth token if available
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                ...options,
                headers
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
            const error = await response.json();
            throw new Error(error.message || 'Error deleting product');
        }

        return response.json();
    }

    // Cart endpoints
    async getCart() {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/cart', {
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

    async updateUserRole(userId, role) {
        return this.request(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    }

    async getAllVendors() {
        return this.request('/admin/vendors');
    }

    async updateVendorStatus(vendorId, status) {
        return this.request(`/admin/vendors/${vendorId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
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
            body: JSON.stringify({ email, password })
        });
    }

    async register(email, password, role) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, role })
        });
    }
}

// Create global API instance
const api = new ApiService();

// Export API instance
window.api = api; 