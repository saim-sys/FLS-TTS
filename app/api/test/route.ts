import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are loaded
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    const hasJwtSecret = !!process.env.JWT_SECRET
    const hasExternalApiUrl = !!process.env.EXTERNAL_API_BASE_URL
    const hasExternalApiToken = !!process.env.EXTERNAL_API_TOKEN

    return NextResponse.json({
      success: true,
      environment: {
        hasDatabaseUrl,
        hasJwtSecret,
        hasExternalApiUrl,
        hasExternalApiToken,
        nodeEnv: process.env.NODE_ENV,
      },
      message: 'Environment variables check completed'
    })
  } catch (error) {
    console.error('Test route error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
