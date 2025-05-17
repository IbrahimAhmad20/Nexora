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
            this.categories = await api.getCategories();
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

            const data = await api.getProducts(params);
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
                    </div>
                </div>
            </div>
        `).join('');
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
            const products = await api.searchProducts(query);
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
}

// Create global product manager instance
const productManager = new ProductManager();

// Initialize product manager on page load
document.addEventListener('DOMContentLoaded', () => {
    productManager.init();
});

// Export product manager instance
window.productManager = productManager; 