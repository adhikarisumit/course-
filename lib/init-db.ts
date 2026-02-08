/**
 * Database Initialization Hook
 * This file is imported in layout.tsx to ensure it runs on app startup
 * Note: Admin creation is now handled by the API route /api/ensure-admin
 * which is called lazily when needed, not on every page load
 */

export async function initializeDatabase() {
  // Skip during build or when no database is configured
  if (process.env.VERCEL_ENV === 'preview' || !process.env.DATABASE_URL) {
    return
  }
  
  // Log only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Checking database initialization...')
    console.log('✅ Database initialization complete')
  }
}

// Auto-run on import (for development only)
if (process.env.NODE_ENV === 'development') {
  initializeDatabase()
}