document.addEventListener('DOMContentLoaded', async () => {
    // Load user data when page loads
    try {
        console.log('Inside loadUserData function.');
        await loadUserData();
        console.log('User data load attempt finished.');
        // await loadOrders(); // Load orders after user data is loaded
        // Commented out payment methods loading until table is created
        // await loadAddresses(); // Load addresses after user data is loaded
        // await loadPaymentMethods(); // Load payment methods after user data is loaded
    } catch (error) {
        console.error('Error loading user data in DOMContentLoaded:', error);
        showError('Failed to load user data. Please try refreshing the page.');
    }

    // Load other data after user profile is loaded (optional, can be parallel)
    try {
        console.log('Attempting to load addresses...');
        await loadAddresses();
        console.log('Addresses load attempt finished.');
        // Commented out payment methods loading until table is created
        // console.log('Attempting to load payment methods...');
        // await loadPaymentMethods();
        // console.log('Payment methods load attempt finished.');
    } catch (error) {
        console.error('Error loading related data in DOMContentLoaded:', error);
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
        const twoFactorToggle = document.getElementById('two-factor');
        const enable2fa = twoFactorToggle.checked;

        if (newPassword && newPassword !== confirmPassword) {
            showError('New passwords do not match');
            return;
        }

        try {
            // Handle password update and 2FA toggle separately
            if (currentPassword || newPassword) {
                 // Only update password if current password or new password fields are filled
                if (!currentPassword) {
                     showError('Current password is required to change password.');
                     return;
                }
                if (newPassword && newPassword.length < 6) {
                     showError('New password must be at least 6 characters long.');
                     return;
                }

                 const passwordUpdateData = {
                     current_password: currentPassword,
                     new_password: newPassword
                 };
                // Assuming backend /user/profile endpoint handles password change if passwords are provided
                 await api.updateUserProfile(passwordUpdateData);
                 showSuccess('Password updated successfully');
                 e.target.querySelector('#current-password').value = '';
                 e.target.querySelector('#new-password').value = '';
                 e.target.querySelector('#confirm-password').value = '';
            }

            // Handle 2FA toggle
            // Check the *current* state of the toggle AFTER potential password update
            const current2faStatusResponse = await api.get2faStatus();
            const is2faEnabled = current2faStatusResponse.enabled;

            if (enable2fa && !is2faEnabled) {
                // User wants to enable 2FA, and it's currently disabled
                // Trigger 2FA setup flow (show QR code, etc.)
                 await start2faSetupFlow();

            } else if (!enable2fa && is2faEnabled) {
                // User wants to disable 2FA, and it's currently enabled
                // No extra verification needed for disabling on this endpoint based on backend code
                await api.toggle2fa(false);
                showSuccess('Two-factor authentication disabled successfully');
            }

            // If password was changed, reload user data to clear password fields
             if (currentPassword || newPassword) {
                 await loadUserData();
             }

        } catch (error) {
            console.error('Error updating security settings:', error);
            showError(error.message || 'Failed to update security settings');
             // Revert toggle state if enabling/disabling failed
            const current2faStatusResponse = await api.get2faStatus();
            const is2faEnabled = current2faStatusResponse.enabled;
            if (twoFactorToggle) {
                twoFactorToggle.checked = is2faEnabled; // Revert to actual status
            }
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
    const addAddressBtn = document.getElementById('add-address-btn');
    const addAddressModal = document.getElementById('addAddressModal');
    const closeAddAddressModalBtn = document.getElementById('closeAddAddressModal');
    const addAddressForm = document.getElementById('add-address-form');
    
    if (addAddressBtn && addAddressModal && closeAddAddressModalBtn && addAddressForm) {
        addAddressBtn.addEventListener('click', () => {
            addAddressModal.style.display = 'flex'; // Show modal
        });

        closeAddAddressModalBtn.addEventListener('click', () => {
            addAddressModal.style.display = 'none'; // Hide modal
            addAddressForm.reset(); // Clear form fields
        });

        addAddressModal.addEventListener('click', (e) => {
            if (e.target === addAddressModal) {
                addAddressModal.style.display = 'none'; // Hide modal when clicking outside content
                addAddressForm.reset(); // Clear form fields
            }
        });

        addAddressForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                title: document.getElementById('modal-title').value,
                street: document.getElementById('modal-street').value,
                apartment: document.getElementById('modal-apartment').value || null,
                city: document.getElementById('modal-city').value,
                state: document.getElementById('modal-state').value,
                zip_code: document.getElementById('modal-zip_code').value,
                country: document.getElementById('modal-country').value,
                phone: document.getElementById('modal-phone').value || null,
                is_default: document.getElementById('modal-is_default').checked
            };

            try {
                const response = await api.addAddress(formData);

                if (response.success) {
                    showSuccess('Address added successfully!');
                    addAddressModal.style.display = 'none'; // Hide modal
                    addAddressForm.reset(); // Clear form fields
                    await loadAddresses(); // Reload addresses to update list
                } else {
                    showError('Failed to add address: ' + (response.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error adding address:', error);
                // Attempt to parse and display backend validation errors
                let errorMessage = 'An error occurred while adding the address.';
                if (error.message) {
                    errorMessage = error.message;
                }
                // If the backend sends back an 'errors' array (common for validation errors)
                if (error.errors && Array.isArray(error.errors)) {
                    errorMessage += '\n\nDetails:';
                    error.errors.forEach(err => {
                        errorMessage += `\n- ${err.param}: ${err.msg}`; // Assuming typical express-validator format
                    });
                }
                showError(errorMessage);
            }
        });
    } else {
        console.error('Add address button or modal elements not found.');
    }

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

    // User Profile Dropdown Toggle
    const userProfileHeader = document.getElementById('userProfile');
    const profileDropdown = userProfileHeader.querySelector('.profile-dropdown');

    if (userProfileHeader && profileDropdown) {
        userProfileHeader.addEventListener('click', (e) => {
            // Prevent clicks inside the dropdown from closing it immediately
            if (!profileDropdown.contains(e.target)) {
                profileDropdown.classList.toggle('show');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userProfileHeader.contains(e.target) && profileDropdown.classList.contains('show')) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    // Add placeholder for 2FA setup UI and logic functions
    function show2faSetupModal(qrCodeData, secret) {
        const modal = document.getElementById('twoFactorSetupModal');
        const qrCodeImage = document.getElementById('qrCodeImage');
        const twoFactorSecretSpan = document.getElementById('twoFactorSecret');

        console.log('Showing 2FA setup modal.');
        console.log('QR Code Data:', qrCodeData ? qrCodeData.substring(0, 50) + '...' : 'No QR Code Data'); // Log first 50 chars
        console.log('Secret:', secret);

        if (modal && qrCodeImage && twoFactorSecretSpan) {
            qrCodeImage.src = qrCodeData;
            twoFactorSecretSpan.textContent = secret;
            modal.style.display = 'flex'; // Or 'block', depending on CSS
        } else {
            console.error('2FA setup modal elements not found.');
        }
    }

    function close2faSetupModal() {
        const modal = document.getElementById('twoFactorSetupModal');
        console.log('Attempting to close 2FA setup modal.');
        modal.style.display = 'none';
        document.getElementById('verification-code').value = '';
    }

    async function verify2faSetupCode() {
        const code = document.getElementById('verification-code').value;
        if (!code || code.length !== 6) {
            showError('Please enter a valid 6-digit code');
            return;
        }

        try {
            await api.verify2faSetup(code);
            showSuccess('Two-factor authentication enabled successfully');
            close2faSetupModal();
            document.getElementById('two-factor').checked = true;
        } catch (error) {
            console.error('Error verifying 2FA setup:', error);
            showError(error.message || 'Failed to verify 2FA setup');
        }
    }

    async function start2faSetupFlow() {
        try {
            const response = await api.setup2fa();
            show2faSetupModal(response.qr, response.secret);
        } catch (error) {
            console.error('Error starting 2FA setup:', error);
            showError(error.message || 'Failed to start 2FA setup');
            // Revert toggle state
            document.getElementById('two-factor').checked = false;
        }
    }

    // Add event listeners for the 2FA modal after DOM is loaded
    const twoFactorSetupModal = document.getElementById('twoFactorSetupModal');
    if (twoFactorSetupModal) {
        const closeBtn = twoFactorSetupModal.querySelector('.modal-close');
        const verifyBtn = twoFactorSetupModal.querySelector('.modal-body .btn-primary');

        if (closeBtn) {
            closeBtn.addEventListener('click', close2faSetupModal);
        }

        if (verifyBtn) {
            verifyBtn.addEventListener('click', verify2faSetupCode);
        }

        // Close modal when clicking outside
        twoFactorSetupModal.addEventListener('click', (e) => {
            if (e.target === twoFactorSetupModal) {
                close2faSetupModal();
            }
        });
    }

    // Add click handler for 2FA toggle
    const twoFactorToggle = document.getElementById('two-factor');
    if (twoFactorToggle) {
        twoFactorToggle.addEventListener('change', async (e) => {
            if (e.target.checked) {
                // User wants to enable 2FA, trigger setup flow
                await start2faSetupFlow();
            } else {
                // User wants to disable 2FA
                if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
                    try {
                        await api.disable2fa();
                        showSuccess('Two-factor authentication has been disabled.');
                        // Update UI after disabling
                        // loadUserData(); // Might not be necessary, toggle state is handled below
                    } catch (error) {
                        console.error('Error disabling 2FA:', error);
                        showError(error.message || 'Failed to disable 2FA. Please try again.');
                        e.target.checked = true; // Reset toggle on failure
                    }
                } else {
                    e.target.checked = true; // Reset toggle if user cancels
                }
            }
             // After toggle change (and potential disable/enable success/failure), reload user data to ensure UI reflects actual state
             // This also handles updating the toggle state based on the latest user data
             await loadUserData();
        });
    }

    // Add event listener for Logout link
    const logoutLink = document.querySelector('.profile-dropdown .logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            // Clear the token (assuming it's stored in localStorage)
            localStorage.removeItem('token');
            // Redirect to the login page (adjust the URL if needed)
            window.location.href = '/login.html';
        });
    }

}); // End DOMContentLoaded

// Load user profile data
async function loadUserData() {
    console.log('Inside loadUserData function.');
    try {
        const response = await api.getUserProfile();
        const userData = response.data; // Extract data from the 'data' property
        console.log('User profile data received:', userData);
        updateUIWithUserData(userData);
         // After loading user data, load related data
        // await loadAddresses();
        // await loadPaymentMethods();

    } catch (error) {
        console.error('Error in loadUserData:', error);
        // Handle error, e.g., show a message or redirect to login
        throw error; // Re-throw to be caught by the DOMContentLoaded handler
    }
    console.log('Finished loadUserData function.');
}

// Update UI with user data
function updateUIWithUserData(userData) {
    console.log('Inside updateUIWithUserData with data:', userData);
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

    // Update 2FA toggle state
    const twoFactorToggle = document.getElementById('two-factor');
    if (twoFactorToggle) {
        twoFactorToggle.checked = userData.two_factor_enabled;
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
            avatarElement.src = userData.avatar_url.startsWith('http') ? userData.avatar_url : `${window.API_BASE_URL}${userData.avatar_url}`;
        } else {
            // Create an image element if it doesn't exist
            const avatarDiv = document.querySelector('.profile-avatar');
            if (avatarDiv) {
                const img = document.createElement('img');
                img.src = userData.avatar_url.startsWith('http') ? userData.avatar_url : `${window.API_BASE_URL}${userData.avatar_url}`;
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

// Load addresses
async function loadAddresses() {
    console.log('Inside loadAddresses function.');
    try {
        const addresses = await api.getAddresses();
        console.log('Addresses data received:', addresses);
        const addressCardsContainer = document.getElementById('address-cards');
        
        if (!addresses.data || addresses.data.length === 0) {
            addressCardsContainer.innerHTML = '<div class="text-center">No addresses saved yet</div>';
            return;
        }
        
        addressCardsContainer.innerHTML = addresses.data.map(address => `
            <div class="address-card" data-address-id="${address.id}">
                <div class="address-card-header">
                    <h3>${address.label}</h3>
                    <div class="address-card-actions">
                        <button class="address-card-action edit-address" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="address-card-action delete-address" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p>${address.address}</p>
                <p>${address.city}, ${address.state} ${address.zip}</p>
                <p>${address.country}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading addresses:', error);
        document.getElementById('address-cards').innerHTML = 
            '<div class="text-center text-error">Failed to load addresses</div>';
    }
}

// Load payment methods
// Commented out until user_payment_methods table is created
/*
async function loadPaymentMethods() {
    console.log('Inside loadPaymentMethods function.');
    try {
        const paymentMethods = await api.getPaymentMethods();
        console.log('Payment methods data received:', paymentMethods);
        const paymentMethodsContainer = document.getElementById('payment-methods');
        
        if (!paymentMethods.length) {
            paymentMethodsContainer.innerHTML = '<div class="text-center">No payment methods saved yet</div>';
            return;
        }
        
        paymentMethodsContainer.innerHTML = paymentMethods.map(method => `
            <div class="payment-method-card" data-method-id="${method.id}">
                <div class="payment-method-header">
                    <i class="fas ${method.type === 'credit_card' ? 'fa-credit-card' : 'fa-paypal'}"></i>
                    <div class="payment-method-actions">
                        <button class="payment-method-action delete-method" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="payment-method-details">
                    <p>**** **** **** ${method.last4}</p>
                    <p>Expires ${method.expiry_month}/${method.expiry_year}</p>
                    ${method.is_default ? '<span class="default-badge">Default</span>' : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading payment methods:', error);
        document.getElementById('payment-methods').innerHTML = 
            '<div class="text-center text-error">Failed to load payment methods</div>';
    }
}
*/

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

// Add placeholder for 2FA setup UI and logic functions
function show2faSetupModal(qrCodeData, secret) {
    const modal = document.getElementById('twoFactorSetupModal');
    const qrCodeImage = document.getElementById('qrCodeImage');
    const twoFactorSecretSpan = document.getElementById('twoFactorSecret');

    console.log('Showing 2FA setup modal.');
    console.log('QR Code Data:', qrCodeData ? qrCodeData.substring(0, 50) + '...' : 'No QR Code Data'); // Log first 50 chars
    console.log('Secret:', secret);

    if (modal && qrCodeImage && twoFactorSecretSpan) {
        qrCodeImage.src = qrCodeData;
        twoFactorSecretSpan.textContent = secret;
        modal.style.display = 'flex'; // Or 'block', depending on CSS
    } else {
        console.error('2FA setup modal elements not found.');
    }
}

function close2faSetupModal() {
    const modal = document.getElementById('twoFactorSetupModal');
    console.log('Attempting to close 2FA setup modal.');
    modal.style.display = 'none';
    document.getElementById('verification-code').value = '';
}

async function verify2faSetupCode() {
    const code = document.getElementById('verification-code').value;
    if (!code || code.length !== 6) {
        showError('Please enter a valid 6-digit code');
        return;
    }

    try {
        await api.verify2faSetup(code);
        showSuccess('Two-factor authentication enabled successfully');
        close2faSetupModal();
        document.getElementById('two-factor').checked = true;
    } catch (error) {
        console.error('Error verifying 2FA setup:', error);
        showError(error.message || 'Failed to verify 2FA setup');
    }
}

async function start2faSetupFlow() {
    try {
        const response = await api.setup2fa();
        show2faSetupModal(response.qr, response.secret);
    } catch (error) {
        console.error('Error starting 2FA setup:', error);
        showError(error.message || 'Failed to start 2FA setup');
        // Revert toggle state
        document.getElementById('two-factor').checked = false;
    }
} 