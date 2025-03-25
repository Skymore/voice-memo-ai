import { NextRequest, NextResponse } from 'next/server'

// Mock database
let users: { email: string; password: string }[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Check if user already exists
    const existingUser = users.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json({ status: 400, message: "Email already registered" }, { status: 400 })
    }

    // Create new user
    users.push({ email, password })

    return NextResponse.json({
      status: 200,
      message: `User ${email} created successfully`
    }, { status: 200 })

  } catch (e) {
    console.error("Error in registration:", e)
    return NextResponse.json({
      status: 500,
      message: `Error during registration: ${e instanceof Error ? e.message : String(e)}`
    }, { status: 500 })
  }
}

