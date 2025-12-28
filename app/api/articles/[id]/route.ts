import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint is disabled (remote-only mode). Use API_BASE_URL public endpoints instead.' },
    { status: 410 },
  )
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
