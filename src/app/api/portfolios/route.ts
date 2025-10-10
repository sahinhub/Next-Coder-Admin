import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nextcoderapi.vercel.app'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Portfolios API route called')
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    // Get authorization header from request
    const authHeader = request.headers.get('authorization')
    
    console.log('🌐 Fetching from:', `${API_BASE_URL}/portfolios?${queryString}`)
    console.log('🔑 Auth header present:', !!authHeader)
    
    const response = await fetch(`${API_BASE_URL}/portfolios?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    })

    console.log('📡 Backend response status:', response.status)
    console.log('📡 Backend response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend error response:', errorText)
      return NextResponse.json(
        { error: `Failed to fetch portfolios: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Portfolios data received:', data?.length || 0, 'items')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error fetching portfolios:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get authorization header from request
    const authHeader = request.headers.get('authorization')
    
    const response = await fetch(`${API_BASE_URL}/newPortfolio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create portfolio' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating portfolio:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
