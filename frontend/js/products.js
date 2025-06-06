// Product Management
class ProductManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.totalPages = 1;
        this.filters = {
            category: null,
            minPrice: null,
            maxPrice: null,
            sortBy: 'newest'
        };
    }

    // Initialize product manager
    async init() {
        await this.loadCategories();
        await this.loadProducts();
        this.setupEventListeners();
    }

    // Load categories
    async loadCategories() {
        try {
            this.categories = await window.API.getCategories();
            this.renderCategories();
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    // Load products
    async loadProducts() {
        try {
            const params = {
                page: this.currentPage,
                limit: this.itemsPerPage,
                ...this.filters
            };

            const data = await window.API.getProducts(params);
            this.products = data.products;
            this.totalPages = data.totalPages;
            this.renderProducts();
            this.renderPagination();
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Category filter
        const categorySelect = document.getElementById('categoryFilter');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        }

        // Price filter
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        if (minPriceInput && maxPriceInput) {
            minPriceInput.addEventListener('change', () => {
                this.filters.minPrice = minPriceInput.value;
                this.currentPage = 1;
                this.loadProducts();
            });
            maxPriceInput.addEventListener('change', () => {
                this.filters.maxPrice = maxPriceInput.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        }

        // Sort filter
        const sortSelect = document.getElementById('sortFilter');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.filters.sortBy = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        }

        // Search form
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const query = document.getElementById('searchInput').value.trim();
                if (query) {
                    await this.searchProducts(query);
                }
            });
        }

        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                // Call your edit function here, e.g.:
                this.editProduct(id);
            });
        });
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                // Call your delete function here, e.g.:
                this.deleteProduct(id);
            });
        });
    }

    // Render categories
    renderCategories() {
        const categoryGrid = document.querySelector('.category-grid');
        if (!categoryGrid) return;

        categoryGrid.innerHTML = this.categories.map(category => `
            <a href="#" class="category-card" data-category-id="${category.id}">
                <i class="${category.icon}"></i>
                <h3>${category.name}</h3>
                <p>${category.description}</p>
            </a>
        `).join('');

        // Add click event listeners
        categoryGrid.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = card.dataset.categoryId;
                this.filters.category = categoryId;
                this.currentPage = 1;
                this.loadProducts();
            });
        });
    }

    // Render products
    renderProducts() {
        const productGrid = document.querySelector('.product-grid');
        if (!productGrid) return;

        if (this.products.length === 0) {
            productGrid.innerHTML = '<p class="no-products">No products found</p>';
            return;
        }

        productGrid.innerHTML = this.products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p class="vendor">By ${product.vendor.name}</p>
                    <div class="product-actions">
                        <button class="btn btn-primary" onclick="cart.addItem(${product.id})">
                            Add to Cart
                        </button>
                        <a href="/product.html?id=${product.id}" class="btn btn-secondary">
                            View Details
                        </a>
                        <button class="action-btn edit" data-id="${product.id}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" data-id="${product.id}" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `).join('');

        // Attach event listeners to edit and delete buttons after rendering
        productGrid.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                console.log('Edit clicked', id);
                this.editProduct(id);
            });
        });
        productGrid.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                this.deleteProduct(id);
            });
        });
    }

    // Render pagination
    renderPagination() {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="btn-page" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="productManager.goToPage(${this.currentPage - 1})">
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
                            onclick="productManager.goToPage(${i})">
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
                    onclick="productManager.goToPage(${this.currentPage + 1})">
                Next
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    // Go to specific page
    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.loadProducts();
    }

    // Search products
    async searchProducts(query) {
        try {
            const products = await window.API.searchProducts(query);
            this.products = products;
            this.currentPage = 1;
            this.totalPages = 1;
            this.renderProducts();
            this.renderPagination();
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    // Clear filters
    clearFilters() {
        this.filters = {
            category: null,
            minPrice: null,
            maxPrice: null,
            sortBy: 'newest'
        };
        this.currentPage = 1;
        this.loadProducts();
    }

    editProduct(id) {
        console.log('editProduct method called with id:', id);
        alert('Edit product with ID: ' + id);
        // TODO: Open your edit modal and populate with product data
    }

    deleteProduct(id) {
        console.log('deleteProduct method called with id:', id);
        if (confirm('Are you sure you want to delete this product?')) {
            alert('Delete product with ID: ' + id);
            // TODO: Call your API to delete the product, then reload the table
        }
    }
}

// Create global product manager instance
const productManager = new ProductManager();

// Initialize product manager on page load
document.addEventListener('DOMContentLoaded', () => {
    productManager.init();
});

// Export product manager instance
window.productManager = productManager;

function renderProducts(products) {
    console.log('renderProducts called', products);
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    if (!products.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#e74c3c;">No products found</td></tr>';
        return;
    }
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.category || ''}</td>
            <td>$${product.price}</td>
            <td>${product.stock}</td>
            <td>
                <span class="product-status ${product.stock > 10 ? 'status-instock' : product.stock > 0 ? 'status-low' : 'status-out'}">
                    ${product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                </span>
            </td>
            <td>
                <button class="action-btn edit" data-id="${product.id}" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" data-id="${product.id}" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    const editBtns = tbody.querySelectorAll('.action-btn.edit');
    const deleteBtns = tbody.querySelectorAll('.action-btn.delete');
    console.log('Edit buttons found:', editBtns.length, 'Delete buttons found:', deleteBtns.length);
    if (editBtns.length === 0) {
        console.warn('No edit buttons found after rendering table!');
    }
    editBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            console.log('Edit button clicked, id:', id);
            window.productManager.editProduct(id);
        });
    });
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            console.log('Delete button clicked, id:', id);
            window.productManager.deleteProduct(id);
        });
    });
}




