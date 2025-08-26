import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const results = {
    environment: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      EXTERNAL_API_BASE_URL: !!process.env.EXTERNAL_API_BASE_URL,
      EXTERNAL_API_TOKEN: !!process.env.EXTERNAL_API_TOKEN,
    },
    database: {
      connected: false,
      error: null,
      userCount: 0,
    },
    externalApi: {
      reachable: false,
      error: null,
    }
  }

  // Test database connection
  try {
    await prisma.$connect()
    results.database.connected = true
    
    // Test user count
    const userCount = await prisma.user.count()
    results.database.userCount = userCount
  } catch (error) {
    results.database.error = error instanceof Error ? error.message : 'Unknown error'
  } finally {
    await prisma.$disconnect()
  }

  // Test external API (without authentication)
  try {
    const response = await fetch(process.env.EXTERNAL_API_BASE_URL + '/api/me', {
      headers: {
        'Authorization': `Bearer ${process.env.EXTERNAL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      results.externalApi.reachable = true
    } else {
      results.externalApi.error = `HTTP ${response.status}: ${response.statusText}`
    }
  } catch (error) {
    results.externalApi.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json(results)
}
