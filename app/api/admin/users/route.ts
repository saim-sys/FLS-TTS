import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 /api/admin/users: Starting request...')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ /api/admin/users: No valid authorization header')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔍 /api/admin/users: Token extracted, getting user...')
    
    const user = await getUserFromToken(token)
    
    if (!user || !user.isActive || !user.isAdmin) {
      console.log('❌ /api/admin/users: User not admin or inactive')
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.log('✅ /api/admin/users: Admin authenticated, fetching users...')

    // Get all users with their task counts
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to include task counts
    const usersWithTaskCounts = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      balance: 0, // This will be updated from external API
      credits: [], // This will be updated from external API
      createdAt: user.createdAt.toISOString(),
      taskCount: user._count.tasks
    }))

    console.log(`✅ /api/admin/users: Found ${usersWithTaskCounts.length} users`)

    return NextResponse.json({ users: usersWithTaskCounts })
  } catch (error) {
    console.error('❌ /api/admin/users: Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
