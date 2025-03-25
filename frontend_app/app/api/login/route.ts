import { NextRequest, NextResponse } from 'next/server'

// Mock database
const users: Array<{ email: string; password: string }> = []

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    // Normalize email (case-insensitive check)
    const normalizedEmail = email.toLowerCase()

    // Check if user already exists
    if (users.some(user => user.email.toLowerCase() === normalizedEmail)) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 400 })
    }

    // Create new user (In a real-world scenario, hash the password before storing)
    users.push({ email: normalizedEmail, password })

    return NextResponse.json({ message: `User ${email} created successfully` }, { status: 201 })
  } catch (error) {
    console.error('Error in registration:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
