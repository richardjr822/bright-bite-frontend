# SEO Implementation Guide for BrightBites

This guide shows which SEO component to import and use for each page in the application.

## How to Use

1. Import the appropriate SEO component from `'../components/seo/SEO'`
2. Add the component at the top of your page's return statement (inside a fragment if needed)

Example:
```jsx
import { DashboardSEO } from '../components/seo/SEO';

function Dashboard() {
  return (
    <>
      <DashboardSEO />
      {/* Your page content */}
    </>
  );
}
```

## Page-to-SEO Component Mapping

### Public Pages
| Page | File Path | SEO Component |
|------|-----------|---------------|
| Landing/Home | `pages/landing.jsx` | `LandingSEO` |
| Login | `pages/login.jsx` | `LoginSEO` ✅ |
| Register | `pages/register.jsx` | `RegisterSEO` |
| Privacy Policy | `pages/PrivacyPolicy.jsx` | `PrivacyPolicySEO` |
| Terms of Service | `pages/TermsOfService.jsx` | `TermsOfServiceSEO` |

### Student Pages
| Page | File Path | SEO Component |
|------|-----------|---------------|
| Dashboard | `pages/student/StudentHomeDashboard.jsx` | `DashboardSEO` ✅ |
| Meal Planner | `pages/student/mealPlanner.jsx` | `MealPlannerSEO` |
| Meal Preferences | `components/student/MealPreferences.jsx` | `MealPreferencesSEO` |
| Campus Canteen | `pages/student/CampusCanteen.jsx` | `CanteenSEO` ✅ |
| Nutrition Tracker | `pages/student/NutritionTracker.jsx` | `NutritionSEO` |
| My Orders | `pages/student/MyOrders.jsx` | `MyOrdersSEO` |
| My Wallet | `pages/student/MyWallet.jsx` | `MyWalletSEO` |
| Rewards & Deals | `pages/student/RewardsDeals.jsx` | `RewardsDealsSEO` |
| Feedback | `pages/student/Feedback.jsx` | `FeedbackSEO` |
| Recommendations | `pages/student/Recommendations.jsx` | `RecommendationsSEO` |
| Settings | `pages/student/StudentSettings.jsx` | `StudentSettingsSEO` |

### Vendor Pages
| Page | File Path | SEO Component |
|------|-----------|---------------|
| Vendor Dashboard | `components/vendor/VendorDashboard.jsx` | `VendorDashboardSEO` |
| Overview | `components/vendor/VendorOverview.jsx` | `VendorOverviewSEO` |
| Orders | `components/vendor/Orders.jsx` | `VendorOrdersSEO` |
| Menu Management | `components/vendor/MenuManagement.jsx` | `VendorMenuSEO` |
| Earnings | `components/vendor/Earnings.jsx` | `VendorEarningsSEO` |
| Reviews | `components/vendor/Reviews.jsx` | `VendorReviewsSEO` |
| Analytics | `components/vendor/StudentAnalytics.jsx` | `VendorAnalyticsSEO` |
| Settings | `components/vendor/Settings.jsx` | `VendorSettingsSEO` |

### Admin Pages
| Page | File Path | SEO Component |
|------|-----------|---------------|
| Admin Dashboard | `pages/admin/AdminDashboard.jsx` | `AdminDashboardSEO` |
| Overview | `pages/admin/AdminOverview.jsx` | `AdminOverviewSEO` |
| Vendors | `pages/admin/AdminVendors.jsx` | `AdminVendorsSEO` |
| Pending Vendors | `pages/admin/AdminPendingVendors.jsx` | `AdminPendingVendorsSEO` |
| Students | `pages/admin/AdminStudents.jsx` | `AdminStudentsSEO` |
| Orders | `pages/admin/AdminOrders.jsx` | `AdminOrdersSEO` |
| Deals | `pages/admin/AdminDeals.jsx` | `AdminDealsSEO` |
| Analytics | `pages/admin/AdminAnalytics.jsx` | `AdminAnalyticsSEO` |
| Transactions | `pages/admin/AdminTransactions.jsx` | `AdminTransactionsSEO` |
| Settings | `pages/admin/AdminSettings.jsx` | `AdminSettingsSEO` |

### Staff/Delivery Pages
| Page | File Path | SEO Component |
|------|-----------|---------------|
| Staff Dashboard | `pages/staff/StaffDashboard.jsx` | `StaffDashboardSEO` |
| Overview | `pages/staff/StaffOverview.jsx` | `StaffOverviewSEO` |
| Active Deliveries | `pages/staff/Deliveries.jsx` | `DeliveriesSEO` |
| Delivery History | `pages/staff/DeliveryHistory.jsx` | `DeliveryHistorySEO` |
| Profile | `pages/staff/StaffProfile.jsx` | `StaffProfileSEO` |

## Implementation Status
✅ = Already implemented
⏳ = Needs implementation

## Notes
- All authenticated pages (student, vendor, admin, staff) have `noIndex={true}` to prevent search engines from indexing private content
- Public pages (landing, login, register, privacy, terms) are indexable
- Each SEO component includes:
  - Page title
  - Meta description
  - Keywords (where applicable)
  - Canonical URL
  - Open Graph tags
  - Twitter Card tags
  - Structured data (JSON-LD)

## Custom SEO Usage
If you need custom SEO for a specific page, you can use the base `SEO` component:

```jsx
import SEO from '../components/seo/SEO';

<SEO
  title="Custom Page Title"
  description="Custom description"
  keywords="custom, keywords"
  url="/custom-url"
  noIndex={false}
/>
```
