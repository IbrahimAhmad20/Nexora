document.addEventListener('DOMContentLoaded', () => {
    console.log('[admin-users] DOMContentLoaded');
    loadUsers();
    // Optionally, add search/filter logic here
});

async function loadUsers() {
    try {
        console.log('[admin-users] loadUsers called');
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        console.log('[admin-users] token:', token);
        console.log('[admin-users] user:', user);
        const res = await api.getAllUsers();
        console.log('[admin-users] API response:', res);
        const users = res.users || res.data; // depends on backend response
        renderUserTable(users);
    } catch (err) {
        console.error('[admin-users] Failed to load users:', err);
        alert('Failed to load users');
    }
}

function renderUserTable(users) {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.email}</td>
            <td>${user.first_name || ''} ${user.last_name || ''}</td>
            <td>${user.role}</td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
                <button class="action-btn" onclick="editUser(${user.id})">Edit</button>
                <button class="action-btn delete" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteUser = async function(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
        console.log('[admin-users] Deleting user:', userId);
        await api.deleteUser(userId);
        loadUsers();
    } catch (err) {
        console.error('[admin-users] Failed to delete user:', err);
        alert('Failed to delete user');
    }
};

window.editUser = function(userId) {
    // Show modal or inline form for editing user (role, name, etc.)
    alert('Edit user ' + userId);
}; 