const wishlistGrid = document.getElementById('wishlistProductGrid');
const token = localStorage.getItem('token');
if (!wishlistGrid) return;
if (!token) {
    wishlistGrid.innerHTML = '<p style="color:#e57373;">Please log in to view your wishlist.</p>';
} else {
    fetch(`${window.API_BASE_URL}/users/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && Array.isArray(data.products) && data.products.length) {
            wishlistGrid.innerHTML = data.products.map(product => {
                let imageUrl = product.primary_image?.startsWith('http')
                    ? product.primary_image
                    : window.BASE_API_URL + product.primary_image;
                if (!product.primary_image) imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png';
                return `
                    <div class="product-card" data-product-id="${product.id}">
                        <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png'">
                        <div class="product-info">
                            <div class="product-category">${product.category ? product.category.toUpperCase() : ''}</div>
                            <div class="product-title">${product.name}</div>
                            <div class="product-price">$${Number(product.price).toFixed(2)}</div>
                        </div>
                        <div class="product-actions">
                            <a class="btn btn-secondary" href="product.html?id=${product.id}" title="View Details"><i class="fas fa-info-circle"></i></a>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            wishlistGrid.innerHTML = '<p style="color:#e57373;">Your wishlist is empty.</p>';
        }
    });
}
