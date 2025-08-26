import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { getTask, deleteTask as deleteExternalTask } from '@/lib/api-client'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // If task is still pending or processing, check external API
    if (task.status === 'PENDING' || task.status === 'PROCESSING') {
      try {
        const externalTask = await getTask(task.externalTaskId!)
        
        // Update our database with the latest status
        await prisma.task.update({
          where: { id: task.id },
          data: {
            status: externalTask.status.toUpperCase() as any,
            resultUrl: externalTask.resultUrl,
            subtitleUrl: externalTask.subtitleUrl,
          },
        })

        return NextResponse.json({
          id: task.id,
          input: task.input,
          voiceId: task.voiceId,
          modelId: task.modelId,
          status: externalTask.status,
          resultUrl: externalTask.resultUrl,
          subtitleUrl: externalTask.subtitleUrl,
          createdAt: task.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
        })
      } catch (error) {
        console.error('Error fetching external task:', error)
        // Return our local task data if external API fails
      }
    }

    return NextResponse.json({
      id: task.id,
      input: task.input,
      voiceId: task.voiceId,
      modelId: task.modelId,
      status: task.status.toLowerCase(),
      resultUrl: task.resultUrl,
      subtitleUrl: task.subtitleUrl,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Delete from external API if we have the external task ID
    if (task.externalTaskId) {
      try {
        await deleteExternalTask(task.externalTaskId)
      } catch (error) {
        console.error('Error deleting external task:', error)
        // Continue with local deletion even if external deletion fails
      }
    }

    // Delete from our database
    await prisma.task.delete({
      where: { id: task.id },
    })

    return NextResponse.json({
      message: 'Task deleted successfully',
    })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
