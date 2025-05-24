// Toggle password visibility
function togglePassword() {
    const passwordField = document.getElementById("password");
    const icon = document.querySelector(".toggle-password");
    
    if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        passwordField.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

function toggleSignupPassword() {
    const passwordField = document.getElementById("signupPassword");
    const icon = document.querySelectorAll(".toggle-password")[1];
    
    if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        passwordField.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

// TOTP 2FA modal logic
async function showTotpLogin(user, token) {
  const totpLoginModal = document.getElementById('totpLoginModal');
  const totpLoginForm = document.getElementById('totpLoginForm');
  const totpLoginCode = document.getElementById('totpLoginCode');
  const totpLoginMsg = document.getElementById('totpLoginMsg');
  const closeTotpLoginModal = document.getElementById('closeTotpLoginModal');
  totpLoginCode.value = '';
  totpLoginMsg.textContent = '';
  totpLoginModal.style.display = 'block';
  return new Promise((resolve) => {
    totpLoginForm.onsubmit = async function(e) {
      e.preventDefault();
      const code = totpLoginCode.value.trim();
      if (!code) {
        totpLoginMsg.textContent = 'Enter the 6-digit code.';
        return;
      }
      const res = await fetch(window.API_BASE_URL + '/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, code })
      });
      const data = await res.json();
      if (data.success) {
        totpLoginModal.style.display = 'none';
        resolve(true);
      } else {
        totpLoginMsg.textContent = data.message || 'Invalid code';
      }
    };
    closeTotpLoginModal.onclick = () => {
      totpLoginModal.style.display = 'none';
      resolve(false);
    };
  });
}

document.addEventListener("DOMContentLoaded", function() {
  // Login form submission with 2FA
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await api.login(email, password);
        let canLogin = true;
        if (response.user && response.user.two_factor_enabled) {
          canLogin = await showTotpLogin(response.user, response.token);
        }
        if (!canLogin) return;
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        // Redirect based on user role
        if (response.user.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else if (response.user.role === 'customer') {
          window.location.href = 'shop.html';
        } else if (response.user.role === 'vendor') {
          window.location.href = 'vendor-dashboard.html';
        }
      } catch (error) {
        alert(error.message || 'Login failed. Please try again.');
      }
    });
  }

  // Signup form submission
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const email = document.getElementById("signupEmail").value;
      const password = document.getElementById("signupPassword").value;
      const userType = document.querySelector('input[name="signupUserType"]:checked').value;
      const firstName = document.getElementById("signupFirstName")?.value || '';
      const lastName = document.getElementById("signupLastName")?.value || '';

      try {
        const response = await api.register(email, password, userType, firstName, lastName);
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          // Redirect based on user role
          if (userType === 'customer') {
            window.location.href = 'shop.html';
          } else if (userType === 'vendor') {
            window.location.href = 'vendor-dashboard.html';
          }
        }
      } catch (error) {
        alert(error.message || 'Registration failed. Please try again.');
      }
    });
  }

  document.querySelector('.social-btn.google').onclick = function() {
    window.location.href = window.API_BASE_URL + '/api/auth/google';
  };
  document.querySelector('.social-btn.facebook').onclick = function() {
    window.location.href = window.API_BASE_URL + '/api/auth/facebook';
  };

  // Handle redirect after OAuth
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const user = params.get('user');
  if (token && user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', user);
    const userObj = JSON.parse(user);
    if (userObj.role === 'customer') {
      window.location.href = 'shop.html';
    } else if (userObj.role === 'vendor') {
      window.location.href = 'vendor-dashboard.html';
    }
  }
});

// Update api.register to accept first_name and last_name
api.register = async function(email, password, role, first_name, last_name) {
  return this.request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, first_name, last_name })
  });
};

// Show signup form
function showSignupForm() {
    document.getElementById("signupBtn").style.display = "none";
    document.getElementById("signupFooterText").style.display = "none";
    document.getElementById("signupForm").style.display = "block";
}

// For demo purposes - toggle between login and signup on mobile
function showSignup() {
    if (window.innerWidth <= 768) {
        document.querySelector(".login-section").style.display = "none";
        document.querySelector(".signup-section").style.display = "flex";
    } else {
        showSignupForm();
    }
}

function showLogin() {
    document.getElementById("signupBtn").style.display = "block";
    document.getElementById("signupFooterText").style.display = "block";
    document.getElementById("signupForm").style.display = "none";
    
    if (window.innerWidth <= 768) {
        document.querySelector(".signup-section").style.display = "none";
        document.querySelector(".login-section").style.display = "flex";
    }
}

// Add responsive behavior
window.addEventListener("resize", function() {
    if (window.innerWidth > 768) {
        document.querySelector(".login-section").style.display = "flex";
        document.querySelector(".signup-section").style.display = "flex";
    }
}); 