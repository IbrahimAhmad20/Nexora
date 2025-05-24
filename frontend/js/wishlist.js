class WishlistManager {
    constructor() {
        this.state = {
            items: new Map()
        };

        this.init();
    }

    async init() {
        await this.loadWishlist();
    }

    async loadWishlist() {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${window.API_BASE_URL}/api/users/wishlist`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to load wishlist');

            const data = await res.json();
            // Look for items in data.products
            const itemsArray = Array.isArray(data.products) ? data.products : [];
            
            // Store full product objects, using a Map for easy lookup by ID
            this.state.items = new Map(itemsArray.map(item => [item.id, item]));
            console.log('Wishlist loaded successfully', this.state.items);
            this.updateWishlistUI();
        } catch (error) {
            console.error('Failed to load wishlist:', error);
        }
    }

    async toggleWishlist(productId, buttonElement) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to manage your wishlist.');
            return;
        }

        const isAdding = !this.state.items.has(productId);
        const endpoint = `/api/products/${productId}/wishlist`;
        const method = isAdding ? 'POST' : 'DELETE';

        try {
            const res = await fetch(`${window.API_BASE_URL}${endpoint}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to update wishlist');

            if (isAdding) {
                this.state.items.add(productId, this.state.items.get(productId));
                buttonElement.classList.add('active');
                buttonElement.querySelector('i')?.classList.replace('far', 'fas');
            } else {
                this.state.items.delete(productId);
                buttonElement.classList.remove('active');
                buttonElement.querySelector('i')?.classList.replace('fas', 'far');
            }

            this.showNotification(
                isAdding ? 'Added to wishlist' : 'Removed from wishlist'
            );
        } catch (error) {
            console.error('Failed to update wishlist:', error);
            this.showNotification('Failed to update wishlist', 'error');
        }
    }

    updateWishlistUI() {
        // Update elements that show wishlist status (like icons on shop page)
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productId = parseInt(btn.getAttribute('data-product-id')); // Ensure productId is a number
            if (this.state.items.has(productId)) {
                btn.classList.add('active');
                btn.querySelector('i')?.classList.replace('far', 'fas');
            } else {
                btn.classList.remove('active');
                btn.querySelector('i')?.classList.replace('fas', 'far');
            }
        });

        // Render the wishlist items on the wishlist page
        this.renderWishlist();
    }

    renderWishlist() {
        console.log('Rendering wishlist...', this.state.items);
        const container = document.getElementById('wishlistProductGrid');
        if (!container) {
            console.error('Wishlist grid container not found.');
            return;
        }

        const products = Array.from(this.state.items.values());

        if (products.length === 0) {
            container.innerHTML = '<p style="color:#888;text-align:center;margin:2rem 0;">Your wishlist is empty.</p>';
            return;
        }

        container.innerHTML = products.map(product => {
            const imageUrl = product.primary_image
                ? (product.primary_image.startsWith('http') ? product.primary_image : window.BASE_API_URL + product.primary_image)
                : 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png';
            // Adapting product card structure from shop.js
            return `
                <div class="product-card" data-product-id="${product.id}">
                    <img src="${imageUrl}" alt="${product.name}">
                    <div class="product-details">
                        <h3>${product.name}</h3>
                        <p class="price">$${Number(product.price).toFixed(2)}</p>
                        <p class="vendor">By ${product.vendor?.name || 'Unknown Vendor'}</p>
                        <div class="product-actions">
                            <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button class="wishlist-btn active" data-product-id="${product.id}">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for Add to Cart and Remove from Wishlist buttons on the rendered items
        container.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.add-to-cart').dataset.productId);
                if (productId && window.cartManager) {
                    window.cartManager.addItem(productId, 1); // Add 1 quantity from wishlist
                }
            });
        });

         container.querySelectorAll('.wishlist-btn').forEach(button => {
             button.addEventListener('click', async (e) => {
                 const productId = parseInt(e.target.closest('.wishlist-btn').dataset.productId);
                 if (productId && window.wishlistManager) {
                     await window.wishlistManager.toggleWishlist(productId, button); // Toggle wishlist status
                     // After toggling, re-render the list to remove the item if removed
                     this.renderWishlist();
                 }
             });
         });
    }

    showNotification(message, type = 'success') {
        // Implement notification system
        alert(message); // Temporary implementation
    }
}

// Initialize wishlist manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.wishlistManager = new WishlistManager();
});
