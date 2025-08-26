import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // This will create the database tables if they don't exist
    await prisma.$connect()
    
    // Test the connection by running a simple query
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      userCount
    })
  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { error: 'Database setup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
