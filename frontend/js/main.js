// Add TOTP modal HTML and variable initialization at the very top
const totpLoginModalHtml = `
<div class="modal" id="totpLoginModal" style="display:none;z-index:2000;">
  <div class="modal-content">
    <span class="close" id="closeTotpLoginModal">&times;</span>
    <h2>Two-Factor Authentication</h2>
    <form id="totpLoginForm">
      <div class="form-group">
        <label for="totpLoginCode">Enter 6-digit code from your authenticator app</label>
        <input type="text" id="totpLoginCode" maxlength="6" required autocomplete="one-time-code">
      </div>
      <button type="submit" class="btn btn-primary">Verify</button>
      <div id="totpLoginMsg" style="color:#c00;margin-top:8px;"></div>
    </form>
  </div>
</div>`;
document.body.insertAdjacentHTML('beforeend', totpLoginModalHtml);
const totpLoginModal = document.getElementById('totpLoginModal');
const totpLoginForm = document.getElementById('totpLoginForm');
const totpLoginCode = document.getElementById('totpLoginCode');
const totpLoginMsg = document.getElementById('totpLoginMsg');
const closeTotpLoginModal = document.getElementById('closeTotpLoginModal');
closeTotpLoginModal.onclick = () => { totpLoginModal.style.display = 'none'; };

// DOM Elements
let loginModal;
let registerModal;
let loginForm;
let registerForm;
let loginBtn;
let registerBtn;
let showLoginLink;
let showRegisterLink;
let closeButtons;
let searchForm;
let searchInput;
let userMenu;
let authButtons;
let cartCount;

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Initialize DOM Elements
function initializeElements() {
    loginModal = document.getElementById('loginModal');
    registerModal = document.getElementById('registerModal');
    loginForm = document.getElementById('loginForm');
    registerForm = document.getElementById('registerForm');
    loginBtn = document.querySelector('.btn-login');
    registerBtn = document.querySelector('.btn-register');
    showLoginLink = document.getElementById('showLogin');
    showRegisterLink = document.getElementById('showRegister');
    closeButtons = document.querySelectorAll('.close');
    searchForm = document.getElementById('searchForm');
    searchInput = document.getElementById('searchInput');
    userMenu = document.getElementById('userMenu');
    authButtons = document.getElementById('authButtons');
    cartCount = document.getElementById('cartCount');
}

// Check Authentication Status
async function checkAuth() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showAuthButtons();
            return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            showUserMenu(user);
        } else {
            localStorage.removeItem('token');
            showAuthButtons();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        showAuthButtons();
    }
}

// Show/Hide Auth Buttons
function showAuthButtons() {
    if (userMenu) userMenu.style.display = 'none';
    if (authButtons) authButtons.style.display = 'flex';
}

function showUserMenu(user) {
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    const userNameElem = document.getElementById('userName');
    if (userNameElem) {
        userNameElem.textContent = user.name;
    }
}

// Modal Functions
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

// Setup Event Listeners
function setupEventListeners() {
    // Login button
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            openModal(loginModal);
        });
    }

    // Register button
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            openModal(registerModal);
        });
    }

    // Show login link
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(registerModal);
            openModal(loginModal);
        });
    }

    // Show register link
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(loginModal);
            openModal(registerModal);
        });
    }

    // Close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Login response:', data);
                    let canLogin = true;
                    if (data.user && data.user.two_factor_enabled) {
                        console.log('TOTP should show');
                        canLogin = await showTotpLogin(data.user, data.token);
                    }
                    if (!canLogin) return;
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    closeModal(loginModal);
                    if (data.user && data.user.role === 'vendor') {
                        window.location.href = 'vendor-dashboard.html';
                    } else if (data.user && data.user.role === 'customer') {
                        window.location.href = 'shop.html';
                    } else {
                        checkAuth();
                    }
                } else {
                    const error = await response.json();
                    console.log('Login error:', error);
                    alert(error.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            }
        });
    }

    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userData = {
                email: document.getElementById('registerEmail').value,
                password: document.getElementById('registerPassword').value,
                first_name: document.getElementById('registerFirstName').value,
                last_name: document.getElementById('registerLastName').value,
                role: document.getElementById('registerRole').value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    closeModal(registerModal);
                    checkAuth();
                } else {
                    const error = await response.json();
                    alert(error.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again.');
            }
        });
    }
}

// Search Functionality
if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        try {
            const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const products = await response.json();
                displayProducts(products);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    });
}

// Display Products
function displayProducts(products) {
    const productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <p class="vendor">By ${product.vendor.name}</p>
            <button class="btn btn-primary" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        </div>
    `).join('');
}

// Cart Functions
async function addToCart(productId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            openModal(loginModal);
            return;
        }

        const response = await fetch(`${API_BASE_URL}/users/cart/count`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (response.ok) {
            updateCartCount();
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to add to cart');
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        alert('Failed to add to cart. Please try again.');
    }
}


// Logout Function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Show TOTP modal and verify code
async function showTotpLogin(user, token) {
  totpLoginCode.value = '';
  totpLoginMsg.textContent = '';
  totpLoginModal.style.display = 'block';
  return new Promise((resolve, reject) => {
    totpLoginForm.onsubmit = async function(e) {
      e.preventDefault();
      const code = totpLoginCode.value.trim();
      if (!code) {
        totpLoginMsg.textContent = 'Enter the 6-digit code.';
        return;
      }
      const res = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, code })
      });
      const data = await res.json();
      if (data.success) {
        totpLoginModal.style.display = 'none';
        resolve(true);
      } else {
        totpLoginMsg.textContent = data.message || 'Invalid code';
      }
    };
    closeTotpLoginModal.onclick = () => {
      totpLoginModal.style.display = 'none';
      resolve(false);
    };
  });
}

// Utility: Check if customer is logged in
function isCustomerLoggedIn() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return token && user && user.role === 'customer';
}

// On landing page, redirect logged-in customers to shop.html
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    if (isCustomerLoggedIn()) {
        window.location.href = 'shop.html';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    // Show auth buttons by default
    showAuthButtons();
    // Then check if user is actually logged in
    checkAuth();
    // updateCartCount();
});

// Bind logout button(s)
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

// --- FEATURED PRODUCTS LANDING PAGE LOGIC ---
const landingFeaturedProductsGrid = document.getElementById('landingFeaturedProducts');
let pendingAddToCartProductId = null;

async function loadFeaturedProducts() {
    if (!landingFeaturedProductsGrid) return;
    try {
        // Try to fetch featured products, fallback to first 6 products
        let res = await fetch(`${API_BASE_URL}/products/featured`);
        let products = [];
        if (res.ok) {
            products = await res.json();
        } else {
            // fallback
            res = await fetch(`${API_BASE_URL}/products`);
            products = (await res.json()).slice(0, 6);
        }
        landingFeaturedProductsGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image || 'https://via.placeholder.com/180x160?text=No+Image'}" alt="${product.name}">
                <div class="product-title">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-vendor">${product.vendor?.name ? 'By ' + product.vendor.name : ''}</div>
                <button class="add-cart-btn" data-product-id="${product.id}"><i class="fas fa-cart-plus"></i> Add to Cart</button>
            </div>
        `).join('');
        // Add event listeners for Add to Cart
        landingFeaturedProductsGrid.querySelectorAll('.add-cart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                handleLandingAddToCart(productId);
            });
        });
    } catch (err) {
        landingFeaturedProductsGrid.innerHTML = '<p style="color:#e74c3c">Failed to load featured products.</p>';
    }
}

function handleLandingAddToCart(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        pendingAddToCartProductId = productId;
        showModal(loginModal);
        return;
    }
    addToCartLanding(productId);
}

async function addToCartLanding(productId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        if (res.ok) {
            alert('Added to cart!');
        } else {
            const err = await res.json();
            alert(err.message || 'Failed to add to cart');
        }
    } catch (err) {
        alert('Failed to add to cart.');
    }
}

// --- MODAL LOGIC ---
function showModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}
function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}
// Modal close buttons
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        const closeLoginModal = document.getElementById('closeLoginModal');
        const closeRegisterModal = document.getElementById('closeRegisterModal');
        if (closeLoginModal) closeLoginModal.onclick = () => closeModal(loginModal);
        if (closeRegisterModal) closeRegisterModal.onclick = () => closeModal(registerModal);
        // Clicking outside modal closes it
        window.onclick = function(event) {
            if (event.target === loginModal) closeModal(loginModal);
            if (event.target === registerModal) closeModal(registerModal);
        };
    });
}
// After successful login, add to cart if pending
async function afterLoginSuccess(user) {
    if (pendingAddToCartProductId) {
        await addToCartLanding(pendingAddToCartProductId);
        pendingAddToCartProductId = null;
    }
}
// Patch loginForm submit to call afterLoginSuccess
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        if (loginForm) {
            const origLoginHandler = loginForm.onsubmit;
            loginForm.onsubmit = async function(e) {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        let canLogin = true;
                        if (data.user && data.user.two_factor_enabled) {
                            canLogin = await showTotpLogin(data.user, data.token);
                        }
                        if (!canLogin) return;
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        closeModal(loginModal);
                        await afterLoginSuccess(data.user);
                        if (data.user && data.user.role === 'vendor') {
                            window.location.href = 'vendor-dashboard.html';
                        } else if (data.user && data.user.role === 'customer') {
                            window.location.href = 'shop.html';
                        } else {
                            checkAuth();
                        }
                    } else {
                        const error = await response.json();
                        alert(error.message || 'Login failed');
                    }
                } catch (error) {
                    alert('Login failed. Please try again.');
                }
            };
        }
    });
}
// Load featured products on DOMContentLoaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
}

document.addEventListener('DOMContentLoaded', function() {
    const cartBtn = document.getElementById('headerCartBtn');
    if (cartBtn) {
        cartBtn.onclick = function() { window.location.href = 'cart.html'; };
    }
});

document.getElementById('checkoutBtn').onclick = placeOrderFromCart; 