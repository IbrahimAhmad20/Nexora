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
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── vendor.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── validation.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── vendor.model.js
│   │   └── order.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── vendor.routes.js
│   │   └── user.routes.js
│   ├── utils/
│   │   └── error.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── products.js
│   │   ├── vendor.js
│   │   ├── admin.js
│   │   └── main.js
│   └── index.html
└── README.md
```

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