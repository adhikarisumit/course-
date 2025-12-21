#!/usr/bin/env node

/**
 * Database Setup Script
 * Ensures admin user exists after database operations
 * Run this after migrations, resets, or deployments
 */

const { execSync } = require('child_process')

function setupDatabase() {
  console.log('🔧 Setting up database...')

  try {
    // Create admin user (this is the most critical part)
    console.log('👤 Ensuring admin user exists...')
    execSync('npx tsx scripts/create-admin.ts', { stdio: 'inherit' })

    console.log('✅ Database setup complete!')
    console.log('🔑 Admin credentials are ready and will persist through resets.')

  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase }