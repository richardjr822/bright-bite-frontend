import React from "react";
import MealCard from "./MealCard";

const DayColumn = ({ dayLabel, meals }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
      <div className="mb-4 pb-3 border-b-2 border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">{dayLabel}</h3>
        <p className="text-xs text-gray-500 mt-1">{meals.length} meals</p>
      </div>
      <div className="space-y-3">
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>
    </div>
  );
};

export default DayColumn;