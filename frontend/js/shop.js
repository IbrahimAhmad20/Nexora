// Nexora Shop Page JS
(function() {
window.API_BASE_URL = "https://nexora-yapl.onrender.com";
window.BASE_API_URL = "https://nexora-yapl.onrender.com";
const productGrid = document.getElementById('shopProductGrid');
const categoryFilters = document.getElementById('categoryFilters');
const searchForm = document.getElementById('shopSearchForm');
const searchInput = document.getElementById('shopSearchInput');
const cartCount = document.getElementById('cartCount');
const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.querySelector('.profile-menu');
const profileDropdown = document.getElementById('profileDropdown');
const profileInitials = document.getElementById('profileInitials');
const hamburger = document.getElementById('hamburgerMenu');

let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';

// Fetch products from API
async function fetchProducts() {
    try {
        const res = await fetch(window.API_BASE_URL + '/api/products');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        if (Array.isArray(data.products) && data.products.length > 0) {
            allProducts = data.products;
            filteredProducts = allProducts;
            renderProducts(filteredProducts);
            markWishlistProducts();
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
    if (!productGrid) return;
    if (!products.length) {
        productGrid.innerHTML = '<div class="alert alert-warning" style="background:#fff3cd;color:#856404;padding:0.7em 1em;border-radius:6px;font-size:0.98em;text-align:center;margin:1.5em auto;max-width:400px;">No products found.</div>';
        return;
    }
    productGrid.innerHTML = products.map(product => {
        let imageUrl = product.primary_image?.startsWith('http')
            ? product.primary_image
            : window.BASE_API_URL + product.primary_image;
        if (!product.primary_image) imageUrl = 'images/placeholder.png';
        return `
            <div class="product-card" data-product-id="${product.id}" tabindex="0" style="cursor:pointer;">
                ${product.badge ? `<span class="badge ${product.badgeColor || ''}">${product.badge}</span>` : ''}
                <div class="product-link" tabindex="-1" style="pointer-events:none;">
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='images/placeholder.png'">
                    <div class="product-info">
                        <div class="product-category">${product.category ? product.category.toUpperCase() : ''}</div>
                        <div class="product-title" style="font-family:'Poppins', 'Segoe UI', Arial, sans-serif; font-size:1.18rem; font-weight:700; color:#fff; margin-bottom:0.2rem; letter-spacing:0.01em; text-decoration:none; box-shadow:none; border-bottom:none;">${product.name}</div>
                    </div>
                </div>
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
                        <button class="add-cart-btn" onclick="addToCart(${product.id});event.stopPropagation();" title="Add to Cart"><i class="fas fa-cart-plus"></i></button>
                        <button class="wishlist-btn" onclick="addToWishlist(${product.id});event.stopPropagation();" title="Add to Favourites"><i class="fas fa-heart"></i></button>
                        <a class="btn btn-secondary" href="product.html?id=${product.id}" onclick="event.stopPropagation();" title="View Details"><i class="fas fa-info-circle"></i></a>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Make the entire card clickable except for action buttons
    document.querySelectorAll('.product-card').forEach(card => {
        if (card.classList.contains('product-card')) {
            card.addEventListener('click', function(e) {
                if (e.target.closest('.product-actions')) return;
                const id = card.getAttribute('data-product-id');
                window.location.href = `product.html?id=${id}`;
            });
            card.addEventListener('keypress', function(e) {
                if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.product-actions')) {
                    const id = card.getAttribute('data-product-id');
                    window.location.href = `product.html?id=${id}`;
                }
            });
        }
    });

    markWishlistProducts();
}

// Category filter
if (categoryFilters) {
    categoryFilters.addEventListener('click', e => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            filterProducts();
        }
    });
}
function showFailedToLoadProducts() {
    if (productGrid) {
        productGrid.innerHTML = '<p style="color: #e57373; font-size:1.1rem;">Sorry, we are having trouble loading products. Please try again later.</p>';
    } else {
        console.warn('shop.js: #shopProductGrid element not found. Cannot show failed to load message.');
    }
}
function showNoProductsFound() {
    if (productGrid) {
        productGrid.innerHTML = '<div class="alert alert-warning" style="background:#fff3cd;color:#856404;padding:0.7em 1em;border-radius:6px;font-size:0.98em;text-align:center;margin:1.5em auto;max-width:400px;">No products found.</div>';
    } else {
        console.warn('shop.js: #shopProductGrid element not found. Cannot show no products message.');
    }
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
if (searchForm) {
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
}

// Add to cart
window.addToCart = async function(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to add to cart.');
        return;
    }
    try {
        const res = await fetch(window.API_BASE_URL + '/api/cart/add', {
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
        if (cartCount) cartCount.textContent = '0';
        return;
    }
    try {
        const res = await fetch(window.API_BASE_URL + '/api/users/cart/count', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            if (cartCount) cartCount.textContent = data.count;
        }
    } catch {}
}

// Profile dropdown
if (profileBtn) {
    profileBtn.addEventListener('click', e => {
        e.stopPropagation();
        profileMenu.classList.toggle('open');
    });
}
document.addEventListener('click', () => {
    if (profileMenu) {
        profileMenu.classList.remove('open');
    }
});

// Set profile initials from user (if available)
function setProfileInitials() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.first_name && user.last_name) {
        if (profileInitials) profileInitials.textContent = (user.first_name[0] + user.last_name[0]).toUpperCase();
    } else {
        if (profileInitials) profileInitials.textContent = 'CU';
    }
}

// Logout Function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Fetch and mark wishlist items on page load
async function markWishlistProducts() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch(window.API_BASE_URL + '/api/users/wishlist', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
            data.products.forEach(product => {
                const btn = document.querySelector(`.product-card[data-product-id="${product.id}"] .wishlist-btn`);
                if (btn) btn.classList.add('active');
            });
        }
    } catch {}
}

window.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartCount();
    setProfileInitials();

    // Profile dropdown
    if (profileDropdown) {
        const links = profileDropdown.querySelectorAll('a');
        const logoutLink = links[links.length - 1];
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    }

    // Cart button
    const cartBtn = document.getElementById('headerCartBtn');
    if (cartBtn) {
        cartBtn.onclick = function() { window.location.href = 'cart.html'; };
    }

    // Hamburger menu
    if (hamburger) {
        // Add your hamburger menu event listeners here if needed, e.g.:
        // hamburger.addEventListener('click', function() { ... });
        // hamburger.addEventListener('keypress', function(e) { ... });
    }
});

window.addToWishlist = async function(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to add to wishlist.');
        return;
    }
    // Find the button for this product
    const btn = document.querySelector(`.product-card[data-product-id="${productId}"] .wishlist-btn`);
    const isActive = btn && btn.classList.contains('active');
    const method = isActive ? 'DELETE' : 'POST';
    try {
        const res = await fetch(window.API_BASE_URL + '/api/products/' + productId + '/wishlist', {
            method,
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            if (btn) btn.classList.toggle('active');
            alert(isActive ? 'Removed from wishlist' : 'Added to wishlist');
        } else {
            alert(data.message || 'Wishlist update failed');
        }
    } catch (err) {
        alert('Failed to update wishlist');
    }
};
})(); 