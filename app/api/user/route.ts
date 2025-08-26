import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { getUserInfo } from '@/lib/api-client'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user info from external API
    const externalUserInfo = await getUserInfo()

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      balance: externalUserInfo.balance,
      credits: externalUserInfo.credits,
    })
  } catch (error) {
    console.error('Get user info error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
