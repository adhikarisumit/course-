# Super Admin System

## Overview
The super admin user is a critical system user that cannot be deleted and is automatically recreated after database operations.

## Super Admin Credentials
- **Email**: sumitadhikari2341@gmail.com
- **Password**: C242N012b..
- **Role**: admin (super admin)

## Persistence Mechanisms

### 1. Database Schema Protection
The super admin user is protected through multiple layers:

- **Automatic Creation**: The admin user is automatically created/updated on:
  - App startup (via `lib/init-db.ts`)
  - Database setup (via `scripts/setup-db.js`)
  - Manual creation (via `npm run create-admin`)

### 2. Package.json Scripts
All database operations automatically ensure admin exists:
```json
{
  "db:reset": "prisma db push --force-reset --accept-data-loss && npm run setup-db",
  "db:migrate": "prisma migrate dev && npm run setup-db",
  "db:push": "prisma db push && npm run setup-db",
  "postinstall": "prisma generate && npm run setup-db"
}
```

### 3. Runtime Protection
- Admin layout checks and recreates admin user on access
- API endpoint `/api/ensure-admin` for manual verification

## Manual Recovery

If super admin credentials are ever lost:

```bash
# Recreate admin user
npm run create-admin

# Or run full database setup
npm run setup-db

# Or run complete seeding
npm run seed
```

## Security Notes
- The super admin email is hardcoded and cannot be changed
- Password is consistent across all environments
- Admin user is automatically updated with correct credentials on each run
- Admin cannot be frozen or deleted through normal admin interfaces

## Files Involved
- `scripts/create-admin.ts` - Core admin creation logic
- `scripts/setup-db.js` - Database setup with admin creation
- `lib/init-db.ts` - App startup initialization
- `app/api/ensure-admin/route.ts` - Runtime admin verification
- `app/admin/layout.tsx` - Admin access protection
- `package.json` - Automated script hooks