document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch(window.API_BASE_URL + '/api/vendor/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            alert('Failed to load dashboard data');
            return;
        }
        const data = await res.json();
        const dashboard = data.data || data; // fallback if not wrapped

        // Update stat cards
        document.getElementById('statProducts').textContent = dashboard.products;
        document.getElementById('statOrders').textContent = dashboard.orders;
        document.getElementById('statRevenue').textContent = `$${Number(dashboard.revenue).toLocaleString()}`;
        document.getElementById('statReviews').textContent = dashboard.averageRating ? `${dashboard.averageRating}/5` : 'N/A';

        // Update recent orders
        const ordersList = document.querySelector('.orders-list');
        if (dashboard.recentOrders && dashboard.recentOrders.length > 0) {
            ordersList.innerHTML = dashboard.recentOrders.map(order => `
                <li class="order-item">
                    <span class="order-status ${order.status ? order.status.toLowerCase() : ''}">●</span>
                    Order #${order.id} <span class="order-label ${order.status ? order.status.toLowerCase() : ''}">${order.status || ''}</span>
                    <span class="order-meta">${order.total ? `$${order.total}` : ''}${order.customer ? ' · ' + order.customer : ''}${order.timeAgo ? ' · ' + order.timeAgo : ''}</span>
                </li>
            `).join('');
        } else {
            ordersList.innerHTML = '<li class="order-item">No recent orders.</li>';
        }

        // Example: Add more stats/features here
        // document.getElementById('statSomeOtherMetric').textContent = data.someOtherMetric;
    } catch (err) {
        console.error('Dashboard fetch error:', err);
        alert('Error loading dashboard data.');
    }

    // Handle Products link click
    const productsLink = document.querySelector('a[href="vendor-products.html"]');
    if (productsLink) {
        productsLink.addEventListener('click', (e) => {
            console.log('Products link clicked');
            // No need to prevent default or manually redirect since the href will handle it
        });
    } else {
        console.error('Products link not found');
    }

    // Handle Products stat card click
    const productsStatBtn = document.querySelector('.stat-card:first-child .stat-btn');
    if (productsStatBtn) {
        productsStatBtn.addEventListener('click', () => {
            console.log('Products stat card clicked');
            window.location.href = 'vendor-products.html';
        });
    }

    // Handle sidebar logout
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const logoutLink = sidebarLinks[sidebarLinks.length - 1]; // Last link is Logout
    if (logoutLink && logoutLink.textContent.toLowerCase().includes('logout')) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
}); 