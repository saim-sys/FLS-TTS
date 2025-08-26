import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting database setup...')
    
    // Connect to database
    await prisma.$connect()
    console.log('✅ Connected to database')

    // Create users table
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "username" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "isAdmin" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "users_pkey" PRIMARY KEY ("id")
    )`

    // Create tasks table
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "tasks" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "input" TEXT NOT NULL,
      "voiceId" TEXT NOT NULL,
      "modelId" TEXT NOT NULL,
      "style" DOUBLE PRECISION,
      "speed" DOUBLE PRECISION,
      "useSpeakerBoost" BOOLEAN,
      "similarity" DOUBLE PRECISION,
      "stability" DOUBLE PRECISION,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "resultUrl" TEXT,
      "subtitleUrl" TEXT,
      "externalTaskId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
    )`

    // Create indexes
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username")`

    console.log('✅ Database tables created successfully')

    // Test the tables by counting users
    const userCount = await prisma.user.count()
    console.log(`✅ User table working - found ${userCount} users`)

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      userCount,
      tablesCreated: ['users', 'tasks']
    })
  } catch (error) {
    console.error('❌ Database setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
