import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 /api/test-voices: Testing external API voices endpoint...')
    
    const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL
    const EXTERNAL_API_TOKEN = process.env.EXTERNAL_API_TOKEN
    
    console.log('🔍 /api/test-voices: Base URL:', EXTERNAL_API_BASE_URL)
    console.log('🔍 /api/test-voices: Token exists:', !!EXTERNAL_API_TOKEN)
    
    // Try different possible voice endpoints
    const possibleEndpoints = [
      '/api/elevenlabs/voices',
      '/api/voices',
      '/voices',
      '/api/elevenlabs/voice',
      '/api/voice'
    ]
    
    const results = {
      baseUrl: EXTERNAL_API_BASE_URL,
      tokenExists: !!EXTERNAL_API_TOKEN,
      endpoints: {} as any
    }
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`🔍 /api/test-voices: Trying endpoint: ${endpoint}`)
        
        const response = await fetch(`${EXTERNAL_API_BASE_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${EXTERNAL_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        })
        
        console.log(`📡 /api/test-voices: ${endpoint} - Status:`, response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ /api/test-voices: ${endpoint} - Success:`, data)
          results.endpoints[endpoint] = {
            status: response.status,
            success: true,
            data: data
          }
        } else {
          const errorText = await response.text()
          console.log(`❌ /api/test-voices: ${endpoint} - Error:`, errorText)
          results.endpoints[endpoint] = {
            status: response.status,
            success: false,
            error: errorText
          }
        }
      } catch (error) {
        console.log(`❌ /api/test-voices: ${endpoint} - Exception:`, error)
        results.endpoints[endpoint] = {
          status: 'ERROR',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('❌ /api/test-voices: Error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
