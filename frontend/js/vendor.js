// Vendor Management
class VendorManager {
    constructor() {
        this.profile = null;
        this.products = [];
        this.orders = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
    }

    // Initialize vendor manager
    async init() {
        if (!auth.isVendor()) {
            window.location.href = '/';
            return;
        }

        await this.loadProfile();
        await this.loadProducts();
        await this.loadOrders();
        this.setupEventListeners();
    }

    // Load vendor profile
    async loadProfile() {
        try {
            this.profile = await api.getVendorProfile();
            this.renderProfile();
        } catch (error) {
            console.error('Failed to load vendor profile:', error);
        }
    }

    // Load vendor products
    async loadProducts() {
        try {
            const data = await api.getVendorProducts();
            this.products = data.products;
            this.totalPages = data.totalPages;
            this.renderProducts();
            this.renderProductPagination();
        } catch (error) {
            console.error('Failed to load vendor products:', error);
        }
    }

    // Load vendor orders
    async loadOrders() {
        try {
            const data = await api.getVendorOrders();
            this.orders = data.orders;
            this.renderOrders();
        } catch (error) {
            console.error('Failed to load vendor orders:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateProfile();
            });
        }

        // Product form
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.createProduct();
            });
        }

        // Order status updates
        document.addEventListener('change', async (e) => {
            if (e.target.classList.contains('order-status')) {
                const orderId = e.target.dataset.orderId;
                const status = e.target.value;
                await this.updateOrderStatus(orderId, status);
            }
        });
    }

    // Render vendor profile
    renderProfile() {
        const profileSection = document.getElementById('vendorProfile');
        if (!profileSection || !this.profile) return;

        profileSection.innerHTML = `
            <div class="profile-header">
                <h2>${this.profile.name}</h2>
                <p class="status ${this.profile.status}">${this.profile.status}</p>
            </div>
            <div class="profile-details">
                <p><strong>Email:</strong> ${this.profile.email}</p>
                <p><strong>Phone:</strong> ${this.profile.phone || 'Not provided'}</p>
                <p><strong>Address:</strong> ${this.profile.address || 'Not provided'}</p>
                <p><strong>Description:</strong> ${this.profile.description || 'No description'}</p>
            </div>
            <button class="btn btn-primary" onclick="vendorManager.showEditProfile()">
                Edit Profile
            </button>
        `;
    }

    // Render vendor products
    renderProducts() {
        const productsSection = document.getElementById('vendorProducts');
        if (!productsSection) return;

        if (this.products.length === 0) {
            productsSection.innerHTML = '<p class="no-products">No products found</p>';
            return;
        }

        productsSection.innerHTML = `
            <div class="products-header">
                <h3>Your Products</h3>
                <button class="btn btn-primary" onclick="vendorManager.showAddProduct()">
                    Add New Product
                </button>
            </div>
            <div class="products-grid">
                ${this.products.map(product => `
                    <div class="product-card">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="product-details">
                            <h4>${product.name}</h4>
                            <p class="price">$${product.price.toFixed(2)}</p>
                            <p class="stock">Stock: ${product.stock}</p>
                            <div class="product-actions">
                                <button class="btn btn-secondary" onclick="vendorManager.editProduct(${product.id})">
                                    Edit
                                </button>
                                <button class="btn btn-danger" onclick="vendorManager.deleteProduct(${product.id})">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Render vendor orders
    renderOrders() {
        const ordersSection = document.getElementById('vendorOrders');
        if (!ordersSection) return;

        if (this.orders.length === 0) {
            ordersSection.innerHTML = '<p class="no-orders">No orders found</p>';
            return;
        }

        ordersSection.innerHTML = `
            <h3>Recent Orders</h3>
            <div class="orders-table">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.orders.map(order => `
                            <tr>
                                <td>#${order.id}</td>
                                <td>${order.customer.name}</td>
                                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>$${order.total.toFixed(2)}</td>
                                <td>
                                    <select class="order-status" data-order-id="${order.id}">
                                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>
                                            Pending
                                        </option>
                                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>
                                            Processing
                                        </option>
                                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>
                                            Shipped
                                        </option>
                                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>
                                            Delivered
                                        </option>
                                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>
                                            Cancelled
                                        </option>
                                    </select>
                                </td>
                                <td>
                                    <button class="btn btn-secondary" onclick="vendorManager.viewOrder(${order.id})">
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

    // Update vendor profile
    async updateProfile() {
        try {
            const formData = new FormData(document.getElementById('profileForm'));
            const profileData = Object.fromEntries(formData.entries());

            await api.updateVendorProfile(profileData);
            await this.loadProfile();
            this.closeModal('profileModal');
            alert('Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    }

    // Create new product
    async createProduct() {
        try {
            const formData = new FormData(document.getElementById('productForm'));
            const productData = Object.fromEntries(formData.entries());

            await api.createProduct(productData);
            await this.loadProducts();
            this.closeModal('productModal');
            alert('Product created successfully');
        } catch (error) {
            console.error('Failed to create product:', error);
            alert('Failed to create product. Please try again.');
        }
    }

    // Update product
    async updateProduct(id, productData) {
        try {
            await api.updateProduct(id, productData);
            await this.loadProducts();
            this.closeModal('productModal');
            alert('Product updated successfully');
        } catch (error) {
            console.error('Failed to update product:', error);
            alert('Failed to update product. Please try again.');
        }
    }

    // Delete product
    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await api.deleteProduct(id);
            await this.loadProducts();
            alert('Product deleted successfully');
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('Failed to delete product. Please try again.');
        }
    }

    // Update order status
    async updateOrderStatus(orderId, status) {
        try {
            await api.updateOrderStatus(orderId, status);
            await this.loadOrders();
            alert('Order status updated successfully');
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert('Failed to update order status. Please try again.');
        }
    }

    // Show edit profile modal
    showEditProfile() {
        const modal = document.getElementById('profileModal');
        if (!modal) return;

        const form = document.getElementById('profileForm');
        form.elements.name.value = this.profile.name;
        form.elements.phone.value = this.profile.phone || '';
        form.elements.address.value = this.profile.address || '';
        form.elements.description.value = this.profile.description || '';

        modal.style.display = 'block';
    }

    // Show add product modal
    showAddProduct() {
        const modal = document.getElementById('productModal');
        if (!modal) return;

        const form = document.getElementById('productForm');
        form.reset();
        form.dataset.mode = 'create';

        modal.style.display = 'block';
    }

    // Show edit product modal
    async editProduct(id) {
        const modal = document.getElementById('productModal');
        if (!modal) return;

        const product = this.products.find(p => p.id === id);
        if (!product) return;

        const form = document.getElementById('productForm');
        form.dataset.mode = 'edit';
        form.dataset.productId = id;

        form.elements.name.value = product.name;
        form.elements.description.value = product.description;
        form.elements.price.value = product.price;
        form.elements.stock.value = product.stock;
        form.elements.category.value = product.category;

        modal.style.display = 'block';
    }

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // View order details
    async viewOrder(id) {
        try {
            const order = await api.getOrder(id);
            const modal = document.getElementById('orderModal');
            if (!modal) return;

            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="vendorManager.closeModal('orderModal')">&times;</span>
                    <h2>Order #${order.id}</h2>
                    <div class="order-details">
                        <p><strong>Customer:</strong> ${order.customer.name}</p>
                        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                        <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                        <h3>Items</h3>
                        <div class="order-items">
                            ${order.items.map(item => `
                                <div class="order-item">
                                    <img src="${item.product.image}" alt="${item.product.name}">
                                    <div class="item-details">
                                        <h4>${item.product.name}</h4>
                                        <p>Quantity: ${item.quantity}</p>
                                        <p>Price: $${item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

            modal.style.display = 'block';
        } catch (error) {
            console.error('Failed to load order details:', error);
            alert('Failed to load order details. Please try again.');
        }
    }
}

// Create global vendor manager instance
const vendorManager = new VendorManager();

// Initialize vendor manager on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Load vendor's products
    loadVendorProducts();

    // Set up product form
    setupProductForm();

    vendorManager.init();
});

// Export vendor manager instance
window.vendorManager = vendorManager;

// Load vendor's products
async function loadVendorProducts() {
    try {
        const products = await ApiService.getVendorProducts();
        displayProducts(products);
    } catch (error) {
        showNotification('Error loading products', 'error');
    }
}

// Display products in the grid
function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    products.forEach(product => {
        const productCard = createProductCard(product);
        productList.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${primaryImage.image_url}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <p class="product-stock">Stock: ${product.stock_quantity}</p>
            <div class="product-actions">
                <button class="btn btn-edit" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Set up product form
function setupProductForm() {
    const form = document.getElementById('addProductForm');
    const imageInput = document.getElementById('productImages');
    const imagePreview = document.getElementById('imagePreview');
    
    // Handle image preview
    imageInput.addEventListener('change', () => {
        imagePreview.innerHTML = '';
        const files = imageInput.files;
        
        for (let i = 0; i < files.length; i++) {
            if (i >= 5) break; // Maximum 5 images
            
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-image" onclick="removeImage(${i})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                imagePreview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        try {
            const product = await ApiService.createProduct(formData);
            showNotification('Product added successfully', 'success');
            form.reset();
            imagePreview.innerHTML = '';
            loadVendorProducts(); // Refresh product list
        } catch (error) {
            showNotification(error.message || 'Error adding product', 'error');
        }
    });
}

// Remove image from preview
function removeImage(index) {
    const imageInput = document.getElementById('productImages');
    const dt = new DataTransfer();
    const files = imageInput.files;
    
    for (let i = 0; i < files.length; i++) {
        if (i !== index) {
            dt.items.add(files[i]);
        }
    }
    
    imageInput.files = dt.files;
    imageInput.dispatchEvent(new Event('change'));
}

// Edit product
async function editProduct(productId) {
    try {
        const product = await ApiService.getProduct(productId);
        // TODO: Implement edit functionality
        showNotification('Edit functionality coming soon', 'info');
    } catch (error) {
        showNotification('Error loading product details', 'error');
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        await ApiService.deleteProduct(productId);
        showNotification('Product deleted successfully', 'success');
        loadVendorProducts(); // Refresh product list
    } catch (error) {
        showNotification('Error deleting product', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // TODO: Implement notification system
    alert(message);
} 