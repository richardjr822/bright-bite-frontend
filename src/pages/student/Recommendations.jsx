import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import MealRecommendations from '../../components/student/MealRecommendations';
import GoalInsights from '../../components/student/GoalInsights';
import NextWeekPreview from '../../components/student/NextWeekPreview';

export default function Recommendations() {
  const navigate = useNavigate();

  const handleAddToCart = (item) => {
    // Navigate to canteen with item pre-selected
    navigate('/canteen', { state: { addItem: item } });
  };

  const handleViewMeal = (item) => {
    navigate('/canteen', { state: { viewItem: item } });
  };

  const handleGeneratePlan = () => {
    navigate('/meal-preferences');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <FaArrowLeft className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meal Recommendations</h1>
          <p className="text-slate-500 text-sm">
            Personalized suggestions based on your goals and preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <MealRecommendations
            onAddToCart={handleAddToCart}
            onViewMeal={handleViewMeal}
          />
        </div>

        {/* Right Column - Goals & Preview */}
        <div className="space-y-6">
          <GoalInsights onNavigateToPreferences={handleGeneratePlan} />
          <NextWeekPreview onGeneratePlan={handleGeneratePlan} />
        </div>
      </div>
    </div>
  );
}
