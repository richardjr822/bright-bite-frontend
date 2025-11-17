import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function TermsAndService() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen py-4 sm:py-6 md:py-0 font-['Montserrat']">
      {/* Google Fonts Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="absolute top-20 right-0 w-1/3 h-1/3 bg-green-900/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-0 w-1/4 h-1/4 bg-green-800/30 rounded-full mix-blend-screen filter blur-2xl opacity-70 animate-pulse-slow animation-delay-1000"></div>
        <div className="absolute top-1/4 left-1/3 w-12 h-12 bg-green-600/20 rounded-full animate-float hidden md:block"></div>
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-green-700/20 rounded-full animate-float animation-delay-2000 hidden md:block"></div>
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDYwaDYwVjBoLTYweiIvPjxwYXRoIGQ9Ik02MCAzMC41djFINTl2LTF6TTYwIDAgMCAwdjU5aDFWMWg1OXoiIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iLjIiLz48cGF0aCBkPSJNMzAgNjBoMXYtMWgtMXpNMzAgMGgxdjFoLTF6TTAgMzBoNjB2MUgweiIgZmlsbD0iIzIwMjAyMCIgZmlsbC1vcGFjaXR5PSIuMiIvPjwvZz48L3N2Zz4=')] opacity-[0.03]"></div>
      </div>

      {/* Back to Login Link */}
      <Link
        to="/login"
        className={`fixed top-4 left-2 sm:top-6 sm:left-6 p-2 text-gray-300 hover:text-green-400 flex items-center gap-2 transition-all duration-300 group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        style={{ transitionDelay: '200ms' }}
      >
        <div className="relative overflow-hidden w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:border-green-500 transition-colors duration-300">
          <span className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/10 transition-colors duration-300"></span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-xs sm:text-sm font-medium relative">
          Back to Login
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300"></span>
        </span>
      </Link>

      {/* Terms Content Only */}
      <div className="w-full max-w-[98vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto overflow-y-auto rounded-2xl shadow-2xl my-6 sm:my-8 z-10 bg-gray-800/50 backdrop-blur-md p-4 sm:p-6 md:p-8 lg:p-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white text-center">Terms &amp; Service</h2>
        <div className="text-gray-300 space-y-4 sm:space-y-6 text-xs sm:text-sm md:text-base leading-relaxed">
          <section>
            <h3 className="text-base sm:text-lg font-semibold text-green-300 mb-1 sm:mb-2">1. Acceptance of Terms</h3>
            <p>
              By accessing or using BrightBite, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our platform.
            </p>
          </section>
          <section>
            <h3 className="text-base sm:text-lg font-semibold text-green-300 mb-1 sm:mb-2">2. User Responsibilities</h3>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Provide accurate and complete information during registration.</li>
              <li>Keep your account credentials confidential and secure.</li>
              <li>Use BrightBite for lawful and intended purposes only.</li>
            </ul>
          </section>
          <section>
            <h3 className="text-base sm:text-lg font-semibold text-green-300 mb-1 sm:mb-2">3. Privacy Policy</h3>
            <p>
              We respect your privacy. Please review our Privacy Policy to understand how we collect, use, and protect your information.
            </p>
          </section>
          <section>
            <h3 className="text-base sm:text-lg font-semibold text-green-300 mb-1 sm:mb-2">4. Content &amp; Intellectual Property</h3>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>All content, trademarks, and data on BrightBite are the property of their respective owners.</li>
              <li>You may not copy, distribute, or use content without permission.</li>
            </ul>
          </section>
          <section>
            <h3 className="text-base sm:text-lg font-semibold text-green-300 mb-1 sm:mb-2">5. Limitation of Liability</h3>
            <p>
              BrightBite is provided "as is" without warranties. We are not liable for any damages arising from your use of the platform.
            </p>
          </section>
          <section>
            <h3 className="text-base sm:text-lg font-semibold text-green-300 mb-1 sm:mb-2">6. Changes to Terms</h3>
            <p>
              We may update these terms at any time. Continued use of BrightBite means you accept the revised terms.
            </p>
          </section>
          <section>
            <h3 className="text-base sm:text-lg font-semibold text-green-300 mb-1 sm:mb-2">7. Contact Us</h3>
            <p>
              For questions, contact us at <a href="mailto:support@brightbite.com" className="text-green-400 hover:underline">support@brightbite.com</a>.
            </p>
          </section>
        </div>
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            to="/register"
            className="inline-block bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-6 sm:py-3 sm:px-8 rounded-lg shadow-lg hover:shadow-green-500/20 transition-all duration-300 text-sm sm:text-base"
          >
            Accept &amp; Register
          </Link>
        </div>
      </div>
      {/* Animation styles */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.4; }
        }
        @keyframes move-particle {
          0% { transform: translate(0, 0); }
          25% { transform: translate(100px, 50px); }
          50% { transform: translate(50px, 100px); }
          75% { transform: translate(-50px, 50px); }
          100% { transform: translate(0, 0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: rgba(34, 197, 94, 0.2);
          pointer-events: none;
        }
        .particle-1 {
          top: 20%;
          left: 20%;
          animation: move-particle 15s linear infinite;
        }
        .particle-2 {
          top: 70%;
          left: 60%;
          animation: move-particle 20s linear infinite reverse;
        }
        .particle-3 {
          top: 40%;
          left: 80%;
          animation: move-particle 18s linear infinite;
        }
        .particle-4 {
          top: 30%;
          left: 40%;
          animation: move-particle 22s linear infinite reverse;
        }
        .particle-5 {
          top: 80%;
          left: 20%;
          animation: move-particle 25s linear infinite;
        }
      `}</style>
    </div>
  );
}