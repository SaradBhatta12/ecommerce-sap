import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json();
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    // Clear main auth token
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // This will delete the cookie
    });
    
    // Clear domain-specific cookies if domain is provided
    if (domain) {
      // Clear tenant session cookie
      response.cookies.set(`tenant-session-${domain}`, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0
      });
      
      // Clear domain-specific token
      response.cookies.set(`domain-${domain}`, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' 
          ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` 
          : '.localhost',
        maxAge: 0
      });
    }
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle GET request for logout (useful for redirect-based logout)
  return POST(request);
}
