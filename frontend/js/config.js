// API Configuration

// Set the base URL for API requests
let apiBase = 'https://nexora-yapl.onrender.com'; // Default to production URL

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    apiBase = 'http://localhost:5000'; // Use local backend for local development
}

window.API_BASE_URL = apiBase;
