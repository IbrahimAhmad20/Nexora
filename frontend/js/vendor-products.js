// Vendor Products JavaScript

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const productTableBody = document.getElementById('productTableBody');
    const productSearch = document.querySelector('.product-search');
    const categoryFilter = document.querySelector('.category-filter');
    const pagination = document.querySelector('.pagination');
    const addProductBtn = document.querySelector('.add-product-btn');
    const productModal = document.getElementById('productModal');
    const deleteModal = document.getElementById('deleteModal');
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    const productImage = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const galleryModal = document.getElementById('galleryModal');
    const galleryImage = document.getElementById('galleryImage');
    const closeGallery = document.getElementById('closeGallery');
    const prevImage = document.getElementById('prevImage');
    const nextImage = document.getElementById('nextImage');
    const productCategorySelect = document.getElementById('productCategory');

    // State
    let currentPage = 1;
    let totalPages = 1;
    let products = [];
    let currentProductId = null;
    let currentImageFile = null;
    let currentGalleryImages = [];
    let currentGalleryIndex = 0;
    let categories = [];

    // --- Fetch Categories ---
    async function fetchCategories() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${window.API_BASE_URL}/api/admin/categories`, {
                 headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to fetch categories:', response.status, errorData.message);
                throw new Error(errorData.message || 'Failed to fetch categories');
            }

            const data = await response.json();
            categories = data.categories || [];
            populateCategoryDropdown();

        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    // --- Populate Category Dropdown ---
    function populateCategoryDropdown() {
        if (!productCategorySelect) return;

        productCategorySelect.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select Category';
        productCategorySelect.appendChild(defaultOption);

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            productCategorySelect.appendChild(option);
        });
    }

    // Image Preview
    productImage.addEventListener('change', (e) => {
        const files = e.target.files;
        imagePreview.style.display = 'block';
        imagePreview.innerHTML = '';
        
        for (let i = 0; i < files.length; i++) {
            if (i >= 5) break; // Maximum 5 images
            
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-image" onclick="removeImage(${i})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                imagePreview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
    });

    // Modal Functions
    function showModal(modal) {
        modal.classList.add('active');
    }

    function hideModal(modal) {
        modal.classList.remove('active');
        if (modal === productModal) {
            resetForm();
        }
    }

    function resetForm() {
        productForm.reset();
        document.getElementById('productId').value = '';
        modalTitle.textContent = 'Add Product';
        imagePreview.style.display = 'none';
        imagePreview.innerHTML = '';
        currentImageFile = null;
    }

    // Fetch products from the backend
    async function fetchProducts(page = 1, search = '', category = '') {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'index.html';
                return;
            }

            const response = await fetch(`${window.API_BASE_URL}/api/vendor/products?page=${page}&search=${search}&category=${category}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            products = data.products;
            totalPages = data.totalPages;
            renderProducts();
            renderPagination();
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Error loading products. Please try again.');
        }
    }

    // Render products in the table
    function renderProducts() {
        productTableBody.innerHTML = '';
        products.forEach((product, idx) => {
            const primaryImage = product.images?.find(img => img.is_primary)?.url || product.images?.[0]?.url || 'https://via.placeholder.com/60';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="product-cell">
                        <img src="${primaryImage}" alt="${product.name}" class="product-thumbnail" data-idx="${idx}">
                        <span>${product.name}</span>
                    </div>
                </td>
                <td>${product.category || product.category_name || 'Uncategorized'}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.stock}</td>
                <td><span class="status-tag ${product.status.toLowerCase()}">${product.status}</span></td>
                <td>
                    <button class="action-btn edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${product.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            productTableBody.appendChild(row);
        });

        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editProduct(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => showDeleteConfirmation(btn.dataset.id));
        });

        // Add event listeners to product images for gallery
        document.querySelectorAll('.product-thumbnail').forEach(img => {
            img.addEventListener('click', function() {
                const idx = this.getAttribute('data-idx');
                openGallery(products[idx].images, 0);
            });
        });
    }

    // Render pagination buttons
    function renderPagination() {
        pagination.innerHTML = '';
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                fetchProducts(currentPage, productSearch.value, categoryFilter.value);
            }
        };
        pagination.appendChild(prevBtn);

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => {
                currentPage = i;
                fetchProducts(currentPage, productSearch.value, categoryFilter.value);
            };
            pagination.appendChild(pageBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                fetchProducts(currentPage, productSearch.value, categoryFilter.value);
            }
        };
        pagination.appendChild(nextBtn);
    }

    // Product CRUD Operations
    async function addProduct(productData) {
        try {
            const token = localStorage.getItem('token');
            
            // Create FormData object for multipart/form-data
            const formData = new FormData();
            formData.append('name', productData.name);
            formData.append('category_id', productCategorySelect.value);
            formData.append('price', productData.price);
            formData.append('stock_quantity', productData.stock);
            formData.append('status', productData.status);
            formData.append('description', productData.description);
            
            const files = productImage.files;
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }
           
            const variants = collectVariants();
            formData.append('variants', JSON.stringify(variants));
            
            const response = await fetch(`${window.API_BASE_URL}/api/vendor/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add product');
            }

            fetchProducts(currentPage, productSearch.value, categoryFilter.value);
            hideModal(productModal);
            alert('Product added successfully!');
        } catch (error) {
            console.error('Error adding product:', error);
            alert(error.message || 'Error adding product. Please try again.');
        }
    }

    async function updateProduct(productId, productData) {
        try {
            const token = localStorage.getItem('token');
            
            // Create FormData object for multipart/form-data
            const formData = new FormData();
            formData.append('name', productData.name);
            formData.append('category_id', productCategorySelect.value);
            formData.append('price', productData.price);
            formData.append('stock_quantity', productData.stock);
            formData.append('status', productData.status);
            formData.append('description', productData.description);
            
            const files = productImage.files;
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }

            const variants = collectVariants();
            formData.append('variants', JSON.stringify(variants));

            const response = await fetch(`${window.API_BASE_URL}/api/vendor/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update product');
            }

            fetchProducts(currentPage, productSearch.value, categoryFilter.value);
            hideModal(productModal);
            alert('Product updated successfully!');
        } catch (error) {
            console.error('Error updating product:', error);
            alert(error.message || 'Error updating product. Please try again.');
        }
    }

    async function deleteProduct(productId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${window.API_BASE_URL}/api/vendor/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                alert('Product deleted successfully!');
                fetchProducts(currentPage, productSearch.value, categoryFilter.value);
                hideModal(deleteModal);
            } else {
                alert('Failed to delete product. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product. Please try again.');
        }
    }

    async function editProduct(productId) {
        const product = products.find(p => p.id == productId);
        if (!product) return;
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productStatus').value = product.status;
        document.getElementById('productDescription').value = product.description;
        // Set category
        productCategorySelect.value = product.category_id || product.category || '';
        modalTitle.textContent = 'Edit Product';
        showModal(productModal);
    }

    function showDeleteConfirmation(productId) {
        currentProductId = productId;
        showModal(deleteModal);
    }

    // Add Product button opens the modal
    addProductBtn.addEventListener('click', () => {
        resetForm();
        showModal(productModal);
    });

    // Initial load
    fetchProducts();
    fetchCategories();

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productData = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            status: document.getElementById('productStatus').value,
            description: document.getElementById('productDescription').value,
            // Add more fields as needed
        };
        if (document.getElementById('productId').value) {
            await updateProduct(document.getElementById('productId').value, productData);
        } else {
            await addProduct(productData);
        }
    });

    document.querySelector('#deleteModal .delete-btn').addEventListener('click', () => {
        if (currentProductId) {
            deleteProduct(currentProductId);
        }
    });

    document.querySelectorAll('#deleteModal .cancel-btn, #deleteModal .close-modal').forEach(btn => {
        btn.addEventListener('click', () => hideModal(deleteModal));
    });

    // Close product modal on cancel or X
    document.querySelectorAll('#productModal .cancel-btn, #productModal .close-modal').forEach(btn => {
        btn.addEventListener('click', () => hideModal(productModal));
    });

    function collectVariants() {
        return [];
    }
});