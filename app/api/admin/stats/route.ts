import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 /api/admin/stats: Starting request...')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ /api/admin/stats: No valid authorization header')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔍 /api/admin/stats: Token extracted, getting user...')
    
    const user = await getUserFromToken(token)
    
    if (!user || !user.isActive || !user.isAdmin) {
      console.log('❌ /api/admin/stats: User not admin or inactive')
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.log('✅ /api/admin/stats: Admin authenticated, fetching stats...')

    // Get all statistics
    const [
      totalUsers,
      activeUsers,
      totalTasks,
      completedTasks
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'COMPLETED' } })
    ])

    const stats = {
      totalUsers,
      activeUsers,
      totalTasks,
      completedTasks,
      totalBalance: 0, // This would be calculated from external API
      totalCredits: 0  // This would be calculated from external API
    }

    console.log('✅ /api/admin/stats: Stats calculated:', stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('❌ /api/admin/stats: Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
