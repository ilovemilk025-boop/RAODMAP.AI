import React, { useState, useEffect } from "react";
import { OnboardingData, Roadmap, UserStats } from "./types";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import DayStudy from "./components/DayStudy";
import KnowledgeMap from "./components/KnowledgeMap";
import AITutor from "./components/AITutor";
import Analytics from "./components/Analytics";
import { Brain, Sparkles, LogOut, Code, Award, Activity, Flame, MessageSquare, Map } from "lucide-react";

const LOCAL_ONB_KEY = "learnanything45_onboarding_v1";
const LOCAL_ROADMAP_KEY = "learnanything45_roadmap_v1";
const LOCAL_STATS_KEY = "learnanything45_stats_v1";

const DEFAULT_STATS: UserStats = {
  completedDays: [],
  currentDay: 1,
  streak: 1,
  xp: 120,
  level: 1,
  lastActiveDate: null,
  deepProcessingScore: 75,
  retrievalScore: 60,
  consistencyScore: 80,
  focusScore: 85,
  summaryEvaluations: {},
  diagnosticsScores: {
    deepProcessing: 68,
    retrieval: 55,
    mindset: 80,
    selfRegulation: 72,
    selfManagement: 64
  }
};

export default function App() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_STATS);
  const [currentView, setCurrentView] = useState<"dashboard" | "knowledge-map" | "tutor" | "analytics">("dashboard");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Hydrate states from local storage on mount
  useEffect(() => {
    try {
      const savedOnb = localStorage.getItem(LOCAL_ONB_KEY);
      const savedRoadmap = localStorage.getItem(LOCAL_ROADMAP_KEY);
      const savedStats = localStorage.getItem(LOCAL_STATS_KEY);

      if (savedOnb) setOnboardingData(JSON.parse(savedOnb));
      if (savedRoadmap) setRoadmap(JSON.parse(savedRoadmap));
      
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      } else {
        // Initial setup for default streak verification on first load
        const todayStr = new Date().toDateString();
        const initialStats = { ...DEFAULT_STATS, lastActiveDate: todayStr };
        setUserStats(initialStats);
        localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(initialStats));
      }
    } catch (e) {
      console.error("Local storage hydration failed:", e);
    }
  }, []);

  // Complete onboarding sequence
  const handleOnboardingComplete = (onb: OnboardingData, generatedRoadmap: Roadmap) => {
    setOnboardingData(onb);
    setRoadmap(generatedRoadmap);
    
    // Set baseline diagnostics based on skill level choice
    let initialScore = 40;
    if (onb.currentLevel === "Novice") initialScore = 20;
    if (onb.currentLevel === "Advanced") initialScore = 75;

    const statsSetup: UserStats = {
      ...DEFAULT_STATS,
      lastActiveDate: new Date().toDateString(),
      diagnosticsScores: {
        deepProcessing: initialScore,
        retrieval: initialScore - 10,
        mindset: 80,
        selfRegulation: onb.bottleneck === "SELF_REG_ERR" ? 45 : initialScore,
        selfManagement: initialScore + 5
      }
    };

    setUserStats(statsSetup);
    setCurrentView("dashboard");
    setSelectedDay(null);

    // Persist
    localStorage.setItem(LOCAL_ONB_KEY, JSON.stringify(onb));
    localStorage.setItem(LOCAL_ROADMAP_KEY, JSON.stringify(generatedRoadmap));
    localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(statsSetup));
  };

  // Select day lesson item
  const handleSelectDay = (dayNum: number) => {
    setSelectedDay(dayNum);
  };

  // Complete study unit process
  const handleCompleteDay = (metrics: { deepProcessing: number; retrieval: number }) => {
    if (!selectedDay) return;

    setUserStats((prev) => {
      const isNewCompletion = !prev.completedDays.includes(selectedDay);
      const updatedCompleted = isNewCompletion 
        ? [...prev.completedDays, selectedDay] 
        : prev.completedDays;

      // Experience calculation (+150 XP per day completion)
      const earnedXp = isNewCompletion ? 150 : 0;
      const totalXp = prev.xp + earnedXp;

      // Level estimation: level transitions every dynamic formula boundary
      const currentLvlLimit = (prev.level * 150) + 100;
      const newLvl = totalXp >= currentLvlLimit ? prev.level + 1 : prev.level;

      // Streak verification using Gregorian calendar dates
      const todayStr = new Date().toDateString();
      let newStreak = prev.streak;
      if (isNewCompletion && prev.lastActiveDate !== todayStr) {
        newStreak = prev.streak + 1;
      }

      // Recalculate average scores
      const newDeepAvg = isNewCompletion
        ? Math.round((prev.deepProcessingScore * (updatedCompleted.length - 1) + metrics.deepProcessing) / updatedCompleted.length)
        : prev.deepProcessingScore;

      const newRetrievalAvg = isNewCompletion
        ? Math.round((prev.retrievalScore * (updatedCompleted.length - 1) + metrics.retrieval) / updatedCompleted.length)
        : prev.retrievalScore;

      // Advance daily focus index sequentially
      let nextActiveDay = prev.currentDay;
      if (selectedDay === prev.currentDay && isNewCompletion) {
        nextActiveDay = Math.min(45, prev.currentDay + 1);
      }

      // Update 5 diagnostic dimensions incrementally based on day details
      const diagnosticsUpdate = {
        deepProcessing: Math.min(100, Math.round((prev.diagnosticsScores.deepProcessing + metrics.deepProcessing) / 2)),
        retrieval: Math.min(100, Math.round((prev.diagnosticsScores.retrieval + metrics.retrieval) / 2)),
        mindset: Math.min(100, prev.diagnosticsScores.mindset + (isNewCompletion ? 1 : 0)),
        selfRegulation: Math.min(100, prev.diagnosticsScores.selfRegulation + (isNewCompletion ? 2 : 0)),
        selfManagement: Math.min(100, prev.diagnosticsScores.selfManagement + (isNewCompletion ? 1 : 0))
      };

      const updatedStats: UserStats = {
        ...prev,
        completedDays: updatedCompleted,
        currentDay: nextActiveDay,
        streak: newStreak,
        xp: totalXp,
        level: newLvl,
        lastActiveDate: todayStr,
        deepProcessingScore: newDeepAvg,
        retrievalScore: newRetrievalAvg,
        diagnosticsScores: diagnosticsUpdate
      };

      // Sync and save and return
      localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(updatedStats));
      return updatedStats;
    });

    // Close the day study view and shift to dashboard
    setSelectedDay(null);
    setCurrentView("dashboard");
  };

  const handleResetRoadmap = () => {
    if (confirm("Are you sure you want to reset your 45-day cognitive learning roadmap? This will wipe your history.")) {
      localStorage.removeItem(LOCAL_ONB_KEY);
      localStorage.removeItem(LOCAL_ROADMAP_KEY);
      localStorage.removeItem(LOCAL_STATS_KEY);
      setOnboardingData(null);
      setRoadmap(null);
      setUserStats(DEFAULT_STATS);
      setCurrentView("dashboard");
      setSelectedDay(null);
    }
  };

  // If onboarding not finalized, display beautiful onboarding screen!
  if (!onboardingData || !roadmap) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const activeDayOutline = roadmap.daysOutline.find((d) => d.dayNumber === selectedDay) || roadmap.daysOutline[0];

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white flex flex-col relative font-sans overflow-x-hidden">
      
      {/* Immersive radial glows from "Frosted Glass" theme specs */}
      <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-200px] right-[-100px] w-[600px] h-[600px] bg-purple-500/10 blur-[160px] rounded-full pointer-events-none"></div>

      {/* Persistent Elegant Header */}
      <header className="h-20 shrink-0 sticky top-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 sm:px-10">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center text-lg font-black shadow-lg shadow-blue-500/20">
            L
          </div>
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            LearnAnything<span className="text-[#3B82F6]">45</span>
          </span>
        </div>

        {/* Global Navigation Link items */}
        <nav className="hidden md:flex gap-8 text-xs uppercase tracking-wider font-extrabold text-white/50">
          <button
            onClick={() => { setCurrentView("dashboard"); setSelectedDay(null); }}
            className={`transition-colors cursor-pointer ${currentView === "dashboard" && !selectedDay ? "text-white pb-1 border-b-2 border-blue-500" : "hover:text-white"}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setCurrentView("knowledge-map"); setSelectedDay(null); }}
            className={`transition-colors cursor-pointer ${currentView === "knowledge-map" ? "text-white pb-1 border-b-2 border-blue-500" : "hover:text-white"}`}
          >
            Knowledge Map
          </button>
          <button
            onClick={() => { setCurrentView("tutor"); setSelectedDay(null); }}
            className={`transition-colors cursor-pointer ${currentView === "tutor" ? "text-white pb-1 border-b-2 border-blue-500" : "hover:text-white"}`}
          >
            AI Tutor
          </button>
          <button
            onClick={() => { setCurrentView("analytics"); setSelectedDay(null); }}
            className={`transition-colors cursor-pointer ${currentView === "analytics" ? "text-white pb-1 border-b-2 border-blue-500" : "hover:text-white"}`}
          >
            Diagnostics
          </button>
        </nav>

        {/* User Stats Profile summary */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Level {userStats.level} Learner</p>
            <p className="text-xs font-black text-white">{onboardingData.currentLevel || "Beginner"}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-blue-500/60 p-0.5 flex items-center justify-center bg-white/5">
            <div className="w-full h-full bg-[#121820] rounded-full flex items-center justify-center font-extrabold text-xs text-blue-400 font-mono">
              ★
            </div>
          </div>
        </div>

      </header>

      {/* Main Workspace Frame container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 z-10">

        {/* Toggleable views orchestrator */}
        {selectedDay ? (
          <DayStudy
            dayNumber={selectedDay}
            dayOutline={activeDayOutline}
            userStats={userStats}
            skillName={roadmap.skillName}
            onBack={() => setSelectedDay(null)}
            onCompleteDay={handleCompleteDay}
          />
        ) : (
          <>
            {currentView === "dashboard" && (
              <Dashboard
                roadmap={roadmap}
                userStats={userStats}
                onSelectDay={handleSelectDay}
                onChangeView={setCurrentView}
                onResetRoadmap={handleResetRoadmap}
              />
            )}

            {currentView === "knowledge-map" && (
              <KnowledgeMap skillName={roadmap.skillName} />
            )}

            {currentView === "tutor" && (
              <AITutor
                skillName={roadmap.skillName}
                currentDay={userStats.currentDay}
                currentDayObjective={roadmap.daysOutline.find(d => d.dayNumber === userStats.currentDay)?.shortObjective}
              />
            )}

            {currentView === "analytics" && (
              <Analytics userStats={userStats} />
            )}
          </>
        )}

      </main>

      {/* Persistent Bottom Mobile Nav Panel */}
      <footer className="md:hidden shrink-0 sticky bottom-0 z-40 bg-black/60 backdrop-blur-md border-t border-white/5 px-4 py-3 flex justify-around text-[10px] font-bold text-white/50">
        <button
          onClick={() => { setCurrentView("dashboard"); setSelectedDay(null); }}
          className={`flex flex-col items-center gap-1.5 transition-colors ${currentView === "dashboard" && !selectedDay ? "text-blue-400" : "hover:text-white"}`}
        >
          <Award className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => { setCurrentView("knowledge-map"); setSelectedDay(null); }}
          className={`flex flex-col items-center gap-1.5 transition-colors ${currentView === "knowledge-map" ? "text-blue-400" : "hover:text-white"}`}
        >
          <Map className="w-4 h-4" />
          <span>Map</span>
        </button>
        <button
          onClick={() => { setCurrentView("tutor"); setSelectedDay(null); }}
          className={`flex flex-col items-center gap-1.5 transition-colors ${currentView === "tutor" ? "text-blue-400" : "hover:text-white"}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Tutor</span>
        </button>
        <button
          onClick={() => { setCurrentView("analytics"); setSelectedDay(null); }}
          className={`flex flex-col items-center gap-1.5 transition-colors ${currentView === "analytics" ? "text-blue-400" : "hover:text-white"}`}
        >
          <Activity className="w-4 h-4" />
          <span>Diagnostics</span>
        </button>
      </footer>

      {/* Small Legal Strip */}
      <div className="w-full text-center py-4 text-[9px] text-white/20 uppercase tracking-widest border-t border-white/5 select-none shrink-0 bg-black/30 pointer-events-none">
        LearnAnything45 Cognitive OS • Powered by Justin Sung Three-C Methods
      </div>

    </div>
  );
}
