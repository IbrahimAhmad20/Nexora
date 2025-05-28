// Nexora Shop Page JS
class ShopManager {
    constructor() {
        this.state = {
            products: [],
            filteredProducts: [],
            currentCategory: 'all',
            isLoading: false,
            error: null,
            searchQuery: ''
        };

        this.elements = {
            productGrid: document.getElementById('productGrid'),
            categoryFilters: document.getElementById('categoryFilters'),
            searchInput: document.getElementById('searchInput'),
            profileMenu: document.getElementById('userProfile'),
            pagination: document.getElementById('pagination'),
            modal: {
                container: document.getElementById('quick-view-modal'),
                closeBtn: document.getElementById('modalCloseBtn'),
                image: document.getElementById('modalImage'),
                title: document.getElementById('modalTitle'),
                detailsTitle: document.getElementById('modalDetailsTitle'),
                rating: document.getElementById('modalRating'),
                price: document.getElementById('modalPrice'),
                currentPrice: document.getElementById('modalCurrentPrice'),
                originalPrice: document.getElementById('modalOriginalPrice'),
                discountBadge: document.getElementById('modalDiscountBadge'),
                description: document.getElementById('modalDescription'),
                addToCartBtn: document.getElementById('modalAddToCartBtn'),
                addToWishlistBtn: document.getElementById('modalAddToWishlistBtn'),
                quantityInput: document.getElementById('modalQtyInput'),
                quantityMinus: document.getElementById('modalQtyMinus'),
                quantityPlus: document.getElementById('modalQtyPlus')
            }
        };

        this.init();
    }

    async init() {
        try {
            await this.setupEventListeners();
            await this.fetchProducts();
            this.setProfileInitials();
        } catch (error) {
            console.error('Initialization error:', error);
            this.handleError(error);
        }
    }

    async setupEventListeners() {
        // Category filter listeners
        this.elements.categoryFilters?.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.handleCategoryFilter(e.target);
            }
        });

        // Search input listener with debounce
        this.elements.searchInput?.addEventListener('input', this.debounce((e) => {
            this.handleSearch(e.target.value);
        }, 300));

        // Modal close listener
        this.elements.modal.closeBtn?.addEventListener('click', () => this.closeQuickViewModal());
        this.elements.modal.container?.addEventListener('click', (e) => {
            if (e.target === this.elements.modal.container) {
                this.closeQuickViewModal();
            }
        });

        // Modal quantity control listeners
        this.elements.modal.quantityMinus?.addEventListener('click', () => this.updateModalQuantity(-1));
        this.elements.modal.quantityPlus?.addEventListener('click', () => this.updateModalQuantity(1));

        // Modal Add to Cart button listener
        this.elements.modal.addToCartBtn?.addEventListener('click', () => {
            const productId = this.elements.modal.addToCartBtn.dataset.productId;
            const quantity = parseInt(this.elements.modal.quantityInput.value);
            if (productId && quantity > 0) {
                window.cartManager?.addItem(productId, quantity);
                this.closeQuickViewModal();
            }
        });

        // Modal Add to Wishlist button listener
        this.elements.modal.addToWishlistBtn?.addEventListener('click', () => {
             const productId = this.elements.modal.addToWishlistBtn.dataset.productId;
             const wishlistBtnInCard = document.querySelector(`.product-card[data-product-id="${productId}"] .wishlist-btn`);
             if (productId) {
                 window.wishlistManager?.toggleWishlist(productId, wishlistBtnInCard);
                 if (this.elements.modal.addToWishlistBtn.querySelector('i')) {
                     const icon = this.elements.modal.addToWishlistBtn.querySelector('i');
                     if (window.wishlistManager?.state.items.has(productId)) {
                         icon.classList.replace('far', 'fas');
                         this.elements.modal.addToWishlistBtn.classList.add('active');
                     } else {
                         icon.classList.replace('fas', 'far');
                         this.elements.modal.addToWishlistBtn.classList.remove('active');
                     }
                 }
             }
        });

        // Event delegation for product card clicks (to open modal or go to product page)
        this.elements.productGrid?.addEventListener('click', (e) => {
            const wishlistBtn = e.target.closest('.wishlist-btn');
            if (wishlistBtn) {
                const productId = wishlistBtn.getAttribute('data-product-id');
                console.log('[Shop] Wishlist heart clicked. productId:', productId, 'window.wishlistManager:', !!window.wishlistManager);
                if (productId && window.wishlistManager) {
                    window.wishlistManager.toggleWishlist(Number(productId), wishlistBtn);
                }
                e.stopPropagation(); // Prevent triggering card click
                return;
            }

            const productCard = e.target.closest('.product-card');
            if (!productCard) return;

            const productId = productCard.dataset.productId;
            const target = e.target;

            // Check if the click was on the add to cart button
            if (target.closest('.add-to-cart')) {
                const quantity = 1;
                window.cartManager?.addItem(productId, quantity);
            } else {
                // If not on specific buttons, redirect to product detail page
                if (productId) {
                    window.location.href = `product.html?id=${productId}`;
                }
            }
        });

        // Event delegation for pagination buttons (if dynamic pagination is implemented)
        this.elements.pagination?.addEventListener('click', (e) => {
            const target = e.target.closest('.pagination-btn');
            if (target && !target.classList.contains('active')) {
                // Implement pagination logic here
                console.log('Pagination button clicked:', target.textContent.trim());
                // Example: fetchProducts(newPageNumber);
            }
        });

        // Redirect to cart.html when cart icon is clicked
        document.querySelector('.action-icons .cart-icon')?.addEventListener('click', () => {
             window.location.href = 'cart.html';
        });

         // Add event listener for wishlist icon if needed (e.g., redirect to wishlist page)
        document.querySelector('.action-icons .wishlist-icon')?.addEventListener('click', () => {
             // Example: Redirect to wishlist page
             window.location.href = 'wishlist.html'; // Assuming you have a wishlist.html page
        });

        // Add event listeners for navigation links
        const navLinks = document.querySelectorAll('.nav-links .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Prevent default link behavior
                e.preventDefault();
                // Get the href attribute and redirect
                const href = link.getAttribute('href');
                if (href) {
                    window.location.href = href;
                }
            });
        });

        // Add event listener for user profile dropdown toggle
        const userProfile = this.elements.profileMenu; // profileMenu is id='userProfile'
        const profileDropdown = userProfile?.querySelector('.profile-dropdown');

        userProfile?.addEventListener('click', (e) => {
            // Prevent default only if clicking the icon/avatar itself, not the dropdown links
            const target = e.target;
            if (target === userProfile || userProfile.contains(target) && !profileDropdown?.contains(target)) {
                 e.preventDefault();
                 userProfile.classList.toggle('active');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (userProfile && !userProfile.contains(e.target)) {
                userProfile.classList.remove('active');
            }
        });

        // Add event listeners for dropdown links
        profileDropdown?.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                const href = link.getAttribute('href');
                if (link.classList.contains('logout-link')) {
                    // Handle logout
                    localStorage.removeItem('user'); // Assuming user info is stored here
                    localStorage.removeItem('token'); // Assuming token is stored here
                    window.location.href = 'login.html'; // Redirect to login page
                } else if (href) {
                    // Handle other links (Profile, Orders)
                    window.location.href = href;
                }
                // Close the dropdown after clicking a link
                userProfile.classList.remove('active');
            });
        });
    }

    async fetchProducts() {
        this.setState({ isLoading: true, error: null });
        try {
            const { currentCategory, searchQuery } = this.state;
            const queryParams = new URLSearchParams();
            if (currentCategory !== 'all') {
                queryParams.append('category', currentCategory);
            }
            if (searchQuery) {
                queryParams.append('search', searchQuery);
            }

            const url = `${window.API_BASE_URL}/api/products?${queryParams.toString()}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch products');

            const data = await res.json();
            if (!Array.isArray(data.products)) throw new Error('Invalid products data format');

            const products = data.products.map(p => ({
                ...p,
                image: p.image
                    ? (p.image.startsWith('http') ? p.image : `${window.API_BASE_URL}${p.image}`)
                    : null
            }));

            this.setState({
                products: products,
                filteredProducts: products,
                isLoading: false
            });

            this.renderProducts();
        } catch (error) {
            this.handleError(error);
        }
    }

    renderProducts() {
        if (!this.elements.productGrid) return;

        if (!this.state.filteredProducts.length) {
            this.elements.productGrid.innerHTML = this.createNoProductsMessage();
            return;
        }

        const fragment = document.createDocumentFragment();
        this.state.filteredProducts.forEach(product => {
            const productCardHTML = this.createProductCard(product);
            const div = document.createElement('div');
            div.innerHTML = productCardHTML;
            if (div.firstElementChild) {
                 fragment.appendChild(div.firstElementChild);
            }
        });

        this.elements.productGrid.innerHTML = '';
        this.elements.productGrid.appendChild(fragment);
    }

    createProductCard(product) {
        const {
            id,
            name,
            price,
            old_price,
            primary_image,
            category,
            rating = 4.5,
            reviews = 20,
            badge,
            badgeClass,
            stock
        } = product;

        const imageUrl = this.getProductImageUrl(primary_image);
        const starsHtml = this.generateStarRating(rating);
        const { discount, displayPrice, displayOldPrice } = this.calculatePriceInfo(price, old_price);
        const isInWishlist = window.wishlistManager?.state.items.has(id);

        return `
            <div class="product-card" data-product-id="${id}">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${name}" onerror="this.onerror=null;this.src='images/placeholder.png'">
                    ${badge ? `<span class="product-badge ${badgeClass || ''}">${badge}</span>` : ''}
                </div>
                <div class="product-info">
                    <div class="product-category">${category ? category.toUpperCase() : ''}</div>
                    <h3 class="product-name">${name}</h3>
                    <div class="product-rating">
                        <div class="stars">${starsHtml}</div>
                        <div class="count">(${reviews})</div>
                    </div>
                    <div class="product-price">
                        <span class="current-price">$${displayPrice}</span>
                        ${displayOldPrice ? `<span class="original-price">$${displayOldPrice}</span>` : ''}
                        ${discount ? `<span class="discount-badge">${discount}% OFF</span>` : ''}
                    </div>
                    <div class="product-stock">
                        <span class="stock-label">Stock:</span>
                        <span class="stock-value ${stock <= 5 ? 'low-stock' : ''}">${stock || 0}</span>
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" data-product-id="${id}" ${stock <= 0 ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i> ${stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" data-product-id="${id}">
                            <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    handleCategoryFilter(button) {
        const category = button.dataset.category;
        this.setState({ currentCategory: category });

        this.elements.categoryFilters.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn === button);
        });

        this.fetchProducts();
    }

    handleSearch(query) {
        this.setState({ searchQuery: query });
        this.fetchProducts();
    }

    openQuickViewModal(productId) {
         if (!this.elements.modal.container) return;

         const product = this.state.products.find(p => p.id === productId);
         if (!product) {
             console.error('Product not found for modal', productId);
        return;
    }

         if (this.elements.modal.image) {
             this.elements.modal.image.src = this.getProductImageUrl(product.primary_image);
             this.elements.modal.image.alt = product.name;
         }
         if (this.elements.modal.title) this.elements.modal.title.textContent = product.name;
         if (this.elements.modal.detailsTitle) this.elements.modal.detailsTitle.textContent = product.name;
         if (this.elements.modal.description) this.elements.modal.description.textContent = product.description || 'No description available.';
         if (this.elements.modal.rating) this.elements.modal.rating.innerHTML = `${this.generateStarRating(product.rating)} <div class="count">(${product.reviews || 0} Reviews)</div>`;

         const { discount, displayPrice, displayOldPrice } = this.calculatePriceInfo(product.price, product.old_price);
         if (this.elements.modal.currentPrice) this.elements.modal.currentPrice.textContent = `$${displayPrice}`;
         if (this.elements.modal.originalPrice) {
             this.elements.modal.originalPrice.textContent = displayOldPrice ? `$${displayOldPrice}` : '';
             this.elements.modal.originalPrice.style.display = displayOldPrice ? 'inline' : 'none';
         }
         if (this.elements.modal.discountBadge) {
              this.elements.modal.discountBadge.textContent = discount ? `${discount}% OFF` : '';
              this.elements.modal.discountBadge.style.display = discount ? 'inline-block' : 'none';
         }

         if (this.elements.modal.addToCartBtn) this.elements.modal.addToCartBtn.dataset.productId = productId;
         if (this.elements.modal.addToWishlistBtn) {
              this.elements.modal.addToWishlistBtn.dataset.productId = productId;
              const isInWishlist = window.wishlistManager?.state.items.has(productId);
              if (this.elements.modal.addToWishlistBtn.querySelector('i')) {
                  const icon = this.elements.modal.addToWishlistBtn.querySelector('i');
                  icon.classList.replace(isInWishlist ? 'far' : 'fas', isInWishlist ? 'fas' : 'far');
                   this.elements.modal.addToWishlistBtn.classList.toggle('active', isInWishlist);
              }
         }

         if (this.elements.modal.quantityInput) this.elements.modal.quantityInput.value = 1;

        this.elements.modal.container.classList.add('active');
         document.body.style.overflow = 'hidden';
    }

    closeQuickViewModal() {
         if (!this.elements.modal.container) return;
        this.elements.modal.container.classList.remove('active');
         document.body.style.overflow = '';
    }

    updateModalQuantity(delta) {
         if (!this.elements.modal.quantityInput) return;
        let currentQty = parseInt(this.elements.modal.quantityInput.value);
        if (isNaN(currentQty)) currentQty = 1;
        const newQty = currentQty + delta;
        if (newQty > 0) {
            this.elements.modal.quantityInput.value = newQty;
        }
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };

        if (newState.wishlist !== undefined) {
            window.wishlistManager?.updateWishlistUI();
        }
    }

    handleError(error) {
        console.error('Error:', error);
        this.setState({
            isLoading: false,
            error: error.message || 'An unexpected error occurred'
        });
        this.showNotification(error.message || 'An error occurred', 'error');
        if (this.elements.productGrid) {
            this.elements.productGrid.innerHTML = `<div class="alert alert-danger" style="background:#f8d7da;color:#721c24;padding:0.7em 1em;border-radius:6px;font-size:0.98em;text-align:center;margin:1.5em auto;max-width:400px;">Error loading products: ${error.message || 'Unknown error'}</div>`;
        }
    }

    showNotification(message, type = 'success') {
        console.log(`Notification (${type}): ${message}`);
        alert(message);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    getProductImageUrl(image) {
        if (!image) return 'https://via.placeholder.com/300x200?text=No+Image';
        return image.startsWith('http://') || image.startsWith('https://') ? image : `${window.BASE_API_URL || ''}${image}`;
    }

    generateStarRating(rating) {
        const roundedRating = Math.round(rating * 2) / 2;
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            if (roundedRating >= i + 1) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (roundedRating > i) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        return starsHtml;
    }

    calculatePriceInfo(price, oldPrice) {
        const currentPrice = parseFloat(price);
        const originalPrice = oldPrice ? parseFloat(oldPrice) : null;
        const discount = (originalPrice && currentPrice < originalPrice && originalPrice > 0)
            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
            : null;

        return {
            discount,
            displayPrice: !isNaN(currentPrice) ? currentPrice.toFixed(2) : 'N/A',
            displayOldPrice: (originalPrice && !isNaN(originalPrice)) ? originalPrice.toFixed(2) : null
        };
    }

    createNoProductsMessage() {
        return `
            <div class="alert alert-warning" style="background:#fff3cd;color:#856404;padding:0.7em 1em;border-radius:6px;font-size:0.98em;text-align:center;margin:1.5em auto;max-width:400px;">
                No products found matching your criteria.
            </div>
        `;
    }

    setProfileInitials() {
        const userJson = localStorage.getItem('user');
        let user = {};
        if (userJson && userJson !== "undefined") {
            try {
                user = JSON.parse(userJson);
            } catch (e) {
                console.error("Error parsing user data from localStorage in shop.js:", e);
                // Optionally clear the invalid data
                // localStorage.removeItem('user');
            }
        }
        const initialsElement = document.getElementById('userProfileInitials');
        if (initialsElement && user && user.initials) {
            initialsElement.textContent = user.initials;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.shopManager = new ShopManager();
}); 