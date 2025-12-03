import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './context/AuthContext'
import { AuthGuard, GuestGuard, StudentGuard, VendorGuard, AdminGuard, StaffGuard } from './components/guards/RouteGuard'
import { PageLoader } from './components/ui/LoadingSpinner'
import SEO from './components/seo/SEO'

// Eagerly loaded components (needed immediately)
import StudentSidebar from './components/studentSidebar'
import ProtectedRoute from './components/ProtectedRoute'
import VendorRoute from './components/vendor/VendorRoute'
import StaffRoute from './components/staff/StaffRoute'

// Lazy loaded pages - Public
const Landing = lazy(() => import('./pages/landing'))
const Login = lazy(() => import('./pages/login'))
const Register = lazy(() => import('./pages/register'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))

// Lazy loaded pages - Student
const StudentHomeDashboard = lazy(() => import('./pages/student/StudentHomeDashboard'))
const MealPreferences = lazy(() => import('./components/student/MealPreferences'))
const MealPlannerPage = lazy(() => import('./pages/student/mealPlanner'))
const CampusCanteen = lazy(() => import('./pages/student/CampusCanteen'))
const NutritionTracker = lazy(() => import('./pages/student/NutritionTracker'))
const MyOrders = lazy(() => import('./pages/student/MyOrders'))
const MyWallet = lazy(() => import('./pages/student/MyWallet'))
const RewardsDeals = lazy(() => import('./pages/student/RewardsDeals'))
const Feedback = lazy(() => import('./pages/student/Feedback'))
const StudentSettings = lazy(() => import('./pages/student/StudentSettings'))
const Recommendations = lazy(() => import('./pages/student/Recommendations'))
const Beneficiaries = lazy(() => import('./components/Beneficiaries'))
const Programs = lazy(() => import('./components/programs'))
const Settings = lazy(() => import('./components/Settings'))

// Lazy loaded pages - Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'))
const AdminPendingVendors = lazy(() => import('./pages/admin/AdminPendingVendors'))
const AdminVendors = lazy(() => import('./pages/admin/AdminVendors'))
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminDeals = lazy(() => import('./pages/admin/AdminDeals'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

// Lazy loaded pages - Vendor
const VendorDashboard = lazy(() => import('./components/vendor/VendorDashboard'))
const VendorOverview = lazy(() => import('./components/vendor/VendorOverview'))
const Orders = lazy(() => import('./components/vendor/Orders'))
const OrderHistory = lazy(() => import('./components/vendor/OrderHistory'))
const MenuManagement = lazy(() => import('./components/vendor/MenuManagement'))
const Earnings = lazy(() => import('./components/vendor/Earnings'))
const Reviews = lazy(() => import('./components/vendor/Reviews'))
const DeliverStaff = lazy(() => import('./components/vendor/DeliverStaff'))
const StudentAnalytics = lazy(() => import('./components/vendor/StudentAnalytics'))
const VendorSettings = lazy(() => import('./components/vendor/Settings'))

// Lazy loaded pages - Staff
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'))
const StaffOverview = lazy(() => import('./pages/staff/StaffOverview'))
const Deliveries = lazy(() => import('./pages/staff/Deliveries'))
const DeliveryHistory = lazy(() => import('./pages/staff/DeliveryHistory'))
const StaffProfile = lazy(() => import('./pages/staff/StaffProfile'))

// Suspense wrapper for lazy-loaded routes
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader message="Loading page..." />}>
    {children}
  </Suspense>
)

// Layout wrapper for all student pages with sidebar
const StudentLayout = () => (
  <StudentGuard>
    <div className="flex min-h-screen bg-neutral-100">
      <StudentSidebar />
      <main className="flex-1 overflow-y-auto">
        <SuspenseWrapper>
          <Outlet />
        </SuspenseWrapper>
      </main>
    </div>
  </StudentGuard>
)

// Guest layout for login/register (redirects if already logged in)
const GuestLayout = ({ children }) => (
  <GuestGuard>
    <SuspenseWrapper>
      {children}
    </SuspenseWrapper>
  </GuestGuard>
)

// Public layout (no auth required)
const PublicLayout = ({ children }) => (
  <SuspenseWrapper>
    {children}
  </SuspenseWrapper>
)

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {/* Global SEO defaults */}
            <SEO />
            
            {/* Toast notifications */}
            <Toaster 
              position="top-center" 
              toastOptions={{ 
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  padding: '12px 16px',
                },
              }} 
            />
            
            <Routes>
              {/* ==================== PUBLIC ROUTES ==================== */}
              <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
              <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
              <Route path="/terms-of-service" element={<PublicLayout><TermsOfService /></PublicLayout>} />

              {/* ==================== GUEST ROUTES (redirect if logged in) ==================== */}
              <Route path="/login" element={<GuestLayout><Login /></GuestLayout>} />
              <Route path="/register" element={<GuestLayout><Register /></GuestLayout>} />

              {/* ==================== STUDENT ROUTES ==================== */}
              <Route element={<StudentLayout />}>
                <Route path="/dashboard" element={<StudentHomeDashboard />} />
                <Route path="/beneficiaries" element={<Beneficiaries />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/meal-preferences" element={<MealPreferences redirectTo="/meal-planner" />} />
                <Route path="/meal-planner" element={<MealPlannerPage />} />
                <Route path="/canteen" element={<CampusCanteen />} />
                <Route path="/orders" element={<MyOrders />} />
                <Route path="/nutrition" element={<NutritionTracker />} />
                <Route path="/wallet" element={<MyWallet />} />
                <Route path="/rewards" element={<RewardsDeals />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/settings" element={<StudentSettings />} />
                <Route path="/recommendations" element={<Recommendations />} />
              </Route>

              {/* Account settings (outside sidebar) */}
              <Route path="/account-settings" element={
                <AuthGuard>
                  <SuspenseWrapper><Settings /></SuspenseWrapper>
                </AuthGuard>
              } />

              {/* ==================== ADMIN ROUTES ==================== */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <SuspenseWrapper><AdminDashboard /></SuspenseWrapper>
                </ProtectedRoute>
              }>
                <Route index element={<SuspenseWrapper><AdminOverview /></SuspenseWrapper>} />
                <Route path="pending-vendors" element={<SuspenseWrapper><AdminPendingVendors /></SuspenseWrapper>} />
                <Route path="vendors" element={<SuspenseWrapper><AdminVendors /></SuspenseWrapper>} />
                <Route path="students" element={<SuspenseWrapper><AdminStudents /></SuspenseWrapper>} />
                <Route path="orders" element={<SuspenseWrapper><AdminOrders /></SuspenseWrapper>} />
                <Route path="deals" element={<SuspenseWrapper><AdminDeals /></SuspenseWrapper>} />
                <Route path="analytics" element={<SuspenseWrapper><AdminAnalytics /></SuspenseWrapper>} />
                <Route path="transactions" element={<SuspenseWrapper><AdminTransactions /></SuspenseWrapper>} />
                <Route path="settings" element={<SuspenseWrapper><AdminSettings /></SuspenseWrapper>} />
              </Route>

              {/* ==================== VENDOR ROUTES ==================== */}
              <Route element={<VendorRoute />}>
                <Route path="/vendor/*" element={<SuspenseWrapper><VendorDashboard /></SuspenseWrapper>}>
                  <Route index element={<SuspenseWrapper><VendorOverview /></SuspenseWrapper>} />
                  <Route path="overview" element={<SuspenseWrapper><VendorOverview /></SuspenseWrapper>} />
                  <Route path="orders" element={<SuspenseWrapper><Orders /></SuspenseWrapper>} />
                  <Route path="order-history" element={<SuspenseWrapper><OrderHistory /></SuspenseWrapper>} />
                  <Route path="menu-management" element={<SuspenseWrapper><MenuManagement /></SuspenseWrapper>} />
                  <Route path="earnings" element={<SuspenseWrapper><Earnings /></SuspenseWrapper>} />
                  <Route path="reviews" element={<SuspenseWrapper><Reviews /></SuspenseWrapper>} />
                  <Route path="delivery-staff" element={<SuspenseWrapper><DeliverStaff /></SuspenseWrapper>} />
                  <Route path="student-insights" element={<SuspenseWrapper><StudentAnalytics /></SuspenseWrapper>} />
                  <Route path="settings" element={<SuspenseWrapper><VendorSettings /></SuspenseWrapper>} />
                  <Route path="*" element={<Navigate to="overview" replace />} />
                </Route>
              </Route>

              {/* ==================== DELIVERY STAFF ROUTES ==================== */}
              <Route element={<StaffRoute />}>
                <Route path="/delivery-staff" element={<SuspenseWrapper><StaffDashboard /></SuspenseWrapper>}>
                  <Route index element={<SuspenseWrapper><StaffOverview /></SuspenseWrapper>} />
                  <Route path="deliveries" element={<SuspenseWrapper><Deliveries /></SuspenseWrapper>} />
                  <Route path="history" element={<SuspenseWrapper><DeliveryHistory /></SuspenseWrapper>} />
                  <Route path="profile" element={<SuspenseWrapper><StaffProfile /></SuspenseWrapper>} />
                </Route>
              </Route>

              {/* ==================== FALLBACK ==================== */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
