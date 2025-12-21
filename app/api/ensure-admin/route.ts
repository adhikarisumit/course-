import { NextRequest, NextResponse } from 'next/server'
import { ensureAdminExists } from '../../../scripts/setup-db'

/**
 * API endpoint to ensure admin user exists
 * This can be called from client-side to guarantee admin persistence
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Ensuring admin user exists via API...')

    const success = ensureAdminExists()

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Admin user ensured to exist'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to ensure admin user exists'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error ensuring admin exists:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}