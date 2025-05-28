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

        const isAdding = !this.state.items.has(Number(productId));
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

            // Debug: Log action
            console.log(`[Wishlist] ${isAdding ? 'Adding' : 'Removing'} productId:`, productId);

            // Reload wishlist from server to get the correct state and update UI
            await this.loadWishlist();

            this.showNotification(
                isAdding ? 'Added to wishlist' : 'Removed from wishlist'
            );
        } catch (error) {
            console.error('Failed to update wishlist:', error);
            this.showNotification('Failed to update wishlist', 'error');
        }
    }

    updateWishlistUI() {
        // Debug: Log current wishlist state
        const wishlistIds = Array.from(this.state.items.keys());
        console.log('[Wishlist] Current wishlist product IDs:', wishlistIds);
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productId = Number(btn.getAttribute('data-product-id'));
            const isInWishlist = this.state.items.has(productId);
            console.log(`[Wishlist] Button for productId ${productId}: isInWishlist=${isInWishlist}`);
            if (isInWishlist) {
                btn.classList.add('active');
                btn.querySelector('i')?.classList.replace('far', 'fas');
            } else {
                btn.classList.remove('active');
                btn.querySelector('i')?.classList.replace('fas', 'far');
            }
        });

        // Only render the wishlist items if the container exists
        if (document.getElementById('wishlistProductGrid')) {
            this.renderWishlist();
        }
    }

    renderWishlist() {
        console.log('Rendering wishlist...', this.state.items);
        const container = document.getElementById('wishlistProductGrid');
        if (!container) {
            alert('Wishlist grid container not found. Please check your HTML.');
            return;
        }

        const products = Array.from(this.state.items.values());

        if (products.length === 0) {
            container.innerHTML = '<p style="color:#888;text-align:center;margin:2rem 0;">Your wishlist is empty.</p>';
            return;
        }

        container.innerHTML = products.map(product => {
            const imageUrl = product.primary_image
                ? (product.primary_image.startsWith('http') ? product.primary_image : window.API_BASE_URL + product.primary_image)
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
        showToast(message, type);
    }
}

function showToast(message, type = 'success') {
    // Remove any existing toast
    document.querySelectorAll('.custom-toast').forEach(el => el.remove());

    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Always initialize wishlist manager on every page
document.addEventListener('DOMContentLoaded', () => {
    window.wishlistManager = new WishlistManager();
});
