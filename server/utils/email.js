const nodemailer = require("nodemailer");

// Create transporter for sending emails
const createTransporter = () => {
  // For development, we'll use Gmail SMTP
  // In production, you might want to use services like SendGrid, Mailgun, etc.
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // This should be an app password for Gmail
    },
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetUrl, userName = "User") => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - BOD Platform",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .warning { background-color: #fef3cd; border: 1px solid #fde68a; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              
              <p>You recently requested to reset your password for your BOD Platform account. Click the button below to reset it:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Your Password</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in 30 minutes for security reasons</li>
                  <li>If you didn't request this password reset, please ignore this email</li>
                  <li>Your password will remain unchanged until you create a new one</li>
                </ul>
              </div>
              
              <p>If you have any questions or need assistance, please contact our support team.</p>
              
              <p>Best regards,<br>The BOD Platform Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; 2025 BOD Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - BOD Platform
        
        Hello ${userName},
        
        You recently requested to reset your password for your BOD Platform account.
        
        Please click the following link to reset your password:
        ${resetUrl}
        
        This link will expire in 30 minutes for security reasons.
        
        If you didn't request this password reset, please ignore this email.
        Your password will remain unchanged until you create a new one.
        
        Best regards,
        The BOD Platform Team
        
        ---
        This is an automated message, please do not reply to this email.
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email configuration is valid");
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  testEmailConfig,
};
