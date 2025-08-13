"use client";
import Link from "next/link";
import { ArrowLeft, Scale, Shield, Users, Briefcase } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="h-6 border-l border-gray-300"></div>
            <div className="flex items-center space-x-2">
              <Scale className="h-6 w-6 text-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900">Terms and Conditions</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Last Updated */}
          <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
            <p className="text-sm text-blue-700">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Ciero ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our job platform and services. By accessing or using our platform, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our platform connects job seekers, employers, and recruitment partners to facilitate employment opportunities and professional growth.
            </p>
          </section>

          {/* User Types */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. User Types and Responsibilities</h2>
            
            <div className="space-y-6">
              {/* Candidates */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">Job Seekers/Candidates</h3>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Provide accurate and truthful information in your profile</li>
                  <li>Keep your resume and contact information up to date</li>
                  <li>Consent to sharing your profile with potential employers</li>
                  <li>Respond professionally to employer communications</li>
                  <li>Notify us of any successful placements through our platform</li>
                </ul>
              </div>

              {/* Employers */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-medium text-gray-900">Employers</h3>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Post accurate and legal job descriptions</li>
                  <li>Comply with all applicable employment laws and regulations</li>
                  <li>Treat all candidates fairly and without discrimination</li>
                  <li>Pay agreed-upon fees for successful placements</li>
                  <li>Provide timely feedback to candidates when possible</li>
                </ul>
              </div>

              {/* Recruitment Partners */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-medium text-gray-900">Recruitment Partners</h3>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Maintain professional standards in candidate placement</li>
                  <li>Follow our commission structure and payment terms</li>
                  <li>Provide accurate candidate assessments and recommendations</li>
                  <li>Respect confidentiality agreements with both candidates and employers</li>
                  <li>Report placement activities according to our guidelines</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Account Registration */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Account Registration and Security</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>You must provide accurate, current, and complete information during registration</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must notify us immediately of any unauthorized access to your account</li>
              <li>One person may not maintain multiple accounts for the same user type</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          {/* Platform Usage */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Platform Usage and Conduct</h2>
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">You agree NOT to:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Use the platform for any illegal or unauthorized purpose</li>
                <li>Post false, misleading, or discriminatory content</li>
                <li>Harass, abuse, or discriminate against other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools to scrape or collect data from our platform</li>
                <li>Share login credentials with third parties</li>
              </ul>
            </div>
          </section>

          {/* Privacy and Data */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Privacy and Data Protection</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Your privacy is important to us. Please review our Privacy Policy for details on data collection and usage</li>
              <li>You consent to the processing of your personal information as described in our Privacy Policy</li>
              <li>We implement appropriate security measures to protect your data</li>
              <li>You have the right to request access, correction, or deletion of your personal information</li>
            </ul>
          </section>

          {/* Payment and Fees */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Payment and Fees</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Job seekers can use basic platform features free of charge</li>
              <li>Employers and recruitment partners may be subject to fees for premium services</li>
              <li>All fees are clearly communicated before any charges are incurred</li>
              <li>Payment disputes must be reported within 30 days of the charge</li>
              <li>Refunds are provided according to our refund policy</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>The Ciero platform and its content are protected by copyright and other intellectual property laws</li>
              <li>You retain ownership of content you upload, but grant us a license to use it for platform operations</li>
              <li>You may not reproduce, distribute, or create derivative works from our platform content</li>
              <li>Respect the intellectual property rights of other users and third parties</li>
            </ul>
          </section>

          {/* Disclaimers and Limitations */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Disclaimers and Limitations of Liability</h2>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>IMPORTANT:</strong> Our platform is provided "as is" without warranties of any kind. We do not guarantee:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>The accuracy or completeness of job listings or candidate profiles</li>
                <li>Successful job placement or hiring outcomes</li>
                <li>Uninterrupted or error-free service</li>
                <li>The conduct or qualifications of platform users</li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Termination</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>You may terminate your account at any time by contacting our support team</li>
              <li>We may suspend or terminate accounts that violate these terms</li>
              <li>Upon termination, your access to the platform will be revoked</li>
              <li>Certain provisions of these terms will survive termination</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Governing Law and Dispute Resolution</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>These terms are governed by the laws of [Your Jurisdiction]</li>
              <li>Disputes will be resolved through binding arbitration when possible</li>
              <li>You waive the right to participate in class action lawsuits</li>
              <li>Any legal proceedings must be brought in [Your Jurisdiction]</li>
            </ul>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to These Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update these Terms from time to time. We will notify users of material changes via email or platform notifications. 
              Continued use of the platform after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 leading-relaxed mb-2">
                If you have questions about these Terms and Conditions, please contact us:
              </p>
              <ul className="text-gray-700 space-y-1">
                <li><strong>Email:</strong> legal@ciero.com</li>
                <li><strong>Address:</strong> [Your Company Address]</li>
                <li><strong>Phone:</strong> [Your Contact Number]</li>
              </ul>
            </div>
          </section>

          {/* Acknowledgment */}
          <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
            <p className="text-blue-700">
              <strong>By using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 