document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = 'index.html';

    // Store Info
    const form = document.getElementById('profileForm');
    const msg = document.getElementById('profileMsg');
    // Policies
    const policyForm = document.getElementById('policyForm');
    // Availability
    const availabilityForm = document.getElementById('availabilityForm');
    // Vendor Profile
    const vendorProfileForm = document.getElementById('vendorProfileForm');
    // Security
    const securityForm = document.getElementById('securityForm');
    // Logo elements
    const storeLogo = document.getElementById('storeLogo');
    const uploadLogoBtn = document.getElementById('uploadLogoBtn');
    const profileAvatar = document.getElementById('profileAvatar');
    // Security elements
    const twoFactorCheckbox = document.getElementById('twoFactor');

    // Fetch and populate profile info
    async function fetchProfile() {
        const res = await fetch('http://localhost:5000/api/vendor/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            const p = data.data;
            form.businessName.value = p.business_name;
            form.businessDescription.value = p.business_description || '';
            form.address.value = p.address || '';
            form.taxId.value = p.tax_id || '';
            form.email.value = p.email;
            form.phone.value = p.phone || '';
            // Demo: set avatar and name
            document.getElementById('profileAvatar').textContent = (p.first_name?.[0] || 'V') + (p.last_name?.[0] || 'U');
            document.getElementById('profileName').textContent = p.first_name + ' ' + p.last_name;
            document.getElementById('profileEmail').textContent = p.email;
            // Vendor profile section
            vendorProfileForm.firstName.value = p.first_name;
            vendorProfileForm.lastName.value = p.last_name;
            vendorProfileForm.profileEmailInput.value = p.email;
            vendorProfileForm.profilePhone.value = p.phone || '';
            
            // Get logo
            fetchLogo();
        }
    }

    // Fetch the vendor logo
    async function fetchLogo() {
        try {
            const res = await fetch('http://localhost:5000/api/vendor/logo', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success && data.logo_url) {
                // If there's a logo, display it instead of the text avatar
                profileAvatar.innerHTML = '';
                profileAvatar.textContent = '';
                profileAvatar.style.backgroundImage = `url(${data.logo_url})`;
                profileAvatar.style.backgroundSize = 'cover';
                profileAvatar.style.backgroundPosition = 'center';
            }
        } catch (error) {
            console.error('Error fetching logo:', error);
        }
    }

    form.onsubmit = async e => {
        e.preventDefault();
        const profileData = {
            business_name: form.businessName.value,
            business_description: form.businessDescription.value,
            address: form.address.value,
            tax_id: form.taxId.value
        };
        const res = await fetch('http://localhost:5000/api/vendor/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        const data = await res.json();
        msg.textContent = data.success ? 'Profile updated!' : (data.message || 'Update failed');
        msg.style.color = data.success ? 'green' : 'red';
    };

    // Logo upload
    uploadLogoBtn.onclick = async (e) => {
        e.preventDefault();
        
        if (!storeLogo.files || storeLogo.files.length === 0) {
            msg.textContent = 'Please select a logo image first.';
            msg.style.color = 'red';
            return;
        }
        
        const formData = new FormData();
        formData.append('logo', storeLogo.files[0]);
        
        try {
            const res = await fetch('http://localhost:5000/api/vendor/logo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type for FormData
                },
                body: formData
            });
            
            const data = await res.json();
            
            if (data.success) {
                msg.textContent = 'Logo uploaded successfully!';
                msg.style.color = 'green';
                
                // Update the avatar with the new logo
                profileAvatar.textContent = '';
                profileAvatar.style.backgroundImage = `url(${data.logo_url})`;
                profileAvatar.style.backgroundSize = 'cover';
                profileAvatar.style.backgroundPosition = 'center';
                
                // Clear the file input
                storeLogo.value = '';
            } else {
                msg.textContent = data.message || 'Logo upload failed.';
                msg.style.color = 'red';
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            msg.textContent = 'Error uploading logo.';
            msg.style.color = 'red';
        }
    };

    // Fetch and populate policies
    async function fetchPolicies() {
        const res = await fetch('http://localhost:5000/api/vendor/policies', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            policyForm.shippingPolicy.value = data.data.shipping_policy || '';
            policyForm.returnPolicy.value = data.data.return_policy || '';
            policyForm.privacyPolicy.value = data.data.privacy_policy || '';
        }
    }
    policyForm.onsubmit = async e => {
        e.preventDefault();
        const body = {
            shipping_policy: policyForm.shippingPolicy.value,
            return_policy: policyForm.returnPolicy.value,
            privacy_policy: policyForm.privacyPolicy.value
        };
        const res = await fetch('http://localhost:5000/api/vendor/policies', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        msg.textContent = data.success ? 'Policies updated!' : (data.message || 'Update failed');
        msg.style.color = data.success ? 'green' : 'red';
    };

    // Fetch and populate availability
    async function fetchAvailability() {
        const res = await fetch('http://localhost:5000/api/vendor/availability', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            availabilityForm.storeStatus.value = data.data.store_status || 'open';
            availabilityForm.vacationMessage.value = data.data.vacation_message || '';
            availabilityForm.notifyOnReturn.checked = !!data.data.notify_on_return;
        }
    }
    availabilityForm.onsubmit = async e => {
        e.preventDefault();
        const body = {
            store_status: availabilityForm.storeStatus.value,
            vacation_message: availabilityForm.vacationMessage.value,
            notify_on_return: availabilityForm.notifyOnReturn.checked
        };
        const res = await fetch('http://localhost:5000/api/vendor/availability', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        msg.textContent = data.success ? 'Availability updated!' : (data.message || 'Update failed');
        msg.style.color = data.success ? 'green' : 'red';
    };

    // Vendor Profile update (first/last name, phone)
    vendorProfileForm.onsubmit = async e => {
        e.preventDefault();
        const body = {
            first_name: vendorProfileForm.firstName.value,
            last_name: vendorProfileForm.lastName.value,
            phone: vendorProfileForm.profilePhone.value
        };
        const res = await fetch('http://localhost:5000/api/vendor/profile-info', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        msg.textContent = data.success ? 'Profile info updated!' : (data.message || 'Update failed');
        msg.style.color = data.success ? 'green' : 'red';
        if (data.success) fetchProfile();
    };

    // Fetch and populate two-factor authentication status
    async function fetchTwoFactorStatus() {
        try {
            const res = await fetch('http://localhost:5000/api/auth/2fa-status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
                twoFactorCheckbox.checked = data.enabled;
            }
        } catch (error) {
            console.error('Error fetching 2FA status:', error);
        }
    }

    // Add TOTP 2FA modal HTML to the end of the file
    const totpModalHtml = `
    <div id="totpSetupModal" style="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:1000;align-items:center;justify-content:center;">
      <div style="background:#fff;padding:32px 24px 24px 24px;border-radius:12px;max-width:350px;margin:auto;box-shadow:0 4px 24px rgba(0,0,0,0.12);text-align:center;">
        <h3 style="margin-bottom:16px;">Enable Two-Factor Authentication</h3>
        <div id="totpQr"></div>
        <p style="font-size:0.98rem;margin:12px 0 8px 0;">Scan this QR code with your authenticator app, then enter the 6-digit code below:</p>
        <input type="text" id="totpCodeInput" maxlength="6" placeholder="123456" style="font-size:1.1rem;padding:8px 12px;margin-bottom:8px;width:140px;text-align:center;">
        <div style="margin-bottom:10px;"><button id="verifyTotpBtn" class="modern-btn">Verify & Enable</button></div>
        <div id="totpSetupMsg" style="color:#c00;font-size:0.97rem;"></div>
        <button id="closeTotpModalBtn" class="modern-btn" style="background:#eee;color:#222;margin-top:10px;">Cancel</button>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', totpModalHtml);
    const totpSetupModal = document.getElementById('totpSetupModal');
    const totpQr = document.getElementById('totpQr');
    const totpCodeInput = document.getElementById('totpCodeInput');
    const verifyTotpBtn = document.getElementById('verifyTotpBtn');
    const totpSetupMsg = document.getElementById('totpSetupMsg');
    const closeTotpModalBtn = document.getElementById('closeTotpModalBtn');

    // Show TOTP modal and fetch QR
    async function startTotpSetup() {
      totpQr.innerHTML = '';
      totpCodeInput.value = '';
      totpSetupMsg.textContent = '';
      totpSetupModal.style.display = 'flex';
      const res = await fetch('http://localhost:5000/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        totpQr.innerHTML = `<img src="${data.qr}" style="width:180px;">`;
      } else {
        totpSetupMsg.textContent = 'Failed to generate QR code.';
      }
    }

    verifyTotpBtn.onclick = async function() {
      const code = totpCodeInput.value.trim();
      if (!code) {
        totpSetupMsg.textContent = 'Enter the 6-digit code.';
        return;
      }
      const res = await fetch('http://localhost:5000/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        totpSetupMsg.style.color = 'green';
        totpSetupMsg.textContent = '2FA enabled!';
        setTimeout(() => { totpSetupModal.style.display = 'none'; fetchTwoFactorStatus(); }, 1200);
      } else {
        totpSetupMsg.style.color = '#c00';
        totpSetupMsg.textContent = data.message || 'Invalid code';
      }
    };
    closeTotpModalBtn.onclick = function() {
      totpSetupModal.style.display = 'none';
      twoFactorCheckbox.checked = false;
    };

    // Disable 2FA
    async function disable2FA() {
      await fetch('http://localhost:5000/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTwoFactorStatus();
    }

    // Update securityForm.onsubmit to handle TOTP setup/disable
    securityForm.onsubmit = async e => {
        e.preventDefault();
        const currentPassword = securityForm.currentPassword.value;
        const newPassword = securityForm.newPassword.value;
        const confirmPassword = securityForm.confirmPassword.value;
        // Handle 2FA toggle
        if (twoFactorCheckbox.checked) {
            // If enabling, show modal for TOTP setup
            startTotpSetup();
            return;
        } else {
            // If disabling, call backend
            await disable2FA();
            msg.textContent = 'Two-factor authentication disabled.';
            msg.style.color = 'green';
            fetchTwoFactorStatus();
        }
        // Password change logic (placeholder for future implementation)
        if (currentPassword && newPassword && confirmPassword) {
            if (newPassword !== confirmPassword) {
                msg.textContent = 'New passwords do not match.';
                msg.style.color = 'red';
                return;
            }
            alert('Password change functionality is not implemented in this demo.');
        }
    };

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

    fetchProfile();
    fetchPolicies();
    fetchAvailability();
    fetchTwoFactorStatus();
});
