import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 /api/setup-admin: Making user ${email} an admin...`)

    // Update user to be admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isAdmin: true }
    })

    console.log(`✅ /api/setup-admin: User ${email} is now an admin`)

    return NextResponse.json({
      success: true,
      message: `User ${email} is now an admin`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        isAdmin: updatedUser.isAdmin
      }
    })
  } catch (error) {
    console.error('❌ /api/setup-admin: Error:', error)
    return NextResponse.json(
      { error: 'Failed to make user admin. User might not exist.' },
      { status: 500 }
    )
  }
}
