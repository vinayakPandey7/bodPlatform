import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      experienceId,
      jobTitle,
      company,
      managerName,
      managerEmail,
      managerPosition,
      relationshipToManager,
      workDescription,
      keyAchievements,
      candidateName,
      candidateEmail
    } = body;

    // Validate required fields
    if (!managerEmail || !managerName || !jobTitle || !company) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Save the referral request to database
    // 2. Generate a unique Google Form link for this specific request
    // 3. Send email using a service like SendGrid, AWS SES, or Nodemailer
    
    // For now, we'll simulate the email sending
    const googleFormUrl = `https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?usp=pp_url&entry.candidateName=${encodeURIComponent(candidateName)}&entry.jobTitle=${encodeURIComponent(jobTitle)}&entry.company=${encodeURIComponent(company)}`;
    
    // Email template content
    const emailContent = {
      to: managerEmail,
      from: 'admin@ciero.com',
      subject: `Professional Reference Request for ${candidateName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Professional Reference Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Professional Reference Request</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${managerName},</p>
            
            <p style="margin-bottom: 20px;">
              We hope this email finds you well. ${candidateName} has listed you as a professional reference for their previous role at <strong>${company}</strong> as <strong>${jobTitle}</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #667eea; margin-top: 0;">Reference Request Details:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Candidate:</strong> ${candidateName}</li>
                <li><strong>Position:</strong> ${jobTitle}</li>
                <li><strong>Company:</strong> ${company}</li>
                <li><strong>Relationship:</strong> ${relationshipToManager}</li>
              </ul>
            </div>
            
            <p style="margin-bottom: 20px;">
              To help potential employers understand ${candidateName}'s contributions and work quality, we would greatly appreciate if you could provide a brief reference by completing our secure form.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${googleFormUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Complete Reference Form
              </a>
            </div>
            
            <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #1a73e8;">
                <strong>Note:</strong> This form should take no more than 5 minutes to complete. Your responses will be kept confidential and used solely for employment verification purposes.
              </p>
            </div>
            
            <p style="margin-bottom: 20px;">
              If you have any questions or concerns about this request, please don't hesitate to contact us at admin@ciero.com.
            </p>
            
            <p style="margin-bottom: 5px;">Thank you for your time and consideration.</p>
            <p style="margin-bottom: 20px;">Best regards,<br><strong>Ciero Team</strong></p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6c757d; text-align: center; margin: 0;">
              This email was sent on behalf of ${candidateName}. If you believe this email was sent in error, please contact us at admin@ciero.com.
            </p>
          </div>
        </body>
        </html>
      `
    };

    // Here you would actually send the email
    // Example with a hypothetical email service:
    // await emailService.send(emailContent);
    
    console.log('Would send email to:', managerEmail);
    console.log('Email content:', emailContent);

    // Save referral request to database (simulated)
    const referralRequest = {
      id: Date.now().toString(),
      experienceId,
      candidateName,
      candidateEmail,
      managerName,
      managerEmail,
      managerPosition,
      jobTitle,
      company,
      relationshipToManager,
      workDescription,
      keyAchievements,
      status: 'pending',
      requestDate: new Date().toISOString(),
      googleFormUrl
    };

    return NextResponse.json({
      message: 'Referral request sent successfully',
      referralRequest,
      googleFormUrl
    });

  } catch (error) {
    console.error('Error processing referral request:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 