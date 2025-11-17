import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaWeight, FaRuler, FaBirthdayCake, FaVenus, FaMars, FaBullseye, FaRunning,
  FaLeaf, FaAllergies, FaFire, FaUtensils, FaClock, FaDumbbell, FaAppleAlt,
  FaArrowRight, FaArrowLeft, FaCheck
} from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const normalizeDbPrefs = (db = {}) => ({
  age: db.age ?? "",
  sex: db.sex ?? "",
  height: db.height ?? "",
  weight: db.weight ?? "",
  goal: db.goal || "maintain",
  activityLevel: db.activity_level ?? "",
  dietaryPreference: db.dietary_preference ?? [],
  avoidFoods: db.avoid_foods ?? "",
  allergies: db.allergies ?? [],
  healthConditions: db.health_conditions ?? [],
  calorieTarget: db.calorie_target ?? "",
  macroPreference: db.macro_preference || "balanced",
  mealsPerDay: db.meals_per_day ?? "",
  mealComplexity: db.meal_complexity ?? "",
  mealPrepStyle: db.meal_prep_style ?? "",
  dailyBudget: db.daily_budget ?? "",
  cookingTime: db.cooking_time ?? "",
  cookingMethod: db.cooking_methods ?? [],
  specialGoals: db.special_goals ?? [],
  appetite: db.appetite ?? ""
});

const STEPS = [
  { id: 1, title: "User Profile", icon: FaUser },
  { id: 2, title: "Dietary Preferences", icon: FaLeaf },
  { id: 3, title: "Allergies & Restrictions", icon: FaAllergies },
  { id: 4, title: "Calorie Goals", icon: FaFire },
  { id: 5, title: "Meal Structure", icon: FaUtensils },
  { id: 6, title: "Budget & Time", icon: FaClock },
  { id: 7, title: "Special Goals", icon: FaDumbbell },
  { id: 8, title: "Portion Size", icon: FaAppleAlt }
];

const MealPreferences = ({ onComplete = () => {}, redirectTo = "/meal-planner" }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    age: "", sex: "", height: "", weight: "", goal: "", activityLevel: "",
    dietaryPreference: [], avoidFoods: "",
    allergies: [], healthConditions: [],
    calorieTarget: "", macroPreference: "",
    mealsPerDay: "", mealComplexity: "", mealPrepStyle: "",
    dailyBudget: "", cookingTime: "", cookingMethod: [],
    specialGoals: [], appetite: ""
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false); // prevent double clicks
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/meal-plans/preferences`, {
          headers: { "x-user-id": user.id },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const norm = normalizeDbPrefs(data?.preferences || {});
        setFormData(f => ({ ...f, ...norm }));
        setIsEditMode(!!data?.preferences);
      } catch {
        setIsEditMode(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateFormData = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const toggleArrayField = (field, value) =>
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(i => i !== value)
        : [...prev[field], value]
    }));

  // Centralized submit + navigate
  const submitAndGenerate = async () => {
    if (submitting) return;
    if (!user?.id) return;
    setSubmitting(true);
    const payload = { ...formData, userId: user.id };
    const method = isEditMode ? "PATCH" : "POST";
    let ok = false;
    let prefsForState = payload;

    try {
      const res = await fetch(`${API_BASE}/meal-plans/preferences`, {
        method,
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        console.warn("MealPreferences: submit failed", res.status);
        throw new Error("PREF_SAVE_FAILED");
      }
      // Try to read updated prefs if returned
      const data = await res.json().catch(() => ({}));
      const norm = normalizeDbPrefs(data?.preferences || {});
      prefsForState = { ...payload, ...norm };
      localStorage.setItem("mealPreferences", JSON.stringify(prefsForState));
      ok = true;
    } catch (e) {
      console.error("MealPreferences: error saving prefs", e);
      // Fallback: keep current formData
      localStorage.setItem("mealPreferences", JSON.stringify(payload));
      prefsForState = payload;
    }

    // Fire generate (non-blocking)
    fetch(`${API_BASE}/meal-plans/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": user.id },
      body: JSON.stringify({ userId: user.id, force: true })
    }).catch(err => console.warn("MealPreferences: generate failed (non-blocking)", err));

    // Small delay to flush localStorage in some browsers
    await new Promise(r => setTimeout(r, 50));

    try {
      navigate(redirectTo, { replace: true, state: { preferences: prefsForState, saved: ok } });
    } catch (navErr) {
      console.error("MealPreferences: navigate failed", navErr);
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = async () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(s => s + 1);
    } else {
      // Final step => submit
      await submitAndGenerate();
    }
  };

  // Optional: expose explicit handler if form submit is used elsewhere
  const handleGenerateClick = () => nextStep();

  const prevStep = () => currentStep > 1 && setCurrentStep(s => s - 1);

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.age && formData.sex && formData.height && formData.weight && formData.goal && formData.activityLevel;
      case 2: return formData.dietaryPreference.length > 0;
      case 4: return formData.calorieTarget;
      case 5: return formData.mealsPerDay && formData.mealComplexity && formData.mealPrepStyle;
      case 6: return formData.dailyBudget && formData.cookingTime && formData.cookingMethod.length > 0;
      case 7: return formData.specialGoals.length > 0;
      case 8: return formData.appetite;
      default: return true;
    }
  };

  const StepIcon = (STEPS.find(s => s.id === currentStep)?.icon) || FaUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      const method = isEditMode ? "PATCH" : "POST";
      const res = await fetch(`${API_BASE}/meal-plans/preferences`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ ...formData, userId: user.id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const norm = normalizeDbPrefs(data?.preferences || {});
      localStorage.setItem("mealPreferences", JSON.stringify(norm));
      navigate("/meal-planner", { replace: true, state: { preferences: norm } });
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-neutral-600">Loading preferences...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="w-full bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-6 px-4">
        <div className="max-w-[1800px] mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 max-w-4xl mx-auto">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive ? "bg-emerald-600 text-white scale-110 shadow"
                          : isCompleted ? "bg-emerald-500 text-white"
                          : "bg-white border-2 border-neutral-300 text-neutral-400"
                      }`}>
                        {isCompleted ? <FaCheck className="text-sm" /> : <Icon className="text-sm" />}
                      </div>
                      <p className={`text-[10px] mt-1 hidden lg:block ${isActive ? "text-emerald-600" : "text-neutral-500"}`}>{step.title}</p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1.5 ${isCompleted ? "bg-emerald-500" : "bg-neutral-200"}`}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <p className="text-center text-xs text-neutral-600">Step {currentStep} of {STEPS.length}</p>
          </div>

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-8 py-6 border-b border-neutral-200">
              <div className="flex items-center gap-4 max-w-7xl mx-auto">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <StepIcon className="text-emerald-600 text-3xl" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{STEPS.find(s => s.id === currentStep)?.title}</h2>
                  <p className="text-sm text-neutral-600">
                    {currentStep === 1 && "Help us personalize your meal plan"}
                    {currentStep === 2 && "Choose your eating style"}
                    {currentStep === 3 && "Keep you safe and healthy"}
                    {currentStep === 4 && "Set your nutrition targets"}
                    {currentStep === 5 && "How do you want to eat?"}
                    {currentStep === 6 && "Let's be practical"}
                    {currentStep === 7 && "What's most important to you?"}
                    {currentStep === 8 && "How much do you typically eat?"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              {/* Step 1: User Profile */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
                  {/* Basic Information Section */}
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-sm mb-4 flex items-center gap-2">
                      <div className="w-1 h-5 bg-emerald-600 rounded-full"></div>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {/* Age */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                          <FaBirthdayCake className="text-emerald-600 text-sm" />
                          Age
                        </label>
                        <input
                          type="number"
                          value={formData.age}
                          onChange={(e) => updateFormData("age", e.target.value)}
                          placeholder="25"
                          className="w-full px-3 py-2.5 text-sm border-2 border-neutral-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-all"
                        />
                      </div>

                      {/* Sex */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-2">
                          Sex
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "male", label: "Male", icon: FaMars },
                            { value: "female", label: "Female", icon: FaVenus }
                          ].map((option) => {
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.value}
                                onClick={() => updateFormData("sex", option.value)}
                                className={`p-2.5 rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 ${
                                  formData.sex === option.value
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                    : "border-neutral-200 hover:border-emerald-300"
                                }`}
                                type="button"
                              >
                                <Icon className="text-base" />
                                <span className="font-medium text-xs">{option.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Height */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                          <FaRuler className="text-emerald-600 text-sm" />
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          value={formData.height}
                          onChange={(e) => updateFormData("height", e.target.value)}
                          placeholder="170"
                          className="w-full px-3 py-2.5 text-sm border-2 border-neutral-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-all"
                        />
                      </div>

                      {/* Weight */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                          <FaWeight className="text-emerald-600 text-sm" />
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={formData.weight}
                          onChange={(e) => updateFormData("weight", e.target.value)}
                          placeholder="70"
                          className="w-full px-3 py-2.5 text-sm border-2 border-neutral-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-xs font-medium text-neutral-500">Goal & Activity</span>
                    </div>
                  </div>

                  {/* Goal Section */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                      <FaBullseye className="text-emerald-600" />
                      What's Your Goal?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "lose", label: "Lose Weight", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop", color: "bg-blue-50 border-blue-500" },
                        { value: "maintain", label: "Maintain", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop", color: "bg-emerald-50 border-emerald-500" },
                        { value: "gain", label: "Gain Weight", img: "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=300&h=200&fit=crop", color: "bg-orange-50 border-orange-500" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateFormData("goal", option.value)}
                          className={`rounded-lg border-2 overflow-hidden transition-all hover:shadow-md ${
                            formData.goal === option.value ? option.color : "border-neutral-200"
                          }`}
                          type="button"
                        >
                          <img src={option.img} alt={option.label} className="w-full h-24 object-cover" />
                          <div className="p-2">
                            <p className="font-semibold text-xs text-neutral-900">{option.label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-neutral-200"></div>
                    </div>
                  </div>

                  {/* Activity Level - Full Width */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                      <FaRunning className="text-emerald-600" />
                      Activity Level
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { value: "sedentary", label: "Sedentary", desc: "Little/no exercise", img: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=200&h=150&fit=crop" },
                        { value: "light", label: "Lightly Active", desc: "1-3 days/week", img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=200&h=150&fit=crop" },
                        { value: "moderate", label: "Moderately Active", desc: "3-5 days/week", img: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=200&h=150&fit=crop" },
                        { value: "very", label: "Very Active", desc: "6-7 days/week", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&h=150&fit=crop" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateFormData("activityLevel", option.value)}
                          className={`rounded-lg border-2 overflow-hidden transition-all text-left ${
                            formData.activityLevel === option.value
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-neutral-200 hover:border-emerald-300"
                          }`}
                          type="button"
                        >
                          <img src={option.img} alt={option.label} className="w-full h-20 object-cover" />
                          <div className="p-2.5">
                            <p className="font-semibold text-xs text-neutral-900">{option.label}</p>
                            <p className="text-[10px] text-neutral-500">{option.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Dietary Preferences */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                      <div className="w-1 h-5 bg-emerald-600 rounded-full"></div>
                      Select Your Dietary Preferences (Multiple allowed)
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                      {[
                        { value: "balanced", label: "Balanced", icon: "🍽️", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop" },
                        { value: "vegetarian", label: "Vegetarian", icon: "🥗", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop" },
                        { value: "vegan", label: "Vegan", icon: "🌱", img: "https://images.unsplash.com/photo-1540914124281-342587941389?w=300&h=200&fit=crop" },
                        { value: "pescatarian", label: "Pescatarian", icon: "🐟", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200&fit=crop" },
                        { value: "keto", label: "Keto", icon: "🥑", img: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=300&h=200&fit=crop" },
                        { value: "low-carb", label: "Low Carb", icon: "🥩", img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => toggleArrayField("dietaryPreference", option.value)}
                          className={`rounded-lg border-2 overflow-hidden transition-all hover:shadow-md ${
                            formData.dietaryPreference.includes(option.value)
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-neutral-200"
                          }`}
                          type="button"
                        >
                          <div className="relative">
                            <img src={option.img} alt={option.label} className="w-full h-24 object-cover" />
                            <div className="absolute top-1.5 right-1.5 text-2xl">{option.icon}</div>
                            {formData.dietaryPreference.includes(option.value) && (
                              <div className="absolute top-1.5 left-1.5 bg-emerald-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
                                <FaCheck className="text-[10px]" />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="font-semibold text-xs text-neutral-900">{option.label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-xs font-medium text-neutral-500">Additional Preferences</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-2">
                      Foods to Avoid (Optional)
                    </label>
                    <textarea
                      value={formData.avoidFoods}
                      onChange={(e) => updateFormData("avoidFoods", e.target.value)}
                      placeholder="e.g., Mushrooms, bell peppers, spicy food..."
                      rows={2}
                      className="w-full px-3 py-2.5 text-sm border-2 border-neutral-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Allergies & Restrictions */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                      <div className="w-1 h-5 bg-red-600 rounded-full"></div>
                      Food Allergies (Select all that apply)
                    </label>
                    <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
                      {[
                        { value: "nuts", label: "Nuts", icon: "🥜" },
                        { value: "shellfish", label: "Shellfish", icon: "🦐" },
                        { value: "dairy", label: "Dairy", icon: "🥛" },
                        { value: "eggs", label: "Eggs", icon: "🥚" },
                        { value: "gluten", label: "Gluten", icon: "🌾" },
                        { value: "soy", label: "Soy", icon: "🫘" },
                        { value: "fish", label: "Fish", icon: "🐟" },
                        { value: "none", label: "None", icon: "✅" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => toggleArrayField("allergies", option.value)}
                          className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                            formData.allergies.includes(option.value)
                              ? "border-red-500 bg-red-50"
                              : "border-neutral-200 hover:border-red-300"
                          }`}
                          type="button"
                        >
                          <span className="text-2xl">{option.icon}</span>
                          <span className="font-medium text-[10px] text-center">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-xs font-medium text-neutral-500">Health Information</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                      <div className="w-1 h-5 bg-orange-600 rounded-full"></div>
                      Health Conditions (Optional)
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                      {[
                        { value: "diabetes", label: "Diabetes", icon: "💉" },
                        { value: "hypertension", label: "Hypertension", icon: "❤️" },
                        { value: "gerd", label: "GERD", icon: "🔥" },
                        { value: "kidney", label: "Kidney", icon: "🫘" },
                        { value: "heart", label: "Heart Disease", icon: "💔" },
                        { value: "none", label: "None", icon: "✅" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => toggleArrayField("healthConditions", option.value)}
                          className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                            formData.healthConditions.includes(option.value)
                              ? "border-orange-500 bg-orange-50"
                              : "border-neutral-200 hover:border-orange-300"
                          }`}
                          type="button"
                        >
                          <span className="text-xl">{option.icon}</span>
                          <span className="font-medium text-xs">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Calorie Goals */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                        <div className="w-1 h-5 bg-orange-600 rounded-full"></div>
                        <FaFire className="text-orange-600" />
                        Daily Calorie Target
                      </label>
                      <input
                        type="number"
                        value={formData.calorieTarget}
                        onChange={(e) => updateFormData("calorieTarget", e.target.value)}
                        placeholder="e.g., 2000"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-all text-base font-semibold"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1.5">
                        Recommended: 1500-2500 calories for most adults
                      </p>
                    </div>

                    <div className="border-l-2 border-neutral-200 pl-6">
                      <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-emerald-600 rounded-full"></div>
                        Macro Preference
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: "balanced", label: "Balanced", ratio: "40/30/30", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop" },
                          { value: "high-protein", label: "High Protein", ratio: "30/40/30", img: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=200&fit=crop" },
                          { value: "low-carb", label: "Low Carb", ratio: "20/40/40", img: "https://images.unsplash.com/photo-1601315243736-d5e0e15a0cd7?w=300&h=200&fit=crop" }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => updateFormData("macroPreference", option.value)}
                            className={`rounded-lg border-2 overflow-hidden transition-all hover:shadow-md ${
                              formData.macroPreference === option.value
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-neutral-200"
                            }`}
                            type="button"
                          >
                            <img src={option.img} alt={option.label} className="w-full h-20 object-cover" />
                            <div className="p-2">
                              <p className="font-bold text-xs text-neutral-900">{option.label}</p>
                              <p className="text-[10px] font-semibold text-emerald-600">{option.ratio}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Meal Structure */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-emerald-600 rounded-full"></div>
                        Meals Per Day
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "3", label: "3 Meals", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop" },
                          { value: "4", label: "4 Meals", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop" },
                          { value: "5", label: "5 Meals", img: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=300&h=200&fit=crop" }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => updateFormData("mealsPerDay", option.value)}
                            className={`rounded-lg border-2 overflow-hidden transition-all ${
                              formData.mealsPerDay === option.value
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-neutral-200"
                            }`}
                            type="button"
                          >
                            <img src={option.img} alt={option.label} className="w-full h-20 object-cover" />
                            <div className="p-2">
                              <p className="font-bold text-xs text-neutral-900">{option.label}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-l-2 border-neutral-200 pl-6">
                      <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                        Meal Complexity
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "simple", label: "Quick", desc: "15-20 min", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop" },
                          { value: "moderate", label: "Moderate", desc: "30-40 min", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop" },
                          { value: "complex", label: "Complex", desc: "45+ min", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=200&fit=crop" }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => updateFormData("mealComplexity", option.value)}
                            className={`rounded-lg border-2 overflow-hidden transition-all ${
                              formData.mealComplexity === option.value
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-neutral-200"
                            }`}
                            type="button"
                          >
                            <img src={option.img} alt={option.label} className="w-full h-20 object-cover" />
                            <div className="p-2">
                              <p className="font-bold text-xs text-neutral-900">{option.label}</p>
                              <p className="text-[10px] text-neutral-500">{option.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-l-2 border-neutral-200 pl-6">
                      <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
                        Meal Prep Style
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "daily", label: "Fresh Daily", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=200&fit=crop" },
                          { value: "prep", label: "Meal Prep", img: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=300&h=200&fit=crop" }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => updateFormData("mealPrepStyle", option.value)}
                            className={`rounded-lg border-2 overflow-hidden transition-all ${
                              formData.mealPrepStyle === option.value
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-neutral-200"
                            }`}
                            type="button"
                          >
                            <img src={option.img} alt={option.label} className="w-full h-20 object-cover" />
                            <div className="p-2">
                              <p className="font-bold text-xs text-neutral-900">{option.label}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Budget & Time */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-green-600 rounded-full"></div>
                        Daily Food Budget (PHP)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: "150", label: "₱150-250" },
                          { value: "300", label: "₱250-400" },
                          { value: "500", label: "₱400-600" },
                          { value: "600+", label: "₱600+" }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => updateFormData("dailyBudget", option.value)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              formData.dailyBudget === option.value
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-neutral-200 hover:border-emerald-300"
                            }`}
                            type="button"
                          >
                            <p className="font-bold text-xs text-neutral-900">{option.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-l-2 border-neutral-200 pl-6">
                      <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                        Daily Cooking Time
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: "15", label: "< 15 min", icon: "⚡" },
                          { value: "30", label: "15-30 min", icon: "⏱️" },
                          { value: "45", label: "30-45 min", icon: "🕐" },
                          { value: "60+", label: "45+ min", icon: "⏳" }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => updateFormData("cookingTime", option.value)}
                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                              formData.cookingTime === option.value
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-neutral-200 hover:border-emerald-300"
                            }`}
                            type="button"
                          >
                            <span className="text-2xl">{option.icon}</span>
                            <span className="font-medium text-[10px]">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-xs font-medium text-neutral-500">Cooking Methods</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                      <div className="w-1 h-5 bg-orange-600 rounded-full"></div>
                      Preferred Cooking Methods (Multiple allowed)
                    </label>
                    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { value: "stove", label: "Stove Top", icon: "🔥", img: "https://images.unsplash.com/photo-1556911073-38141963c9e0?w=200&h=150&fit=crop" },
                        { value: "oven", label: "Oven", icon: "🥘", img: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=200&h=150&fit=crop" },
                        { value: "airfryer", label: "Air Fryer", icon: "🍗", img: "https://images.unsplash.com/photo-1624027358844-06afd7cc1168?w=200&h=150&fit=crop" },
                        { value: "microwave", label: "Microwave", icon: "📱", img: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=200&h=150&fit=crop" },
                        { value: "slowcooker", label: "Slow Cooker", icon: "🍲", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=150&fit=crop" },
                        { value: "nocook", label: "No-Cook", icon: "🥗", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=150&fit=crop" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => toggleArrayField("cookingMethod", option.value)}
                          className={`rounded-lg border-2 overflow-hidden transition-all ${
                            formData.cookingMethod.includes(option.value)
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-neutral-200 hover:border-emerald-300"
                          }`}
                          type="button"
                        >
                          <div className="relative">
                            <img src={option.img} alt={option.label} className="w-full h-20 object-cover" />
                            {formData.cookingMethod.includes(option.value) && (
                              <div className="absolute top-1.5 left-1.5 bg-emerald-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
                                <FaCheck className="text-[10px]" />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xl mb-0.5">{option.icon}</p>
                            <p className="font-semibold text-[10px] text-neutral-900">{option.label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Special Goals */}
              {currentStep === 7 && (
                <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                      <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
                      Select Your Focus Areas (Multiple allowed)
                    </label>
                    <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {[
                        { value: "muscle", label: "Muscle Building", icon: "💪", img: "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=300&h=200&fit=crop" },
                        { value: "fat-loss", label: "Fat Loss", icon: "🔥", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop" },
                        { value: "balanced", label: "Balanced", icon: "⚖️", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop" },
                        { value: "high-protein", label: "High Protein", icon: "🍖", img: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=200&fit=crop" },
                        { value: "low-sodium", label: "Low Sodium", icon: "🧂", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop" },
                        { value: "high-fiber", label: "High Fiber", icon: "🌾", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop" },
                        { value: "budget", label: "Budget", icon: "💰", img: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=300&h=200&fit=crop" },
                        { value: "energy", label: "Energy", icon: "⚡", img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&h=200&fit=crop" },
                        { value: "immunity", label: "Immunity", icon: "🛡️", img: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=300&h=200&fit=crop" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => toggleArrayField("specialGoals", option.value)}
                          className={`rounded-lg border-2 overflow-hidden transition-all hover:shadow-md ${
                            formData.specialGoals.includes(option.value)
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-neutral-200"
                          }`}
                          type="button"
                        >
                          <div className="relative">
                            <img src={option.img} alt={option.label} className="w-full h-24 object-cover" />
                            <div className="absolute top-1.5 right-1.5 text-2xl">{option.icon}</div>
                            {formData.specialGoals.includes(option.value) && (
                              <div className="absolute top-1.5 left-1.5 bg-emerald-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
                                <FaCheck className="text-[10px]" />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="font-semibold text-xs text-neutral-900">{option.label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 8: Portion Size */}
              {currentStep === 8 && (
                <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                      <div className="w-1 h-5 bg-amber-600 rounded-full"></div>
                      Select Your Appetite Level
                    </label>
                    <div className="grid lg:grid-cols-3 gap-4">
                      {[
                        { 
                          value: "light", 
                          label: "Light Eater", 
                          desc: "Small portions", 
                          img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
                          icon: "🥗"
                        },
                        { 
                          value: "average", 
                          label: "Average Appetite", 
                          desc: "Standard portions", 
                          img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
                          icon: "🍽️"
                        },
                        { 
                          value: "heavy", 
                          label: "Heavy Eater", 
                          desc: "Large portions", 
                          img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
                          icon: "🍖"
                        }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateFormData("appetite", option.value)}
                          className={`rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg ${
                            formData.appetite === option.value
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-neutral-200"
                          }`}
                          type="button"
                        >
                          <div className="relative">
                            <img src={option.img} alt={option.label} className="w-full h-32 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-3 left-3 text-white">
                              <p className="text-3xl mb-1">{option.icon}</p>
                              <p className="font-bold text-base">{option.label}</p>
                            </div>
                          </div>
                          <div className="p-3 bg-white">
                            <p className="text-xs text-neutral-600">{option.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-emerald-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-xs font-medium text-neutral-500">Almost Done!</span>
                    </div> 
                  </div>

                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-600 text-white p-2.5 rounded-lg">
                        <FaCheck className="text-base" />
                      </div>
                      <div>
                        <h3 className="font-bold text-emerald-900 mb-1 text-sm">Almost Done!</h3>
                        <p className="text-emerald-700 text-xs">
                          Click "Generate My Meal Plan" to get your personalized weekly menu!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="bg-neutral-50 border-t px-6 py-4 border-neutral-200">
              <div className="flex justify-between items-center max-w-7xl mx-auto">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm ${
                    currentStep === 1 ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      : "bg-white border-2 border-neutral-200 text-neutral-700 hover:border-emerald-500"
                  }`}
                  type="button">
                  <FaArrowLeft className="text-xs" /> Back
                </button>
                <div className="text-xs text-neutral-500">{currentStep} of {STEPS.length}</div>
                <button
                  onClick={nextStep}
                  disabled={!isStepValid() || submitting}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm shadow ${
                    isStepValid() && !submitting
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  }`}
                  type="button">
                  {currentStep === STEPS.length
                    ? submitting
                      ? (<><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>)
                      : (<><FaCheck className="text-xs" /> Generate</>)
                    : (<>Next <FaArrowRight className="text-xs" /></>)}
                </button>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn { from {opacity:0;transform:translateY(10px);} to {opacity:1;transform:translateY(0);} }
          .animate-fadeIn { animation: fadeIn .4s ease-out; }
        `}</style>
      </div>
    </main>
  );
};

export default MealPreferences;