// Cart Page Logic

document.addEventListener('DOMContentLoaded', () => {
    // Ensure cartManager is initialized before using it
    if (window.cartManager) {
        // Initial render
        renderCartPage();

        // Listen for cart updates and re-render the page
        // Assuming CartManager has an event system or a public method to subscribe
        // For now, we can manually call renderCartPage after cart operations in CartManager
        // Or, CartManager could expose a way to get updated state and trigger UI update here.

        // For demonstration, let's assume CartManager will call updateCartUI internally
        // and we just need to ensure initial load and event listeners are set up.

        // Setup event listeners for buttons that interact with CartManager
        setupCartPageEventListeners();

    } else {
        console.error('CartManager not initialized.');
        // Display an error message on the page if CartManager is not available
        const cartItemsList = document.getElementById('cartItemsList');
        if (cartItemsList) {
            cartItemsList.innerHTML = '<p style="color:#e74c3c;text-align:center;margin:2rem 0;">Error: Cart functionality not available.</p>';
        }
    }
});

function renderCartPage() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartItemCount = document.getElementById('cartItemCount');
    const summaryItemCount = document.getElementById('summaryItemCount');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryShipping = document.getElementById('summaryShipping');
    const summaryTax = document.getElementById('summaryTax');
    const summaryTotal = document.getElementById('summaryTotal');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('proceedToCheckoutBtn');

    // Get cart data from CartManager state
    const cartItems = Array.from(window.cartManager?.state.items.values() || []);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    // Shipping and tax (using constants from cart.js)
    const shipping = cartItems.length > 0 ? window.SHIPPING : 0; // Use SHIPPING from cart.js
    const tax = +(subtotal * window.TAX_RATE).toFixed(2); // Use TAX_RATE from cart.js

    // Render cart items
    if (!cartItems.length) {
        if (cartItemsList) cartItemsList.innerHTML = '<p style="color:#888;text-align:center;margin:2rem 0;">Your cart is empty.</p>';
        if (cartItemCount) cartItemCount.textContent = '0 Items in Cart';
        if (summaryItemCount) summaryItemCount.textContent = '0';
        if (summarySubtotal) summarySubtotal.textContent = '$0.00';
        if (summaryShipping) summaryShipping.textContent = '$0.00';
        if (summaryTax) summaryTax.textContent = '$0.00';
        if (summaryTotal) summaryTotal.textContent = '$0.00';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    if (cartItemsList) {
        cartItemsList.innerHTML = cartItems.map(item => `
            <div class="cart-item">
                <img src="${item.image && !item.image.startsWith('http') ? window.BASE_API_URL + item.image : item.image}" class="cart-item-img" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${Number(item.price).toFixed(2)}</div>
                </div>
                <div class="cart-item-qty-controls">
                    <button class="qty-btn" data-action="decrease" data-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item-btn" data-id="${item.id}"><i class="fas fa-times"></i></button>
            </div>
        `).join('');
    }

    if (cartItemCount) cartItemCount.textContent = `${itemCount} Item${itemCount > 1 ? 's' : ''} in Cart`;
    if (summaryItemCount) summaryItemCount.textContent = String(itemCount);
    if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (summaryShipping) summaryShipping.textContent = `$${shipping.toFixed(2)}`;
    if (summaryTax) summaryTax.textContent = `$${tax.toFixed(2)}`;
    if (summaryTotal) summaryTotal.textContent = `$${(subtotal + shipping + tax).toFixed(2)}`;
    if (checkoutBtn) checkoutBtn.disabled = false;
}

function setupCartPageEventListeners() {
    const cartItemsList = document.getElementById('cartItemsList');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('proceedToCheckoutBtn');

    // Clear cart button
    if (clearCartBtn) {
        clearCartBtn.onclick = async () => {
            if (confirm('Clear all items from your cart?')) {
                await window.cartManager?.clearCart();
                // CartManager.clearCart calls updateCartUI which should ideally trigger a re-render here
                // If not, we might need a custom event or callback.
                renderCartPage(); // Manual re-render for now
            }
        };
    }

    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            // Redirect to checkout page
            window.location.href = 'checkout.html';
        };
    }

    // Bind quantity and remove buttons using event delegation on the items list
    if (cartItemsList) {
        cartItemsList.addEventListener('click', async (e) => {
            const target = e.target;
            const itemElement = target.closest('.cart-item');
            if (!itemElement) return;

            const productId = itemElement.dataset.id; // Assuming data-id is used in HTML

            if (target.classList.contains('qty-btn')) {
                const action = target.dataset.action; // Assuming data-action is used
                const item = window.cartManager?.state.items.get(productId); // Get item from manager state
                if (!item) return;

                let newQty = item.quantity;
                if (action === 'increase') newQty++;
                if (action === 'decrease' && item.quantity > 1) newQty--;

                if (newQty !== item.quantity) {
                    await window.cartManager?.updateQuantity(productId, newQty);
                    renderCartPage(); // Manual re-render after quantity update
                }

            } else if (target.closest('.remove-item-btn')) {
                await window.cartManager?.removeItem(productId);
                renderCartPage(); // Manual re-render after item removal
            }
        });
    }
}

// Removed redundant quantity and remove handlers, and old cart data functions
// window.updateCartQuantity = async function(productId, quantity) { ... };
// window.removeCartItem = async function(productId) { ... };
// async function getCart() { ... }
// function setCart(cart) { ... }
// function clearCartBackend() { ... } 