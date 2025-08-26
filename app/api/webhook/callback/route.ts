import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook callback received!')
    console.log('🔔 Request headers:', Object.fromEntries(request.headers.entries()))
    
    const body = await request.json()
    console.log('🔔 Webhook payload:', body)
    
    // Validate the callback payload
    const { id: externalTaskId, result, subtitle, input } = body

    if (!externalTaskId) {
      console.log('❌ Webhook: Missing task ID')
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
      console.error(`❌ Webhook: Task not found for external ID: ${externalTaskId}`)
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Webhook: Found task ${task.id}, updating status...`)

    // Update the task with the results
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: 'COMPLETED',
        resultUrl: result,
        subtitleUrl: subtitle,
      },
    })

    console.log(`✅ Webhook: Task ${task.id} completed successfully`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
