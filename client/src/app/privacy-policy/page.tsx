"use client";
import Link from "next/link";
import { ArrowLeft, Shield, Eye, Lock, Database, Globe, Users } from "lucide-react";

export default function PrivacyPolicyPage() {
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
              <Shield className="h-6 w-6 text-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Last Updated */}
          <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-400 rounded">
            <p className="text-sm text-green-700">
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
              At Ciero ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our job platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using our platform, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                </div>
                <p className="text-gray-700 mb-2">We collect personal information you provide directly to us, including:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Name, email address, and phone number</li>
                  <li>Profile information (resume, work experience, education)</li>
                  <li>Location data (zip code, city, state, coordinates)</li>
                  <li>Professional skills and certifications</li>
                  <li>Company information (for employers and recruitment partners)</li>
                </ul>
              </div>

              {/* Usage Information */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-medium text-gray-900">Usage Information</h3>
                </div>
                <p className="text-gray-700 mb-2">We automatically collect information about your use of our platform:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Pages visited and features used</li>
                  <li>Search queries and job applications</li>
                  <li>Device information and IP address</li>
                  <li>Browser type and operating system</li>
                  <li>Referring and exit pages</li>
                </ul>
              </div>

              {/* Location Data */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Globe className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-medium text-gray-900">Location Data</h3>
                </div>
                <p className="text-gray-700 mb-2">With your consent, we collect precise location data to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Automatically fill your zip code and address</li>
                  <li>Show relevant job opportunities near you</li>
                  <li>Improve our location-based services</li>
                  <li>Provide accurate distance calculations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">For Job Seekers:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Create and maintain your profile</li>
                  <li>Match you with relevant job opportunities</li>
                  <li>Share your profile with potential employers</li>
                  <li>Send job alerts and recommendations</li>
                  <li>Facilitate professional references</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">For Employers & Partners:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Process job postings and applications</li>
                  <li>Provide candidate recommendations</li>
                  <li>Facilitate recruitment processes</li>
                  <li>Generate analytics and reports</li>
                  <li>Process payments and commissions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. How We Share Your Information</h2>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">With Your Consent</h3>
                <p className="text-gray-700">
                  We share your profile information with employers and recruitment partners when you apply for jobs 
                  or when you consent to being contacted about opportunities.
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Service Providers</h3>
                <p className="text-gray-700">
                  We may share information with trusted third-party service providers who help us operate our platform, 
                  such as email services, payment processors, and analytics providers.
                </p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Legal Requirements</h3>
                <p className="text-gray-700">
                  We may disclose information if required by law, court order, or to protect our rights, property, 
                  or safety of our users.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Lock className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-medium text-gray-900">Security Measures</h3>
              </div>
              <p className="text-gray-700 mb-3">We implement appropriate technical and organizational security measures to protect your data:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication</li>
                <li>Secure data centers and infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Database className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Retention Periods</h3>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Active Accounts:</strong> We retain your data as long as your account is active</li>
                <li><strong>Closed Accounts:</strong> Data is retained for up to 7 years for legal and business purposes</li>
                <li><strong>Job Applications:</strong> Application data is retained for 3 years</li>
                <li><strong>Analytics Data:</strong> Aggregated usage data may be retained indefinitely</li>
                <li><strong>Legal Requirements:</strong> Some data may be retained longer if required by law</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Privacy Rights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access & Portability</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Request a copy of your data</li>
                  <li>Download your profile information</li>
                  <li>Export your application history</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Control & Correction</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Update your profile information</li>
                  <li>Correct inaccurate data</li>
                  <li>Control privacy settings</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Deletion & Objection</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Request deletion of your data</li>
                  <li>Object to certain processing</li>
                  <li>Withdraw consent</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Marketing & Communication</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Opt out of marketing emails</li>
                  <li>Control notification preferences</li>
                  <li>Manage communication settings</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our platform:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded">
                <h4 className="font-medium text-gray-900">Essential Cookies</h4>
                <p className="text-sm text-gray-700">Required for basic platform functionality and security</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                <p className="text-sm text-gray-700">Help us understand how users interact with our platform</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <h4 className="font-medium text-gray-900">Preference Cookies</h4>
                <p className="text-sm text-gray-700">Remember your settings and preferences</p>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our platform may integrate with third-party services that have their own privacy policies:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Payment processors (for handling transactions)</li>
              <li>Email service providers (for communications)</li>
              <li>Analytics services (for platform improvement)</li>
              <li>Cloud storage providers (for data hosting)</li>
              <li>Social media platforms (for profile integration)</li>
            </ul>
          </section>

          {/* International Transfers */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure appropriate safeguards are in place to protect your data during international transfers, 
                including compliance with applicable data protection laws.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Children's Privacy</h2>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                Our platform is not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children under 18. If you become aware that a child has provided us 
                with personal information, please contact us immediately.
              </p>
            </div>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other 
              operational, legal, or regulatory reasons. We will notify you of any material changes via email or 
              platform notifications. The "Last Updated" date at the top of this page indicates when the policy was last revised.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 leading-relaxed mb-2">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="text-gray-700 space-y-1">
                <li><strong>Privacy Officer:</strong> privacy@ciero.com</li>
                <li><strong>General Contact:</strong> support@ciero.com</li>
                <li><strong>Address:</strong> [Your Company Address]</li>
                <li><strong>Phone:</strong> [Your Contact Number]</li>
              </ul>
            </div>
          </section>

          {/* Acknowledgment */}
          <div className="mt-8 p-4 bg-green-50 border-l-4 border-green-400 rounded">
            <p className="text-green-700">
              <strong>By using our platform, you acknowledge that you have read and understood this Privacy Policy 
              and agree to our data practices as described herein.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 