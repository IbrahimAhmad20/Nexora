// --- Cart Data Management ---
const CART_KEY = 'cart_items';
const SHIPPING = 5.99;
const TAX_RATE = 0.08;

// Use: window.BASE_API_URL and window.API_BASE_URL directly everywhere

class CartManager {
    constructor() {
        this.state = {
            items: new Map(),
            isOpen: false
        };

        this.elements = {
            sidebar: document.querySelector('.cart-sidebar'),
            closeBtn: document.querySelector('.cart-sidebar-close'),
            itemsList: document.querySelector('.cart-items-list'),
            count: document.querySelector('.cart-icon .cart-count'),
            checkoutBtn: document.querySelector('.checkout-btn'),
            clearBtn: document.querySelector('.clear-cart'),
            summary: {
                subtotal: document.querySelector('.summary-subtotal'),
                shipping: document.querySelector('.summary-shipping'),
                tax: document.querySelector('.summary-tax'),
                total: document.querySelector('.summary-total')
            }
        };

        this.setupEventListeners();
        this.init();
        this.closeCart();
    }

    init() {
        // Find and assign the cart count element here
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            this.elements.count = cartIcon.querySelector('.cart-count');
            console.log('Cart count element found:', this.elements.count); // Log element found
        }
        this.loadCart();
    }

    setupEventListeners() {
        this.elements.closeBtn?.addEventListener('click', () => this.closeCart());
        this.elements.checkoutBtn?.addEventListener('click', () => this.checkout());
        this.elements.clearBtn?.addEventListener('click', () => this.clearCart());
        // Add event listener for quantity buttons and remove item buttons using delegation on itemsList
        this.elements.itemsList?.addEventListener('click', (e) => {
            const target = e.target;
            const itemElement = target.closest('.cart-item');
            if (!itemElement) return;

            const productId = itemElement.dataset.productId;

            if (target.classList.contains('minus')) {
                const currentQty = parseInt(itemElement.querySelector('.cart-item-qty').textContent);
                if (currentQty > 1) {
                    this.updateQuantity(productId, currentQty - 1);
                }
            } else if (target.classList.contains('plus')) {
                const currentQty = parseInt(itemElement.querySelector('.cart-item-qty').textContent);
                this.updateQuantity(productId, currentQty + 1);
            } else if (target.classList.contains('remove-item')) {
                this.removeItem(productId);
            }
        });

        // Add event listener to the cart icon in the header to open the sidebar
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.openCart());
        }
    }

    async loadCart() {
        const token = localStorage.getItem('token');
        // Do not attempt to load cart if no token exists
        if (!token) {
            this.state.items.clear();
            this.updateCartUI();
            return;
        }

        try {
            const res = await fetch(`${window.API_BASE_URL}/api/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to load cart');

            const data = await res.json();
             // Ensure data.items is an array before mapping
            const itemsArray = Array.isArray(data.data) ? data.data : (Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []));
            
            if (itemsArray.length > 0) {
                 this.state.items = new Map(itemsArray.map(item => [item.id, item]));
                 console.log('Cart loaded successfully', this.state.items);
            } else {
                 this.state.items = new Map(); // Clear cart if data format is wrong or empty
                 console.warn('Invalid or empty cart data format', data);
            }
            this.updateCartUI();
        } catch (error) {
            console.error('Failed to load cart:', error);
             this.state.items.clear(); // Clear cart on load failure
             this.updateCartUI();
        }
    }

    async addItem(productId, quantity = 1) {
        const token = localStorage.getItem('token');
        if (!token) {
             alert('Please log in to add items to your cart.');
             return;
        }
        try {
            const res = await fetch(`${window.API_BASE_URL}/api/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId, quantity })
            });

            if (!res.ok) throw new Error('Failed to add item to cart');

            await this.loadCart(); // Reload cart to get updated state from backend
            this.showNotification('Item added to cart');
        } catch (error) {
            console.error('Failed to add item:', error);
            this.showNotification('Failed to add item to cart', 'error');
        }
    }

    async updateQuantity(productId, quantity) {
        const token = localStorage.getItem('token');
         if (!token) return; // Should not happen if button is disabled when not logged in
        try {
            const res = await fetch(`${window.API_BASE_URL}/api/cart/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity })
            });

            if (!res.ok) throw new Error('Failed to update quantity');

            await this.loadCart(); // Reload cart to get updated state from backend
        } catch (error) {
            console.error('Failed to update quantity:', error);
            this.showNotification('Failed to update quantity', 'error');
        }
    }

    async removeItem(productId) {
         const token = localStorage.getItem('token');
         if (!token) return; // Should not happen if button is disabled when not logged in
        try {
            const res = await fetch(`${window.API_BASE_URL}/api/cart/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 404) {
                console.warn(`Attempted to remove item ${productId} but it was not found in cart.`);
                // Item wasn't on the backend, but might be in our local state if UI is out of sync
                // Reload cart to ensure UI matches backend state
                await this.loadCart();
                this.showNotification('Item not found in cart, refreshing');
                return; // Exit the function after handling 404
            }

            if (!res.ok) throw new Error('Failed to remove item');

            await this.loadCart(); // Reload cart to get updated state from backend
            console.log('State items after loading cart:', this.state.items);
            this.showNotification('Item removed from cart');
        } catch (error) {
            console.error('Failed to remove item:', error);
            this.showNotification('Failed to remove item', 'error');
        }
    }

    async clearCart() {
        const token = localStorage.getItem('token');
         if (!token) return; // Should not happen if button is disabled when not logged in
        try {
            const res = await fetch(`${window.API_BASE_URL}/api/cart`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to clear cart');

            this.state.items.clear(); // Clear local state immediately
            this.updateCartUI(); // Update UI immediately
            this.showNotification('Cart cleared');
        } catch (error) {
            console.error('Failed to clear cart:', error);
            this.showNotification('Failed to clear cart', 'error');
        }
    }

    updateCartUI() {
        // Update cart count (this part should always run if the element exists)
        const totalItems = Array.from(this.state.items.values())
            .reduce((sum, item) => {
                // console.log('Processing item for total count:', item); // Keep or remove debug log
                // Ensure item.quantity is a number, default to 0 if not
                const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                return sum + quantity;
            }, 0);

        console.log('Updating cart count UI with total items:', totalItems); // Log total items

        // Use optional chaining in case elements.count is not found
        if (this.elements.count) {
           this.elements.count.textContent = totalItems > 0 ? String(totalItems) : ''; // Display empty string if 0 items
        }

        // Update items list (this part only runs if the itemsList element exists)
        if (!this.elements.itemsList) return; // Only proceed if itemsList element is found

        // Use a fragment for better performance when adding many items
        const fragment = document.createDocumentFragment();
        Array.from(this.state.items.values()).forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.dataset.productId = item.id;
            itemElement.innerHTML = this.createCartItemHTML(item);
            fragment.appendChild(itemElement);
        });

        this.elements.itemsList.innerHTML = ''; // Clear previous items
        this.elements.itemsList.appendChild(fragment);


        // Update summary
        this.updateSummary();

        // Note: Event listeners for cart items are attached using delegation in setupEventListeners
    }

    createCartItemHTML(item) {
        // Ensure item.image is handled correctly, similar to product card
        const imageUrl = item.image && !item.image.startsWith('http') ? `${window.BASE_API_URL}${item.image}` : item.image || 'https://via.placeholder.com/60x60?text=No+Image';

        return `
            <div class="cart-item" data-product-id="${item.product_id}">
                <img src="${imageUrl}" class="cart-item-img" alt="${item.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/60x60?text=No+Image'">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${Number(item.price).toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn minus" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="qty-btn plus">+</button>
                        <button class="remove-item" title="Remove">&times;</button>
                    </div>
                </div>
            </div>
        `;
    }

    updateSummary() {
        const subtotal = Array.from(this.state.items.values())
            .reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
        // Shipping is 0 if no items, otherwise SHIPPING constant
        const shipping = this.state.items.size > 0 ? SHIPPING : 0;
        const tax = subtotal * TAX_RATE; // 10% tax
        const total = subtotal + shipping + tax;

        // Use optional chaining
        if (this.elements.summary.subtotal) this.elements.summary.subtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (this.elements.summary.shipping) this.elements.summary.shipping.textContent = `$${shipping.toFixed(2)}`;
        if (this.elements.summary.tax) this.elements.summary.tax.textContent = `$${tax.toFixed(2)}`;
        if (this.elements.summary.total) this.elements.summary.total.textContent = `$${total.toFixed(2)}`;
    }

    openCart() {
        this.state.isOpen = true;
        this.elements.sidebar?.classList.add('open');
    }

    closeCart() {
        this.state.isOpen = false;
        this.elements.sidebar?.classList.remove('open');
    }

    async checkout() {
        const token = localStorage.getItem('token');
         if (!token) {
             alert('Please log in to checkout.');
             return;
         }
         if (this.state.items.size === 0) {
             alert('Your cart is empty.');
             return;
         }

        // Redirect to the checkout page
        window.location.href = 'checkout.html';
    }

    showNotification(message, type = 'success') {
        // Implement notification system
        alert(message); // Temporary implementation
    }
}

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
}); 