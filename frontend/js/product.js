function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchProduct(id) {
  try {
    const res = await fetch(`${window.API_BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error('Product not found or unavailable.');
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (err) {
    throw new Error('Product not found or unavailable.');
  }
}

async function fetchReviews(productId) {
  const res = await fetch(`${window.API_BASE_URL}/products/${productId}/reviews`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.success ? data.reviews : [];
}

async function fetchRelated(category, excludeId) {
  const res = await fetch(`${window.API_BASE_URL}/products?category=${encodeURIComponent(category)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.products || []).filter(p => p.id !== excludeId).slice(0, 4);
}

async function fetchQA(productId) {
  const res = await fetch(`${window.API_BASE_URL}/products/${productId}/qa`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.success ? data.qa : [];
}

async function fetchVariants(productId) {
  const res = await fetch(`${window.API_BASE_URL}/products/${productId}/variants`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.success ? data.variants : [];
}

async function fetchSpecs(productId) {
  const res = await fetch(`${window.API_BASE_URL}/products/${productId}/specs`);
  if (!res.ok) return {};
  const data = await res.json();
  return data.success ? data.specifications : {};
}

function renderGallery(images, mainImage) {
  const gallery = document.getElementById('productGallery');
  if (!gallery) return;
  let mainImgUrl = mainImage?.startsWith('http') ? mainImage : window.BASE_API_URL + mainImage;
  if (!mainImage) mainImgUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png';
  gallery.innerHTML = `
    <div class="main-image">
      <img id="mainProductImage" src="${mainImgUrl}" alt="Product Image" onerror="this.onerror=null;this.src='https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png'">
    </div>
    <div class="thumbnails">
      ${images.map(img => {
        let imageUrl = img.url?.startsWith('http') ? img.url : window.BASE_API_URL + img.url;
        if (!img.url) imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png';
        return `<img src="${imageUrl}" class="thumb" onclick="document.getElementById('mainProductImage').src='${imageUrl}'" onerror="this.onerror=null;this.src='https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png'">`;
      }).join('')}
    </div>
  `;
}

function renderInfo(product) {
  const info = document.getElementById('productInfo');
  if (!info) return;
  info.innerHTML = `
    <h1>${product.name}</h1>
    <div class="product-price">$${Number(product.price).toFixed(2)}</div>
    <div class="stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
      ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
    </div>
    <div class="product-category">Category: ${product.category}</div>
    <div class="product-description">${product.description}</div>
    <div class="product-vendor">By: ${product.vendor?.name || 'Unknown'}</div>
    <div class="product-actions">
      <button class="btn-primary" id="addToCartBtn" ${product.stock === 0 ? 'disabled' : ''}>Add to Cart</button>
      <button class="btn" id="wishlistBtn" onclick="toggleWishlist(${product.id})">
        <i class="fas fa-heart"></i> Add to Wishlist
      </button>
    </div>
  `;
  const addToCartBtn = document.getElementById('addToCartBtn');
  if (addToCartBtn) addToCartBtn.onclick = () => addToCart(product.id);
}

async function addToCart(productId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to add to cart.');
    return;
  }
  const res = await fetch(`${window.API_BASE_URL}/cart/add`, {
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
}

function renderReviews(reviews) {
  const section = document.getElementById('reviewsSection');
  if (!section) return;
  if (!reviews.length) {
    section.innerHTML = `
      <h3>Reviews</h3>
      <p style="color:#888;">No reviews yet.</p>
      <button class="btn btn-primary" id="writeReviewBtn">Write a Review</button>
    `;
    const writeReviewBtn = document.getElementById('writeReviewBtn');
    if (writeReviewBtn) writeReviewBtn.onclick = showReviewForm;
    return;
  }
  section.innerHTML = `
    <h3>Reviews</h3>
    <button class="btn btn-primary" id="writeReviewBtn">Write a Review</button>
    ${reviews.map(r => `
      <div class="review" style="background:#f8fbff;border-left:5px solid #2ecc71;padding:1.2rem 1.5rem;margin-bottom:1rem;border-radius:8px;box-shadow:0 1px 4px #2ecc7111;">
        <span class="review-author">${r.author || 'Anonymous'}</span>
        <span class="review-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        <div class="review-text">${r.text}</div>
      </div>
    `).join('')}
  `;
  const writeReviewBtn = document.getElementById('writeReviewBtn');
  if (writeReviewBtn) writeReviewBtn.onclick = showReviewForm;
}

function showReviewForm() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to write a review.');
    return;
  }
  const section = document.getElementById('reviewsSection');
  const form = document.createElement('div');
  form.innerHTML = `
    <h3>Write a Review</h3>
    <form id="reviewForm" style="margin-top: 1rem;">
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem;">Rating:</label>
        <select name="rating" required style="width: 100%; padding: 0.5rem; background: #151e2e; color: #e6eaf3; border: 1px solid #2ee6a8; border-radius: 4px;">
          <option value="">Select rating</option>
          <option value="5">★★★★★ Excellent</option>
          <option value="4">★★★★☆ Very Good</option>
          <option value="3">★★★☆☆ Good</option>
          <option value="2">★★☆☆☆ Fair</option>
          <option value="1">★☆☆☆☆ Poor</option>
        </select>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem;">Your Review:</label>
        <textarea name="text" required style="width: 100%; padding: 0.5rem; background: #151e2e; color: #e6eaf3; border: 1px solid #2ee6a8; border-radius: 4px; min-height: 100px;"></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Submit Review</button>
      <button type="button" class="btn" onclick="document.getElementById('reviewForm').remove()" style="margin-left: 1rem; background: #ff5c8d;">Cancel</button>
    </form>
  `;
  section.insertBefore(form, section.firstChild);
  document.getElementById('reviewForm').onsubmit = submitReview;
}

async function submitReview(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to submit a review.');
    return;
  }
  const form = e.target;
  const rating = form.rating.value;
  const text = form.text.value;
  try {
    const res = await fetch(`${window.API_BASE_URL}/products/${getProductIdFromUrl()}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rating, text })
    });
    const data = await res.json();
    if (data.success) {
      alert('Review submitted successfully!');
      form.remove();
      // Refresh reviews
      const reviews = await fetchReviews(getProductIdFromUrl());
      renderReviews(reviews);
    } else {
      alert(data.message || 'Failed to submit review');
    }
  } catch (err) {
    alert('Failed to submit review. Please try again.');
  }
}

function renderQA(qa) {
  const section = document.getElementById('qaSection');
  if (!section) return;
  if (!qa.length) {
    section.innerHTML = `
      <h3>Questions & Answers</h3>
      <p style="color:#888;">No questions yet.</p>
      <button class="btn btn-primary" id="askQuestionBtn">Ask a Question</button>
    `;
    const askQuestionBtn = document.getElementById('askQuestionBtn');
    if (askQuestionBtn) askQuestionBtn.onclick = showQuestionForm;
    return;
  }
  section.innerHTML = `
    <h3>Questions & Answers</h3>
    <button class="btn btn-primary" id="askQuestionBtn">Ask a Question</button>
    ${qa.map(q => `
      <div class="qa-item" style="background:#f8fbff;border-left:5px solid #2d8cff;padding:1.2rem 1.5rem;margin-bottom:1rem;border-radius:8px;box-shadow:0 1px 4px #2d8cff11;">
        <div class="question" style="color:#2d8cff;font-weight:600;">Q: ${q.question}</div>
        <div style="color:#666;font-size:0.97rem;">Asked by ${q.asker} on ${new Date(q.created_at).toLocaleDateString()}</div>
        ${q.answer ? `
          <div class="answer" style="margin-top:0.7rem;color:#27ae60;font-weight:500;">A: ${q.answer}<span style="color:#888;font-size:0.95rem;"> (by ${q.answerer} on ${new Date(q.answered_at).toLocaleDateString()})</span></div>
        ` : '<div style="color:#888;font-style:italic;margin-top:0.7rem;">No answer yet</div>'}
      </div>
    `).join('')}
  `;
  const askQuestionBtn = document.getElementById('askQuestionBtn');
  if (askQuestionBtn) askQuestionBtn.onclick = showQuestionForm;
}

function showQuestionForm() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to ask a question.');
    return;
  }
  const section = document.getElementById('qaSection');
  const form = document.createElement('div');
  form.innerHTML = `
    <h3>Ask a Question</h3>
    <form id="questionForm" style="margin-top: 1rem;">
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem;">Your Question:</label>
        <textarea name="question" required style="width: 100%; padding: 0.5rem; background: #151e2e; color: #e6eaf3; border: 1px solid #2ee6a8; border-radius: 4px; min-height: 100px;"></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Submit Question</button>
      <button type="button" class="btn" onclick="document.getElementById('questionForm').remove()" style="margin-left: 1rem; background: #ff5c8d;">Cancel</button>
    </form>
  `;
  section.insertBefore(form, section.firstChild);
  document.getElementById('questionForm').onsubmit = submitQuestion;
}

async function submitQuestion(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to submit a question.');
    return;
  }
  const form = e.target;
  const question = form.question.value;
  try {
    const res = await fetch(`${window.API_BASE_URL}/products/${getProductIdFromUrl()}/qa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    if (data.success) {
      alert('Question submitted successfully!');
      form.remove();
      // Refresh Q&A
      const qa = await fetchQA(getProductIdFromUrl());
      renderQA(qa);
    } else {
      alert(data.message || 'Failed to submit question');
    }
  } catch (err) {
    alert('Failed to submit question. Please try again.');
  }
}

function renderVariants(variants) {
  const section = document.getElementById('variantsSection');
  if (!variants.length) {
    section.innerHTML = '';
    return;
  }

  section.innerHTML = `
    <h3>Available Options</h3>
    <div class="variants-grid">
      ${variants.map(v => `
        <div class="variant-card">
          <div class="variant-options">
            ${v.options.split(',').map((opt, i) => `
              <div>
                <strong>${opt}:</strong> ${v.values.split(',')[i]}
              </div>
            `).join('')}
          </div>
          <div class="variant-price">
            $${Number(v.price).toFixed(2)}
          </div>
          <div class="variant-stock ${v.stock > 0 ? 'in-stock' : 'out-of-stock'}">
            ${v.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderSpecs(specs) {
  const section = document.getElementById('specsSection');
  if (!section) return;
  if (Object.keys(specs).length === 0) {
    section.innerHTML = '';
    return;
  }

  section.innerHTML = `
    <h3>Product Specifications</h3>
    <div class="specs-grid">
      ${Object.entries(specs).map(([category, items]) => `
        <div class="spec-category">
          <h4>${category}</h4>
          ${items.map(spec => `
            <div>
              <strong>${spec.name}:</strong>
              <span>${spec.value}</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

async function toggleWishlist(productId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to add to wishlist.');
    return;
  }

  const isInWishlist = document.getElementById('wishlistBtn').classList.contains('active');
  const method = isInWishlist ? 'DELETE' : 'POST';
  
  try {
    const res = await fetch(`${window.API_BASE_URL}/products/${productId}/wishlist`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('wishlistBtn').classList.toggle('active');
      alert(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Failed to update wishlist');
  }
}

function renderRelated(products) {
  const section = document.getElementById('relatedProducts');
  if (!section) return;
  if (!products.length) {
    section.innerHTML = '';
    return;
  }
  section.innerHTML = `
    <h3>Related Products</h3>
    <div class="related-grid">
      ${products.map(p => {
        let imageUrl = '';
        if (p.image) {
          imageUrl = p.image.startsWith('http') ? p.image : window.BASE_API_URL + p.image;
        } else if (p.images && p.images.length && p.images[0].url) {
          imageUrl = p.images[0].url.startsWith('http') ? p.images[0].url : window.BASE_API_URL + p.images[0].url;
        } else {
          imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png';
        }
        return `
          <div class="related-card">
            <a href="product.html?id=${p.id}">
              <img src="${imageUrl}" alt="${p.name}" onerror="this.onerror=null;this.src='https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png'">
              <h4>${p.name}</h4>
              <div class="product-price">$${Number(p.price).toFixed(2)}</div>
              <span>View Details</span>
            </a>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Fetch and render related products
async function fetchRelatedProducts(productId) {
    try {
        const res = await fetch(`${window.API_BASE_URL}/products/${productId}/related`);
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
            renderRelatedProducts(data.products);
        }
    } catch (err) {
        renderRelatedProducts([]);
    }
}

function renderRelatedProducts(products) {
    const container = document.getElementById('relatedProductsContainer');
    if (!container) return;
    if (!products.length) {
        container.innerHTML = '<p>No related products found.</p>';
        return;
    }
    container.innerHTML = products.map(product => {
        const imageUrl = product.primary_image
            ? (product.primary_image.startsWith('http') ? product.primary_image : window.BASE_API_URL + product.primary_image)
            : 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png';
        return `
            <div class="related-product-card">
                <img src="${imageUrl}" alt="${product.name}" class="related-product-img">
                <div class="related-product-title">${product.name}</div>
                <div class="related-product-price">$${Number(product.price).toFixed(2)}</div>
                <a href="product.html?id=${product.id}" class="related-product-link">View Details</a>
            </div>
        `;
    }).join('');
}

(async function() {
  const productId = getProductIdFromUrl();
  if (!productId) {
    document.body.insertAdjacentHTML('afterbegin', `<div class="alert alert-warning" style="background:#fff3cd;color:#856404;padding:0.7em 1em;border-radius:6px;font-size:1.05em;text-align:center;margin:3em auto;max-width:400px;">Product not found.</div>`);
    return;
  }
  try {
    const data = await fetchProduct(productId);
    renderGallery(data.images || [], data.image);
    renderInfo(data);
    
    // Reviews
    const reviews = await fetchReviews(productId);
    renderReviews(reviews);
    
    // Q&A
    const qa = await fetchQA(productId);
    renderQA(qa);
    
    // Variants
    const variants = await fetchVariants(productId);
    renderVariants(variants);
    
    // Specifications
    const specs = await fetchSpecs(productId);
    renderSpecs(specs);
    
    // Related products (new logic only)
    await fetchRelatedProducts(productId);
  } catch (err) {
    document.body.insertAdjacentHTML('afterbegin', `<div class="alert alert-warning" style="background:#fff3cd;color:#856404;padding:0.7em 1em;border-radius:6px;font-size:1.05em;text-align:center;margin:3em auto;max-width:400px;">${err.message}</div>`);
  }
})(); 