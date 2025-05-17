// Nexora Shop Page JS
const API_BASE_URL = 'http://localhost:5000/api';
const productGrid = document.getElementById('shopProductGrid');
const categoryFilters = document.getElementById('categoryFilters');
const searchForm = document.getElementById('shopSearchForm');
const searchInput = document.getElementById('shopSearchInput');
const cartCount = document.getElementById('cartCount');
const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.querySelector('.profile-menu');
const profileDropdown = document.getElementById('profileDropdown');
const profileInitials = document.getElementById('profileInitials');

let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';

// Fetch products from API
async function fetchProducts() {
    try {
        const res = await fetch(`${API_BASE_URL}/products`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        if (Array.isArray(data.products) && data.products.length > 0) {
            allProducts = data.products;
            filteredProducts = allProducts;
            renderProducts(filteredProducts);
        } else {
            showNoProductsFound();
        }
    } catch (error) {
        showFailedToLoadProducts();
        console.error('Fetch error:', error);
    }
}

// Render products
function renderProducts(products) {
    const BASE_API_URL = 'http://localhost:5000';
    if (!products.length) {
        productGrid.innerHTML = '<p style="color:#bfc9da">No products found.</p>';
        return;
    }
    productGrid.innerHTML = products.map(product => {
        const imageUrl = product.primary_image?.startsWith('http')
            ? product.primary_image
            : BASE_API_URL + product.primary_image;
        return `
            <div class="product-card" data-product-id="${product.id}">
                ${product.badge ? `<span class="badge ${product.badgeColor || ''}">${product.badge}</span>` : ''}
                <a href="product.html?id=${product.id}" class="product-link" tabindex="-1">
                    <img src="${imageUrl}" alt="${product.name}">
                    <div class="product-info">
                        <div class="product-category">${product.category ? product.category.toUpperCase() : ''}</div>
                        <div class="product-title">${product.name}</div>
                    </div>
                </a>
                <div class="product-info">
                    <div class="product-rating">
                        <i class="fas fa-star"></i> ${(product.rating || 4.5).toFixed(1)}
                        <span style="color:#bfc9da;font-size:0.9em;">(${product.reviews || 20})</span>
                    </div>
                    <div>
                        <span class="product-price">
                            $${!isNaN(Number(product.price)) ? Number(product.price).toFixed(2) : 'N/A'}
                        </span>
                        ${product.old_price && !isNaN(Number(product.old_price)) ? `<span class="product-old-price">$${Number(product.old_price).toFixed(2)}</span>` : ''}
                        ${product.discount ? `<span class="product-discount">${product.discount}% OFF</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="add-cart-btn" onclick="addToCart(${product.id})"><i class="fas fa-cart-plus"></i> Add to Cart</button>
                        <button class="wishlist-btn"><i class="fas fa-heart"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add click handler to product cards (except buttons)
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('button')) return; // Don't trigger on button clicks
            const id = card.getAttribute('data-product-id');
            window.location.href = `product.html?id=${id}`;
        });
    });
}

// Category filter
categoryFilters.addEventListener('click', e => {
    if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.dataset.category;
        filterProducts();
    }
});
function showFailedToLoadProducts() {
    productGrid.innerHTML = '<p style="color: #e57373;">Failed to load products. Please try again later.</p>';
}
function showNoProductsFound() {
    productGrid.innerHTML = '<p style="color: #e57373;">No products found.</p>';
}
function filterProducts() {
    if (currentCategory === 'all') {
        filteredProducts = allProducts;
    } else {
        filteredProducts = allProducts.filter(p => (p.category || '').toLowerCase().replace(/\s/g,'') === currentCategory);
    }
    renderProducts(filteredProducts);
}

// Search
searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
        filterProducts();
        return;
    }
    const results = filteredProducts.filter(p => p.name.toLowerCase().includes(q));
    renderProducts(results);
});

// Add to cart
window.addToCart = async function(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to add to cart.');
        return;
    }
    try {
        const res = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        if (res.ok) {
            updateCartCount();
        } else {
            const err = await res.json();
            alert(err.message || 'Failed to add to cart');
        }
    } catch (err) {
        alert('Failed to add to cart.');
    }
}

// Update cart count
async function updateCartCount() {
    const token = localStorage.getItem('token');
    if (!token) {
        cartCount.textContent = '0';
        return;
    }
    try {
        const res = await fetch(`${API_BASE_URL}/users/cart/count`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            cartCount.textContent = data.count;
        }
    } catch {}
}

// Profile dropdown
profileBtn.addEventListener('click', e => {
    e.stopPropagation();
    profileMenu.classList.toggle('open');
});
document.addEventListener('click', () => {
    profileMenu.classList.remove('open');
});

// Set profile initials from user (if available)
function setProfileInitials() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.first_name && user.last_name) {
        profileInitials.textContent = (user.first_name[0] + user.last_name[0]).toUpperCase();
    } else {
        profileInitials.textContent = 'CU';
    }
}

// Logout Function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Bind logout in profile dropdown
window.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartCount();
    setProfileInitials();
    if (profileDropdown) {
        const links = profileDropdown.querySelectorAll('a');
        const logoutLink = links[links.length - 1]; // Last link is Logout
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const cartBtn = document.getElementById('headerCartBtn');
    if (cartBtn) {
        cartBtn.onclick = function() { window.location.href = 'cart.html'; };
    }
}); 