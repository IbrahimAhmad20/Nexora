// --- Cart Data Management ---
const CART_KEY = 'cart_items';
const SHIPPING = 5.99;
const TAX_RATE = 0.08;
const BASE_API_URL = window.BASE_API_URL;

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
function clearCart() {
  // No-op: Cart is managed on backend
}

// --- Render Order Summary ---
async function renderOrderSummary() {
  const cart = await getCart();
  const orderList = document.querySelector('.order-items-list');
  const subtotalEl = document.querySelector('.summary-subtotal');
  const shippingEl = document.querySelector('.summary-shipping');
  const taxEl = document.querySelector('.summary-tax');
  const totalEl = document.querySelector('.summary-total');
  const discountEl = document.querySelector('.summary-discount');
  const giftcardEl = document.querySelector('.summary-giftcard');

  orderList.innerHTML = '';
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += Number(item.price) * item.quantity;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    itemDiv.innerHTML = `
      <img src="${item.image && !item.image.startsWith('http') ? BASE_API_URL + item.image : item.image}" class="order-item-img" alt="${item.name}">
      <div class="order-item-info">
        <div class="order-item-title">${item.name}</div>
        <div class="order-item-details">Qty: ${item.quantity}</div>
      </div>
      <div class="order-item-price">$${(Number(item.price) * item.quantity).toFixed(2)}</div>
    `;
    orderList.appendChild(itemDiv);
  });
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  shippingEl.textContent = cart.length ? `$${SHIPPING.toFixed(2)}` : '$0.00';
  const tax = subtotal * TAX_RATE;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  // Dummy discount/gift card
  let discount = window._checkoutDiscount || 0;
  let giftcard = window._checkoutGiftCard || 0;
  discountEl.textContent = `-$${discount.toFixed(2)}`;
  giftcardEl.textContent = `-$${giftcard.toFixed(2)}`;
  const total = subtotal + (cart.length ? SHIPPING : 0) + tax - discount - giftcard;
  totalEl.textContent = `$${total.toFixed(2)}`;
}

// --- Address Selection ---
document.addEventListener('DOMContentLoaded', () => {
  renderOrderSummary();
  // Address selection
  document.querySelectorAll('.address-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.address-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
  // Payment method selection
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      // Show/hide card form
      document.querySelector('.card-form').style.display = opt.dataset.method === 'card' ? 'flex' : 'none';
    });
  });
  // Promo code
  document.querySelector('.promo-apply').addEventListener('click', () => {
    const code = document.querySelector('.promo-input').value.trim();
    if (code.toLowerCase() === 'save10') {
      window._checkoutDiscount = 10;
      alert('Promo code applied!');
    } else {
      window._checkoutDiscount = 0;
      alert('Invalid promo code.');
    }
    renderOrderSummary();
  });
  // Gift card
  document.querySelector('.add-giftcard').addEventListener('click', () => {
    window._checkoutGiftCard = 20;
    alert('Gift card applied!');
    renderOrderSummary();
  });
  // Complete order
  document.querySelector('.complete-order-btn').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to place an order.');
        return;
    }
    // Check for empty cart
    const cart = await getCart();
    if (!cart.length) {
        alert('Your cart is empty.');
        return;
    }
    // Get selected address (update this as needed for your UI)
    const selectedAddress = document.querySelector('.address-card.selected .address-details');
    if (!selectedAddress) {
        alert('Please select a shipping address.');
        return;
    }
    const shipping_address = selectedAddress.innerText.trim();

    let card = null;
    const cardOptionSelected = document.querySelector('.payment-option.selected').dataset.method === 'card';
    const cardFields = {
      card_number: document.querySelector('.card-number-input').value.trim(),
      card_expiry: document.querySelector('.card-expiry-input').value.trim(),
      card_cvc: document.querySelector('.card-cvc-input').value.trim(),
      card_name: document.querySelector('.card-name-input').value.trim()
    };
    const cardFormFilled = cardFields.card_number && cardFields.card_expiry && cardFields.card_cvc && cardFields.card_name;

    if (cardOptionSelected) {
      if (await hasCreditCardInfo()) {
        // Use saved card (card = null)
      } else if (cardFormFilled) {
        card = cardFields; // Use form card for this order only
      } else {
        alert('Please fill out all card fields before checking out.');
        return;
      }
    }

    try {
        const res = await fetch(window.API_BASE_URL + '/api/checkout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ shipping_address, card })
        });
        const data = await res.json();
        if (data.success) {
            alert('Order completed! Thank you for your purchase.');
            window.location.href = 'index.html';
        } else {
            alert(data.message || 'Order failed.');
        }
    } catch (err) {
        alert('Order failed. Please try again.');
    }
  });
  // Save card
  document.querySelector('.save-card-btn').addEventListener('click', async () => {
    const card_number = document.querySelector('.card-number-input').value.trim();
    const card_expiry = document.querySelector('.card-expiry-input').value.trim();
    const card_cvc = document.querySelector('.card-cvc-input').value.trim();
    const card_name = document.querySelector('.card-name-input').value.trim();
    if (!card_number || !card_expiry || !card_cvc || !card_name) {
      alert('Please fill out all card fields.');
      return;
    }
    const token = localStorage.getItem('token');
    const res = await fetch(BASE_API_URL + '/users/save-card', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ card_number, card_expiry, card_cvc, card_name })
    });
    const data = await res.json();
    if (data.success) {
      alert('Card saved!');
    } else {
      alert(data.message || 'Failed to save card.');
    }
  });
});

// Utility to check if user has credit card info
async function hasCreditCardInfo() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
        const res = await fetch(BASE_API_URL + '/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return false;
        const data = await res.json();
        return !!(data.data && data.data.credit_card);
    } catch {
        return false;
    }
} 