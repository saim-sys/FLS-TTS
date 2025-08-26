import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the callback payload
    const { id: externalTaskId, result, subtitle, input } = body

    if (!externalTaskId) {
      return NextResponse.json(
        { error: 'Missing task ID' },
        { status: 400 }
      )
    }

    // Find the task in our database using the external task ID
    const task = await prisma.task.findFirst({
      where: { externalTaskId },
    })

    if (!task) {
      console.error(`Task not found for external ID: ${externalTaskId}`)
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Update the task with the results
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: 'COMPLETED',
        resultUrl: result,
        subtitleUrl: subtitle,
      },
    })

    console.log(`Task ${task.id} completed successfully`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
