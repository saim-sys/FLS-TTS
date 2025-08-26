import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { getUserInfo } from '@/lib/api-client'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 /api/user: Starting request...')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ /api/user: No valid authorization header')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔍 /api/user: Token extracted, getting user from token...')
    
    const user = await getUserFromToken(token)
    
    if (!user || !user.isActive) {
      console.log('❌ /api/user: User not found or inactive')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ /api/user: User authenticated, getting external user info...')

    // Get user info from external API
    const externalUserInfo = await getUserInfo()
    console.log('✅ /api/user: External user info received:', externalUserInfo)

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      balance: externalUserInfo.balance,
      credits: externalUserInfo.credits,
    })
  } catch (error) {
    console.error('❌ /api/user: Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
