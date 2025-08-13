"use client";
import React, { memo } from 'react';
import { X, Shield, Eye, Lock, Database, Globe, Users } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = memo(({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Privacy Policy</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Last Updated */}
          <div className="mb-6 p-3 bg-green-50 border-l-4 border-green-400 rounded">
            <p className="text-sm text-green-700">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Introduction</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              At Ciero, we respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, and safeguard your information.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using our platform, you agree to the data practices described in this policy.
            </p>
          </section>

          {/* Information Collection */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Information We Collect</h3>
            
            <div className="space-y-4">
              {/* Personal Information */}
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Personal Information</h4>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Name, email, and phone number</li>
                  <li>Resume and work experience</li>
                  <li>Location data (zip code, coordinates)</li>
                  <li>Professional skills and certifications</li>
                </ul>
              </div>

              {/* Usage Information */}
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="h-4 w-4 text-purple-600" />
                  <h4 className="font-medium text-gray-900">Usage Information</h4>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Pages visited and features used</li>
                  <li>Search queries and applications</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                </ul>
              </div>

              {/* Location Data */}
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium text-gray-900">Location Data</h4>
                </div>
                <p className="text-sm text-gray-700">
                  With your consent, we collect location data to show relevant jobs and auto-fill your address.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">For Job Seekers:</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Create and maintain profiles</li>
                  <li>Match with job opportunities</li>
                  <li>Share profiles with employers</li>
                  <li>Send job recommendations</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">For Employers:</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Process job postings</li>
                  <li>Provide candidate matches</li>
                  <li>Facilitate hiring processes</li>
                  <li>Generate analytics</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Information Sharing</h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">With Your Consent</h4>
                <p className="text-sm text-gray-700">
                  We share your profile with employers when you apply for jobs or consent to being contacted.
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Service Providers</h4>
                <p className="text-sm text-gray-700">
                  We work with trusted partners for email services, payments, and analytics.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Data Security</h3>
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="h-4 w-4 text-red-600" />
                <h4 className="font-medium text-gray-900">Security Measures</h4>
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication</li>
                <li>Secure infrastructure and data centers</li>
              </ul>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Data Retention</h3>
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Retention Periods</h4>
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Active accounts: While account is active</li>
                <li>Closed accounts: Up to 7 years</li>
                <li>Job applications: 3 years</li>
                <li>Analytics data: May be retained indefinitely</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Your Privacy Rights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Access & Export</h4>
                <p className="text-sm text-gray-700">Request and download your data</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Correction</h4>
                <p className="text-sm text-gray-700">Update inaccurate information</p>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Deletion</h4>
                <p className="text-sm text-gray-700">Request removal of your data</p>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Communication</h4>
                <p className="text-sm text-gray-700">Control marketing preferences</p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Cookies & Tracking</h3>
            <div className="space-y-2">
              <div className="p-2 bg-gray-50 rounded">
                <h4 className="font-medium text-gray-900 text-sm">Essential Cookies</h4>
                <p className="text-xs text-gray-700">Required for platform functionality</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <h4 className="font-medium text-gray-900 text-sm">Analytics Cookies</h4>
                <p className="text-xs text-gray-700">Help us improve our platform</p>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Children's Privacy</h3>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-gray-700">
                Our platform is not intended for users under 18. We do not knowingly collect 
                information from children under 18.
              </p>
            </div>
          </section>

          {/* Changes */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Policy Changes</h3>
            <p className="text-sm text-gray-700">
              We may update this policy periodically. Material changes will be communicated via 
              email or platform notifications.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">11. Contact Us</h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">Privacy questions or concerns?</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Privacy Officer:</strong> privacy@ciero.com</li>
                <li><strong>General Contact:</strong> support@ciero.com</li>
              </ul>
            </div>
          </section>

          {/* Acknowledgment */}
          <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-400 rounded">
            <p className="text-sm text-green-700">
              <strong>By using our platform, you acknowledge that you understand this Privacy Policy 
              and agree to our data practices.</strong>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PrivacyPolicyModal.displayName = 'PrivacyPolicyModal';

export default PrivacyPolicyModal; 