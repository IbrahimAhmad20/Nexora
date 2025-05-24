function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchProduct(id) {
  try {
    const res = await fetch(`${window.API_BASE_URL}/api/products/${id}`);
    if (!res.ok) throw new Error('Product not found or unavailable.');
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (err) {
    throw new Error('Product not found or unavailable.');
  }
}

async function fetchReviews(productId) {
  const res = await fetch(`${window.API_BASE_URL}/api/products/${productId}/reviews`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.success ? data.reviews : [];
}

async function fetchRelatedProducts(productId) {
  try {
    const res = await fetch(`${window.API_BASE_URL}/api/products/${productId}/related`);
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

async function fetchQA(productId) {
  const res = await fetch(`${window.API_BASE_URL}/api/products/${productId}/qa`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.success ? data.qa : [];
}

async function fetchVariants(productId) {
  const res = await fetch(`${window.API_BASE_URL}/api/products/${productId}/variants`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.success ? data.variants : [];
}

async function fetchSpecs(productId) {
  const res = await fetch(`${window.API_BASE_URL}/api/products/${productId}/specs`);
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
    <div class="product-category">Category: ${product.category}</div>
    ${product.vendor?.name ? `<div class="product-vendor">By: ${product.vendor.name}</div>` : ''}
    <div class="product-description">${product.description || 'No description available.'}</div>
  `;
}

function renderPurchaseOptions(product) {
    const purchaseSection = document.getElementById('productPurchase');
    if (!purchaseSection) return;

    purchaseSection.innerHTML = `
        <div class="product-purchase">
            <div class="price">$${Number(product.price).toFixed(2)}</div>
            ${product.shipping_info ? `<div class="shipping-info">${product.shipping_info}</div>` : ''} <!-- Assuming product data includes shipping_info -->
            ${product.delivery_info ? `<div class="delivery-info">${product.delivery_info}</div>` : ''} <!-- Assuming product data includes delivery_info -->
            ${product.location ? `<div class="location"><i class="fas fa-map-marker-alt"></i> ${product.location}</div>` : ''} <!-- Assuming product data includes location -->
            
            <div class="stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
              ${product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </div>

            <div class="quantity-selector">
                <label for="product-qty">Quantity:</label>
                <select id="product-qty">
                    ${Array.from({ length: product.stock > 0 ? Math.min(product.stock, 10) : 1 }, (_, i) => i + 1).map(qty => `<option value="${qty}">${qty}</option>`).join('')}
                </select>
            </div>

            <div class="action-buttons">
                <button class="btn-primary" id="addToCartBtn" ${product.stock === 0 ? 'disabled' : ''}>Add to Cart</button>
                <button class="btn" id="buyNowBtn" ${product.stock === 0 ? 'disabled' : ''}>Buy Now</button>
            </div>

            ${product.payment_info ? `<div class="payment-info">${product.payment_info}</div>` : ''} <!-- Assuming product data includes payment_info -->
            ${product.returns_info ? `<div class="returns-info">${product.returns_info}</div>` : ''} <!-- Assuming product data includes returns_info -->
            ${product.ships_from_info ? `<div class="ships-from-info">${product.ships_from_info}</div>` : ''} <!-- Assuming product data includes ships_from_info -->
            ${product.see_more_link ? `<div class="see-more">${product.see_more_link}</div>` : ''} <!-- Assuming product data includes see_more_link -->
            
            <div class="gift-receipt">
                 <input type="checkbox" id="gift-receipt">
                 <label for="gift-receipt">Add a gift receipt for easy returns</label>
            </div>

            <button class="btn add-to-list-btn" id="addToListBtn">Add to List</button>
        </div>
    `;

    // Add event listener for Add to Cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.onclick = () => {
            const quantity = parseInt(document.getElementById('product-qty').value);
            addToCart(product.id, quantity);
        };
    }

    // Add event listener for Buy Now button
    const buyNowBtn = document.getElementById('buyNowBtn');
    if (buyNowBtn) {
        buyNowBtn.onclick = async () => {
            const quantity = parseInt(document.getElementById('product-qty').value);
            const productId = getProductIdFromUrl();
            if (productId && window.cartManager) {
                // Add item to cart
                await window.cartManager.addItem(productId, quantity);
                // Redirect to checkout page
                window.location.href = 'checkout.html';
            } else {
                console.error('Could not buy now: productId not found or cartManager not initialized.');
                alert('Error processing order. Please try again later.');
            }
        };
    }

    // Add event listener for Add to List button
     const addToListBtn = document.getElementById('addToListBtn');
     if (addToListBtn) {
         addToListBtn.onclick = () => {
             const productId = getProductIdFromUrl();
             if (productId && window.wishlistManager) {
                 window.wishlistManager.toggleWishlist(productId, addToListBtn);
             } else {
                 console.error('Could not toggle wishlist: productId not found or wishlistManager not initialized.');
                 alert('Error updating wishlist. Please try again later.');
             }
         };
     }
}

async function addToCart(productId, quantity) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to add to cart.');
        return;
    }

    // Use the global cartManager to add the item
    if (window.cartManager) {
        window.cartManager.addItem(productId, quantity);
    } else {
        console.error('cartManager is not initialized.');
        alert('Error adding to cart. Please try again later.');
    }
}

function renderReviews(reviews) {
  const section = document.getElementById('reviewsSection');
  if (!section) return;
  if (!reviews.length) {
    section.innerHTML = `
      <h3>Reviews</h3>
      <p class="no-reviews-message">No reviews yet.</p>
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
      <div class="review">
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
    <form id="reviewForm" class="review-form-container">
      <div>
        <label>Rating:</label>
        <select name="rating" required>
          <option value="">Select rating</option>
          <option value="5">★★★★★ Excellent</option>
          <option value="4">★★★★☆ Very Good</option>
          <option value="3">★★★☆☆ Good</option>
          <option value="2">★★☆☆☆ Fair</option>
          <option value="1">★☆☆☆☆ Poor</option>
        </select>
      </div>
      <div>
        <label>Your Review:</label>
        <textarea name="text" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Submit Review</button>
      <button type="button" class="btn" onclick="document.getElementById('reviewForm').remove()">Cancel</button>
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
    const res = await fetch(`${window.API_BASE_URL}/api/products/${getProductIdFromUrl()}/reviews`, {
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
      <p class="no-questions-message">No questions yet.</p>
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
      <div class="qa-item">
        <div class="question">Q: ${q.question}</div>
        <div class="qa-meta">Asked by ${q.asker} on ${new Date(q.created_at).toLocaleDateString()}</div>
        ${q.answer ? `
          <div class="answer">A: ${q.answer}<span class="qa-meta"> (by ${q.answerer} on ${new Date(q.answered_at).toLocaleDateString()})</span></div>
        ` : '<div class="no-answer">No answer yet</div>'}
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
    <form id="questionForm" class="question-form-container">
      <div>
        <label>Your Question:</label>
        <textarea name="question" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Submit Question</button>
      <button type="button" class="btn" onclick="document.getElementById('questionForm').remove()">Cancel</button>
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
    const res = await fetch(`${window.API_BASE_URL}/api/products/${getProductIdFromUrl()}/qa`, {
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
    const res = await fetch(`${window.API_BASE_URL}/api/products/${productId}/wishlist`, {
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

(async function() {
  const productId = getProductIdFromUrl();
  if (!productId) {
    document.body.insertAdjacentHTML('afterbegin', '<div class="alert alert-warning product-not-found-message">Product not found.</div>');
    return;
  }
  try {
    const data = await fetchProduct(productId);
    renderGallery(data.images || [], data.primary_image || data.image);
    renderInfo(data);
    renderPurchaseOptions(data);
    
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
    
    // Related products
    await fetchRelatedProducts(productId);
  } catch (err) {
    document.body.insertAdjacentHTML('afterbegin', `<div class="alert alert-warning product-fetch-error-message">${err.message}</div>`);
  }
})(); 