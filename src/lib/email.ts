import nodemailer from 'nodemailer';

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail app password (16 characters)
  },
});

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    console.log('Attempting to send OTP email via Gmail SMTP to:', email);
    console.log('Gmail user configured:', !!process.env.GMAIL_USER);
    console.log('Gmail password configured:', !!process.env.GMAIL_APP_PASSWORD);

    const mailOptions = {
      from: `"School Management System" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Login OTP - School Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">School Management System</h1>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h2 style="color: #1e293b; margin-top: 0;">Your Login OTP</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">
              Hello! You've requested to login to the School Management System. 
              Here's your One-Time Password:
            </p>
            
            <div style="background-color: #ffffff; padding: 20px; margin: 25px 0; text-align: center; border-radius: 6px; border: 2px dashed #e2e8f0;">
              <h1 style="color: #2563eb; font-size: 36px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; margin: 0; font-weight: 500;">
                ⏰ This OTP is valid for 10 minutes only
              </p>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
              If you didn't request this login, please ignore this email. 
              Your account remains secure.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
              This is an automated email from School Management System. 
              Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via Gmail SMTP:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email via Gmail SMTP:', error);
    return false;
  }
}
