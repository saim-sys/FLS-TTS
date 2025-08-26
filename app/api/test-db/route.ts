import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Try to create a test user to see if tables exist
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: 'testpassword123',
      },
    })

    // Delete the test user
    await prisma.user.delete({
      where: { id: testUser.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Database connection and table creation test successful',
      testUser: {
        id: testUser.id,
        email: testUser.email,
        username: testUser.username,
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    
    // Check if it's a table doesn't exist error
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json({
        success: false,
        error: 'Database tables do not exist',
        details: error.message,
        solution: 'Need to run database migration'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
