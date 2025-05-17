// Cart Page Logic

document.addEventListener('DOMContentLoaded', () => {
    renderCartPage();
    cart.updateUI = function() {
        renderCartPage();
    };
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

    // Shipping and tax (static for demo)
    const shipping = 5.99;
    const tax = +(cart.total * 0.08).toFixed(2);

    // Render cart items
    if (!cart.items.length) {
        cartItemsList.innerHTML = '<p style="color:#888;text-align:center;margin:2rem 0;">Your cart is empty.</p>';
        cartItemCount.textContent = '0 Items in Cart';
        summaryItemCount.textContent = '0';
        summarySubtotal.textContent = '$0.00';
        summaryTax.textContent = '$0.00';
        summaryTotal.textContent = '$0.00';
        checkoutBtn.disabled = true;
        return;
    }
    cartItemsList.innerHTML = cart.items.map(item => `
        <div class="cart-item">
            <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.product.name}</div>
                <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-qty-controls">
                <button class="qty-btn" data-action="decrease" data-id="${item.product.id}">-</button>
                <span class="cart-item-qty">${item.quantity}</span>
                <button class="qty-btn" data-action="increase" data-id="${item.product.id}">+</button>
            </div>
            <button class="remove-item-btn" data-id="${item.product.id}"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
    cartItemCount.textContent = `${cart.count} Item${cart.count > 1 ? 's' : ''} in Cart`;
    summaryItemCount.textContent = cart.count;
    summarySubtotal.textContent = `$${cart.total.toFixed(2)}`;
    summaryShipping.textContent = `$${shipping.toFixed(2)}`;
    summaryTax.textContent = `$${tax.toFixed(2)}`;
    summaryTotal.textContent = `$${(cart.total + shipping + tax).toFixed(2)}`;
    checkoutBtn.disabled = false;

    // Clear cart
    clearCartBtn.onclick = async () => {
        if (confirm('Clear all items from your cart?')) {
            await cart.clear();
            renderCartPage();
        }
    };
    // Checkout
    checkoutBtn.onclick = () => {
        window.location.href = 'checkout.html';
    };

    // Bind quantity and remove buttons
    cartItemsList.querySelectorAll('.qty-btn').forEach(btn => {
        btn.onclick = async function() {
            const id = this.getAttribute('data-id');
            const action = this.getAttribute('data-action');
            const item = cart.items.find(i => i.product.id == id);
            if (!item) return;
            let newQty = item.quantity;
            if (action === 'increase') newQty++;
            if (action === 'decrease' && item.quantity > 1) newQty--;
            if (newQty !== item.quantity) {
                await cart.updateQuantity(item.product.id, newQty);
            }
        };
    });
    cartItemsList.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.onclick = async function() {
            const id = this.getAttribute('data-id');
            await cart.removeItem(id);
        };
    });
}

// Quantity and remove handlers
window.updateCartQuantity = async function(productId, quantity) {
    if (quantity < 1) return;
    await cart.updateQuantity(productId, quantity);
    renderCartPage();
};
window.removeCartItem = async function(productId) {
    await cart.removeItem(productId);
    renderCartPage();
}; 