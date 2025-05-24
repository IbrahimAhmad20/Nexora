if (window.location.hostname === 'localhost') {
  window.API_BASE_URL = 'http://localhost:5000';
  window.BASE_API_URL = 'http://localhost:5000';
} else {
  window.API_BASE_URL = 'https://nexora-yapl.onrender.com';
  window.BASE_API_URL = 'https://nexora-yapl.onrender.com';
}
