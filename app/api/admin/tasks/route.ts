import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 /api/admin/tasks: Starting request...')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ /api/admin/tasks: No valid authorization header')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔍 /api/admin/tasks: Token extracted, getting user...')
    
    const user = await getUserFromToken(token)
    
    if (!user || !user.isActive || !user.isAdmin) {
      console.log('❌ /api/admin/tasks: User not admin or inactive')
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.log('✅ /api/admin/tasks: Admin authenticated, fetching tasks...')

    // Get all tasks with user information
    const tasks = await prisma.task.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data
    const tasksWithUserInfo = tasks.map(task => ({
      id: task.id,
      userId: task.userId,
      input: task.input,
      status: task.status.toLowerCase(),
      createdAt: task.createdAt.toISOString(),
      resultUrl: task.resultUrl,
      user: task.user
    }))

    console.log(`✅ /api/admin/tasks: Found ${tasksWithUserInfo.length} tasks`)

    return NextResponse.json({ tasks: tasksWithUserInfo })
  } catch (error) {
    console.error('❌ /api/admin/tasks: Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
