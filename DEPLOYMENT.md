# Deployment Guide

This guide covers deploying your ShopHub ecommerce application to production.

## Prerequisites

- GitHub account
- Vercel account
- PostgreSQL database (Supabase, Neon, or Railway)
- Stripe account with live API keys

## Option 1: Deploy to Vercel + Supabase (Recommended)

### Step 1: Set Up Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once created, go to Project Settings > Database
3. Copy the "Connection String" (URI format)
4. Your DATABASE_URL will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

### Step 2: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:

```env
DATABASE_URL=<your-supabase-connection-string>
JWT_SECRET=<generate-a-random-secure-string>
STRIPE_SECRET_KEY=<your-live-stripe-secret-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-live-stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=<leave-empty-for-now>
```

5. Click "Deploy"

### Step 4: Run Database Migrations

After deployment, you need to run migrations. You can do this locally:

```bash
# Set DATABASE_URL to your production database
DATABASE_URL="<your-supabase-connection-string>" npx prisma migrate deploy

# Seed the database
DATABASE_URL="<your-supabase-connection-string>" npm run prisma:seed
```

### Step 5: Set Up Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the "Signing secret"
6. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
7. Redeploy your app in Vercel

## Option 2: Deploy to Railway

Railway provides both app hosting and PostgreSQL database in one place.

### Step 1: Create Railway Account

1. Go to [Railway](https://railway.app) and sign in with GitHub
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your repository

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" > "PostgreSQL"
3. Copy the connection string from the PostgreSQL service

### Step 3: Configure Environment Variables

In your Next.js service settings, add:

```env
DATABASE_URL=<railway-postgres-connection-string>
JWT_SECRET=<generate-a-random-secure-string>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
```

### Step 4: Deploy

Railway will automatically deploy your app. After deployment:

1. Run migrations via Railway CLI or your local terminal
2. Set up Stripe webhooks pointing to your Railway URL

## Environment Variables Explained

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `DATABASE_URL` | PostgreSQL connection string | Your database provider |
| `JWT_SECRET` | Secret key for JWT tokens | Generate with: `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | Stripe API secret key | [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks) |

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Test product browsing and search
- [ ] Test adding products to cart
- [ ] Test checkout with Stripe test cards
- [ ] Verify webhook is receiving events
- [ ] Test admin login
- [ ] Test creating/editing products as admin
- [ ] Test updating order statuses
- [ ] Check database is populating correctly
- [ ] Verify all environment variables are set
- [ ] Set up custom domain (optional)
- [ ] Enable production mode in Stripe
- [ ] Set up monitoring (Vercel Analytics, Sentry, etc.)

## Troubleshooting

### Database Connection Issues

**Error**: "Can't reach database server"

**Solution**: 
- Verify DATABASE_URL is correct
- Check if your database is running
- Ensure IP whitelisting (if required by your provider)

### Stripe Webhook Not Working

**Error**: Webhook signature verification failed

**Solution**:
- Verify STRIPE_WEBHOOK_SECRET matches the one in Stripe Dashboard
- Ensure webhook URL is correct (https://your-app.com/api/stripe/webhook)
- Check Stripe webhook logs for detailed error messages

### Prisma Client Not Generated

**Error**: "Cannot find module '@prisma/client'"

**Solution**:
```bash
# Add postinstall script to package.json (already included)
# Vercel will automatically run: prisma generate
```

### 500 Internal Server Error

**Solution**:
- Check Vercel logs for detailed error messages
- Verify all environment variables are set
- Ensure database migrations are up to date

## Scaling Considerations

As your app grows, consider:

1. **Database**: 
   - Enable connection pooling (Prisma supports this)
   - Set up read replicas for heavy read workloads
   - Regular database backups

2. **Caching**:
   - Add Redis for session storage
   - Cache product listings
   - Use CDN for static assets

3. **Monitoring**:
   - Set up error tracking (Sentry)
   - Monitor API performance
   - Set up uptime monitoring

4. **Security**:
   - Enable rate limiting
   - Add CAPTCHA to forms
   - Regular security audits
   - Keep dependencies updated

## Support

For deployment issues:
- Vercel: [Vercel Support](https://vercel.com/support)
- Supabase: [Supabase Docs](https://supabase.com/docs)
- Railway: [Railway Docs](https://docs.railway.app)
- Stripe: [Stripe Support](https://support.stripe.com)
