import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting database setup with Prisma...')
    
    // Use Prisma db push to create/update the database schema
    console.log('🔍 Running: npx prisma db push')
    const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss')
    
    console.log('✅ Prisma db push output:', stdout)
    if (stderr) {
      console.log('⚠️ Prisma db push stderr:', stderr)
    }

    // Generate Prisma client
    console.log('🔍 Running: npx prisma generate')
    const { stdout: generateStdout, stderr: generateStderr } = await execAsync('npx prisma generate')
    
    console.log('✅ Prisma generate output:', generateStdout)
    if (generateStderr) {
      console.log('⚠️ Prisma generate stderr:', generateStderr)
    }

    console.log('✅ Database setup completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully with Prisma',
      prismaOutput: stdout,
      generateOutput: generateStdout
    })
  } catch (error) {
    console.error('❌ Database setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
