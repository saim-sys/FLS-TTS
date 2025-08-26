import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting database migration...')
    
    // Add balance column to users table if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS balance INTEGER DEFAULT 0
    `
    
    console.log('✅ Balance column added successfully')
    
    // Update existing users to have a default balance if they don't have one
    await prisma.$executeRaw`
      UPDATE users 
      SET balance = 0 
      WHERE balance IS NULL
    `
    
    console.log('✅ Existing users updated with default balance')
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully'
    })
    
  } catch (error) {
    console.error('❌ Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
