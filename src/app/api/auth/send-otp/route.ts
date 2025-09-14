import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, storeOTP } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  console.log('=== SEND OTP API CALLED ===');
  
  try {
    const { email } = await request.json();
    console.log('1. Email received:', email);

    if (!email || !email.includes('@')) {
      console.log('2. Invalid email format');
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check environment variables
    console.log('3. Environment check:');
    console.log('   - GMAIL_USER exists:', !!process.env.GMAIL_USER);
    console.log('   - GMAIL_APP_PASSWORD exists:', !!process.env.GMAIL_APP_PASSWORD);
    console.log('   - DB_HOST exists:', !!process.env.DB_HOST);
    console.log('   - DB_USER exists:', !!process.env.DB_USER);
    console.log('   - DB_PASSWORD exists:', !!process.env.DB_PASSWORD);
    console.log('   - DB_NAME exists:', !!process.env.DB_NAME);

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('4. Gmail SMTP credentials are missing!');
      return NextResponse.json(
        { success: false, message: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    console.log('5. Generated OTP:', otp);

    // Store OTP in database
    console.log('6. Attempting to store OTP in database...');
    const otpStored = await storeOTP(email, otp);
    console.log('7. OTP stored successfully:', otpStored);
    
    if (!otpStored) {
      console.error('8. Failed to store OTP in database');
      return NextResponse.json(
        { success: false, message: 'Failed to generate OTP' },
        { status: 500 }
      );
    }

    // Send OTP via email
    console.log('9. Attempting to send OTP email...');
    const emailSent = await sendOTPEmail(email, otp);
    console.log('10. Email sent successfully:', emailSent);
    
    if (!emailSent) {
      console.error('11. Failed to send OTP email');
      return NextResponse.json(
        { success: false, message: 'Failed to send OTP email. Please check your email address.' },
        { status: 500 }
      );
    }

    console.log('12. OTP process completed successfully');
    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email successfully'
    });

  } catch (error) {
    console.error('=== SEND OTP ERROR ===');
    console.error('Error details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error message:', errorMessage);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error: ' + errorMessage },
      { status: 500 }
    );
  }
}
