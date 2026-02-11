# ShopHub - Production-Ready Ecommerce Application

A full-stack, production-ready ecommerce application built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Prisma**, **PostgreSQL**, and **Stripe** for payments.

## Features

### Customer Features
- 🛍️ Product browsing with search and category filters
- 🛒 Shopping cart with persistent storage
- 💳 Secure checkout with Stripe payment integration
- 📦 Order history and tracking
- 🔐 User authentication (register/login)
- 📱 Fully responsive design
- 🌙 Professional dark theme UI

### Admin Features
- 📊 Dashboard with key metrics and statistics
- 📦 Product management (CRUD operations)
- 📋 Order management with status updates
- 👥 View customer information
- 🔒 Admin-only access with role-based authentication

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Payment**: Stripe React + Stripe.js
- **Icons**: Lucide React

### Backend (Next.js API Routes)
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT tokens
- **Payment**: Stripe SDK
- **Validation**: Zod schemas

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (for payments)

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ecommerce
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 4. Set Up the Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

After seeding the database, you can use these credentials:

### Admin Account
- **Email**: admin@example.com
- **Password**: admin123

### Regular User
- **Email**: user@example.com
- **Password**: user123

## Project Structure

```
/ecommerce
├── app/                      # Next.js App Router
│   ├── api/                  # API routes (backend)
│   │   ├── auth/            # Authentication endpoints
│   │   ├── products/        # Product CRUD
│   │   ├── orders/          # Order management
│   │   └── stripe/          # Payment processing
│   ├── admin/               # Admin dashboard
│   ├── products/            # Product pages
│   ├── cart/                # Shopping cart
│   ├── checkout/            # Checkout flow
│   ├── orders/              # Order history
│   ├── login/               # Login page
│   └── register/            # Registration page
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ProductCard.tsx
├── lib/                     # Utilities and services
│   ├── services/            # Business logic
│   ├── db.ts                # Prisma client
│   ├── auth.ts              # Authentication utilities
│   ├── utils.ts             # Helper functions
│   └── api-client.ts        # Axios client
├── prisma/                  # Database schema and seed
│   ├── schema.prisma
│   └── seed.ts
├── store/                   # Zustand stores
│   └── cart.ts              # Cart state management
└── public/                  # Static assets
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PATCH /api/auth/profile` - Update user profile (protected)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `GET /api/products/categories` - Get all categories

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders` - Get user orders / all orders (admin)
- `GET /api/orders/:id` - Get order by ID (protected)
- `PATCH /api/orders/:id/status` - Update order status (admin only)
- `GET /api/orders/stats` - Get order statistics (admin only)

### Payments
- `POST /api/stripe/create-payment-intent` - Create Stripe payment intent (protected)
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## Database Schema

### User
- id, email, name, password, isAdmin, timestamps

### Product
- id, name, description, price, stock, images, category, featured, timestamps

### Order
- id, userId, total, status, razorpayPaymentId, shippingAddress, timestamps

### OrderItem
- id, orderId, productId, quantity, price

## Razorpay Integration

### Test Cards

For testing payments in Razorpay test mode:

- **Success**: 4111 1111 1111 1111
- **Failure**: 4012 0010 3714 1112
- **Network Failure**: 5104 0600 0000 0008

Use any future expiration date, any CVV, and any cardholder name.

### Webhook Setup

For local development with webhooks:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret to your `.env` file

## Deployment

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Database Hosting

Recommended options:
- **Supabase** (PostgreSQL with generous free tier)
- **Neon** (Serverless PostgreSQL)
- **Railway** (Simple deployment with PostgreSQL)

## Production Checklist

- [ ] Set up production PostgreSQL database
- [ ] Add real Stripe API keys (not test keys)
- [ ] Set strong JWT_SECRET
- [ ] Configure custom domain
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Enable database backups
- [ ] Add rate limiting for API routes
- [ ] Set up CI/CD pipeline
- [ ] Add image hosting (e.g., Cloudinary)
- [ ] Configure email service for order confirmations

## Resume Highlights

This project demonstrates:

- ✅ Full-stack development with Next.js (frontend + backend)
- ✅ TypeScript for type safety
- ✅ RESTful API design with proper HTTP methods
- ✅ Database design and ORM usage (Prisma)
- ✅ Authentication & authorization (JWT, role-based access)
- ✅ Payment processing (Stripe integration)
- ✅ State management (Zustand)
- ✅ Form handling and validation (Zod)
- ✅ Responsive UI design with Tailwind CSS
- ✅ Error handling and user feedback
- ✅ Security best practices
- ✅ Production-ready code structure

## Contributing

This is a personal project for portfolio purposes. Feel free to fork and customize for your own use!

## License

MIT License - feel free to use this project for your portfolio or learning.

## Contact

For any questions or feedback, reach out via:
- GitHub: [Your GitHub]
- LinkedIn: [Your LinkedIn]
- Email: [Your Email]
