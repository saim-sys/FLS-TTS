import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('🔍 Testing login for:', email)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        email
      })
    }

    console.log('✅ User found:', user.email, user.username)

    const isValidPassword = await verifyPassword(password, user.password)
    
    console.log('🔐 Password verification result:', isValidPassword)

    return NextResponse.json({
      success: true,
      userFound: true,
      passwordValid: isValidPassword,
      user: {
        email: user.email,
        username: user.username,
        isActive: user.isActive
      }
    })
  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
