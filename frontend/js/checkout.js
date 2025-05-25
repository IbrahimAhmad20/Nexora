// --- Cart Data Management ---
const CART_KEY = 'cart_items';
const SHIPPING = 5.99;
const TAX_RATE = 0.08;

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
      <img src="${item.image && !item.image.startsWith('http') ? window.BASE_API_URL + item.image : item.image}" class="order-item-img" alt="${item.name}">
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

// --- Address Management ---
async function fetchAndRenderAddresses() {
  const token = localStorage.getItem('token');
  const addressListEl = document.querySelector('.address-list');
  if (!token || !addressListEl) return;

  try {
    const res = await fetch(window.API_BASE_URL + '/api/users/addresses', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    addressListEl.innerHTML = ''; // Clear existing addresses
    if (data.success && Array.isArray(data.data)) {
      if (data.data.length === 0) {
         addressListEl.innerHTML = '<p style="text-align:center; color:#888;">No addresses found. Add one below.</p>';
      } else {
        data.data.forEach((address, index) => {
          const addressCardHtml = `
            <div class="address-card ${index === 0 ? 'selected' : ''}" data-address-id="${address.id}">
              <div class="address-title">${address.label || 'Address #' + (index + 1)}</div>
              <div class="address-details">
                ${address.address}<br>
                ${address.city}, ${address.state} ${address.zip}<br>
                ${address.country}
              </div>
            </div>
          `;
          addressListEl.insertAdjacentHTML('beforeend', addressCardHtml);
        });
      }
    } else {
       addressListEl.innerHTML = '<p style="text-align:center; color:#e74c3c;">Failed to load addresses.</p>';
       console.error('Failed to fetch addresses:', data);
    }
  } catch (error) {
    console.error('Error fetching addresses:', error);
    addressListEl.innerHTML = '<p style="text-align:center; color:#e74c3c;">Error loading addresses.</p>';
  }
}

// Add event listener for address card selection using delegation
document.addEventListener('click', (e) => {
  const addressCard = e.target.closest('.address-card');
  if (addressCard) {
    document.querySelectorAll('.address-card').forEach(c => c.classList.remove('selected'));
    addressCard.classList.add('selected');
  }
});

// Modify DOMContentLoaded to call fetchAndRenderAddresses
document.addEventListener('DOMContentLoaded', () => {
  renderOrderSummary();
  fetchAndRenderAddresses(); // Fetch and display addresses
  // Address selection event listener is now handled by delegation above

  // --- Add New Address Modal/Form (Moved inside DOMContentLoaded) ---
  const addAddressModal = document.getElementById('add-address-modal');
  const addAddressCloseBtn = document.getElementById('add-address-close-btn');
  const addAddressForm = document.getElementById('add-address-form');
  const addAddressMsgEl = document.getElementById('add-address-msg');

  // Event listeners for add address modal
  document.querySelector('.add-address').addEventListener('click', () => {
    if (addAddressModal) addAddressModal.style.display = 'flex';
  });

  if (addAddressCloseBtn) {
    addAddressCloseBtn.addEventListener('click', () => {
      if (addAddressModal) addAddressModal.style.display = 'none';
      if (addAddressForm) addAddressForm.reset();
      if (addAddressMsgEl) addAddressMsgEl.textContent = '';
    });
  }

  if (addAddressModal) {
    addAddressModal.addEventListener('click', (e) => {
      if (e.target === addAddressModal) {
        if (addAddressModal) addAddressModal.style.display = 'none';
        if (addAddressForm) addAddressForm.reset();
        if (addAddressMsgEl) addAddressMsgEl.textContent = '';
      }
    });
  }

  // Add address form submission
  if (addAddressForm) {
    addAddressForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (addAddressMsgEl) addAddressMsgEl.textContent = ''; // Clear previous messages

      const token = localStorage.getItem('token');
      if (!token) {
        if (addAddressMsgEl) addAddressMsgEl.textContent = 'You must be logged in to add an address.';
        return;
      }

      const newAddress = {
        label: document.getElementById('address-label')?.value.trim(),
        address: document.getElementById('address-address')?.value.trim(),
        city: document.getElementById('address-city')?.value.trim(),
        state: document.getElementById('address-state')?.value.trim(),
        zip: document.getElementById('address-zip')?.value.trim(),
        country: document.getElementById('address-country')?.value.trim(),
        // Note: Backend also expects optional 'apartment' and 'is_default' fields if available
        // You would need form fields for these if you want to send them
        // apartment: document.getElementById('address-apartment')?.value.trim() || null,
        // is_default: document.getElementById('address-is_default')?.checked || false,
      };

      // Basic validation (backend has more)
      if (!newAddress.address || !newAddress.city || !newAddress.state || !newAddress.zip || !newAddress.country) {
        if (addAddressMsgEl) addAddressMsgEl.textContent = 'Please fill in all required address fields.';
        return;
      }

      try {
        const res = await fetch(window.API_BASE_URL + '/api/users/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newAddress)
        });

        const data = await res.json();

        if (data.success) {
          if (addAddressMsgEl) {
            addAddressMsgEl.style.color = '#28a745'; // Green for success
            addAddressMsgEl.textContent = data.message || 'Address added successfully!';
          }
          if (addAddressForm) addAddressForm.reset();
          fetchAndRenderAddresses(); // Refresh the address list
          // Optionally close the modal after a short delay
          setTimeout(() => { if (addAddressModal) addAddressModal.style.display = 'none'; }, 1500);
        } else {
          if (addAddressMsgEl) {
            addAddressMsgEl.style.color = '#e74c3c'; // Red for error
            addAddressMsgEl.textContent = data.message || 'Failed to add address.';
          }
        }
      } catch (error) {
        console.error('Error adding address:', error);
        if (addAddressMsgEl) {
          addAddressMsgEl.style.color = '#e74c3c'; // Red for error
          addAddressMsgEl.textContent = 'Error adding address. Please try again.';
        }
      }
    });
  }

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
    // Get selected address
    const selectedAddressCard = document.querySelector('.address-card.selected');
    if (!selectedAddressCard) {
        alert('Please select a shipping address.');
        return;
    }
    const addressId = selectedAddressCard.dataset.addressId;
    if (!addressId) {
        alert('Invalid address selection. Please try again.');
        return;
    }

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

    console.log('Sending checkout request with:', { addressId, card });

    try {
        const res = await fetch(window.API_BASE_URL + '/api/checkout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ addressId, card })
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
    const res = await fetch(window.BASE_API_URL + '/users/save-card', {
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
        const res = await fetch(window.BASE_API_URL + '/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return false;
        const data = await res.json();
        return !!(data.data && data.data.credit_card);
    } catch {
        return false;
    }
} 