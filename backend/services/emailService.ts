import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER || "maddison53@gmail.com",
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || "jn7jnAPss4f63QBp6D",
  },
});

// Generate a 6-digit verification code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  verificationCode: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: email,
      subject: 'Goji - Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Your Verification Code</h2>
            <p style="color: #666; margin-bottom: 20px;">
              Use the following verification code to complete your sign-in:
            </p>
            
            <div style="background-color: white; border: 2px solid #007AFF; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007AFF; font-size: 32px; margin: 0; letter-spacing: 8px; font-family: monospace;">
                ${verificationCode}
              </h1>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated message from Goji. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};
