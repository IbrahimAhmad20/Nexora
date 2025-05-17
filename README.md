# Nexora Marketplace

A modern e-commerce platform that connects vendors with customers, providing a seamless shopping experience.

## Features

- User authentication and authorization
- Vendor management and product listing
- Shopping cart functionality
- Order management
- Admin dashboard
- Responsive design
- **Two-Factor Authentication (TOTP, Google Authenticator compatible) for all user roles**
- **Vendor logo upload and modern profile/settings UI**

## Tech Stack

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Express Validator
- **speakeasy** (TOTP 2FA)
- **qrcode** (QR code generation)

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Font Awesome Icons

## Project Structure

```
nexora/
├── backend/
│   ├── config/
│   │   ├── db.js                  # DB connection logic
│   │   └── db.config.js           # DB config (host, user, pass, etc)
│   ├── controllers/
│   │   ├── admin.controller.js    # Admin logic
│   │   ├── auth.controller.js     # Auth logic
│   │   ├── product.controller.js  # Product logic
│   │   ├── user.controller.js     # User logic
│   │   ├── vendor.controller.js   # Vendor logic
│   │   └── order.controller.js    # Order logic
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT, role checks
│   │   ├── admin.middleware.js    # Admin-specific checks
│   │   └── validation.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── vendor.model.js
│   │   ├── order.model.js
│   │   └── category.model.js
│   ├── routes/
│   │   ├── admin.routes.js        # /api/admin/*
│   │   ├── auth.routes.js         # /api/auth/*
│   │   ├── product.routes.js      # /api/products/*
│   │   ├── user.routes.js         # /api/users/*
│   │   ├── vendor.routes.js       # /api/vendor/*
│   │   └── order.routes.js        # /api/orders/*
│   ├── utils/
│   │   ├── error.js
│   │   └── helpers.js
│   ├── database/
│   │   └── schema.sql             # MySQL schema
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── server.js                  # Express app entry point
├── frontend/
│   ├── css/
│   │   ├── style.css              # Shared styles
│   │   ├── admin-dashboard.css
│   │   ├── admin-products.css
│   │   ├── admin-users.css
│   │   ├── admin-vendors.css
│   │   ├── vendor-dashboard.css
│   │   ├── user-dashboard.css
│   │   └── ...
│   ├── js/
│   │   ├── api.js                 # API utility
│   │   ├── admin-products.js      # Admin product logic
│   │   ├── admin-dashboard.js
│   │   ├── admin-users.js
│   │   ├── admin-vendors.js
│   │   ├── vendor-dashboard.js
│   │   ├── user-dashboard.js
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── products.js
│   │   ├── vendor.js
│   │   ├── user.js
│   │   └── main.js                # Shared JS
│   ├── admin-products.html        # Admin product management UI
│   ├── admin-dashboard.html       # Admin dashboard UI
│   ├── admin-users.html           # Admin user management UI
│   ├── admin-vendors.html         # Admin vendor management UI
│   ├── vendor-dashboard.html      # Vendor dashboard UI
│   ├── user-dashboard.html        # User dashboard UI
│   ├── index.html                 # Main landing page
│   ├── login.html                 # Login page
│   ├── register.html              # Registration page
│   ├── product-details.html       # Product details
│   ├── cart.html                  # Shopping cart
│   ├── orders.html                # Orders page
│   └── ...
└── README.md
```

- **backend/**: All server-side code, API routes, database, and business logic.
  - **controllers/**: Route handler logic for each resource.
  - **middleware/**: Auth, validation, and admin checks.
  - **models/**: DB models (if using ORM or for structure).
  - **routes/**: Express route definitions.
  - **utils/**: Helper functions, error handling.
  - **database/**: SQL schema and migrations.
- **frontend/**: All static files, HTML, CSS, and JS for admin, vendor, and user UIs.
  - **css/**: Styles for each major page/role.
  - **js/**: Scripts for each major page/role and shared utilities.
  - **admin-***, **vendor-***, **user-***: HTML pages for each role's dashboard and management.
  - **index.html**: Main landing page.
  - **login.html**, **register.html**: Auth pages.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nexora.git
   cd nexora
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   # Also install TOTP/QR dependencies if not present
   npm install speakeasy qrcode
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials and JWT secret

4. Set up the database:
   - Create a MySQL database
   - Import the schema from `backend/database/schema.sql`
   - **Apply the following migrations if not present:**
     ```sql
     ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT 0;
     ALTER TABLE users ADD COLUMN totp_secret VARCHAR(64);
     ALTER TABLE vendor_profiles ADD COLUMN logo_url VARCHAR(255) DEFAULT NULL;
     ALTER TABLE vendor_profiles ADD COLUMN store_status VARCHAR(20) DEFAULT 'open';
     ALTER TABLE vendor_profiles ADD COLUMN vacation_message TEXT;
     ALTER TABLE vendor_profiles ADD COLUMN notify_on_return BOOLEAN DEFAULT 0;
     ALTER TABLE vendor_profiles ADD COLUMN shipping_policy TEXT;
     ALTER TABLE vendor_profiles ADD COLUMN return_policy TEXT;
     ALTER TABLE vendor_profiles ADD COLUMN privacy_policy TEXT;
     ```

5. Start the backend server:
   ```bash
   npm start
   npm run dev
   ```

6. Open the frontend:
   - Open `frontend/index.html` in your browser
   - Or serve it using a local server

## API Documentation

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/verify` - Verify JWT token
- POST `/api/auth/2fa/setup` - Generate TOTP secret and QR code (requires auth)
- POST `/api/auth/2fa/verify-setup` - Verify TOTP code and enable 2FA (requires auth)
- POST `/api/auth/2fa/verify` - Verify TOTP code during login
- POST `/api/auth/2fa/disable` - Disable 2FA (requires auth)

### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get product details
- POST `/api/products` - Create new product (vendor)
- PUT `/api/products/:id` - Update product (vendor)
- DELETE `/api/products/:id` - Delete product (vendor)

### Vendors
- GET `/api/vendor/profile` - Get vendor profile
- PUT `/api/vendor/profile` - Update vendor profile
- POST `/api/vendor/logo` - Upload vendor logo
- GET `/api/vendor/logo` - Get vendor logo
- GET `/api/vendors` - Get all vendors
- GET `/api/vendors/:id` - Get vendor details
- GET `/api/vendors/:id/products` - Get vendor products
- GET `/api/vendors/:id/orders` - Get vendor orders

### Users
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile
- PUT `/api/users/password` - Change password

### Cart
- GET `/api/cart` - Get cart items
- POST `/api/cart` - Add item to cart
- PUT `/api/cart/:id` - Update cart item
- DELETE `/api/cart/:id` - Remove cart item

### Orders
- POST `/api/orders` - Create new order
- GET `/api/orders` - Get user orders
- GET `/api/orders/:id` - Get order details
- PUT `/api/orders/:id/status` - Update order status

## Two-Factor Authentication (2FA)

- **Available for all user roles (vendor, admin, customer).**
- Uses TOTP (Google Authenticator, Authy, etc.).
- To enable: Go to your profile/security settings, click "Enable 2FA", scan the QR code, and enter the code from your app.
- On login, if 2FA is enabled, you will be prompted for a 6-digit code after entering your password.
- To disable: Uncheck the 2FA box in your profile/security settings.

## Vendor Features
- Upload and update store logo
- Modern, responsive profile/settings UI
- Store policies and availability management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/nexora 

# Nexora Marketplace Admin Panel

## Overview
This project is a full-stack admin/vendor/user management system for the Nexora marketplace, built with:
- **Backend:** Node.js/Express, MySQL
- **Frontend:** Vanilla JS, HTML, CSS

## Features
- Admin dashboard with stats and navigation
- User, vendor, product, and category management
- Add, edit, delete, and search for products, users, and vendors
- Category assignment for products
- JWT-based authentication

## API Endpoints
- **Products (Admin):**
  - `GET    /api/admin/products` (list, paginated)
  - `PUT    /api/admin/products/:id` (update)
- **Categories (Admin):**
  - `GET    /api/admin/categories` (list)
- **Users, Vendors, Orders:** See respective routes in backend

## Local Development Setup

### 1. **Backend**
- Start the backend server (default: `http://localhost:5000`).
- Ensure your `.env` has the correct `JWT_SECRET` and DB credentials.

### 2. **Frontend**
- Open `frontend/admin-products.html` in your browser (served via a dev server or directly).
- **API calls must point to the backend on port 5000.**
- If you use vanilla JS/HTML, you must use the full backend URL in fetch requests (e.g., `http://localhost:5000/api/admin/products`).
- If you use React or another framework, set up a proxy (see below).

### 3. **Proxy Setup (for React or Vite projects)**
- **React (Create React App):** Add this to `package.json`:
  ```json
  "proxy": "http://localhost:5000"
  ```
- **Vite:** In `vite.config.js`:
  ```js
  server: { proxy: { '/api': 'http://localhost:5000' } }
  ```
- **Vanilla JS/HTML:** Use the full backend URL in fetch requests.

## Troubleshooting

### 404 Not Found
- Check that your frontend is calling the correct endpoint (e.g., `/api/admin/products` not `/api/products` if using admin routes).
- Make sure the backend server is running on port 5000.

### 403 Forbidden / Insufficient Permissions
- Ensure you are sending the JWT token in the `Authorization` header: `Bearer <token>`.
- Make sure you are logged in as an admin for admin routes.

### CORS Issues
- The backend enables CORS for `http://localhost:3000` by default. Adjust as needed in `server.js`.

### Product List Not Updating
- After editing a product, the frontend should call `loadProducts()` to refresh the table.

### Category Dropdown Not Populating
- Make sure the frontend fetches from `/api/admin/categories` and sends the JWT token.
- Ensure categories exist in the database.

## Deployment
- In production, use **relative URLs** (e.g., `/api/admin/products`) in your frontend code.
- Set up a reverse proxy (Nginx, Apache, or cloud provider) to forward `/api` requests to your backend server.
- Ensure environment variables and CORS settings are production-ready.

## Contact
For help, open an issue or contact the Nexora dev team. 