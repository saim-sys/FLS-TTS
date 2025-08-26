import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { getVoices } from '@/lib/api-client'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 /api/voices: Starting request...')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ /api/voices: No valid authorization header')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔍 /api/voices: Token extracted, getting user...')
    
    const user = await getUserFromToken(token)
    
    if (!user || !user.isActive) {
      console.log('❌ /api/voices: User not found or inactive')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ /api/voices: User authenticated, fetching voices...')

    // Get voices from external API
    const voices = await getVoices()
    console.log('✅ /api/voices: Voices fetched:', voices.length, 'voices')

    return NextResponse.json({ voices })
  } catch (error) {
    console.error('❌ /api/voices: Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
