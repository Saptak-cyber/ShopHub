# Authentication Migration Fixes

## Issue Summary
After migrating from JWT-based authentication to NextAuth.js, there were two main issues:

1. **Google OAuth Account Selection**: Always showing the same Google account instead of allowing users to choose
2. **API Routes Failing**: Orders API and other protected routes returning 500 errors due to old JWT auth

## Fixes Applied

### 1. Google OAuth Configuration

**File**: `lib/auth.config.ts`

**Change**: Updated OAuth prompt from `"consent"` to `"select_account"`

```typescript
Google({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      prompt: "select_account", // Always show account selector
      access_type: "offline",
      response_type: "code"
    }
  }
})
```

**Why**: `prompt: "select_account"` forces Google to always show the account selection screen, preventing account caching.

### 2. API Routes Migration (JWT → NextAuth Sessions)

All API routes were updated to use NextAuth's `auth()` function instead of the old `requireAuth` and `requireAdmin` JWT middleware.

#### Updated Routes:

**Orders**:
- ✅ `/api/orders/route.ts` (GET, POST)
- ✅ `/api/orders/[id]/route.ts` (GET)
- ✅ `/api/orders/[id]/status/route.ts` (PATCH)
- ✅ `/api/orders/stats/route.ts` (GET)

**Products**:
- ✅ `/api/products/route.ts` (POST)
- ✅ `/api/products/[id]/route.ts` (PUT, DELETE)

**Stripe**:
- ✅ `/api/stripe/create-payment-intent/route.ts` (POST)

**Profile**:
- ✅ `/api/auth/profile/route.ts` (GET, PATCH)

#### Migration Pattern:

**Before** (JWT):
```typescript
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  // ... use user.id
}
```

**After** (NextAuth):
```typescript
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // ... use session.user.id
}
```

**Admin routes**:
```typescript
if (!session?.user?.isAdmin) {
  return NextResponse.json(
    { success: false, message: 'Unauthorized - Admin access required' },
    { status: 403 }
  );
}
```

### 3. Client-Side Updates

#### API Client (`lib/api-client.ts`)

**Before**: Manually added JWT token to Authorization header
```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**After**: Use cookie-based sessions (automatic)
```typescript
const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Include cookies for NextAuth session
});
```

#### Admin Layout (`app/admin/layout.tsx`)

**Before**: Checked localStorage for token and user
```typescript
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');
const user = JSON.parse(userStr);
```

**After**: Use NextAuth session
```typescript
const { data: session, status } = useSession();

useEffect(() => {
  if (status === 'unauthenticated') {
    router.push('/login');
  } else if (status === 'authenticated' && !session?.user?.isAdmin) {
    router.push('/');
  }
}, [status, session, router]);
```

#### Orders Page (`app/orders/page.tsx`)

**Before**: Checked localStorage for token
```typescript
const token = localStorage.getItem('token');
if (!token) {
  router.push('/login');
}
```

**After**: Use NextAuth session
```typescript
const { data: session, status } = useSession();

useEffect(() => {
  if (status === 'unauthenticated') {
    router.push('/login');
    return;
  }
  
  if (status === 'authenticated') {
    fetchOrders();
  }
}, [status, router, searchParams]);
```

### 4. Documentation Updates

**File**: `GOOGLE_OAUTH_SETUP.md`

Added comprehensive troubleshooting section for account selection issues:
- Clear browser cache solution
- Incognito mode instructions
- Google account permissions management
- Test users configuration for apps in testing mode

## Testing Checklist

- [ ] Sign in with different Google accounts
- [ ] Verify account selector appears every time
- [ ] Test all order operations (view, create)
- [ ] Test admin dashboard access
- [ ] Test product CRUD operations (admin only)
- [ ] Test Stripe payment flow
- [ ] Verify profile page works
- [ ] Test sign out functionality

## Why These Changes Were Necessary

1. **Security**: NextAuth.js uses HTTP-only cookies which are more secure than storing JWT tokens in localStorage
2. **Standard Pattern**: NextAuth is the industry standard for Next.js authentication
3. **OAuth Management**: Better handling of OAuth flows and token refresh
4. **Session Management**: Automatic session validation and refresh

## Breaking Changes

- ⚠️ All existing JWT tokens in localStorage are now invalid
- ⚠️ Users will need to log in again after this update
- ⚠️ Admin middleware changed from `requireAdmin(request)` to checking `session.user.isAdmin`

## Migration Notes for Future Development

When adding new authenticated routes:

1. **Import auth**: `import { auth } from '@/lib/auth';`
2. **Check session**: 
   ```typescript
   const session = await auth();
   if (!session?.user) return 401;
   ```
3. **Admin check**: 
   ```typescript
   if (!session?.user?.isAdmin) return 403;
   ```
4. **No more**: `requireAuth` or `requireAdmin` functions
5. **No more**: localStorage token management
