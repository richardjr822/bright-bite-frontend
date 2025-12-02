import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StudentSidebar from "../../components/studentSidebar";
import StudentHomeDashboard from "./StudentHomeDashboard";
import MealPlannerPage from "./mealPlanner";
import CampusCanteen from "./CampusCanteen";
import MyOrders from "./MyOrders";
import NutritionTracker from "./NutritionTracker";
import MyWallet from "./MyWallet";
import RewardsDeals from "./RewardsDeals";
import Feedback from "./Feedback";
import StudentSettings from "./StudentSettings";

const User = () => {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Only show content that matches sidebar routes
  const renderContent = () => {
    const path = location.pathname;
    
    switch(path) {
      case "/dashboard":
        return <StudentHomeDashboard />;
      case "/meal-planner":
        return <MealPlannerPage />;
      case "/canteen":
        return <CampusCanteen />;
      case "/orders":
        return <MyOrders />;
      case "/nutrition":
        return <NutritionTracker />;
      case "/wallet":
        return <MyWallet />;
      case "/rewards":
        return <RewardsDeals />;
      case "/feedback":
        return <Feedback />;
      case "/settings":
        return <StudentSettings />;
      default:
        // Default to dashboard
        return <StudentHomeDashboard />;
    }
  };

  useEffect(() => {
    // Redirect to /dashboard if at /user root
    if (location.pathname === "/user") {
      navigate("/dashboard", { replace: true });
    }
    setMounted(true);
  }, [location, navigate]);

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <StudentSidebar />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default User;