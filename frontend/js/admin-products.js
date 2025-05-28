document.addEventListener('DOMContentLoaded', () => {
    console.log('[admin-products] DOMContentLoaded');
    // Fetch categories and products concurrently
    fetchCategoriesMap().then(() => {
        loadProducts();
    });
    
    document.querySelector('.add-product-btn').onclick = openAddProductModal;
    document.querySelectorAll('.product-search').forEach(input => {
        input.addEventListener('input', function() {
            filterProducts(this.value);
        });
    });
    document.querySelector('#productTable').addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            const productId = e.target.getAttribute('data-id');
            const product = allProducts.find(p => p.id == productId);
            openEditProductModal(product);
        }
        if (e.target.classList.contains('delete-btn')) {
            const productId = e.target.getAttribute('data-id');
            deleteProduct(productId);
        }
    });
});

let allProducts = [];
let categoriesMap = new Map(); // Map to store categories by ID

// Function to fetch categories and build the categoriesMap
async function fetchCategoriesMap() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(window.API_BASE_URL + '/api/admin/categories', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const data = await res.json();
        categoriesMap.clear();
        if (data.categories && data.categories.length) {
            data.categories.forEach(cat => {
                categoriesMap.set(cat.id, cat.name);
            });
        }
        console.log('[admin-products] Categories Map built:', categoriesMap);
    } catch (error) {
        console.error('Failed to fetch categories map:', error);
         // Optionally display an error to the user or in the table
    }
}

async function loadProducts() {
    try {
        const res = await fetch(`${window.API_BASE_URL}/api/admin/products`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await res.json();
        if (data.success) {
            const products = data.products.map(p => ({
                ...p,
                image: p.image
                    ? (p.image.startsWith('http') ? p.image : `${window.API_BASE_URL}${p.image}`)
                    : null
            }));
            allProducts = products;
            renderProducts(allProducts);
        }
    } catch (err) {
        alert('Failed to load products');
        console.error(err);
    }
}

function renderProducts(products) {
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';
    products
        .filter(product => product.status !== 'deleted')
        .forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.vendor_name || ''}</td>
                <td>${product.category || 'Uncategorized'}</td>
                <td>${product.price}</td>
                <td>${product.stock}</td>
                <td>${product.status}</td>
                <td><input type="checkbox" class="featured-toggle" data-id="${product.id}" ${product.featured ? 'checked' : ''}></td>
                <td>${product.created_at ? new Date(product.created_at).toLocaleString() : ''}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${product.id}">Edit</button>
                    <button class="action-btn delete delete-btn" data-id="${product.id}">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    // Add event listeners for featured toggles
    document.querySelectorAll('.featured-toggle').forEach(toggle => {
        toggle.addEventListener('change', async function() {
            const productId = this.getAttribute('data-id');
            const featured = this.checked ? 1 : 0;
            const token = localStorage.getItem('token');
            const res = await fetch(window.API_BASE_URL + '/api/admin/products/' + productId + '/featured', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ featured })
            });
            const data = await res.json();
            if (!data.success) {
                alert(data.message || 'Failed to update featured status');
            }
            await loadProducts(); // Reload products after update
        });
    });
}

function filterProducts(query) {
    query = query.trim().toLowerCase();
    if (!query) {
        renderProducts(allProducts);
        return;
    }
    const filtered = allProducts.filter(product => {
        // Look up category name for filtering, default to empty string if not found
        const categoryName = categoriesMap.get(product.category_id) || ''; 
        return (
            (product.name && product.name.toLowerCase().includes(query)) ||
            (product.vendor_name && product.vendor_name.toLowerCase().includes(query)) ||
            (categoryName.toLowerCase().includes(query))
        );
    });
    renderProducts(filtered);
}

function openAddProductModal() {
    alert('Add Product modal coming soon!');
}

// Open modal and populate with product data
function openEditProductModal(product) {
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductDescription').value = product.description || '';
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductStock').value = product.stock;
    document.getElementById('editProductStatus').value = product.status;
    
    // Load categories into dropdown for the modal
    loadCategories('editProductCategory', product.category_id); // Keep existing modal function call
  
    document.getElementById('editProductModal').style.display = 'flex';
  }
  
// Load categories into dropdown (existing function, kept for edit modal)
function loadCategories(selectElementId, selectedId) {
    const token = localStorage.getItem('token');
    fetch(window.API_BASE_URL + '/api/admin/categories', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => res.json())
      .then(data => {
        const select = document.getElementById(selectElementId);
        select.innerHTML = '';
        if (data.categories && data.categories.length) {
          data.categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            if (cat.id == selectedId) opt.selected = true;
            select.appendChild(opt);
          });
        } else {
          const opt = document.createElement('option');
          opt.value = '';
          opt.textContent = 'No categories found';
          select.appendChild(opt);
        }
      })
      .catch(error => {
        console.error('Failed to load categories for modal:', error);
         const select = document.getElementById(selectElementId);
         select.innerHTML = '';
         const opt = document.createElement('option');
         opt.value = '';
         opt.textContent = 'Error loading categories';
         select.appendChild(opt);
      });
  }
  
  // Close modal
  document.getElementById('closeEditModal').onclick = function() {
    document.getElementById('editProductModal').style.display = 'none';
  };
  
  // Handle form submit
  document.getElementById('editProductForm').onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('editProductId').value;
    const data = {
      name: document.getElementById('editProductName').value,
      description: document.getElementById('editProductDescription').value,
      price: parseFloat(document.getElementById('editProductPrice').value),
      stock_quantity: parseInt(document.getElementById('editProductStock').value),
      status: document.getElementById('editProductStatus').value,
      category_id: parseInt(document.getElementById('editProductCategory').value)
    };
    const res = await fetch(window.API_BASE_URL + '/api/admin/products/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      alert('Product updated!');
      document.getElementById('editProductModal').style.display = 'none';
      await loadProducts(); // Reload products after update
    } else {
      alert('Failed to update product: ' + result.message);
    }
  };
  
  // Example: Attach to edit buttons in your product table (likely handled by event delegation now)
  // window.editProduct = function(productId) { /* ... */ };

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(window.API_BASE_URL + '/api/admin/products/' + productId, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const result = await res.json();
        if (result.success) {
            alert('Product deleted!');
            await loadProducts(); // Reload products after deletion
        } else {
            alert('Failed to delete product: ' + result.message);
            console.error(result.message);
        }
    } catch (error) {
        alert('Failed to delete product');
        console.error(error);
    }
}

// Add this function if you need to access product data easily by ID
/*
function getProductById(productId) {
    return allProducts.find(p => p.id == productId);
}
*/

// Keep this function if it's called elsewhere, otherwise it can be removed
// window.editProduct = function(productId) { /* ... */ }; 