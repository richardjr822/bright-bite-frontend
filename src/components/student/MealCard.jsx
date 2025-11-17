import React from "react";
import { FaFire, FaClock } from "react-icons/fa";

const MealCard = ({ meal }) => {
  const getMealTypeColor = (type) => {
    const colors = {
      Breakfast: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Lunch: "bg-blue-100 text-blue-700 border-blue-200",
      Dinner: "bg-purple-100 text-purple-700 border-purple-200",
      Snack: "bg-green-100 text-green-700 border-green-200",
    };
    return colors[type] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-green-300 transition-all group">
      <div className="relative h-28 overflow-hidden">
        <img
          src={meal.img}
          alt={meal.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getMealTypeColor(meal.type)}`}>
            {meal.type}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          {meal.name}
        </h4>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <FaFire className="text-orange-500" />
            <span className="font-semibold">{meal.calories} kcal</span>
          </div>
          <div className="flex items-center gap-1">
            <FaClock className="text-gray-400" />
            <span>15 min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCard;