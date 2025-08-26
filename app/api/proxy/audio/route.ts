import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const audioUrl = searchParams.get('url')
    
    if (!audioUrl) {
      return NextResponse.json(
        { error: 'Missing audio URL' },
        { status: 400 }
      )
    }

    console.log('🔍 /api/proxy/audio: Proxying audio from:', audioUrl)

    // Fetch the audio file from the external API
    const response = await fetch(audioUrl)
    
    if (!response.ok) {
      console.error('❌ /api/proxy/audio: Failed to fetch audio:', response.status)
      return NextResponse.json(
        { error: 'Failed to fetch audio' },
        { status: response.status }
      )
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()
    
    // Get content type from the original response
    const contentType = response.headers.get('content-type') || 'audio/mpeg'
    
    console.log('✅ /api/proxy/audio: Successfully proxied audio')

    // Return the audio with proper headers
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('❌ /api/proxy/audio: Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
