import { ensureAdminExists } from '../scripts/setup-db'

/**
 * Database Initialization Hook
 * Ensures critical data (like admin user) exists on app startup
 * This runs automatically when the app starts
 */

export async function initializeDatabase() {
  try {
    console.log('🔄 Checking database initialization...')

    // Ensure admin user exists
    const adminCreated = ensureAdminExists()

    if (adminCreated) {
      console.log('✅ Database initialization complete')
    } else {
      console.warn('⚠️  Database initialization had issues')
    }

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    // Don't throw error - allow app to continue
  }
}

// Auto-run on import (for development)
if (process.env.NODE_ENV === 'development') {
  initializeDatabase()
}