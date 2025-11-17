import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt, FaLock, FaUserShield, FaDatabase } from 'react-icons/fa';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#0d3d23] hover:text-[#1a5d3a] transition-colors font-medium"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
        {/* Title Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] shadow-lg mb-6">
            <FaShieldAlt className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-neutral-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 md:p-12 space-y-10">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Introduction</h2>
            <p className="text-neutral-700 leading-relaxed">
              Welcome to BrightBite. We are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, 
              whether you're a student, vendor, or delivery staff member.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#0d3d23]/10 flex items-center justify-center flex-shrink-0">
                <FaDatabase className="w-5 h-5 text-[#0d3d23]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Information We Collect</h2>
              </div>
            </div>

            <div className="space-y-6 ml-13">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">For Students:</h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                  <li>Personal information: name, email address, organization/school</li>
                  <li>Dietary preferences and restrictions</li>
                  <li>Meal planning preferences and goals</li>
                  <li>Order history and food preferences</li>
                  <li>Nutrition tracking data and health goals</li>
                  <li>Feedback and reviews</li>
                  <li>Rewards points and voucher usage</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">For Vendors:</h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                  <li>Business information: business name, address, contact details</li>
                  <li>Business permit documentation</li>
                  <li>Menu items and pricing information</li>
                  <li>Order and sales data</li>
                  <li>Customer reviews and ratings</li>
                  <li>Earnings and transaction records</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">For Delivery Staff:</h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                  <li>Personal information: name, contact details</li>
                  <li>Staff ID and employment information</li>
                  <li>Delivery history and performance data</li>
                  <li>Location data during active deliveries</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#0d3d23]/10 flex items-center justify-center flex-shrink-0">
                <FaUserShield className="w-5 h-5 text-[#0d3d23]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">How We Use Your Information</h2>
              </div>
            </div>

            <div className="space-y-4 ml-13">
              <p className="text-neutral-700 leading-relaxed">We use the collected information to:</p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                <li>Provide and maintain our meal planning and ordering services</li>
                <li>Generate personalized AI meal plans based on your preferences and goals</li>
                <li>Process and fulfill food orders</li>
                <li>Track nutrition and dietary progress</li>
                <li>Manage rewards points and promotional deals</li>
                <li>Facilitate communication between students, vendors, and delivery staff</li>
                <li>Improve our services and develop new features</li>
                <li>Send important updates, notifications, and promotional offers</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#0d3d23]/10 flex items-center justify-center flex-shrink-0">
                <FaLock className="w-5 h-5 text-[#0d3d23]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Data Security</h2>
              </div>
            </div>

            <div className="space-y-4 ml-13">
              <p className="text-neutral-700 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and authorization systems</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and role-based permissions</li>
                <li>Secure payment processing through trusted third-party providers</li>
              </ul>
              <p className="text-neutral-700 leading-relaxed mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, 
                we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Information Sharing</h2>
            <div className="space-y-4">
              <p className="text-neutral-700 leading-relaxed">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                <li><strong>With Vendors:</strong> Order details and delivery information to fulfill your food orders</li>
                <li><strong>With Delivery Staff:</strong> Delivery location and order details for successful delivery</li>
                <li><strong>Service Providers:</strong> Third-party services that help us operate our platform (payment processors, cloud hosting, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights, property, or safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Your Rights</h2>
            <div className="space-y-4">
              <p className="text-neutral-700 leading-relaxed">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal data</li>
                <li>Opt-out of marketing communications</li>
                <li>Restrict or object to certain data processing</li>
                <li>Data portability</li>
              </ul>
              <p className="text-neutral-700 leading-relaxed mt-4">
                To exercise these rights, please contact us at <a href="mailto:privacy@brightbite.com" className="text-[#0d3d23] hover:text-[#1a5d3a] font-medium">privacy@brightbite.com</a>
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Cookies and Tracking</h2>
            <p className="text-neutral-700 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and deliver personalized content. 
              You can control cookie preferences through your browser settings, though some features may not function properly if cookies are disabled.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Children's Privacy</h2>
            <p className="text-neutral-700 leading-relaxed">
              Our services are intended for users who are at least 13 years old. We do not knowingly collect personal information from children under 13. 
              If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Changes to This Policy</h2>
            <p className="text-neutral-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page 
              and updating the "Last updated" date. Your continued use of BrightBite after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="pt-6 border-t border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact Us</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-neutral-50 rounded-xl p-6 space-y-2">
              <p className="text-neutral-900 font-medium">BrightBite Support</p>
              <p className="text-neutral-700">Email: <a href="mailto:privacy@brightbite.com" className="text-[#0d3d23] hover:text-[#1a5d3a]">privacy@brightbite.com</a></p>
              <p className="text-neutral-700">Email: <a href="mailto:support@brightbite.com" className="text-[#0d3d23] hover:text-[#1a5d3a]">support@brightbite.com</a></p>
            </div>
          </section>
        </div>

        {/* Back to Top */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0d3d23] text-white font-semibold hover:bg-[#1a5d3a] transition-colors shadow-lg"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
          <p className="text-center text-sm text-neutral-600">
            © {new Date().getFullYear()} BrightBite. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
