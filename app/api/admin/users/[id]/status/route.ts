import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateStatusSchema = z.object({
  isActive: z.boolean()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 /api/admin/users/[id]/status: Starting request...')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ /api/admin/users/[id]/status: No valid authorization header')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔍 /api/admin/users/[id]/status: Token extracted, getting user...')
    
    const user = await getUserFromToken(token)
    
    if (!user || !user.isActive || !user.isAdmin) {
      console.log('❌ /api/admin/users/[id]/status: User not admin or inactive')
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const userId = params.id
    const body = await request.json()
    const { isActive } = updateStatusSchema.parse(body)

    console.log(`✅ /api/admin/users/[id]/status: Updating user ${userId} status to ${isActive}`)

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    })

    console.log('✅ /api/admin/users/[id]/status: User status updated successfully')

    return NextResponse.json({
      id: updatedUser.id,
      isActive: updatedUser.isActive
    })
  } catch (error) {
    console.error('❌ /api/admin/users/[id]/status: Error:', error)
    
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
