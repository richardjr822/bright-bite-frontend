import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/login'
import ForgotPassword from './components/forgotPassword'
import Landing from './pages/landing'
import Register from './pages/register'
  import Beneficiaries from './components/Beneficiaries'
import Programs from './components/programs'
import Settings from './components/Settings'
import PostGoogleLogin from './components/postGoogleLogin'
import MealPreferences from './components/student/MealPreferences'
import MealPlannerPage from './pages/student/mealPlanner'
import CampusCanteen from './pages/student/CampusCanteen'
import Feedback from './pages/student/Feedback'
import NutritionTracker from './pages/student/NutritionTracker'
import MyOrders from './pages/student/MyOrders'
import MyWallet from './pages/student/MyWallet'
import RewardsDeals from './pages/student/RewardsDeals'
import StudentSettings from './pages/student/StudentSettings'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOverview from './pages/admin/AdminOverview'
import AdminPendingVendors from './pages/admin/AdminPendingVendors'
import AdminVendors from './pages/admin/AdminVendors'
import AdminStudents from './pages/admin/AdminStudents'
import AdminOrders from './pages/admin/AdminOrders'
import AdminDeals from './pages/admin/AdminDeals'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminSettings from './pages/admin/AdminSettings'
import VendorDashboard from './components/vendor/VendorDashboard'
import VendorRoute from './components/vendor/VendorRoute'
import Analytics from './components/vendor/Analytics'
import Orders from './components/vendor/Orders'
import OrderHistory from './components/vendor/OrderHistory'
import MenuManagement from './components/vendor/MenuManagement'
import Earnings from './components/vendor/Earnings'
import Reviews from './components/vendor/Reviews'
import Notifications from './components/vendor/Notifications'
import VendorSettings from './components/vendor/Settings'
import VendorOverview from './components/vendor/VendorOverview'
import DeliverStaff from './components/vendor/DeliverStaff'
import StudentSidebar from './components/studentSidebar' // added
import StaffRoute from './components/staff/StaffRoute'
import ProtectedRoute from './components/ProtectedRoute'
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffOverview from './pages/staff/StaffOverview'
import Deliveries from './pages/staff/Deliveries'
import DeliveryHistory from './pages/staff/DeliveryHistory'
import StaffProfile from './pages/staff/StaffProfile'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'

// Layout wrapper for all student pages with sidebar
const StudentLayout = () => (
  <div className="flex min-h-screen bg-neutral-100">
    <StudentSidebar />
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        {/** Email verification temporarily disabled for presentation */}
        <Route path="/complete-profile" element={<PostGoogleLogin />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        {/* Student routes with sidebar */}
        <Route element={<StudentLayout />}>
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
        </Route>

        {/* Account settings (outside sidebar if desired) */}
        <Route path="/account-settings" element={<Settings />} />

        {/* Admin (protected) */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="pending-vendors" element={<AdminPendingVendors />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="deals" element={<AdminDeals />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Vendor (protected) */}
        <Route element={<VendorRoute />}>
          <Route path="/vendor/*" element={<VendorDashboard />}>
            <Route index element={<VendorOverview />} />
            <Route path="overview" element={<VendorOverview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="order-history" element={<OrderHistory />} />
            <Route path="menu-management" element={<MenuManagement />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="delivery-staff" element={<DeliverStaff />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<VendorSettings />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Route>
        </Route>

        {/* Delivery Staff (protected) */}
        <Route element={<StaffRoute />}>
          <Route path="/delivery-staff" element={<StaffDashboard />}>
            <Route index element={<StaffOverview />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="history" element={<DeliveryHistory />} />
            <Route path="profile" element={<StaffProfile />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
