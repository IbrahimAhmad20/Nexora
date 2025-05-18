document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    document.querySelector('.category-search').addEventListener('input', function() {
        filterCategories(this.value);
    });
    document.getElementById('addCategoryBtn').onclick = () => openCategoryModal();
    document.getElementById('closeCategoryModal').onclick = closeCategoryModal;
    document.getElementById('categoryForm').onsubmit = saveCategory;
});

let allCategories = [];

async function loadCategories() {
    const token = localStorage.getItem('token');
    const res = await fetch(window.API_BASE_URL + '/api/admin/categories', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    allCategories = data.categories || data.data || [];
    renderCategories(allCategories);
}

function renderCategories(categories) {
    const tbody = document.getElementById('categoryTableBody');
    tbody.innerHTML = '';
    categories.forEach(cat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cat.id}</td>
            <td>${cat.name}</td>
            <td>
                <button class="edit-btn" onclick="openCategoryModal(${cat.id})"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteCategory(${cat.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterCategories(query) {
    query = query.trim().toLowerCase();
    if (!query) {
        renderCategories(allCategories);
        return;
    }
    const filtered = allCategories.filter(cat =>
        cat.name && cat.name.toLowerCase().includes(query)
    );
    renderCategories(filtered);
}

window.openCategoryModal = function(id) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    const nameInput = document.getElementById('categoryName');
    const idInput = document.getElementById('categoryId');
    if (id) {
        const cat = allCategories.find(c => c.id === id);
        if (!cat) return;
        title.textContent = 'Edit Category';
        nameInput.value = cat.name;
        idInput.value = cat.id;
    } else {
        title.textContent = 'Add Category';
        nameInput.value = '';
        idInput.value = '';
    }
    modal.style.display = 'block';
}

function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
}

async function saveCategory(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value.trim();
    if (!name) return alert('Name is required');
    let url = window.API_BASE_URL + '/api/admin/categories';
    let method = 'POST';
    let body = JSON.stringify({ name });
    if (id) {
        url += '/' + id;
        method = 'PUT';
    }
    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body
    });
    const data = await res.json();
    if (data.success) {
        closeCategoryModal();
        await loadCategories();
    } else {
        alert(data.message || 'Failed to save category');
    }
}

window.deleteCategory = async function(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(window.API_BASE_URL + '/api/admin/categories/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (data.success) {
        await loadCategories();
    } else {
        alert(data.message || 'Failed to delete category');
    }
}; 