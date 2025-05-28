function loadFeaturedProducts() {
  fetch(`${window.API_BASE_URL}/api/products/featured`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const products = data.products.map(p => ({
        ...p,
        image: p.image
          ? (p.image.startsWith('http') ? p.image : `${window.API_BASE_URL}${p.image}`)
          : null
      }));
      displayFeaturedProducts(products);
    }
  })
  .catch(error => console.error('Error loading featured products:', error));
} 