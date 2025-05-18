document.addEventListener('DOMContentLoaded', () => {
    console.log('[admin-products] DOMContentLoaded');
    loadProducts();
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

async function loadProducts() {
    try {
        const res = await api.getAllProducts();
        const products = res.products || res.data;
        allProducts = products;
        renderProducts(products);
    } catch (err) {
        alert('Failed to load products');
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
                <td>${product.category || ''}</td>
                <td>${product.price}</td>
                <td>${product.stock_quantity}</td>
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
            await loadProducts();
        });
    });
}

function filterProducts(query) {
    query = query.trim().toLowerCase();
    if (!query) {
        renderProducts(allProducts);
        return;
    }
    const filtered = allProducts.filter(product =>
        (product.name && product.name.toLowerCase().includes(query)) ||
        (product.vendor_name && product.vendor_name.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query))
    );
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
    document.getElementById('editProductStock').value = product.stock_quantity;
    document.getElementById('editProductStatus').value = product.status;
    // Set category after categories are loaded
    loadCategories(product.category_id);
  
    document.getElementById('editProductModal').style.display = 'flex';
  }
  
  // Load categories into dropdown
  function loadCategories(selectedId) {
    // Get the token from localStorage (or wherever you store it)
    const token = localStorage.getItem('token');
    fetch(window.API_BASE_URL + '/api/admin/categories', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => res.json())
      .then(data => {
        const select = document.getElementById('editProductCategory');
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
      await loadProducts();
    } else {
      alert('Failed to update product: ' + result.message);
    }
  };
  
  // Example: Attach to edit buttons in your product table
  // document.querySelectorAll('.edit-btn').forEach(btn => {
  //   btn.onclick = function() {
  //     const product = ... // get product data for this row
  //     openEditProductModal(product);
  //   };
  // });
window.editProduct = function(productId) {
    alert('Edit product ' + productId);
};

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(window.API_BASE_URL + '/api/admin/products/' + productId, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    const result = await res.json();
    if (result.success) {
        alert('Product deleted!');
        await loadProducts();
    } else {
        alert('Failed to delete product: ' + result.message);
    }
} 