document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();

    // Add event listener for logout
    const logoutLink = document.querySelector('.sidebar-nav a[href="#"] i.fas.fa-sign-out-alt').closest('a');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the default link behavior
            
            // Clear token and user from local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to login page
            window.location.href = 'login.html'; // Assuming your login page is login.html
        });
    }
});

async function loadDashboardStats() {
    try {
        const res = await api.getDashboardAnalytics();
        // userStats, orderStats, productStats are arrays
        const totalUsers = res.userStats?.[0]?.total_users ?? '--';
        const totalVendors = res.userStats?.[0]?.vendor_count ?? '--';
        const totalProducts = res.productStats?.[0]?.total_products ?? '--';
        const totalOrders = res.orderStats?.[0]?.total_orders ?? '--';
        document.getElementById('statUsers').textContent = totalUsers;
        document.getElementById('statVendors').textContent = totalVendors;
        document.getElementById('statProducts').textContent = totalProducts;
        document.getElementById('statOrders').textContent = totalOrders;
    } catch (err) {
        document.getElementById('statUsers').textContent = '--';
        document.getElementById('statVendors').textContent = '--';
        document.getElementById('statProducts').textContent = '--';
        document.getElementById('statOrders').textContent = '--';
    }
}
