import { NextRequest, NextResponse } from 'next/server';
import { verifyStoredOTP, getUserByEmail, createUser, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== VERIFY OTP API CALLED ===');
    const { email, otp } = await request.json();

    console.log('1. Verify OTP request - Email:', email, 'OTP:', otp);
    console.log('2. OTP type:', typeof otp, 'length:', otp?.length);
    console.log('3. Email type:', typeof email);

    if (!email || !otp) {
      console.log('4. Missing email or OTP');
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      console.log('5. Invalid OTP length:', otp.length);
      return NextResponse.json(
        { success: false, message: 'OTP must be 6 digits' },
        { status: 400 }
      );
    }

    console.log('6. About to call verifyStoredOTP...');
    
    // Verify OTP
    const isValidOTP = await verifyStoredOTP(email, otp);
    console.log('7. Back from verifyStoredOTP, result:', isValidOTP);
    
    if (!isValidOTP) {
      console.log('8. OTP verification failed');
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    console.log('9. OTP verified successfully, continuing with user creation...');

    // Get or create user
    let user = await getUserByEmail(email);
    if (!user) {
      console.log('10. User not found, creating new user');
      user = await createUser(email);
      if (!user) {
        console.error('11. Failed to create user');
        return NextResponse.json(
          { success: false, message: 'Failed to create user account' },
          { status: 500 }
        );
      }
    }

    console.log('12. User found/created:', user);

    // Create session
    const sessionToken = await createSession(user.id);
    if (!sessionToken) {
      console.error('13. Failed to create session');
      return NextResponse.json(
        { success: false, message: 'Failed to create session' },
        { status: 500 }
      );
    }

    console.log('14. Session created successfully');

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, email: user.email }
    });

    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('=== VERIFY OTP API ERROR ===');
    console.error('Error details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, message: 'Internal server error: ' + errorMessage },
      { status: 500 }
    );
  }
}
