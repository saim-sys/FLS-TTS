import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateBalanceSchema = z.object({
  balance: z.number().min(0)
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 /api/admin/users/[id]/balance: Starting request...')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ /api/admin/users/[id]/balance: No valid authorization header')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔍 /api/admin/users/[id]/balance: Token extracted, getting user...')
    
    const user = await getUserFromToken(token)
    
    if (!user || !user.isActive || !user.isAdmin) {
      console.log('❌ /api/admin/users/[id]/balance: User not admin or inactive')
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const userId = params.id
    const body = await request.json()
    const { balance } = updateBalanceSchema.parse(body)

    console.log(`✅ /api/admin/users/[id]/balance: Updating user ${userId} balance to ${balance}`)

    // Note: This would typically update the external API balance
    // For now, we'll just return success since we don't have direct balance management
    // You would need to integrate with your external API's balance management

    console.log('✅ /api/admin/users/[id]/balance: Balance update request processed')

    return NextResponse.json({
      id: userId,
      balance: balance,
      message: 'Balance update request processed. Please update the external API manually.'
    })
  } catch (error) {
    console.error('❌ /api/admin/users/[id]/balance: Error:', error)
    
    if (error instanceof z.ZodError) {
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
