# 🎓 Student Portal - Quick Start Guide

## ✅ What's Been Installed

Your website now has a complete student portal with:

- **Authentication System** (Sign in/Sign up with email + OAuth)
- **Course Management** (Free and paid courses)
- **Student Dashboard** (Track progress and enrolled courses)
- **Payment Integration** (Stripe for paid courses)
- **Protected Routes** (Automatic access control)

## 🚀 Getting Started

### 1. Start the Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

### 2. Create Your First Account

1. Go to http://localhost:3000/auth/signup
2. Enter your details:
   - Name: Your Name
   - Email: your@email.com
   - Password: minimum 8 characters
3. Click "Create account"
4. You'll be automatically logged in!

### 3. Add Test Courses

Open Prisma Studio to add courses:

```bash
pnpm prisma studio
```

This opens a database GUI at http://localhost:5555

#### Create a Free Course:
Click "Course" → "Add record":
- title: "Introduction to Web Development"
- description: "Learn HTML, CSS, and JavaScript basics"
- price: 0
- isPaid: false ✓ (uncheck)
- isPublished: true ✓ (check)
- category: "Web Development"
- level: "beginner"
- duration: "5 hours"

Save and add some lessons!

#### Create a Paid Course:
Same steps but:
- price: 49.99
- isPaid: true ✓ (check)

### 4. Test the Features

**As a Visitor:**
- ✓ Browse courses at `/courses`
- ✓ See course details
- ✓ Redirected to sign-in for paid courses

**As a Logged-in Student:**
- ✓ Enroll in free courses instantly
- ✓ See paid course enrollment page
- ✓ Access student dashboard at `/portal/dashboard`
- ✓ Track course progress

## 📁 Key Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/courses` | Browse all courses |
| `/courses/[id]` | Course details |
| `/courses/[id]/enroll` | Enroll/payment page |
| `/auth/signin` | Sign in |
| `/auth/signup` | Sign up |
| `/portal/dashboard` | Student dashboard (protected) |

## ⚙️ Configuration

### Required Environment Variables

Already set in your `.env` file:

```env
# Database (SQLite - ready to use)
DATABASE_URL="file:./prisma/dev.db"

# NextAuth (required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="changeme-generate-a-random-secret-key-here"
```

### Generate Secure Secret

On Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy the output and update `NEXTAUTH_SECRET` in `.env`

### Optional: Enable Stripe Payments

For paid courses, add to `.env`:

```env
STRIPE_SECRET_KEY="sk_test_your_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_key"
STRIPE_WEBHOOK_SECRET="whsec_your_secret"
```

Get keys from https://dashboard.stripe.com/test/apikeys

### Optional: Enable OAuth

**Google OAuth:**
```env
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"
```

**GitHub OAuth:**
```env
GITHUB_ID="your-client-id"
GITHUB_SECRET="your-client-secret"
```

## 🎨 Customization

### Update Header Navigation

File: `components/header.tsx`
- Already includes user menu with avatar
- Shows "Sign In/Sign Up" when logged out
- Shows user dropdown when logged in

### Customize Course Cards

Files:
- `app/courses/page.tsx` - Course listing
- `app/courses/[id]/page.tsx` - Course details

### Modify Dashboard

File: `app/portal/dashboard/page.tsx`
- Shows enrolled courses
- Displays progress statistics
- Easy to add more widgets

## 📊 Database Management

### View Data
```bash
pnpm prisma studio
```

### Reset Database
```bash
pnpm prisma migrate reset
```

### Create Migrations (after schema changes)
```bash
pnpm prisma migrate dev --name your_change_name
```

## 🧪 Testing Flow

### Test Authentication:
1. Sign up → Auto logged in → Redirected to dashboard
2. Sign out → Can still browse courses
3. Try to access `/portal/dashboard` → Redirected to sign-in

### Test Course Enrollment:
1. Create a free course in Prisma Studio
2. Browse to `/courses`
3. Click course → Click "Start Free Course"
4. Check dashboard → Course appears!

### Test Paid Course Flow:
1. Create a paid course (isPaid: true, price: 49.99)
2. Click course → Redirected to enrollment page
3. See price and "Proceed to Payment" button
4. (Payment works when Stripe is configured)

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt
- ✅ Session management with NextAuth
- ✅ Protected routes with middleware
- ✅ CSRF protection
- ✅ SQL injection prevention (Prisma)

## 📱 What Works Out of the Box

- [x] User registration and login
- [x] OAuth social login (Google, GitHub)
- [x] Course browsing (public)
- [x] Course enrollment
- [x] Student dashboard
- [x] Progress tracking
- [x] Responsive design
- [x] Dark/light mode
- [x] Payment integration (Stripe)

## 🚧 Optional Enhancements

Consider adding:
- [ ] Email verification
- [ ] Password reset
- [ ] Course certificates
- [ ] Video lessons
- [ ] Quizzes and assessments
- [ ] Discussion forums
- [ ] Admin panel
- [ ] Course reviews

## 🐛 Troubleshooting

**"Invalid credentials" error:**
- Check email/password are correct
- Password must be at least 8 characters

**Can't access dashboard:**
- Make sure you're logged in
- Check middleware is working

**Course not showing:**
- Verify `isPublished` is checked in Prisma Studio
- Refresh the page

**Prisma errors:**
- Run `pnpm prisma generate`
- Check DATABASE_URL in .env

## 📚 File Structure

```
app/
├── auth/              # Authentication pages
│   ├── signin/
│   └── signup/
├── courses/           # Course pages
│   ├── page.tsx       # List all courses
│   └── [id]/
│       ├── page.tsx   # Course details
│       └── enroll/    # Payment page
├── portal/            # Student portal
│   ├── dashboard/     # Main dashboard
│   └── layout.tsx     # Protected layout
└── api/               # API routes
    ├── auth/          # Auth endpoints
    ├── checkout/      # Stripe checkout
    └── webhooks/      # Stripe webhooks

prisma/
├── schema.prisma      # Database schema
└── dev.db            # SQLite database

components/
├── header.tsx         # Updated with auth
└── auth-provider.tsx  # Session provider
```

## 🎉 You're All Set!

Your student portal is ready to use. Start by:

1. ✅ Starting the dev server: `pnpm dev`
2. ✅ Creating a test account
3. ✅ Adding a course via Prisma Studio
4. ✅ Testing enrollment

## 💡 Pro Tips

- Use Prisma Studio for quick database management
- Check `STUDENT_PORTAL_SETUP.md` for detailed docs
- Environment variables are in `.env`
- All passwords are securely hashed
- OAuth is optional - email auth works out of the box

## 🆘 Need Help?

- Check logs in terminal
- Open Prisma Studio to inspect database
- Review `STUDENT_PORTAL_SETUP.md` for details
- Test with free courses first

---

**Happy Teaching! 🎓**
