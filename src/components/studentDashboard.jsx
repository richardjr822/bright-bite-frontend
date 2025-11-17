import React, { useState, useEffect, useCallback } from "react";
import { 
  FaLeaf, 
  FaHeart, 
  FaSeedling, 
  FaClock, 
  FaRegLightbulb,
  FaUserFriends,
  FaUtensils
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

const UserDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  // Animate elements when component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all data from backend with 5-minute auto-refresh
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log("=== FRONTEND: Fetching data from API ===");
      console.log("API_BASE:", API_BASE);
      
      // Fetch programs
      console.log("Fetching programs from:", `${API_BASE}/programs`);
      const programsRes = await fetch(`${API_BASE}/programs`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }).catch(err => {
        console.error("Programs fetch error:", err);
        return { ok: false, json: () => Promise.resolve([]) };
      });
      
      console.log("Programs response status:", programsRes.status);
      console.log("Programs response ok:", programsRes.ok);
      
      // Fetch meal plans
      console.log("Fetching meal plans from:", `${API_BASE}/meal-plans`);
      const mealPlansRes = await fetch(`${API_BASE}/meal-plans`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }).catch(err => {
        console.error("Meal plans fetch error:", err);
        return { ok: false, json: () => Promise.resolve([]) };
      });
      
      console.log("Meal plans response status:", mealPlansRes.status);
      
      // Fetch beneficiaries
      console.log("Fetching beneficiaries from:", `${API_BASE}/beneficiaries`);
      const beneficiariesRes = await fetch(`${API_BASE}/beneficiaries`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }).catch(err => {
        console.error("Beneficiaries fetch error:", err);
        return { ok: false, json: () => Promise.resolve([]) };
      });
      
      console.log("Beneficiaries response status:", beneficiariesRes.status);

      // Parse responses
      let programsData = [];
      if (programsRes.ok) {
        try {
          const responseText = await programsRes.text();
          console.log("Programs raw response:", responseText);
          programsData = responseText ? JSON.parse(responseText) : [];
          console.log("Programs parsed data:", programsData);
        } catch (parseError) {
          console.error("Error parsing programs response:", parseError);
          programsData = [];
        }
      }

      let mealPlansData = [];
      if (mealPlansRes.ok) {
        try {
          const responseText = await mealPlansRes.text();
          console.log("Meal plans raw response:", responseText);
          mealPlansData = responseText ? JSON.parse(responseText) : [];
          console.log("Meal plans parsed data:", mealPlansData);
        } catch (parseError) {
          console.error("Error parsing meal plans response:", parseError);
          mealPlansData = [];
        }
      }

      let beneficiariesData = [];
      if (beneficiariesRes.ok) {
        try {
          const responseText = await beneficiariesRes.text();
          console.log("Beneficiaries raw response:", responseText);
          beneficiariesData = responseText ? JSON.parse(responseText) : [];
          console.log("Beneficiaries parsed data:", beneficiariesData);
        } catch (parseError) {
          console.error("Error parsing beneficiaries response:", parseError);
          beneficiariesData = [];
        }
      }

      console.log("=== FRONTEND: Final data counts ===");
      console.log("Programs:", programsData.length);
      console.log("Meal plans:", mealPlansData.length);
      console.log("Beneficiaries:", beneficiariesData.length);

      setPrograms(programsData);
      setMealPlans(mealPlansData);
      setBeneficiaries(beneficiariesData);

      // Calculate analytics
      const analytics = calculateAnalytics(programsData, mealPlansData, beneficiariesData);
      setAnalyticsData(analytics);
      
      setLoading(false);
    } catch (err) {
      console.error("=== FRONTEND: Data fetch error ===", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();
    
    // Set up 5-minute auto-refresh interval
    const refreshInterval = setInterval(() => {
      console.log("=== Auto-refresh triggered ===");
      fetchData();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
    
    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [fetchData]);

  // Calculate analytics from fetched data
  const calculateAnalytics = (programs, mealPlans, beneficiaries) => {
    console.log("=== Calculating analytics ===");
    console.log("Input programs:", programs);
    console.log("Input meal plans:", mealPlans);
    console.log("Input beneficiaries:", beneficiaries);

    // Calculate beneficiaries by age
    const beneficiariesByAge = {
      children: beneficiaries.filter(b => {
        const age = b.age || 0;
        return age < 13;
      }).length,
      teens: beneficiaries.filter(b => {
        const age = b.age || 0;
        return age >= 13 && age < 20;
      }).length,
      adults: beneficiaries.filter(b => {
        const age = b.age || 0;
        return age >= 20 && age < 60;
      }).length,
      elderly: beneficiaries.filter(b => {
        const age = b.age || 0;
        return age >= 60;
      }).length
    };

    // Filter programs - show all statuses EXCEPT "Cancelled"
    const activePrograms = programs.filter(p => {
      console.log(`Program "${p.name}" status:`, p.status);
      return p.status !== "Cancelled";
    });
    
    console.log("Active programs (all except Cancelled) count:", activePrograms.length);
    
    // Calculate progress based on status and days passed
    const programsWithCounts = activePrograms.map(p => {
      const progress = calculateProgramProgress(p.event_date, p.status);
      
      return {
        ...p,
        beneficiaryCount: p.beneficiaries_count || 0,
        progress: progress
      };
    });

    console.log("Programs with counts:", programsWithCounts);

    const analytics = {
      totalBeneficiaries: beneficiaries.length,
      activeMealPlans: mealPlans.length,
      nutritionMetrics: {
        caloriesServed: mealPlans.reduce((sum, meal) => sum + (meal.calories || 0), 0),
        proteinsServed: Math.round(mealPlans.reduce((sum, meal) => sum + (meal.calories || 0), 0) * 0.15 / 4),
        mealsDistributed: beneficiaries.length * 30
      },
      beneficiariesByAge,
      programs: programsWithCounts
    };

    console.log("=== Final analytics ===", analytics);
    return analytics;
  };

  // Calculate program progress based on event date and status
  const calculateProgramProgress = (eventDate, status) => {
    if (!eventDate) return 0;
    
    try {
      const event = new Date(eventDate);
      const today = new Date();
      
      // If status is Completed, show 100%
      if (status === "Completed") {
        return 100;
      }
      
      // If status is Ongoing, show 50-75% progress
      if (status === "Ongoing") {
        return 65; // Middle of the program
      }
      
      // If status is Upcoming, calculate progress based on days until event
      if (status === "Upcoming") {
        if (event > today) {
          // Assume program planning started 30 days before event
          const programStart = new Date(event);
          programStart.setDate(programStart.getDate() - 30);
          
          const totalDuration = event - programStart;
          const elapsed = today - programStart;
          
          const progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
          return progress;
        } else {
          // Event has passed but status is still Upcoming
          return 100;
        }
      }
      
      // Default case
      return 0;
    } catch (e) {
      console.error("Error calculating progress:", e);
      return 0;
    }
  };

  // Calculate days remaining based on event_date
  const getDaysRemaining = (eventDate) => {
    if (!eventDate) return 0;
    
    try {
      const event = new Date(eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      event.setHours(0, 0, 0, 0);
      
      const diff = Math.ceil((event - today) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch (e) {
      console.error("Error calculating days remaining:", e);
      return 0;
    }
  };

  // Use loading state for analytics section only
  const analytics = analyticsData || {
    totalBeneficiaries: 0,
    activeMealPlans: 0,
    nutritionMetrics: {
      caloriesServed: 0,
      proteinsServed: 0,
      mealsDistributed: 0
    },
    beneficiariesByAge: {
      children: 0,
      teens: 0,
      adults: 0,
      elderly: 0
    },
    programs: []
  };

  // Get all active programs (not cancelled)
  const activePrograms = analytics.programs;

  console.log("=== Rendering dashboard ===");
  console.log("Active programs to display:", activePrograms);

  return (
    <div className="h-full px-6 py-6 overflow-auto">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Dashboard
        </h1>
        <p className="text-gray-400 mt-1">Program overview and activity monitoring</p>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-8">
        {/* Analytics Cards */}
        <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {/* Beneficiaries Card */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-700/10 rounded-xl border border-green-500/20 p-5 relative overflow-hidden group hover:border-green-500/40 transition-all duration-300 shadow-lg">
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-green-500/5 rounded-tr-full"></div>
              <div className="flex items-start gap-4">
                <div className="bg-green-500/20 rounded-lg p-2.5 text-green-300">
                  <FaHeart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-green-300 text-sm mb-1">Beneficiaries</p>
                  <h3 className="text-2xl font-bold text-white">
                    {loading ? "..." : analytics.totalBeneficiaries.toLocaleString()}
                  </h3>
                  <p className="text-xs text-green-300/70 mt-1">People supported</p>
                </div>
              </div>
            </div>
            {/* Meal Plan Card */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-700/10 rounded-xl border border-emerald-500/20 p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300 shadow-lg">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-emerald-500/5 rounded-tr-full"></div>
              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/20 rounded-lg p-2.5 text-emerald-300">
                  <FaLeaf className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-emerald-300 text-sm mb-1">Meal Plans</p>
                  <h3 className="text-2xl font-bold text-white">
                    {loading ? "..." : analytics.activeMealPlans}
                  </h3>
                  <p className="text-xs text-emerald-300/70 mt-1">Active meal plans</p>
                </div>
              </div>
            </div>
            {/* Active Programs Card */}
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-700/10 rounded-xl border border-amber-500/20 p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300 shadow-lg">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-amber-500/5 rounded-tr-full"></div>
              <div className="flex items-start gap-4">
                <div className="bg-amber-500/20 rounded-lg p-2.5 text-amber-300">
                  <FaSeedling className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-amber-300 text-sm mb-1">Active Programs</p>
                  <h3 className="text-2xl font-bold text-white">
                    {loading ? "..." : activePrograms.length}
                  </h3>
                  <p className="text-xs text-amber-300/70 mt-1">Active programs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Programs Overview - Full Width */}
        <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/40 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center">
              <span className="bg-amber-500/20 p-1.5 rounded-md mr-3">
                <FaUtensils className="h-4 w-4 text-amber-300" />
              </span>
              Active Programs
            </h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-800/50 rounded-xl border border-gray-700/30 p-5 animate-pulse h-40"></div>
                ))}
              </div>
            ) : activePrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activePrograms.map((program) => {
                  const daysRemaining = getDaysRemaining(program.event_date);
                  
                  // Dynamic color scheme based on status
                  const getColorScheme = (status) => {
                    switch(status) {
                      case "Upcoming":
                        return {
                          bg: "from-amber-800/30 to-amber-900/20",
                          border: "border-amber-500/40",
                          iconBg: "bg-amber-500/20",
                          iconText: "text-amber-300",
                          progressBg: "bg-amber-500",
                          textColor: "text-amber-300"
                        };
                      case "Ongoing":
                        return {
                          bg: "from-emerald-800/30 to-emerald-900/20",
                          border: "border-emerald-500/40",
                          iconBg: "bg-emerald-500/20",
                          iconText: "text-emerald-300",
                          progressBg: "bg-emerald-500",
                          textColor: "text-emerald-300"
                        };
                      case "Completed":
                        return {
                          bg: "from-indigo-800/30 to-indigo-900/20",
                          border: "border-indigo-500/40",
                          iconBg: "bg-indigo-500/20",
                          iconText: "text-indigo-300",
                          progressBg: "bg-indigo-500",
                          textColor: "text-indigo-300"
                        };
                      default:
                        return {
                          bg: "from-gray-800/50 to-gray-800/30",
                          border: "border-gray-500/40",
                          iconBg: "bg-gray-500/20",
                          iconText: "text-gray-300",
                          progressBg: "bg-gray-500",
                          textColor: "text-gray-300"
                        };
                    }
                  };
                  
                  const colorScheme = getColorScheme(program.status);

                  return (
                    <div 
                      key={program.id}
                      className={`bg-gradient-to-r ${colorScheme.bg} rounded-xl border border-gray-700/30 p-5 hover:${colorScheme.border} transition-all cursor-pointer shadow-md`}
                      onClick={() => navigate("/programs")}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`${colorScheme.iconBg} rounded-lg p-3 ${colorScheme.iconText}`}>
                          <FaRegLightbulb className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                            <div>
                              <h3 className="text-white font-medium">{program.name}</h3>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Serving {program.beneficiaryCount} {program.beneficiaryCount === 1 ? 'person' : 'people'}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1.5 text-xs">
                              <span className="text-gray-400">Progress</span>
                              <span className={colorScheme.textColor}>{program.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                              <div 
                                className={`${colorScheme.progressBg} h-1.5 rounded-full transition-all duration-500`}
                                style={{ width: `${program.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {program.status !== "Completed" && (
                            <div className={`mt-3 flex items-center text-xs ${colorScheme.textColor}`}>
                              <FaClock className="h-3 w-3 mr-1.5" />
                              <span>
                                {daysRemaining === 0 
                                  ? "Event is today!" 
                                  : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} until event`
                                }
                              </span>
                            </div>
                          )}
                          
                          {program.status === "Completed" && (
                            <div className={`mt-3 flex items-center text-xs ${colorScheme.textColor}`}>
                              <span>Event completed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FaSeedling className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No active programs</p>
                <p className="text-xs mt-1">Create a new program to see it here</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                className="bg-gray-700/50 hover:bg-gray-700/70 transition-colors text-gray-300 font-medium text-sm px-5 py-2.5 rounded-lg border border-gray-700/50 flex items-center gap-2"
                onClick={() => navigate("/programs")}
              >
                View All Programs
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Beneficiary Demographics */}
        <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/40 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center">
              <span className="bg-emerald-500/20 p-1.5 rounded-md mr-3">
                <FaUserFriends className="h-4 w-4 text-emerald-300" />
              </span>
              Beneficiary Demographics
            </h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-800/60 rounded-lg border border-gray-700/40 p-4 animate-pulse h-24"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/60 rounded-lg border border-gray-700/40 p-4 text-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-indigo-300 text-xs mb-1">Children</p>
                  <h3 className="text-xl font-bold text-white">{analytics.beneficiariesByAge.children}</h3>
                  <p className="text-[10px] text-gray-500 mt-1">&lt; 13 years</p>
                </div>
                
                <div className="bg-gray-800/60 rounded-lg border border-gray-700/40 p-4 text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-emerald-300 text-xs mb-1">Teens</p>
                  <h3 className="text-xl font-bold text-white">{analytics.beneficiariesByAge.teens}</h3>
                  <p className="text-[10px] text-gray-500 mt-1">13-19 years</p>
                </div>
                
                <div className="bg-gray-800/60 rounded-lg border border-gray-700/40 p-4 text-center">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-amber-300 text-xs mb-1">Adults</p>
                  <h3 className="text-xl font-bold text-white">{analytics.beneficiariesByAge.adults}</h3>
                  <p className="text-[10px] text-gray-500 mt-1">20-59 years</p>
                </div>
                
                <div className="bg-gray-800/60 rounded-lg border border-gray-700/40 p-4 text-center">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-rose-300 text-xs mb-1">Elderly</p>
                  <h3 className="text-xl font-bold text-white">{analytics.beneficiariesByAge.elderly}</h3>
                  <p className="text-[10px] text-gray-500 mt-1">60+ years</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;