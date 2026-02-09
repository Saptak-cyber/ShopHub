# Quick Setup Guide

Follow these steps to get your ecommerce app running locally.

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up PostgreSQL Database

You have several options:

### Option A: Local PostgreSQL
```bash
# Install PostgreSQL if you haven't
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Create database
createdb ecommerce

# Your DATABASE_URL will be:
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"
```

### Option B: Supabase (Recommended - Free Tier)
1. Go to https://supabase.com
2. Create a new project
3. Get connection string from Settings > Database
4. Use the "Connection String" (URI format)

### Option C: Neon (Free Tier)
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string

## 3. Create Environment File

Create `.env` in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"

# NextAuth (run: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secret-nextauth-key-change-this"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional - see GOOGLE_OAUTH_SETUP.md for instructions)
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"

# Stripe Test Keys (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Legacy JWT (used for backward compatibility)
JWT_SECRET="your-super-secret-jwt-key-change-this"
```

**Note**: Google OAuth is optional. If you want to enable "Sign in with Google", follow the detailed guide in [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md).

## 4. Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:migrate

# Seed with sample data (12 products, 2 users)
npm run prisma:seed
```

## 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 6. Test the Application

### Login Options

**Option 1: Google OAuth (if configured)**
- Click "Sign in with Google" on login/register pages
- Choose your Google account
- Automatically creates your account

**Option 2: Email/Password (After Seeding)**

**Admin Account**:
- Email: admin@example.com
- Password: admin123

**Regular User**:
- Email: user@example.com
- Password: user123

### Test Stripe Payment

Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

Any future expiration date, any 3-digit CVC, any postal code.

## 7. Explore Features

### As a Customer:
1. Browse products at `/products`
2. Add items to cart
3. Proceed to checkout
4. Complete payment with test card
5. View order history at `/orders`

### As an Admin:
1. Login with admin credentials
2. Go to `/admin`
3. View dashboard statistics
4. Manage products (create, edit, delete)
5. Manage orders (update status)

## Common Issues

### "Can't reach database server"
- Check if PostgreSQL is running
- Verify DATABASE_URL is correct
- Ensure database exists

### "Module '@prisma/client' not found"
- Run: `npm run prisma:generate`

### Stripe payment fails
- Verify Stripe keys are correct (test keys start with sk_test_ and pk_test_)
- Check browser console for errors
- Ensure you're using a test card number

### Admin panel shows "Unauthorized"
- Make sure you're logged in with admin@example.com
- Check the isAdmin flag in database

## Next Steps

1. ✅ Replace placeholder product images with real images
2. ✅ Set up Stripe webhook for local development
3. ✅ Customize branding (logo, colors, etc.)
4. ✅ Add more products via admin panel
5. ✅ Test all features thoroughly
6. ✅ Prepare for deployment (see DEPLOYMENT.md)

## Need Help?

- Check README.md for detailed documentation
- Review DEPLOYMENT.md for production deployment
- Check the database with: `npm run prisma:studio`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View linting errors
npm run lint
```

Happy coding! 🚀
