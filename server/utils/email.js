const nodemailer = require("nodemailer");
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Create OAuth2 transporter for Gmail
const createOAuthTransporter = async () => {
  try {
    const credentialsPath = path.join(__dirname, '../config/credentials.json');
    const tokenPath = path.join(__dirname, '../config/token.json');
    
    if (!fs.existsSync(credentialsPath) || !fs.existsSync(tokenPath)) {
      console.log('OAuth credentials or token not found');
      return null;
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath));
    const token = JSON.parse(fs.readFileSync(tokenPath));

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    oAuth2Client.setCredentials(token);

    const emailUser = process.env.ADMIN_EMAIL_USER || "admin@theciero.com";

    // Refresh the access token if needed
    try {
      await oAuth2Client.getAccessToken();
    } catch (refreshError) {
      console.error('Error refreshing access token:', refreshError);
      return null;
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: emailUser,
        clientId: client_id,
        clientSecret: client_secret,
        refreshToken: token.refresh_token,
        // Let nodemailer handle the access token refresh
      },
    });
  } catch (error) {
    console.error('Error creating OAuth transporter:', error);
    return null;
  }
};

// Create transporter for sending emails
const createTransporter = async (accountType = "admin") => {
  console.log("Using app password for email authentication");
  
  // Use app password directly for reliability
  return createAppPasswordTransporter(accountType);
};

const createAppPasswordTransporter = async (accountType = "admin") => {
  const emailUser = process.env.ADMIN_EMAIL_USER || "admin@theciero.com";
  const emailPass = process.env.ADMIN_EMAIL_PASS;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass, // This should be an app password for Gmail
    },
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetUrl, userName = "User") => {
  try {
    const transporter = await createTransporter("admin"); // Use admin account for password resets

    const mailOptions = {
      from: process.env.ADMIN_EMAIL_USER || "admin@theciero.com",
      to: email,
      subject: "Password Reset Request - CIERO",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: green; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
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
              
              <p>You recently requested to reset your password for your CIERO account. Click the button below to reset it:</p>
              
              <div style="text-align: center; color: white" >
                <a href="${resetUrl}" class="button" style="background-color: green; color: white !important;">Reset Your Password</a>
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
              
              <p>Best regards,<br>The CIERO Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; 2025 CIERO. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - CIERO
        
        Hello ${userName},
        
        You recently requested to reset your password for your CIERO account.
        
        Please click the following link to reset your password:
        ${resetUrl}
        
        This link will expire in 30 minutes for security reasons.
        
        If you didn't request this password reset, please ignore this email.
        Your password will remain unchanged until you create a new one.
        
        Best regards,
        The CIERO Team
        
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
const testEmailConfig = async (accountType = "admin") => {
  try {
    const transporter = await createTransporter(accountType);
    await transporter.verify();
    console.log(`Email configuration is valid for ${accountType} account`);
    return true;
  } catch (error) {
    console.error(`Email configuration error for ${accountType}:`, error);
    return false;
  }
};

// General email sending function
const sendEmail = async (options) => {
  try {
    const accountType = "admin"; // Always use admin account
    const transporter = await createTransporter(accountType);

    const fromEmail = process.env.ADMIN_EMAIL_USER || "admin@theciero.com";

    const mailOptions = {
      from: options.from || fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  testEmailConfig,
  sendEmail,
};
