import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFileContract, FaUserCheck, FaGavel, FaExclamationTriangle } from 'react-icons/fa';

export default function TermsOfService() {
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
            <FaFileContract className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-neutral-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 md:p-12 space-y-10">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Agreement to Terms</h2>
            <p className="text-neutral-700 leading-relaxed">
              Welcome to BrightBite. By accessing or using our platform, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services. These terms apply to all users including 
              students, vendors, and delivery staff.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#0d3d23]/10 flex items-center justify-center flex-shrink-0">
                <FaUserCheck className="w-5 h-5 text-[#0d3d23]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">User Accounts and Responsibilities</h2>
              </div>
            </div>

            <div className="space-y-6 ml-13">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">For Students:</h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                  <li>You must provide accurate registration information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must be at least 13 years old to use our services</li>
                  <li>You agree to provide accurate dietary information and preferences</li>
                  <li>You are responsible for all orders placed through your account</li>
                  <li>You agree to provide honest feedback and reviews</li>
                  <li>You must not misuse rewards points or promotional offers</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">For Vendors:</h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                  <li>You must provide valid business registration and permits</li>
                  <li>You are responsible for food safety and quality standards</li>
                  <li>You must provide accurate menu information and pricing</li>
                  <li>You agree to fulfill orders in a timely manner</li>
                  <li>You are responsible for managing your staff and operations</li>
                  <li>You must comply with all local food service regulations</li>
                  <li>You agree to maintain proper hygiene and safety standards</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">For Delivery Staff:</h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                  <li>You must be authorized by a vendor to perform deliveries</li>
                  <li>You are responsible for timely and safe delivery of orders</li>
                  <li>You must handle food items with care and maintain hygiene</li>
                  <li>You agree to provide professional service to customers</li>
                  <li>You must update delivery status accurately in the system</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Services Provided */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Services Provided</h2>
            <div className="space-y-4">
              <p className="text-neutral-700 leading-relaxed">BrightBite provides the following services:</p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                <li><strong>AI Meal Planning:</strong> Personalized meal plans based on dietary preferences and health goals</li>
                <li><strong>Campus Canteen:</strong> Platform to browse and order food from multiple campus vendors</li>
                <li><strong>Nutrition Tracking:</strong> Tools to monitor daily nutrition intake and progress toward goals</li>
                <li><strong>Order Management:</strong> Real-time order tracking and delivery coordination</li>
                <li><strong>Rewards Program:</strong> Points system and promotional deals for students</li>
                <li><strong>Feedback System:</strong> Platform for reviews and service improvement</li>
              </ul>
            </div>
          </section>

          {/* Orders and Payments */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Orders and Payments</h2>
            <div className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                <li>All orders are subject to vendor acceptance and availability</li>
                <li>Prices are set by individual vendors and may change without notice</li>
                <li>Payment is processed through secure third-party payment providers</li>
                <li>Refunds are subject to vendor policies and are handled on a case-by-case basis</li>
                <li>Order cancellations must be made according to vendor-specific timeframes</li>
                <li>Students are responsible for picking up orders at designated locations</li>
              </ul>
            </div>
          </section>

          {/* AI Meal Plans */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">AI-Generated Meal Plans</h2>
            <div className="space-y-4">
              <p className="text-neutral-700 leading-relaxed">
                Our AI meal planning feature provides personalized suggestions based on your input. However:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                <li>Meal plans are suggestions only and not medical or nutritional advice</li>
                <li>You should consult healthcare professionals for specific dietary needs</li>
                <li>We are not liable for any health outcomes resulting from following meal plans</li>
                <li>Nutritional information is provided for guidance and may not be 100% accurate</li>
                <li>You are responsible for verifying allergen and ingredient information</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Prohibited Activities</h2>
              </div>
            </div>

            <div className="space-y-4 ml-13">
              <p className="text-neutral-700 leading-relaxed">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                <li>Use the platform for any illegal purposes</li>
                <li>Post false, misleading, or fraudulent information</li>
                <li>Abuse the rewards or promotional system</li>
                <li>Harass, abuse, or harm other users, vendors, or staff</li>
                <li>Attempt to access unauthorized areas of the platform</li>
                <li>Use automated systems to scrape or collect data</li>
                <li>Interfere with the proper functioning of the platform</li>
                <li>Share your account credentials with others</li>
                <li>Post inappropriate content or reviews</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Intellectual Property</h2>
            <div className="space-y-4">
              <p className="text-neutral-700 leading-relaxed">
                All content on BrightBite, including text, graphics, logos, images, and software, is the property of BrightBite 
                or its content suppliers and is protected by intellectual property laws.
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                <li>You may not reproduce, distribute, or create derivative works without permission</li>
                <li>Vendors retain ownership of their menu items and business information</li>
                <li>By submitting content (reviews, feedback), you grant us a license to use it</li>
              </ul>
            </div>
          </section>

          {/* Liability and Disclaimers */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#0d3d23]/10 flex items-center justify-center flex-shrink-0">
                <FaGavel className="w-5 h-5 text-[#0d3d23]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Limitation of Liability</h2>
              </div>
            </div>

            <div className="space-y-4 ml-13">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <p className="text-neutral-900 font-semibold mb-2">Important Notice:</p>
                <p className="text-neutral-700 leading-relaxed text-sm">
                  BrightBite acts as a platform connecting students with vendors. We are not responsible for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-700 text-sm mt-2 ml-4">
                  <li>Food quality, safety, or preparation by vendors</li>
                  <li>Accuracy of nutritional information provided by vendors</li>
                  <li>Delivery delays or issues beyond our control</li>
                  <li>Health outcomes from consuming ordered food</li>
                  <li>Disputes between users and vendors</li>
                  <li>Loss or theft of rewards points due to account compromise</li>
                </ul>
              </div>
              <p className="text-neutral-700 leading-relaxed">
                To the maximum extent permitted by law, BrightBite shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages arising from your use of the platform.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Account Termination</h2>
            <div className="space-y-4">
              <p className="text-neutral-700 leading-relaxed">
                We reserve the right to suspend or terminate your account if:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                <li>You violate these Terms of Service</li>
                <li>You engage in fraudulent or illegal activities</li>
                <li>Your account poses a security risk</li>
                <li>We are required to do so by law</li>
              </ul>
              <p className="text-neutral-700 leading-relaxed mt-4">
                You may terminate your account at any time through your account settings. Upon termination, 
                unused rewards points will be forfeited, and pending orders must be completed or cancelled.
              </p>
            </div>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Changes to Terms</h2>
            <p className="text-neutral-700 leading-relaxed">
              We may modify these Terms of Service at any time. We will notify users of significant changes through the platform 
              or via email. Your continued use of BrightBite after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Governing Law</h2>
            <p className="text-neutral-700 leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of the Philippines, 
              without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Contact */}
          <section className="pt-6 border-t border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact Us</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-neutral-50 rounded-xl p-6 space-y-2">
              <p className="text-neutral-900 font-medium">BrightBite Support</p>
              <p className="text-neutral-700">Email: <a href="mailto:legal@brightbite.com" className="text-[#0d3d23] hover:text-[#1a5d3a]">legal@brightbite.com</a></p>
              <p className="text-neutral-700">Email: <a href="mailto:support@brightbite.com" className="text-[#0d3d23] hover:text-[#1a5d3a]">support@brightbite.com</a></p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="pt-6 border-t border-neutral-200">
            <div className="bg-[#0d3d23]/5 border border-[#0d3d23]/20 rounded-xl p-6">
              <p className="text-neutral-900 font-semibold mb-2">By using BrightBite, you acknowledge that:</p>
              <ul className="list-disc list-inside space-y-1 text-neutral-700 text-sm ml-4">
                <li>You have read and understood these Terms of Service</li>
                <li>You agree to be bound by these terms</li>
                <li>You are of legal age to enter into this agreement</li>
                <li>You will comply with all applicable laws and regulations</li>
              </ul>
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
