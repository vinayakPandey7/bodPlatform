"use client";
import React, { memo } from 'react';
import { X, Scale, Shield, Users, Briefcase } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = memo(({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scale className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Terms and Conditions</h2>
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
          <div className="mb-6 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
            <p className="text-sm text-blue-700">
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
              Welcome to Ciero. These Terms govern your use of our job platform. By using our platform, you agree to these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our platform connects job seekers, employers, and recruitment partners.
            </p>
          </section>

          {/* User Types */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">2. User Responsibilities</h3>
            
            <div className="space-y-4">
              {/* Candidates */}
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Job Seekers</h4>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Provide accurate profile information</li>
                  <li>Keep resume and contact details updated</li>
                  <li>Consent to profile sharing with employers</li>
                  <li>Respond professionally to communications</li>
                </ul>
              </div>

              {/* Employers */}
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Briefcase className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium text-gray-900">Employers</h4>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Post accurate job descriptions</li>
                  <li>Comply with employment laws</li>
                  <li>Treat candidates fairly</li>
                  <li>Pay agreed-upon fees</li>
                </ul>
              </div>

              {/* Recruitment Partners */}
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <h4 className="font-medium text-gray-900">Recruitment Partners</h4>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Maintain professional standards</li>
                  <li>Follow commission structure</li>
                  <li>Provide accurate assessments</li>
                  <li>Respect confidentiality</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Account Security */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Account Security</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Provide accurate registration information</li>
              <li>Maintain security of account credentials</li>
              <li>Report unauthorized access immediately</li>
              <li>One account per person per user type</li>
            </ul>
          </section>

          {/* Platform Usage */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Platform Usage</h3>
            <div className="mb-3">
              <h4 className="font-medium text-gray-900 mb-2">Prohibited Activities:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Illegal or unauthorized use</li>
                <li>False or discriminatory content</li>
                <li>Harassment or abuse</li>
                <li>Unauthorized system access</li>
                <li>Data scraping or automated tools</li>
              </ul>
            </div>
          </section>

          {/* Privacy */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Privacy</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Review our Privacy Policy for data handling details</li>
              <li>We implement security measures to protect your data</li>
              <li>You have rights to access, correct, or delete your information</li>
            </ul>
          </section>

          {/* Payment */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Payment and Fees</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Basic features are free for job seekers</li>
              <li>Premium services may incur fees</li>
              <li>All fees are clearly communicated</li>
              <li>Disputes must be reported within 30 days</li>
            </ul>
          </section>

          {/* Disclaimers */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Disclaimers</h3>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Platform provided "as is":</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>No guarantee of job placement success</li>
                <li>No warranty of uninterrupted service</li>
                <li>Users responsible for verifying information</li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Termination</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>You may close your account anytime</li>
              <li>We may suspend accounts for violations</li>
              <li>Access will be revoked upon termination</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Contact</h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">Questions about these Terms?</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Email:</strong> legal@ciero.com</li>
                <li><strong>Address:</strong> [Your Company Address]</li>
              </ul>
            </div>
          </section>

          {/* Acknowledgment */}
          <div className="mt-6 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
            <p className="text-sm text-blue-700">
              <strong>By using our platform, you agree to these Terms and Conditions.</strong>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

TermsAndConditionsModal.displayName = 'TermsAndConditionsModal';

export default TermsAndConditionsModal; 