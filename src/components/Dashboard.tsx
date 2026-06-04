import React from "react";
import { Roadmap, UserStats, DayOutline } from "../types";
import { Flame, Brain, Award, Sparkles, BookOpen, AlertCircle, Play, CheckCircle, Lock, Calendar, ClipboardList } from "lucide-react";

interface DashboardProps {
  roadmap: Roadmap;
  userStats: UserStats;
  onSelectDay: (dayNumber: number) => void;
  onChangeView: (view: any) => void;
  onResetRoadmap: () => void;
}

export default function Dashboard({ roadmap, userStats, onSelectDay, onChangeView, onResetRoadmap }: DashboardProps) {
  // Compute percentage complete based on completedDays array
  const totalDays = 45;
  const completedCount = userStats.completedDays.length;
  const percentageComplete = Math.round((completedCount / totalDays) * 100);

  // Derive today's day number (next uncompleted day, or current active day)
  const todayDayNum = userStats.currentDay;
  const todayOutline = roadmap.daysOutline.find(d => d.dayNumber === todayDayNum) || roadmap.daysOutline[0];

  // Group days by Phase
  const getPhaseDays = (phaseNum: number) => {
    return roadmap.daysOutline.filter(d => d.phaseNumber === phaseNum);
  };

  // Find user's bottleneck diagnostic text for quick tips
  const currentBottleneckName = roadmap.bottleneckTitle || "Passive Retrieval Dependency";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section Card: Frosted Glass Header */}
      <div id="dashboard_hero_card" className="glass-panel-glow rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Soft decorative glow behind the card */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-4 max-w-xl">
          <div>
            <span className="inline-block px-3 py-1 bg-[#3B82F6]/15 text-[#3B82F6] rounded-full text-xs font-bold uppercase tracking-widest mb-3 border border-[#3B82F6]/25">
              Active Roadmap Mastery
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              {roadmap.skillName}
            </h1>
            <p className="text-white/60 text-sm md:text-base mt-2 leading-relaxed">
              Applying the Three C Protocol: Compression schema builders, compilation tasks, and consolidating retrieval targets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Current Node Target</span>
              <span className="text-xl font-black text-white mt-0.5">Day {todayDayNum} <span className="text-sm font-medium text-white/50">/ 45</span></span>
            </div>
            
            <div className="h-6 w-[1px] bg-white/10 hidden sm:block"></div>

            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Cognitive Impediment Focus</span>
              <span className="text-sm font-extrabold text-amber-400 mt-0.5 flex items-center gap-1.5">
                <Brain className="w-4 h-4" /> {currentBottleneckName}
              </span>
            </div>
          </div>
        </div>

        {/* Circular Progress Indicator */}
        <div className="relative shrink-0 w-32 h-32 md:w-36 md:h-36 flex items-center justify-center self-center md:self-auto bg-black/10 rounded-full p-2 border border-white/5">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
            <circle cx="64" cy="64" r="54" stroke="url(#hero-progress-gradient)" strokeWidth="8" fill="transparent" strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * percentageComplete) / 100} strokeLinecap="round" className="transition-all duration-700 ease-out" />
            <defs>
              <linearGradient id="hero-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black tracking-tight">{percentageComplete}%</span>
            <span className="text-[9px] uppercase tracking-wider text-white/45 font-semibold">Mastery</span>
          </div>
        </div>
      </div>

      {/* Primary Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Streak Counter Segment (Left) */}
        <div id="streak_badge_container" className="col-span-1 md:col-span-4 bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-3 relative group">
            <Flame className="w-8 h-8 text-orange-500 group-hover:scale-110 transition-all duration-300" />
            <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-20"></div>
          </div>
          <span className="text-4xl font-extrabold tracking-tight text-white">{userStats.streak} Days</span>
          <span className="text-white/45 text-xs font-semibold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
            Learning Streak
          </span>
          <p className="text-xs text-white/40 mt-2 max-w-[200px] leading-relaxed">
            Streaks represent consistent high-yield attention slots, reinforcing core consolidation.
          </p>
        </div>

        {/* Dynamic today&apos;s objective card */}
        <div id="todays_mission_container" className="col-span-1 md:col-span-5 bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest px-2.5 py-1 bg-emerald-500/15 rounded-full border border-emerald-500/20">
                Today&apos;s Mission
              </span>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Day {todayDayNum} unit</span>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold leading-snug tracking-tight text-white line-clamp-1">
                {todayOutline?.title}
              </h2>
              <p className="text-white/60 text-xs leading-relaxed max-w-sm line-clamp-2">
                Objective: {todayOutline?.shortObjective}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              id="btn_start_active_day"
              onClick={() => onSelectDay(todayDayNum)}
              className="px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-[#0B0F14] rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Start Deep Work
            </button>
            <button
              id="btn_dashboard_map"
              onClick={() => onChangeView("knowledge-map")}
              className="px-5 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold text-xs uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1.5"
            >
              View Knowledge Map
            </button>
          </div>
        </div>

        {/* Experience Progression */}
        <div id="level_xp_progress_container" className="col-span-1 md:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs uppercase tracking-widest font-bold">Progress Ring</span>
            <span className="text-xs font-extrabold text-[#8B5CF6] uppercase">LVL {userStats.level}</span>
          </div>

          <div className="my-4 text-center">
            <div className="text-3xl font-black text-white">{userStats.xp} XP</div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mt-1">Total Earned Experience</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-white/50 font-bold uppercase tracking-wider">
              <span>Next Level Goal</span>
              <span>{(userStats.level * 150) + 100} XP</span>
            </div>
            {/* XP progress bar */}
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (userStats.xp / ((userStats.level * 150) + 100)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive 45-Day Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Structured Learning Journey</h2>
            <p className="text-white/40 text-xs mt-1">Sequential 45-day milestones targeting cognitive schema growth.</p>
          </div>
          <button
            id="btn_reset_curr_roadmap"
            onClick={onResetRoadmap}
            className="px-4 py-2 border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer"
          >
            Reset Active OS
          </button>
        </div>

        {/* Phases Loop */}
        <div className="space-y-8">
          {roadmap.phases.map((phase) => {
            const phaseDays = getPhaseDays(phase.phaseNumber);
            return (
              <div key={phase.phaseNumber} className="glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden space-y-4">
                
                {/* Phase background accent */}
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500/50 to-transparent"></div>

                {/* Phase Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-[#3B82F6]/15 text-[#3B82F6] text-[10px] font-black uppercase tracking-widest rounded border border-[#3B82F6]/25">
                        Phase {phase.phaseNumber}
                      </span>
                      <span className="text-xs text-white/50 font-bold uppercase tracking-wider">
                        {phase.daysRange}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{phase.title}</h3>
                    <p className="text-xs text-white/60 max-w-2xl mt-1 leading-relaxed">
                      {phase.description}
                    </p>
                  </div>
                  
                  {/* Milestone Card */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-sm w-full md:w-auto shrink-0 space-y-1">
                    <h4 className="text-[9px] uppercase tracking-widest text-emerald-400 font-extrabold flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" /> Phase Project Limit
                    </h4>
                    <p className="text-xs font-black text-white leading-snug line-clamp-1">{phase.milestoneProject}</p>
                  </div>
                </div>

                {/* Days Grid Inside Phase */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 pt-2">
                  {phaseDays.map((day) => {
                    const isCompleted = userStats.completedDays.includes(day.dayNumber);
                    const isCurrent = userStats.currentDay === day.dayNumber;
                    const isLocked = day.dayNumber > userStats.currentDay;

                    let stateStyle = "bg-white/5 border-white/10 hover:border-white/20 text-white/80 cursor-pointer";
                    if (isCompleted) {
                      stateStyle = "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 cursor-pointer shadow-sm shadow-emerald-500/5";
                    } else if (isCurrent) {
                      stateStyle = "bg-blue-500/15 border-[#3B82F6] text-white ring-2 ring-blue-500/20 rounded-2xl scale-[1.02] cursor-pointer cursor-pulse transform";
                    } else if (isLocked) {
                      stateStyle = "bg-black/25 border-white/5 text-white/30 cursor-not-allowed opacity-55";
                    }

                    return (
                      <button
                        key={day.dayNumber}
                        id={`timeline_day_card_${day.dayNumber}`}
                        disabled={isLocked}
                        onClick={() => !isLocked && onSelectDay(day.dayNumber)}
                        className={`text-left p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 relative group h-28 ${stateStyle}`}
                      >
                        {/* Status Icon */}
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-white/40">Day {day.dayNumber}</span>
                          {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-400 fill-current bg-black rounded-full" />}
                          {isCurrent && <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>}
                          {isLocked && <Lock className="w-3.5 h-3.5 text-white/20" />}
                        </div>

                        {/* Title truncation */}
                        <div>
                          <h5 className="font-bold text-xs text-white group-hover:text-[#3B82F6] transition-all leading-snug line-clamp-2 mt-auto">
                            {day.title.replace(/^Day \d+ -\s*/, '')}
                          </h5>
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
