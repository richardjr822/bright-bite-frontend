import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StudentSidebar from "../../components/studentSidebar";
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
        // No dashboard or dashboard content for student side
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to BrightBite!</h2>
              <p className="text-gray-600">Select a menu item from the sidebar to get started.</p>
            </div>
          </div>
        );
    }
  };

  useEffect(() => {
    // Redirect to /canteen if at /user root
    if (location.pathname === "/user") {
      navigate("/canteen", { replace: true });
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