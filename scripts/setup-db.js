#!/usr/bin/env node

/**
 * Database Setup Script
 * Ensures admin user exists after database operations
 * Run this after migrations, resets, or deployments
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function setupDatabase() {
  console.log('🔧 Setting up database...')

  // Skip admin creation during Vercel builds - it will be handled at runtime
  if (process.env.VERCEL || process.env.CI) {
    console.log('⏭️  Skipping admin creation during build (will be handled at runtime)')
    console.log('✅ Database setup complete!')
    return
  }

  try {
    // Create admin user (this is the most critical part)
    console.log('👤 Ensuring admin user exists...')
    execSync('npx tsx scripts/create-admin.ts', { stdio: 'inherit' })

    // Create a marker file to indicate admin was created
    const markerPath = path.join(__dirname, '..', '.admin-created')
    fs.writeFileSync(markerPath, new Date().toISOString())

    console.log('✅ Database setup complete!')
    console.log('🔑 Admin user configured from environment variables.')
    console.log('📝 Admin creation marker created.')

  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    // Don't exit with error during build to prevent build failures
    console.log('⚠️  Admin will be created at runtime instead.')
  }
}

// Also create a function to check if admin exists and create if not
function ensureAdminExists() {
  try {
    execSync('npx tsx scripts/create-admin.ts', { stdio: 'pipe' })
    return true
  } catch (error) {
    console.error('Failed to ensure admin exists:', error.message)
    return false
  }
}

if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase, ensureAdminExists }