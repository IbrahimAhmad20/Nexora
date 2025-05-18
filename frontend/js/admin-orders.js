document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    document.querySelector('.order-search').addEventListener('input', function() {
        filterOrders(this.value);
    });
});

let allOrders = [];

async function loadOrders() {
    const token = localStorage.getItem('token');
    const res = await fetch(window.API_BASE_URL + '/api/admin/orders', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    allOrders = data.orders || [];
    renderOrders(allOrders);
}

function renderOrders(orders) {
    const tbody = document.getElementById('orderTableBody');
    tbody.innerHTML = '';
    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer_email} (${order.first_name} ${order.last_name})</td>
            <td>${order.total_amount || order.total || ''}</td>
            <td>
                <select onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>${new Date(order.created_at).toLocaleString()}</td>
            <td>
                <button onclick="viewOrder(${order.id})">View</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterOrders(query) {
    query = query.trim().toLowerCase();
    if (!query) {
        renderOrders(allOrders);
        return;
    }
    const filtered = allOrders.filter(order =>
        (order.customer_email && order.customer_email.toLowerCase().includes(query)) ||
        (order.id && order.id.toString().includes(query))
    );
    renderOrders(filtered);
}

window.updateOrderStatus = async function(orderId, status) {
    const token = localStorage.getItem('token');
    const res = await fetch(window.API_BASE_URL + '/api/admin/orders/' + orderId + '/status', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ status })
    });
    const result = await res.json();
    if (result.success) {
        alert('Order status updated!');
        await loadOrders();
    } else {
        alert('Failed to update order status: ' + result.message);
    }
};

window.viewOrder = async function(orderId) {
    const token = localStorage.getItem('token');
    const res = await fetch(window.API_BASE_URL + '/api/admin/orders/' + orderId, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (data.success) {
        showOrderModal(data.order);
    } else {
        alert('Failed to fetch order details: ' + data.message);
    }
};

function showOrderModal(order) {
    const modal = document.getElementById('orderModal');
    const body = document.getElementById('orderModalBody');
    body.innerHTML = `
        <strong>Order ID:</strong> ${order.id}<br>
        <strong>Customer ID:</strong> ${order.customer_id}<br>
        <strong>Total Amount:</strong> $${order.total_amount}<br>
        <strong>Status:</strong> ${order.status}<br>
        <strong>Shipping Address:</strong> ${order.shipping_address}<br>
        <strong>Payment Method:</strong> ${order.payment_method}<br>
        <strong>Payment Status:</strong> ${order.payment_status}<br>
        <strong>Created At:</strong> ${new Date(order.created_at).toLocaleString()}<br>
        <strong>Updated At:</strong> ${new Date(order.updated_at).toLocaleString()}<br>
    `;
    modal.style.display = 'block';
}

document.getElementById('closeOrderModal').onclick = function() {
    document.getElementById('orderModal').style.display = 'none';
};
window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};
