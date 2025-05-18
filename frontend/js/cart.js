// --- Cart Data Management ---
const CART_KEY = 'cart_items';
const SHIPPING = 5.99;
const TAX_RATE = 0.08;

// Use: window.BASE_API_URL and window.API_BASE_URL directly everywhere

async function getCart() {
  const token = localStorage.getItem('token');
  if (!token) return [];
  const res = await fetch(window.API_BASE_URL + '/api/cart', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.data || [];
}
function setCart(cart) {
  // No-op: Cart is managed on backend
}
function clearCartBackend() {
  const token = localStorage.getItem('token');
  if (!token) return Promise.resolve();
  return fetch(window.API_BASE_URL + '/api/cart', {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

// --- Render Cart ---
async function renderCart() {
  const cart = await getCart();
  const cartList = document.querySelector('.cart-items-list');
  const cartCount = document.querySelector('.cart-count');
  const subtotalEl = document.querySelector('.summary-subtotal');
  const shippingEl = document.querySelector('.summary-shipping');
  const taxEl = document.querySelector('.summary-tax');
  const totalEl = document.querySelector('.summary-total');

  cartList.innerHTML = '';
  let subtotal = 0;
  let itemCount = 0;

  cart.forEach((item, idx) => {
    subtotal += Number(item.price) * item.quantity;
    itemCount += item.quantity;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${item.image && !item.image.startsWith('http') ? window.BASE_API_URL + item.image : item.image}" class="cart-item-img" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-category"></div>
        <div class="cart-item-price">$${Number(item.price).toFixed(2)}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn minus" data-id="${item.product_id}" ${item.quantity === 1 ? 'disabled' : ''}>-</button>
        <span class="cart-item-qty">${item.quantity}</span>
        <button class="qty-btn plus" data-id="${item.product_id}">+</button>
        <button class="remove-item" data-id="${item.product_id}" title="Remove">🗑️</button>
      </div>
    `;
    // Add event listeners for quantity buttons
    itemDiv.querySelector('.minus').addEventListener('click', async () => {
      if (item.quantity > 1) {
        await updateCartQuantity(item.product_id, item.quantity - 1);
        await renderCart();
      }
    });
    itemDiv.querySelector('.plus').addEventListener('click', async () => {
      await updateCartQuantity(item.product_id, item.quantity + 1);
      await renderCart();
    });
    // Remove item
    itemDiv.querySelector('.remove-item').addEventListener('click', async () => {
      await removeCartItem(item.product_id);
      await renderCart();
    });
    cartList.appendChild(itemDiv);
  });

  cartCount.textContent = `${itemCount} Item${itemCount !== 1 ? 's' : ''} in Cart`;
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  shippingEl.textContent = cart.length ? `$${SHIPPING.toFixed(2)}` : '$0.00';
  const tax = subtotal * TAX_RATE;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  totalEl.textContent = `$${(subtotal + (cart.length ? SHIPPING : 0) + tax).toFixed(2)}`;
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  document.querySelector('.clear-cart').addEventListener('click', async () => {
    await clearCartBackend();
    renderCart();
  });
  document.querySelector('.checkout-btn').addEventListener('click', async () => {
    const cart = await getCart();
    if (!cart.length) {
        alert('Your cart is empty.');
        return;
    }
    if (!(await hasCreditCardInfo())) {
        alert('Please add your credit card information before checking out.');
        return;
    }
    window.location.href = 'checkout.html';
  });
});

async function updateCartQuantity(productId, quantity) {
  if (quantity < 1) return;
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    await fetch(window.API_BASE_URL + '/api/cart/' + productId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });
  } catch (err) {
    alert('Failed to update cart item.');
  }
}

async function removeCartItem(productId) {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    await fetch(window.API_BASE_URL + '/api/cart/' + productId, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (err) {
    alert('Failed to remove item.');
  }
}

async function hasCreditCardInfo() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
        const res = await fetch(window.API_BASE_URL + '/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return false;
        const data = await res.json();
        return !!(data.data && data.data.credit_card);
    } catch {
        return false;
    }
} 