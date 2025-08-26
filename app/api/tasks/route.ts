import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { createTask, getTaskHistory } from '@/lib/api-client'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createTaskSchema = z.object({
  input: z.string().min(1).max(5000),
  voiceId: z.string(),
  modelId: z.string().optional(),
  style: z.number().min(0).max(1).optional(),
  speed: z.number().min(0.7).max(1.2).optional(),
  useSpeakerBoost: z.boolean().optional(),
  similarity: z.number().min(0).max(1).optional(),
  stability: z.number().min(0).max(1).optional(),
  exportSubtitle: z.boolean().optional(),
  maxCharactersPerLine: z.number().optional(),
  maxLinesPerCue: z.number().optional(),
  maxSecondsPerCue: z.number().optional(),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 /api/tasks POST: Starting task creation...')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ /api/tasks POST: No valid authorization header')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔍 /api/tasks POST: Token extracted, getting user...')
    
    const user = await getUserFromToken(token)
    
    if (!user || !user.isActive) {
      console.log('❌ /api/tasks POST: User not found or inactive')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ /api/tasks POST: User authenticated, parsing request body...')
    const body = await request.json()
    console.log('📝 /api/tasks POST: Request body:', body)
    
    const taskData = createTaskSchema.parse(body)
    console.log('✅ /api/tasks POST: Request data validated')

    console.log('🔍 /api/tasks POST: Creating task in external API...')
    // Create task in external API
    const externalTask = await createTask(taskData)
    console.log('✅ /api/tasks POST: External task created:', externalTask)

    console.log('🔍 /api/tasks POST: Storing task in database...')
    // Store task in our database
    const task = await prisma.task.create({
      data: {
        userId: user.id,
        input: taskData.input,
        voiceId: taskData.voiceId,
        modelId: taskData.modelId || 'eleven_multilingual_v2',
        style: taskData.style,
        speed: taskData.speed,
        useSpeakerBoost: taskData.useSpeakerBoost,
        similarity: taskData.similarity,
        stability: taskData.stability,
        externalTaskId: externalTask.taskId,
        status: 'PENDING',
      },
    })
    console.log('✅ /api/tasks POST: Task stored in database:', task.id)

    return NextResponse.json({
      id: task.id,
      taskId: externalTask.taskId,
      status: 'pending',
    })
  } catch (error) {
    console.error('❌ /api/tasks POST: Error:', error)
    if (error instanceof z.ZodError) {
      console.error('❌ /api/tasks POST: Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get tasks from our database
    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await prisma.task.count({
      where: { userId: user.id },
    })

    return NextResponse.json({
      tasks: tasks.map(task => ({
        id: task.id,
        input: task.input,
        voiceId: task.voiceId,
        modelId: task.modelId,
        status: task.status.toLowerCase(),
        resultUrl: task.resultUrl,
        subtitleUrl: task.subtitleUrl,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
      total,
      page: page.toString(),
      limit: limit.toString(),
    })
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
