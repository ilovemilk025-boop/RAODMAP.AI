import React from "react";
import { UserStats } from "../types";
import { BarChart2, Activity, Brain, Clipboard, HelpCircle, Trophy, TrendingUp, Sparkles, Zap, ShieldAlert, Sliders } from "lucide-react";

interface AnalyticsProps {
  userStats: UserStats;
}

export default function Analytics({ userStats }: AnalyticsProps) {
  // Trigonometry calculation for Custom SVG Radar Chart
  const centerX = 160;
  const centerY = 150;
  const maxRadius = 100;

  // 5 dimensions: Deep Processing, Retrieval, Mindset, Self-Regulation, Self-Management
  const dimensions = [
    { key: "deepProcessing", label: "Deep Processing", angle: -90, val: userStats.diagnosticsScores.deepProcessing },
    { key: "retrieval", label: "Retrieval", angle: -18, val: userStats.diagnosticsScores.retrieval },
    { key: "mindset", label: "Mindset Belief", angle: 54, val: userStats.diagnosticsScores.mindset },
    { key: "selfRegulation", label: "Self-Regulation", angle: 126, val: userStats.diagnosticsScores.selfRegulation },
    { key: "selfManagement", label: "Self-Management", angle: 198, val: userStats.diagnosticsScores.selfManagement }
  ];

  // Map 0-100 scores to SVG coordinates
  const getPointsString = () => {
    return dimensions.map((d) => {
      const rad = (d.angle * Math.PI) / 180;
      const x = centerX + maxRadius * (d.val / 100) * Math.cos(rad);
      const y = centerY + maxRadius * (d.val / 100) * Math.sin(rad);
      return `${x},${y}`;
    }).join(" ");
  };

  // Find lowest metric
  const sortedDims = [...dimensions].sort((a, b) => a.val - b.val);
  const weakestDim = sortedDims[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* View Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Cognitive Analytics</h2>
        <p className="text-white/40 text-xs mt-1">
          Tracking actual learning mechanics and schema density instead of superficial time indicators.
        </p>
      </div>

      {/* Analytics stats banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        
        <div className="glass-panel rounded-3xl p-5 border border-white/10 relative overflow-hidden flex flex-col justify-between h-32">
          <div>
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Deep Processing Score</span>
            <div className="text-3xl font-black text-blue-400 mt-1">{userStats.deepProcessingScore}%</div>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">Average 3-sentence relational schema evaluation.</p>
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-white/10 relative overflow-hidden flex flex-col justify-between h-32">
          <div>
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Retrieval Accuracy</span>
            <div className="text-3xl font-black text-[#8B5CF6] mt-1">{userStats.retrievalScore}%</div>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">Recall density across Day consolidation flashcards.</p>
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-white/10 relative overflow-hidden flex flex-col justify-between h-32">
          <div>
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Focus Consistency Ratio</span>
            <div className="text-3xl font-black text-[#10B981] mt-1">{userStats.consistencyScore}%</div>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">Streak multipliers plus timeline continuity ratios.</p>
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-white/10 relative overflow-hidden flex flex-col justify-between h-32">
          <div>
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Attention management</span>
            <div className="text-3xl font-black text-amber-400 mt-1">{userStats.focusScore}%</div>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">Dampens mental exhaustion under deliberate loads.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: SVG Radar diagram */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col items-center">
          <div className="w-full pb-3 border-b border-white/5 mb-4 text-center">
            <span className="text-xs uppercase tracking-widest text-[#3B82F6] font-extrabold flex items-center justify-center gap-1.5 leading-normal">
              <Activity className="w-4 h-4" /> 5-Dimension Radar Profile
            </span>
          </div>

          {/* SVG Vector Radar */}
          <div className="relative w-[320px] h-[300px]">
            <svg className="w-full h-full">
              {/* Draw concentric pentagons */}
              {[40, 70, 100].map((radius, idx) => {
                const pentPoints = dimensions.map((d) => {
                  const rad = (d.angle * Math.PI) / 180;
                  const x = centerX + radius * Math.cos(rad);
                  const y = centerY + radius * Math.sin(rad);
                  return `${x},${y}`;
                }).join(" ");

                return (
                  <polygon
                    key={idx}
                    points={pentPoints}
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Draw spider spokes */}
              {dimensions.map((d, idx) => {
                const rad = (d.angle * Math.PI) / 180;
                const endX = centerX + maxRadius * Math.cos(rad);
                const endY = centerY + maxRadius * Math.sin(rad);

                const labelRad = ((d.angle) * Math.PI) / 180;
                const labelX = centerX + (maxRadius + 22) * Math.cos(labelRad);
                const labelY = centerY + (maxRadius + 15) * Math.sin(labelRad);

                return (
                  <g key={idx}>
                    <line
                      x1={centerX}
                      y1={centerY}
                      x2={endX}
                      y2={endY}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="1"
                    />
                    {/* labels */}
                    <text
                      x={labelX}
                      y={labelY}
                      fill="rgba(255,255,255,0.45)"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="font-extrabold uppercase tracking-widest"
                    >
                      {d.label.split(" ")[0]}
                    </text>
                  </g>
                );
              })}

              {/* Draw the user statistics polygon */}
              <polygon
                points={getPointsString()}
                fill="rgba(139, 92, 246, 0.25)"
                stroke="#8B5CF6"
                strokeWidth="2.5"
                className="animate-fadeIn"
              />

              {/* Dynamic vertices points */}
              {dimensions.map((d, idx) => {
                const rad = (d.angle * Math.PI) / 180;
                const ptX = centerX + maxRadius * (d.val / 100) * Math.cos(rad);
                const ptY = centerY + maxRadius * (d.val / 100) * Math.sin(rad);

                return (
                  <circle
                    key={idx}
                    cx={ptX}
                    cy={ptY}
                    r="4"
                    fill="#3B82F6"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Column: Weakness targeting & dynamic adjustment parameters */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-lg font-extrabold flex items-center gap-2.5 text-white">
              <ShieldAlert className="w-5 h-5 text-amber-400" /> Neural Optimizations
            </h3>

            <div className="space-y-3.5 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 active-scale animate-pulse">
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-black tracking-widest">Bottleneck focus</span>
                <h4 className="text-sm font-black text-white mt-0.5">Weakest cognitive dimension: {weakestDim?.label} ({weakestDim?.val}%)</h4>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                LearnAnything45 auto-calibrates. Because your <strong>{weakestDim?.label}</strong> is currently trailing, we automatically increase Socratic coaching challenge levels and target retrieval latency schedules during subsequent consolidations to crack this impediment.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#3B82F6]">Current Cognitive Level</h4>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Sliders className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-white">Adaptive Learning Level {Math.floor(userStats.level / 2) + 1}</h5>
                  <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                    Your deep processing density triggers automated curriculum compression modules, optimizing study slot ratios dynamically.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gamified Achievements Tracker summary */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-purple-400" /> Mastered Achievements
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "7-Day Streak", desc: "Consistency prime unlocked.", has: userStats.streak >= 7 },
                { title: "First Knowledge Map", desc: "Constructed first node linkage map.", has: userStats.completedDays.length >= 1 },
                { title: "Schema Master", desc: "Evaluated summary with score > 85.", has: userStats.deepProcessingScore >= 85 },
                { title: "Durable Recall", desc: "Rated 5 console cards as Perfect.", has: userStats.retrievalScore >= 80 }
              ].map((ach, idx) => (
                <div key={idx} className={`p-3.5 border rounded-2xl flex items-center gap-3 transition-colors ${
                  ach.has 
                    ? "bg-[#10B981]/10 border-[#10B981]/25 text-white" 
                    : "bg-white/5 border-white/5 text-white/30"
                }`}>
                  <div className={`p-2 rounded-xl text-xs font-black shrink-0 ${ach.has ? "bg-emerald-500/20 text-[#10B981]" : "bg-white/5 text-white/20"}`}>
                    🏆
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs leading-normal">{ach.title}</h5>
                    <p className="text-[9px] mt-0.5 leading-normal opacity-60">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
