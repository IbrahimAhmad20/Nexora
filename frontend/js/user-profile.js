import { ApiService } from './api.js';

// Initialize API service
const api = new ApiService();

// Wrap all DOM interaction and event listeners inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    // Load user data when page loads
    try {
        await loadUserData();
        // await loadOrders(); // Load orders after user data is loaded
        // await loadAddresses(); // Load addresses after user data is loaded
        // await loadPaymentMethods(); // Load payment methods after user data is loaded
    } catch (error) {
        console.error('Error loading user data:', error);
        showError('Failed to load user data. Please try refreshing the page.');
    }

    // Load other data after user profile is loaded (optional, can be parallel)
    try {
        await loadOrders();
        await loadAddresses();
        await loadPaymentMethods();
    } catch (error) {
        console.error('Error loading related data:', error);
        // Decide if you want to show an error or just leave sections empty
    }

    // Form submission handlers
    document.getElementById('personal-info-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const formData = {
                first_name: document.getElementById('first-name').value,
                last_name: document.getElementById('last-name').value,
                phone: document.getElementById('customer-phone').value,
                // birth_date: document.getElementById('birth-date').value // Assuming backend expects snake_case
                birthDate: document.getElementById('birth-date').value // Assuming backend expects camelCase based on prev edit
            };
            await api.updateUserProfile(formData);
            showSuccess('Personal information updated successfully');
            // Optionally reload user data to reflect changes immediately
            await loadUserData();
        } catch (error) {
            console.error('Error updating personal info:', error);
            showError('Failed to update personal information');
        }
    });

    document.getElementById('security-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword && newPassword !== confirmPassword) {
            showError('New passwords do not match');
            return;
        }

        try {
            const formData = {
                current_password: currentPassword,
                new_password: newPassword || undefined,
                two_factor_enabled: document.getElementById('two-factor').checked
            };
            await api.updateUserProfile(formData);
            showSuccess('Security settings updated successfully');
            e.target.reset(); // Clear the form after successful submission
        } catch (error) {
            console.error('Error updating security settings:', error);
            showError('Failed to update security settings');
        }
    });

    document.getElementById('notification-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const formData = {
                order_updates: document.querySelector('input[name="order-updates"]').checked,
                promotions: document.querySelector('input[name="promotions"]').checked,
                price_drop_alerts: document.querySelector('input[name="price-drop-alerts"]').checked,
                new_arrivals: document.querySelector('input[name="new-arrivals"]').checked,
                method: document.querySelector('input[name="notification-method"]:checked').value
            };
            await api.updateNotificationPreferences(formData);
            showSuccess('Notification preferences updated successfully');
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            showError('Failed to update notification preferences');
        }
    });

    // Profile avatar change
    document.querySelector('.profile-avatar-edit').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const formData = new FormData();
                    formData.append('avatar', file);
                    await api.updateUserAvatar(formData);
                    showSuccess('Profile picture updated successfully');
                    // Reload user data to get new avatar
                    await loadUserData();
                } catch (error) {
                    console.error('Error updating avatar:', error);
                    showError('Failed to update profile picture');
                }
            }
        };
        input.click();
    });

    // Add new address button
    document.getElementById('add-address-btn').addEventListener('click', () => {
        window.location.href = '/add-address.html';
    });

    // Add new payment method button
    document.getElementById('add-payment-btn').addEventListener('click', () => {
        window.location.href = '/add-payment.html';
    });

    // Navigation Links (Assuming these exist in the HTML and you want them handled by JS)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // e.preventDefault(); // Prevent default if navigation is handled by JS
        // Add your navigation logic here, e.g., using history.pushState or a routing library
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          window.location.href = href; // Simple navigation
        }
      });
    });

    // Sidebar Menu Items (Assuming these exist in the HTML)
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        // e.preventDefault(); // Prevent default if navigation is handled by JS
        // Add your navigation logic here
         const href = item.getAttribute('href');
        if (href && href !== '#') {
          window.location.href = href; // Simple navigation
        }
      });
    });

    // Logo Click (Assuming logo exists in HTML)
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = '/'; // Navigate to home page
        });
    }

    // View Cart Button (Assuming button with class 'btn-secondary' and cart icon exists)
    const viewCartBtn = document.querySelector('.btn-secondary:has(i.fa-shopping-cart)');
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = '/cart.html'; // Navigate to cart page
        });
    }

    // View All Orders Button (Assuming button with class 'btn-secondary' and list icon exists)
    const viewAllOrdersBtn = document.querySelector('.btn-secondary:has(i.fa-list)');
    if (viewAllOrdersBtn) {
        viewAllOrdersBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = '/orders.html'; // Navigate to orders page
        });
    }

    // Order Details/Track Buttons (Assuming these buttons exist within the order history table)
    // This event listener uses event delegation for efficiency
    document.getElementById('recent-orders').addEventListener('click', (e) => {
        const target = e.target.closest('.btn-secondary');
        if (target) {
            e.preventDefault();
            const orderRow = target.closest('tr');
            const orderId = orderRow.querySelector('td:first-child').textContent.replace('#', ''); // Remove # from ID
            const action = target.textContent.trim().toLowerCase();
            if (action === 'details') {
              window.location.href = `/order-details.html?id=${orderId}`;
            } else if (action === 'track') {
              window.location.href = `/track-order.html?id=${orderId}`;
            }
        }
    });

    // Address Card Actions (Using event delegation)
    document.getElementById('address-cards').addEventListener('click', async (e) => {
        const target = e.target.closest('.address-card-action');
        if (target) {
            e.preventDefault();
            const addressCard = target.closest('.address-card');
            const addressId = addressCard.dataset.addressId;
            const isEdit = target.querySelector('i').classList.contains('fa-edit');

            if (isEdit) {
              window.location.href = `/edit-address.html?id=${addressId}`;
            } else { // Delete
              if (confirm('Are you sure you want to delete this address?')) {
                try {
                  await api.deleteAddress(addressId);
                  addressCard.remove();
                  showSuccess('Address deleted successfully!');
                } catch (error) {
                  console.error('Error deleting address:', error);
                  showError('Failed to delete address. Please try again.');
                }
              }
            }
        }
    });

    // Payment Method Actions (Using event delegation)
    document.getElementById('payment-methods').addEventListener('click', async (e) => {
        const target = e.target.closest('.btn-secondary'); // Target the button
        if (target) {
            e.preventDefault();
            const paymentMethod = target.closest('.payment-method');
            const methodId = paymentMethod.dataset.methodId;
            const isEdit = target.querySelector('i').classList.contains('fa-edit');

            if (isEdit) {
                window.location.href = `/edit-payment-method.html?id=${methodId}`;
            } else { // Delete
                if (confirm('Are you sure you want to delete this payment method?')) {
                    try {
                        await api.deletePaymentMethod(methodId);
                        paymentMethod.remove();
                        showSuccess('Payment method deleted successfully!');
                    } catch (error) {
                        console.error('Error deleting payment method:', error);
                        showError('Failed to delete payment method. Please try again.');
                    }
                }
            }
        }
    });

     // Sidebar toggle
    document.querySelector('.sidebar-toggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('sidebar-collapsed');
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) { // Check if element exists
        mobileMenuToggle.addEventListener('click', () => {
            document.querySelector('.mobile-menu').classList.toggle('active');
        });
    }

}); // End DOMContentLoaded

// Load user profile data
async function loadUserData() {
    try {
        const response = await api.getUserProfile();
        const userData = response.data; // Extract data from the 'data' property
        updateUIWithUserData(userData);
         // After loading user data, load related data
        // await loadOrders();
        // await loadAddresses();
        // await loadPaymentMethods();

    } catch (error) {
        console.error('Error loading user profile:', error);
        // Handle error, e.g., show a message or redirect to login
        throw error; // Re-throw to be caught by the DOMContentLoaded handler
    }
}

// Update UI with user data
function updateUIWithUserData(userData) {
    // Update profile information (using snake_case from backend)
    document.getElementById('profile-name').textContent = `${userData.first_name} ${userData.last_name}`;
    document.getElementById('profile-email').textContent = userData.email;
    // Assuming role is directly available or needs mapping if backend returns different values
    document.getElementById('profile-role').textContent = userData.role || 'Customer';
    document.getElementById('profile-initials').textContent = 
        `${userData.first_name ? userData.first_name[0] : '-'}${userData.last_name ? userData.last_name[0] : '-'}`.toUpperCase();

    // Update personal info form (using snake_case from backend)
    document.getElementById('first-name').value = userData.first_name || '';
    document.getElementById('last-name').value = userData.last_name || '';
    document.getElementById('customer-email').value = userData.email || '';
    document.getElementById('customer-phone').value = userData.phone || '';
    // Assuming birthDate might come as a date string and needs formatting if needed
    document.getElementById('birth-date').value = userData.birthDate || ''; // Use birthDate as per prev edit

    // Update notification preferences (using snake_case)
    if (userData.notification_preferences) {
        const prefs = userData.notification_preferences;
        document.querySelector('input[name="order-updates"]').checked = prefs.order_updates;
        document.querySelector('input[name="promotions"]').checked = prefs.promotions;
        document.querySelector('input[name="price-drop-alerts"]').checked = prefs.price_drop_alerts;
        document.querySelector('input[name="new-arrivals"]').checked = prefs.new_arrivals;

        const notificationMethod = prefs.method || 'email';
        const methodRadio = document.querySelector(`input[name="notification-method"][value="${notificationMethod}"]`);
        if (methodRadio) {
             methodRadio.checked = true;
        }
    }

    // Update stats (assuming stats object exists in backend response)
    // Add checks for userData.stats before accessing properties
    document.getElementById('total-orders').textContent = userData.stats?.totalOrders || 0; // Assuming camelCase from prev edit
    document.getElementById('wishlist-count').textContent = userData.stats?.wishlistItems || 0; // Assuming camelCase from prev edit
    document.getElementById('pending-orders').textContent = userData.stats?.pendingOrders || 0; // Assuming camelCase from prev edit
    document.getElementById('reviews-count').textContent = userData.stats?.reviewsGiven || 0; // Assuming camelCase from prev edit

    // Update avatar if URL is provided
    if (userData.avatar_url) {
        const avatarElement = document.querySelector('.profile-avatar img');
        if (avatarElement) {
            avatarElement.src = userData.avatar_url;
        } else {
            // Create an image element if it doesn't exist
            const avatarDiv = document.querySelector('.profile-avatar');
            if (avatarDiv) {
                const img = document.createElement('img');
                img.src = userData.avatar_url;
                // Optional: Add alt text
                img.alt = `${userData.first_name} ${userData.last_name}'s avatar`;
                 // Remove the initials span if it exists
                const initialsSpan = avatarDiv.querySelector('span');
                if(initialsSpan) initialsSpan.remove();
                avatarDiv.prepend(img); // Add the image before other content in avatar div
            }
        }
         // Hide initials if avatar is present
        const initialsSpan = document.getElementById('profile-initials');
        if(initialsSpan) initialsSpan.style.display = 'none';

    } else {
         // Show initials if no avatar
         const initialsSpan = document.getElementById('profile-initials');
        if(initialsSpan) initialsSpan.style.display = 'block'; // Or whatever the default display is
         // Remove avatar image if it exists
         const avatarImg = document.querySelector('.profile-avatar img');
         if(avatarImg) avatarImg.remove();
    }

}

// Load orders
async function loadOrders() {
    try {
        const response = await api.getOrders();
        const orders = response.data; // Assuming orders are in a 'data' property
        const recentOrders = orders.slice(0, 5); // Get 5 most recent orders
        const ordersContainer = document.getElementById('recent-orders');

        if (!ordersContainer) return; // Check if container exists

        if (recentOrders.length === 0) {
            ordersContainer.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
            return;
        }

        ordersContainer.innerHTML = recentOrders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>${order.items.length}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td><span class="order-status status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td>
                    <a href="/order-details.html?id=${order.id}" class="btn btn-secondary btn-sm">Details</a>
                    ${order.status === 'SHIPPED' ? `<a href="/track-order.html?id=${order.id}" class="btn btn-secondary btn-sm">Track</a>` : ''}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        const ordersContainer = document.getElementById('recent-orders');
         if (ordersContainer) {
             ordersContainer.innerHTML = '<tr><td colspan="6" class="text-center">Error loading orders</td></tr>';
         }
    }
}

// Load addresses
async function loadAddresses() {
    try {
        const response = await api.getAddresses();
        const addresses = response.data; // Assuming addresses are in a 'data' property
        const addressesContainer = document.getElementById('address-cards');

         if (!addressesContainer) return; // Check if container exists

        if (addresses.length === 0) {
            addressesContainer.innerHTML = '<div class="text-center">No addresses found</div>';
            return;
        }

        addressesContainer.innerHTML = addresses.map(address => `
            <div class="address-card ${address.is_default ? 'address-card-default' : ''}" data-address-id="${address.id}">
                <div class="address-card-header">
                    <div class="address-card-title">${address.title}</div>
                    ${address.is_default ? '<span class="address-card-default-badge">Default</span>' : ''}
                </div>
                <div class="address-card-actions">
                    <div class="address-card-action edit-address">
                        <i class="fas fa-edit"></i>
                    </div>
                    <div class="address-card-action delete-address">
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
                <p>${address.street}</p>
                ${address.apartment ? `<p>${address.apartment}</p>` : ''}
                <p>${address.city}, ${address.state} ${address.zip_code}</p>
                <p>${address.country}</p>
                <p>Phone: ${address.phone}</p>
            </div>
        `).join('');

        // Add event listeners for address actions (using event delegation earlier)

    } catch (error) {
        console.error('Error loading addresses:', error);
         const addressesContainer = document.getElementById('address-cards');
         if (addressesContainer) {
             addressesContainer.innerHTML = '<div class="text-center">Error loading addresses</div>';
         }
    }
}

// Load payment methods
async function loadPaymentMethods() {
    try {
        const response = await api.getPaymentMethods();
        const paymentMethods = response.data; // Assuming payment methods are in a 'data' property
        const methodsContainer = document.getElementById('payment-methods');

         if (!methodsContainer) return; // Check if container exists

        if (paymentMethods.length === 0) {
            methodsContainer.innerHTML = '<div class="text-center">No payment methods found</div>';
            return;
        }

        methodsContainer.innerHTML = paymentMethods.map(method => `
            <div class="payment-method" data-method-id="${method.id}">
                <div class="payment-method-icon">
                    <i class="fab fa-${method.type.toLowerCase()}"></i>
                </div>
                <div class="payment-method-info">
                    <div class="payment-method-name">${method.type} ending in ${method.last4}</div>
                    <div class="payment-method-details">Expires ${method.expiry_month}/${method.expiry_year}</div>
                </div>
                <div class="payment-method-actions">
                    <button class="btn btn-secondary btn-sm edit-payment">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm delete-payment">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners for payment method actions (using event delegation earlier)

    } catch (error) {
        console.error('Error loading payment methods:', error);
         const methodsContainer = document.getElementById('payment-methods');
         if (methodsContainer) {
             methodsContainer.innerHTML = '<div class="text-center">Error loading payment methods</div>';
         }
    }
}

// Utility functions
function showSuccess(message) {
    // Implement your success notification here
    console.log('Success:', message);
    alert(message); // Basic alert for demonstration
}

function showError(message) {
    // Implement your error notification here
    console.error('Error:', message);
    alert(message); // Basic alert for demonstration
}

// Note: Sidebar toggle and mobile menu toggle listeners are now inside DOMContentLoaded 