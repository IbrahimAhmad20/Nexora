document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = 'index.html';

    const tableBody = document.getElementById('ordersTableBody');
    const modal = document.getElementById('orderDetailsModal');
    const orderDetailsDiv = document.getElementById('orderDetails');
    const closeModal = document.getElementById('closeOrderModal');
    const orderSearch = document.getElementById('orderSearch');
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    const paginationDiv = document.getElementById('ordersPagination');
    let orders = [];
    let currentPage = 1;
    let totalPages = 1;
    let pageSize = 10;
    let currentSearch = '';
    let currentStatus = '';
    let editOrderId = null;

    function renderOrders() {
        let filtered = orders;
        totalPages = Math.max(1, totalPages);
        const start = 0;
        const pageOrders = filtered.slice(start, start + pageSize);
        if (pageOrders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#aaa;">No orders found.</td></tr>';
        } else {
            tableBody.innerHTML = pageOrders.map(order => `
                <tr>
                    <td>#ORD-${order.id}</td>
                    <td><span class="customer-avatar">${(order.first_name[0] || '') + (order.last_name ? order.last_name[0] : '')}</span> ${order.first_name} ${order.last_name || ''}</td>
                    <td>${new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>$${Number(order.total_amount).toFixed(2)}</td>
                    <td><span class="status-badge ${order.status}">${capitalize(order.status)}</span></td>
                    <td>
                        <button class="action-btn view-btn" data-id="${order.id}" title="View"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-id="${order.id}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${order.id}" title="Delete"><i class="fas fa-times"></i></button>
                    </td>
                </tr>
            `).join('');
        }
        renderPagination();
    }

    function renderPagination() {
        paginationDiv.innerHTML = '';
        if (totalPages <= 1) return;
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
            btn.textContent = i;
            btn.onclick = () => { currentPage = i; fetchOrders(); };
            paginationDiv.appendChild(btn);
        }
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    async function fetchOrders() {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        if (currentSearch) params.append('search', currentSearch);
        if (currentStatus) params.append('status', currentStatus);
        const res = await fetch(`${window.API_BASE_URL}/api/vendor/orders?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            orders = data.data;
            totalPages = data.totalPages || 1;
            renderOrders();
        }
    }

    function openEditModal(order) {
        editOrderId = order.id;
        orderDetailsDiv.innerHTML = `
            <h3>Edit Order #${order.id}</h3>
            <label>Shipping Address:<br>
                <input type="text" id="editShippingAddress" value="${order.shipping_address || ''}" style="width:100%;padding:0.5em;margin:0.5em 0;">
            </label>
            <button id="saveEditOrderBtn">Save</button>
        `;
        modal.style.display = 'block';
        document.getElementById('saveEditOrderBtn').onclick = async () => {
            const newAddress = document.getElementById('editShippingAddress').value.trim();
            if (!newAddress) return alert('Shipping address is required.');
            await fetch(`${window.API_BASE_URL}/api/vendor/orders/${editOrderId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ shipping_address: newAddress })
            });
            modal.style.display = 'none';
            fetchOrders();
        };
    }

    tableBody.addEventListener('click', async e => {
        if (e.target.closest('.view-btn')) {
            const orderId = e.target.closest('.view-btn').dataset.id;
            const res = await fetch(`${window.API_BASE_URL}/api/vendor/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const o = data.data;
                orderDetailsDiv.innerHTML = `
                    <h3>Order #${o.id}</h3>
                    <p>Status: ${o.status}</p>
                    <p>Customer: ${o.first_name} ${o.last_name} (${o.email})</p>
                    <p>Shipping Address: ${o.shipping_address}</p>
                    <p>Items:</p>
                    <ul>
                        ${o.items.map(item => `<li>${item.name} x${item.quantity} - $${item.price_at_time}</li>`).join('')}
                    </ul>
                    <label>Update Status:
                        <select id="orderStatus">
                            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="canceled" ${o.status === 'canceled' ? 'selected' : ''}>Canceled</option>
                        </select>
                        <button id="updateStatusBtn">Update</button>
                    </label>
                `;
                modal.style.display = 'block';
                document.getElementById('updateStatusBtn').onclick = async () => {
                    const newStatus = document.getElementById('orderStatus').value;
                    await fetch(`${window.API_BASE_URL}/api/vendor/orders/${orderId}/status`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: newStatus })
                    });
                    modal.style.display = 'none';
                    fetchOrders();
                };
            }
        } else if (e.target.closest('.edit-btn')) {
            const orderId = e.target.closest('.edit-btn').dataset.id;
            const res = await fetch(`${window.API_BASE_URL}/api/vendor/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                openEditModal(data.data);
            }
        } else if (e.target.closest('.delete-btn')) {
            const orderId = e.target.closest('.delete-btn').dataset.id;
            if (confirm('Are you sure you want to cancel this order?')) {
                await fetch(`${window.API_BASE_URL}/api/vendor/orders/${orderId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchOrders();
            }
        }
    });

    closeModal.onclick = () => { modal.style.display = 'none'; };
    orderSearch.oninput = () => {
        currentSearch = orderSearch.value.trim();
        currentPage = 1;
        fetchOrders();
    };
    orderStatusFilter.onchange = () => {
        currentStatus = orderStatusFilter.value;
        currentPage = 1;
        fetchOrders();
    };

    // Export Orders button
    document.querySelector('.export-btn').onclick = async () => {
        const params = new URLSearchParams();
        if (currentSearch) params.append('search', currentSearch);
        if (currentStatus) params.append('status', currentStatus);
        const res = await fetch(`${window.API_BASE_URL}/api/vendor/orders/export?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            alert('Failed to export orders.');
            return;
        }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    fetchOrders();
});
