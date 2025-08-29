import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@sparknest.com",
    to: email,
    subject: "SparkNest - Email Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SparkNest</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your Verification Code</p>
        </div>
        <div style="background: white; padding: 40px 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #374151; margin: 0 0 20px 0;">Welcome to SparkNest!</h2>
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 30px 0;">
            Thank you for signing up! Please use the verification code below to complete your registration:
          </p>
          <div style="background: #f9fafb; border: 2px solid #8b5cf6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h1 style="color: #8b5cf6; font-size: 32px; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</h1>
          </div>
          <p style="color: #6b7280; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px;">
            This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
