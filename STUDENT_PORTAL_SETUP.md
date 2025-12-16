# Student Portal Setup Guide

## Overview
A complete student portal has been added to your website with authentication, course enrollment, and payment processing.

## Features Implemented

### 1. **Authentication System**
- ✅ Email/Password sign up and sign in
- ✅ OAuth providers (Google, GitHub)
- ✅ Protected routes with middleware
- ✅ Session management with NextAuth.js

### 2. **Database Schema**
- ✅ User accounts and profiles
- ✅ Course management
- ✅ Lesson tracking
- ✅ Enrollment system
- ✅ Payment records
- ✅ Progress tracking

### 3. **Student Portal**
- ✅ Personal dashboard
- ✅ Enrolled courses view
- ✅ Progress tracking
- ✅ Course statistics

### 4. **Course Management**
- ✅ Public course listing
- ✅ Course detail pages
- ✅ Lesson curriculum
- ✅ Free and paid courses
- ✅ Enrollment system

### 5. **Payment Integration**
- ✅ Stripe payment processing
- ✅ Secure checkout
- ✅ Webhook handling for enrollment
- ✅ Payment status tracking

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Then fill in the required values:

```env
# Database (already configured for SQLite)
DATABASE_URL="file:./dev.db"

# NextAuth - REQUIRED
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# OAuth Providers - OPTIONAL
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Stripe - REQUIRED for paid courses
STRIPE_SECRET_KEY="sk_test_your-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
```

### 2. Generate NextAuth Secret

```bash
# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# On Linux/Mac:
openssl rand -base64 32
```

### 3. Set Up Stripe (for paid courses)

1. Create a Stripe account at https://stripe.com
2. Get your API keys from https://dashboard.stripe.com/test/apikeys
3. Set up webhook endpoint:
   - URL: `http://localhost:3000/api/webhooks/stripe` (development)
   - Events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy the webhook signing secret

### 4. Optional: OAuth Providers

#### Google OAuth:
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Google+ API
4. Create OAuth credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth:
1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### 5. Database Setup

The database is already created. To reset or migrate:

```bash
# Reset database
pnpm prisma migrate reset

# Create new migration
pnpm prisma migrate dev --name your-migration-name

# Open Prisma Studio to manage data
pnpm prisma studio
```

### 6. Run the Development Server

```bash
pnpm dev
```

Visit:
- Homepage: http://localhost:3000
- Courses: http://localhost:3000/courses
- Sign In: http://localhost:3000/auth/signin
- Sign Up: http://localhost:3000/auth/signup
- Dashboard: http://localhost:3000/portal/dashboard

## Adding Courses

You can add courses through Prisma Studio:

```bash
pnpm prisma studio
```

Or create a seed file:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.course.create({
    data: {
      title: "Introduction to Web Development",
      description: "Learn the basics of web development",
      price: 49.99,
      isPaid: true,
      isPublished: true,
      category: "Web Development",
      level: "beginner",
      duration: "10 hours",
      lessons: {
        create: [
          {
            title: "Getting Started",
            description: "Introduction to the course",
            content: "Welcome to the course!",
            order: 1,
            isFree: true, // Free preview lesson
          },
          // Add more lessons...
        ],
      },
    },
  })
}

main()
```

Run the seed:
```bash
pnpm prisma db seed
```

## File Structure

```
app/
├── auth/
│   ├── signin/page.tsx          # Sign in page
│   └── signup/page.tsx          # Sign up page
├── portal/
│   ├── dashboard/page.tsx       # Student dashboard
│   └── layout.tsx               # Protected layout
├── courses/
│   ├── page.tsx                 # Course listing
│   └── [id]/
│       ├── page.tsx             # Course details
│       └── enroll/page.tsx      # Enrollment/payment
├── api/
│   ├── auth/
│   │   ├── register/route.ts   # Registration API
│   │   └── [...nextauth]/route.ts
│   ├── checkout/route.ts        # Stripe checkout
│   └── webhooks/
│       └── stripe/route.ts      # Stripe webhooks
prisma/
├── schema.prisma                # Database schema
└── migrations/                  # Database migrations
lib/
└── prisma.ts                    # Prisma client
auth.ts                          # NextAuth configuration
middleware.ts                    # Route protection
```

## Key Routes

### Public Routes
- `/` - Homepage
- `/courses` - Browse all courses
- `/auth/signin` - Sign in
- `/auth/signup` - Sign up

### Protected Routes (require authentication)
- `/portal/dashboard` - Student dashboard
- `/courses/[id]` - Course details (paid courses)
- `/courses/[id]/enroll` - Course enrollment

## Testing

### Test the Authentication:
1. Go to `/auth/signup`
2. Create an account
3. You'll be auto-signed in and redirected to dashboard

### Test Course Enrollment:
1. Add a free course via Prisma Studio (set `isPaid: false`)
2. Visit the course page
3. Click "Start Free Course"
4. Check enrollment in dashboard

### Test Stripe Payment (Test Mode):
1. Add a paid course via Prisma Studio
2. Visit `/courses/[course-id]/enroll`
3. Click "Proceed to Payment"
4. Use Stripe test card: `4242 4242 4242 4242`
5. After payment, check webhook logs

## Production Deployment

### Vercel Deployment:

1. **Update environment variables** on Vercel:
   - Add all `.env` variables
   - Update `NEXTAUTH_URL` to your production domain

2. **Update Stripe webhook**:
   - Production URL: `https://yourdomain.com/api/webhooks/stripe`

3. **Database**: Consider upgrading to PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```
   Use services like:
   - Neon (https://neon.tech)
   - Supabase (https://supabase.com)
   - Railway (https://railway.app)

## Troubleshooting

### Common Issues:

1. **NextAuth error**: Make sure `NEXTAUTH_SECRET` is set
2. **Database errors**: Run `pnpm prisma generate`
3. **Stripe webhook not working**: Check webhook secret and events
4. **OAuth not working**: Verify redirect URIs match exactly

## Next Steps

1. ✅ Set up environment variables
2. ✅ Add your first course via Prisma Studio
3. ✅ Test authentication flow
4. ✅ Configure Stripe for payments
5. ⬜ Customize course content and styling
6. ⬜ Add email notifications
7. ⬜ Create admin panel for course management

## Support

For questions or issues:
- Check Prisma docs: https://www.prisma.io/docs
- NextAuth docs: https://authjs.dev
- Stripe docs: https://stripe.com/docs

---

**Your student portal is ready to use! 🎉**
