// Admin Management
class AdminManager {
    constructor() {
        this.users = [];
        this.vendors = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
    }

    // Initialize admin manager
    async init() {
        if (!auth.isAdmin()) {
            window.location.href = '/';
            return;
        }

        await this.loadUsers();
        await this.loadVendors();
        this.setupEventListeners();
    }

    // Load users
    async loadUsers() {
        try {
            const data = await api.getAllUsers();
            this.users = data.users;
            this.totalPages = data.totalPages;
            this.renderUsers();
            this.renderUserPagination();
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    // Load vendors
    async loadVendors() {
        try {
            const data = await api.getAllVendors();
            this.vendors = data.vendors;
            this.renderVendors();
        } catch (error) {
            console.error('Failed to load vendors:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // User role updates
        document.addEventListener('change', async (e) => {
            if (e.target.classList.contains('user-role')) {
                const userId = e.target.dataset.userId;
                const role = e.target.value;
                await this.updateUserRole(userId, role);
            }
        });

        // Vendor status updates
        document.addEventListener('change', async (e) => {
            if (e.target.classList.contains('vendor-status')) {
                const vendorId = e.target.dataset.vendorId;
                const status = e.target.value;
                await this.updateVendorStatus(vendorId, status);
            }
        });
    }

    // Render users
    renderUsers() {
        const usersSection = document.getElementById('adminUsers');
        if (!usersSection) return;

        if (this.users.length === 0) {
            usersSection.innerHTML = '<p class="no-users">No users found</p>';
            return;
        }

        usersSection.innerHTML = `
            <h3>User Management</h3>
            <div class="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.users.map(user => `
                            <tr>
                                <td>#${user.id}</td>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>
                                    <select class="user-role" data-user-id="${user.id}">
                                        <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>
                                            Customer
                                        </option>
                                        <option value="vendor" ${user.role === 'vendor' ? 'selected' : ''}>
                                            Vendor
                                        </option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>
                                            Admin
                                        </option>
                                    </select>
                                </td>
                                <td>
                                    <span class="status ${user.status}">${user.status}</span>
                                </td>
                                <td>
                                    <button class="btn btn-secondary" onclick="adminManager.viewUser(${user.id})">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Render vendors
    renderVendors() {
        const vendorsSection = document.getElementById('adminVendors');
        if (!vendorsSection) return;

        if (this.vendors.length === 0) {
            vendorsSection.innerHTML = '<p class="no-vendors">No vendors found</p>';
            return;
        }

        vendorsSection.innerHTML = `
            <h3>Vendor Management</h3>
            <div class="vendors-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Products</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.vendors.map(vendor => `
                            <tr>
                                <td>#${vendor.id}</td>
                                <td>${vendor.name}</td>
                                <td>${vendor.email}</td>
                                <td>
                                    <select class="vendor-status" data-vendor-id="${vendor.id}">
                                        <option value="pending" ${vendor.status === 'pending' ? 'selected' : ''}>
                                            Pending
                                        </option>
                                        <option value="approved" ${vendor.status === 'approved' ? 'selected' : ''}>
                                            Approved
                                        </option>
                                        <option value="suspended" ${vendor.status === 'suspended' ? 'selected' : ''}>
                                            Suspended
                                        </option>
                                    </select>
                                </td>
                                <td>${vendor.productCount}</td>
                                <td>
                                    <button class="btn btn-secondary" onclick="adminManager.viewVendor(${vendor.id})">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Update user role
    async updateUserRole(userId, role) {
        try {
            await api.updateUserRole(userId, role);
            await this.loadUsers();
            alert('User role updated successfully');
        } catch (error) {
            console.error('Failed to update user role:', error);
            alert('Failed to update user role. Please try again.');
        }
    }

    // Update vendor status
    async updateVendorStatus(vendorId, status) {
        try {
            await api.updateVendorStatus(vendorId, status);
            await this.loadVendors();
            alert('Vendor status updated successfully');
        } catch (error) {
            console.error('Failed to update vendor status:', error);
            alert('Failed to update vendor status. Please try again.');
        }
    }

    // View user details
    async viewUser(id) {
        try {
            const user = this.users.find(u => u.id === id);
            if (!user) return;

            const modal = document.getElementById('userModal');
            if (!modal) return;

            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="adminManager.closeModal('userModal')">&times;</span>
                    <h2>User Details</h2>
                    <div class="user-details">
                        <p><strong>ID:</strong> #${user.id}</p>
                        <p><strong>Name:</strong> ${user.name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Role:</strong> ${user.role}</p>
                        <p><strong>Status:</strong> ${user.status}</p>
                        <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                        <h3>Recent Activity</h3>
                        <div class="activity-list">
                            ${user.recentActivity ? user.recentActivity.map(activity => `
                                <div class="activity-item">
                                    <p>${activity.description}</p>
                                    <small>${new Date(activity.timestamp).toLocaleString()}</small>
                                </div>
                            `).join('') : '<p>No recent activity</p>'}
                        </div>
                    </div>
                </div>
            `;

            modal.style.display = 'block';
        } catch (error) {
            console.error('Failed to load user details:', error);
            alert('Failed to load user details. Please try again.');
        }
    }

    // View vendor details
    async viewVendor(id) {
        try {
            const vendor = this.vendors.find(v => v.id === id);
            if (!vendor) return;

            const modal = document.getElementById('vendorModal');
            if (!modal) return;

            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="adminManager.closeModal('vendorModal')">&times;</span>
                    <h2>Vendor Details</h2>
                    <div class="vendor-details">
                        <p><strong>ID:</strong> #${vendor.id}</p>
                        <p><strong>Name:</strong> ${vendor.name}</p>
                        <p><strong>Email:</strong> ${vendor.email}</p>
                        <p><strong>Status:</strong> ${vendor.status}</p>
                        <p><strong>Products:</strong> ${vendor.productCount}</p>
                        <p><strong>Joined:</strong> ${new Date(vendor.createdAt).toLocaleDateString()}</p>
                        <h3>Recent Products</h3>
                        <div class="products-list">
                            ${vendor.recentProducts ? vendor.recentProducts.map(product => `
                                <div class="product-item">
                                    <img src="${product.image}" alt="${product.name}">
                                    <div class="product-info">
                                        <h4>${product.name}</h4>
                                        <p>$${product.price.toFixed(2)}</p>
                                        <p>Stock: ${product.stock}</p>
                                    </div>
                                </div>
                            `).join('') : '<p>No recent products</p>'}
                        </div>
                    </div>
                </div>
            `;

            modal.style.display = 'block';
        } catch (error) {
            console.error('Failed to load vendor details:', error);
            alert('Failed to load vendor details. Please try again.');
        }
    }

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Render user pagination
    renderUserPagination() {
        const pagination = document.querySelector('.users-pagination');
        if (!pagination) return;

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="btn-page" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="adminManager.goToPage(${this.currentPage - 1})">
                Previous
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            if (
                i === 1 || 
                i === this.totalPages || 
                (i >= this.currentPage - 2 && i <= this.currentPage + 2)
            ) {
                paginationHTML += `
                    <button class="btn-page ${i === this.currentPage ? 'active' : ''}"
                            onclick="adminManager.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (
                i === this.currentPage - 3 || 
                i === this.currentPage + 3
            ) {
                paginationHTML += '<span class="pagination-ellipsis">...</span>';
            }
        }

        // Next button
        paginationHTML += `
            <button class="btn-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}
                    onclick="adminManager.goToPage(${this.currentPage + 1})">
                Next
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    // Go to specific page
    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.loadUsers();
    }
}

// Create global admin manager instance
const adminManager = new AdminManager();

// Initialize admin manager on page load
document.addEventListener('DOMContentLoaded', () => {
    adminManager.init();
});

// Export admin manager instance
window.adminManager = adminManager; 