import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { getTask } from '@/lib/api-client'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 /api/tasks/[id]/check-status: Checking task status...')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ /api/tasks/[id]/check-status: No valid authorization header')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔍 /api/tasks/[id]/check-status: Token extracted, getting user...')
    
    const user = await getUserFromToken(token)
    
    if (!user || !user.isActive) {
      console.log('❌ /api/tasks/[id]/check-status: User not found or inactive')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const taskId = params.id
    console.log('🔍 /api/tasks/[id]/check-status: Checking task:', taskId)

    // Get the task from our database
    const task = await prisma.task.findFirst({
      where: { 
        id: taskId,
        userId: user.id 
      },
    })

    if (!task) {
      console.log('❌ /api/tasks/[id]/check-status: Task not found')
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    if (!task.externalTaskId) {
      console.log('❌ /api/tasks/[id]/check-status: No external task ID')
      return NextResponse.json(
        { error: 'No external task ID' },
        { status: 400 }
      )
    }

    console.log('✅ /api/tasks/[id]/check-status: Getting task from external API...')

    // Get task status from external API
    const externalTask = await getTask(task.externalTaskId)
    console.log('✅ /api/tasks/[id]/check-status: External task data:', externalTask)

    // Map external API status to our Prisma enum
    let mappedStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
    
    switch (externalTask.status.toLowerCase()) {
      case 'completed':
        mappedStatus = 'COMPLETED'
        break
      case 'failed':
        mappedStatus = 'FAILED'
        break
      case 'processing':
        mappedStatus = 'PROCESSING'
        break
      default:
        mappedStatus = 'PENDING'
    }

    // Update our database with the latest status
    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: {
        status: mappedStatus,
        resultUrl: externalTask.resultUrl,
        subtitleUrl: externalTask.subtitleUrl,
      },
    })

    console.log('✅ /api/tasks/[id]/check-status: Task updated successfully')

    return NextResponse.json({
      id: updatedTask.id,
      status: updatedTask.status,
      resultUrl: updatedTask.resultUrl,
      subtitleUrl: updatedTask.subtitleUrl,
    })
  } catch (error) {
    console.error('❌ /api/tasks/[id]/check-status: Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
