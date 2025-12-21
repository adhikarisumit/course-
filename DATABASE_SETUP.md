# Database Setup & Admin Management

## 🔐 Admin Credentials Protection

**✅ SOLVED**: Admin credentials are now **automatically preserved** through database resets and deployments.

### How It Works

1. **Admin Creation**: Uses `upsert` operation - creates if doesn't exist, updates if exists
2. **Automatic Setup**: Runs after any database operation (`db:reset`, `db:migrate`, `postinstall`)
3. **Consistent Credentials**:
   - Email: `sumitadhikari2341@gmail.com`
   - Password: `C242N012b..`
   - Role: `admin`

## 🚀 Quick Setup

### First Time Setup
```bash
npm install
npm run setup-db
```

### Database Reset (Safe - Admin Preserved)
```bash
npm run db:reset
```

### Migration (Safe - Admin Preserved)
```bash
npm run db:migrate
```

### Full Seeding
```bash
npm run seed
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run create-admin` | Create/update admin user manually |
| `npm run setup-db` | Setup database and ensure admin exists |
| `npm run db:reset` | Reset database and recreate admin |
| `npm run db:migrate` | Run migrations and ensure admin exists |
| `npm run seed` | Run all seeding scripts |

## 🔑 Admin Access

After any database operation, admin credentials are guaranteed to be available:

- **Email**: sumitadhikari2341@gmail.com
- **Password**: C242N012b..
- **Role**: admin

## 🛡️ Safety Features

1. **Upsert Operation**: Admin user is created if missing, updated if exists
2. **Post-Operation Hook**: Admin creation runs after `db:reset`, `db:migrate`, `postinstall`
3. **Error Handling**: Setup continues even if seeding fails
4. **Consistent Data**: Admin always has correct role and permissions

## 📁 File Structure

```
scripts/
├── create-admin.ts      # Admin user creation logic
├── setup-db.js          # Database setup orchestrator
├── seed.ts              # Main seeding script
├── seed-resources.ts    # Resource seeding
└── check-mentors.ts     # Mentor checking
```

## 🔧 Manual Admin Creation

If you need to recreate admin manually:

```bash
npm run create-admin
```

This will output the credentials and ensure the admin user exists.

## 🚨 Important Notes

- Admin credentials are hardcoded for consistency
- Never commit real credentials to version control
- The setup scripts ensure admin access is always available
- Database resets are now safe - admin will always be recreated