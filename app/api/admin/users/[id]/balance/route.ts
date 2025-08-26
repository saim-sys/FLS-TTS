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

    // First, let's check the current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    })
    console.log(`🔍 Current user data:`, currentUser)

    // Update the user's balance in the local database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { balance: balance }
    })

    console.log(`✅ /api/admin/users/[id]/balance: User balance updated in database to ${updatedUser.balance}`)
    
    // Verify the update worked
    const verifyUser = await prisma.user.findUnique({
      where: { id: userId }
    })
    console.log(`🔍 Verification - user data after update:`, verifyUser)

    return NextResponse.json({
      id: userId,
      balance: updatedUser.balance,
      message: 'Balance updated successfully in local database. Note: External API balance may need separate management.'
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
