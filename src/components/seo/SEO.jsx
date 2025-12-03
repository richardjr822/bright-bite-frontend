import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component - Manages document head for each page
 * Implements proper meta tags, Open Graph, and Twitter Cards
 */
const SEO = ({
  title,
  description = 'BrightBites - Your personalized campus meal planning and nutrition tracking platform. Discover healthy meals, track your nutrition, and order from campus vendors.',
  keywords = 'meal planning, nutrition, campus food, healthy eating, student meals, meal tracker',
  image = '/og-image.png',
  url = '',
  type = 'website',
  noIndex = false,
  children,
}) => {
  const siteTitle = 'BrightBites';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const canonicalUrl = url ? `https://brightbites.app${url}` : 'https://brightbites.app';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta */}
      <meta name="theme-color" content="#22c55e" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteTitle} />
      
      {/* Structured Data for Local Business */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "BrightBites",
          "description": description,
          "url": canonicalUrl,
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "PHP"
          }
        })}
      </script>
      
      {children}
    </Helmet>
  );
};

/**
 * Pre-configured SEO components for common pages
 */
export const HomeSEO = () => (
  <SEO
    title="Home"
    description="Welcome to BrightBites - Your personalized campus meal planning platform. Get AI-powered meal recommendations, track nutrition, and order from campus vendors."
    url="/"
  />
);

export const DashboardSEO = () => (
  <SEO
    title="Dashboard"
    description="Your personalized BrightBites dashboard. View your nutrition goals, meal plans, and quick access to all features."
    url="/dashboard"
    noIndex={true}
  />
);

export const MealPlannerSEO = () => (
  <SEO
    title="Meal Planner"
    description="Plan your weekly meals with AI-powered recommendations based on your dietary preferences and nutrition goals."
    url="/meal-planner"
    noIndex={true}
  />
);

export const CanteenSEO = () => (
  <SEO
    title="Campus Canteen"
    description="Browse and order from campus food vendors. Find healthy meals that match your dietary preferences."
    url="/canteen"
    noIndex={true}
  />
);

export const NutritionSEO = () => (
  <SEO
    title="Nutrition Tracker"
    description="Track your daily nutrition intake. Monitor calories, protein, carbs, and fats to reach your health goals."
    url="/nutrition"
    noIndex={true}
  />
);

export const LoginSEO = () => (
  <SEO
    title="Login"
    description="Sign in to your BrightBites account to access personalized meal planning and nutrition tracking."
    url="/login"
  />
);

export const RegisterSEO = () => (
  <SEO
    title="Create Account"
    description="Join BrightBites today. Create your account for personalized meal planning and campus food ordering."
    url="/register"
  />
);

export const VendorDashboardSEO = () => (
  <SEO
    title="Vendor Dashboard"
    description="Manage your campus food vendor account. View orders, manage menu, and track earnings."
    url="/vendor"
    noIndex={true}
  />
);

export const AdminDashboardSEO = () => (
  <SEO
    title="Admin Dashboard"
    description="BrightBites administration panel. Manage vendors, students, and platform settings."
    url="/admin"
    noIndex={true}
  />
);

// Student Pages
export const MyOrdersSEO = () => (
  <SEO
    title="My Orders"
    description="View and track your food orders from campus vendors. Check order status and history."
    url="/orders"
    noIndex={true}
  />
);

export const MyWalletSEO = () => (
  <SEO
    title="My Wallet"
    description="Manage your BrightBites wallet. Add funds, view transactions, and track your spending."
    url="/wallet"
    noIndex={true}
  />
);

export const RewardsDealsSEO = () => (
  <SEO
    title="Rewards & Deals"
    description="Discover exclusive deals and rewards from campus vendors. Save money on your favorite meals."
    url="/rewards"
    noIndex={true}
  />
);

export const FeedbackSEO = () => (
  <SEO
    title="Feedback"
    description="Share your feedback and help us improve BrightBites. Rate vendors and suggest new features."
    url="/feedback"
    noIndex={true}
  />
);

export const StudentSettingsSEO = () => (
  <SEO
    title="Settings"
    description="Manage your BrightBites account settings, preferences, and privacy options."
    url="/settings"
    noIndex={true}
  />
);

export const RecommendationsSEO = () => (
  <SEO
    title="Meal Recommendations"
    description="Get personalized meal recommendations based on your dietary preferences and nutrition goals."
    url="/recommendations"
    noIndex={true}
  />
);

export const MealPreferencesSEO = () => (
  <SEO
    title="Meal Preferences"
    description="Set your dietary preferences, allergies, and nutrition goals for personalized meal planning."
    url="/meal-preferences"
    noIndex={true}
  />
);

// Vendor Pages
export const VendorOverviewSEO = () => (
  <SEO
    title="Vendor Overview"
    description="Overview of your vendor performance, sales, and customer feedback."
    url="/vendor/overview"
    noIndex={true}
  />
);

export const VendorOrdersSEO = () => (
  <SEO
    title="Vendor Orders"
    description="Manage incoming orders from students. Accept, prepare, and fulfill orders."
    url="/vendor/orders"
    noIndex={true}
  />
);

export const VendorMenuSEO = () => (
  <SEO
    title="Menu Management"
    description="Manage your food menu. Add, edit, and remove items from your offerings."
    url="/vendor/menu"
    noIndex={true}
  />
);

export const VendorEarningsSEO = () => (
  <SEO
    title="Earnings"
    description="Track your earnings, revenue, and financial performance."
    url="/vendor/earnings"
    noIndex={true}
  />
);

export const VendorReviewsSEO = () => (
  <SEO
    title="Reviews"
    description="View customer reviews and ratings for your food and service."
    url="/vendor/reviews"
    noIndex={true}
  />
);

export const VendorAnalyticsSEO = () => (
  <SEO
    title="Analytics"
    description="Analyze your vendor performance with detailed insights and reports."
    url="/vendor/analytics"
    noIndex={true}
  />
);

export const VendorSettingsSEO = () => (
  <SEO
    title="Vendor Settings"
    description="Manage your vendor account settings, business information, and preferences."
    url="/vendor/settings"
    noIndex={true}
  />
);

// Admin Pages
export const AdminOverviewSEO = () => (
  <SEO
    title="Admin Overview"
    description="Overview of platform statistics, active users, and system health."
    url="/admin/overview"
    noIndex={true}
  />
);

export const AdminVendorsSEO = () => (
  <SEO
    title="Manage Vendors"
    description="Manage campus food vendors. Approve, suspend, or remove vendor accounts."
    url="/admin/vendors"
    noIndex={true}
  />
);

export const AdminPendingVendorsSEO = () => (
  <SEO
    title="Pending Vendors"
    description="Review and approve pending vendor applications."
    url="/admin/pending-vendors"
    noIndex={true}
  />
);

export const AdminStudentsSEO = () => (
  <SEO
    title="Manage Students"
    description="Manage student accounts and view user activity."
    url="/admin/students"
    noIndex={true}
  />
);

export const AdminOrdersSEO = () => (
  <SEO
    title="All Orders"
    description="View and manage all orders across the platform."
    url="/admin/orders"
    noIndex={true}
  />
);

export const AdminDealsSEO = () => (
  <SEO
    title="Manage Deals"
    description="Create and manage platform-wide deals and promotions."
    url="/admin/deals"
    noIndex={true}
  />
);

export const AdminAnalyticsSEO = () => (
  <SEO
    title="Platform Analytics"
    description="View comprehensive analytics and insights for the entire platform."
    url="/admin/analytics"
    noIndex={true}
  />
);

export const AdminTransactionsSEO = () => (
  <SEO
    title="Transactions"
    description="Monitor all financial transactions across the platform."
    url="/admin/transactions"
    noIndex={true}
  />
);

export const AdminSettingsSEO = () => (
  <SEO
    title="Admin Settings"
    description="Configure platform settings, features, and system preferences."
    url="/admin/settings"
    noIndex={true}
  />
);

// Staff/Delivery Pages
export const StaffDashboardSEO = () => (
  <SEO
    title="Delivery Dashboard"
    description="Manage your delivery tasks and track your performance."
    url="/delivery-staff"
    noIndex={true}
  />
);

export const StaffOverviewSEO = () => (
  <SEO
    title="Delivery Overview"
    description="Overview of your delivery statistics and earnings."
    url="/delivery-staff/overview"
    noIndex={true}
  />
);

export const DeliveriesSEO = () => (
  <SEO
    title="Active Deliveries"
    description="View and manage your active delivery orders."
    url="/delivery-staff/deliveries"
    noIndex={true}
  />
);

export const DeliveryHistorySEO = () => (
  <SEO
    title="Delivery History"
    description="View your completed delivery history and earnings."
    url="/delivery-staff/history"
    noIndex={true}
  />
);

export const StaffProfileSEO = () => (
  <SEO
    title="Delivery Profile"
    description="Manage your delivery staff profile and account settings."
    url="/delivery-staff/profile"
    noIndex={true}
  />
);

// Public Pages
export const PrivacyPolicySEO = () => (
  <SEO
    title="Privacy Policy"
    description="Learn how BrightBites collects, uses, and protects your personal information."
    keywords="privacy policy, data protection, user privacy, BrightBites privacy"
    url="/privacy-policy"
  />
);

export const TermsOfServiceSEO = () => (
  <SEO
    title="Terms of Service"
    description="Read the terms and conditions for using the BrightBites platform."
    keywords="terms of service, user agreement, terms and conditions, BrightBites terms"
    url="/terms-of-service"
  />
);

export const LandingSEO = () => (
  <SEO
    title="Smart Campus Meal Planning & Nutrition Tracking"
    description="BrightBites is your all-in-one campus food solution. Get AI-powered meal recommendations, track nutrition, order from vendors, and achieve your health goals. Join thousands of students eating smarter."
    keywords="campus meal planning, student nutrition, healthy eating, food delivery, meal tracker, campus food, nutrition goals, AI meal planner, student meals, healthy campus dining"
    url="/"
  />
);

export default SEO;
