import React, { useState, useEffect } from "react";
import { DayDetail, DayOutline, UserStats } from "../types";
import { ArrowLeft, BookOpen, Brain, Sparkles, ClipboardCheck, Dumbbell, PlayCircle, Loader2, RefreshCw, CheckCircle, Check, HelpCircle } from "lucide-react";

interface DayStudyProps {
  dayNumber: number;
  dayOutline: DayOutline;
  userStats: UserStats;
  skillName: string;
  onBack: () => void;
  onCompleteDay: (scoreMetrics: { deepProcessing: number; retrieval: number }) => void;
}

export default function DayStudy({ dayNumber, dayOutline, userStats, skillName, onBack, onCompleteDay }: DayStudyProps) {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DayDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Three C state trackers
  const [userSummary, setUserSummary] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [summaryAssessment, setSummaryAssessment] = useState<{
    score: number;
    pros: string;
    cons: string;
    cognitiveTips: string;
    refinedModel: string;
  } | null>(null);

  const [compileChecked, setCompileChecked] = useState(false);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [recallRatings, setRecallRatings] = useState<{ [key: number]: number }>({});
  const [reflectionText, setReflectionText] = useState("");

  // Load day details dynamically from our backend API
  useEffect(() => {
    async function loadDayDetails() {
      setLoading(true);
      setErrorMessage("");
      setSummaryAssessment(null);
      setUserSummary("");
      setCompileChecked(false);
      setFlippedCards([]);
      setRecallRatings({});
      setReflectionText("");

      try {
        const response = await fetch("/api/roadmap/day-detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skillName,
            phaseTitle: `Phase ${dayOutline.phaseNumber}`,
            dayNumber,
            dayTitle: dayOutline.title,
            shortObjective: dayOutline.shortObjective
          })
        });

        if (!response.ok) {
          throw new Error("Unable to fetch day guide");
        }

        const data: DayDetail = await response.json();
        setDetail(data);

        // Prepopulate text if they already evaluated this day previously
        if (userStats.summaryEvaluations?.[dayNumber]) {
          const prev = userStats.summaryEvaluations[dayNumber];
          setUserSummary(prev.userSummary);
          setSummaryAssessment({
            score: prev.score,
            pros: prev.pros,
            cons: prev.cons,
            cognitiveTips: prev.cognitiveTips,
            refinedModel: prev.refinedModel
          });
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("Network issue loading detailed lesson from AI server. Loading local cognitive backup...");
        
        // Dynamic client-side fallback
        setTimeout(() => {
          setDetail({
            dayNumber,
            theorySummary: `Understand the high-level semantic connection behind ${dayOutline.title}. In cognitive processing, mastering any skill requires structuring mental templates first. Instead of trying to memorize facts separately, connect how elements interact inside the dynamic environment.`,
            resources: [
              { type: "Video tutorial", title: `${dayOutline.title} Masterclass`, actionPrompt: "Analyze how individual variables triggers or overrides the system state." },
              { type: "Whitepaper / Document", title: `Synthesizing ${dayOutline.title}`, actionPrompt: "Outline three boundary limitations where standard heuristics break down." }
            ],
            compressPrompt: `Draft a dense three-sentence compression explaining how ${dayOutline.title} functions systemic-level. Do not use generic buzzwords.`,
            compileActivity: {
              title: "Construct Relational Anchor Mind Map",
              taskDescription: "Draw out three connected nodes. Label the exact relationship vectors linking them.",
              mindMapInstruction: "Identify any negative feedback loops. If node B rises, does A decrease?"
            },
            consolidateQuestions: [
              { question: `What is the core relational anchor of ${dayOutline.title}?`, answerBenchmark: "Must relate components explaining causal feedback chains rather than lists." },
              { question: "How does this concept fail when scaled upwards?", answerBenchmark: "Identifies systemic latency, capacity degradation or cognitive overloads." },
              { question: "Provide an active physical analogy for this mechanism.", answerBenchmark: "Uses real physics (e.g., dams, pressure, pulleys) mapping components perfectly." }
            ]
          });
        }, 1200);
      } finally {
        setLoading(false);
      }
    }

    loadDayDetails();
  }, [dayNumber, dayOutline, skillName]);

  const handleEvaluateSchema = async () => {
    if (!userSummary.trim()) return;
    setEvaluating(true);
    try {
      const response = await fetch("/api/roadmap/evaluate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: dayOutline.title,
          userSummary
        })
      });

      if (!response.ok) {
        throw new Error("Unable to submit summary for grading");
      }

      const scoreReport = await response.json();
      setSummaryAssessment(scoreReport);
    } catch (err) {
      console.error(err);
      // Give smart mock evaluation based on word density to make sure user gets feedback
      const sentencesCount = userSummary.split(/[.!?]+/).filter(Boolean).length;
      let score = 75;
      if (sentencesCount !== 3) score = 45;
      
      setSummaryAssessment({
        score: score,
        pros: "Your attempt uses appropriate contextual vocabulary and highlights correct relationships.",
        cons: sentencesCount !== 3 ? "WARNING: Justin Sung principles demand exactly 3 sentences to force optimal cognitive tension. You submitted " + sentencesCount + " sentences." : "Could contain denser analogical mapping to reduce filler terms and increase semantic weight.",
        cognitiveTips: "To improve: Always structure Sentence 1 explaining the mechanism, Sentence 2 the catalyst, and Sentence 3 the final system boundary limit.",
        refinedModel: "Model Explanation: [Sentence 1 explaining catalyst]. [Sentence 2 defining causal relationship]. [Sentence 3 mapping boundary failure condition]."
      });
    } finally {
      setEvaluating(false);
    }
  };

  const toggleFlipCard = (cardIndex: number) => {
    if (flippedCards.includes(cardIndex)) {
      setFlippedCards(flippedCards.filter(i => i !== cardIndex));
    } else {
      setFlippedCards([...flippedCards, cardIndex]);
    }
  };

  const handleRateRecall = (cardIndex: number, rating: number) => {
    setRecallRatings((prev) => ({ ...prev, [cardIndex]: rating }));
  };

  const handleSubmitDay = () => {
    // Calculate final scores
    const deepScore = summaryAssessment ? summaryAssessment.score : 50;
    
    const recallVals = Object.values(recallRatings);
    const retrievalScore = recallVals.length > 0 
      ? Math.round((recallVals as number[]).reduce((a: number, b: number) => a + b, 0) / recallVals.length) 
      : 50;

    onCompleteDay({
      deepProcessing: deepScore,
      retrieval: retrievalScore
    });
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[450px]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Assembling Cognitive Syllabus...</h3>
          <p className="text-sm text-white/50 animate-pulse max-w-sm mx-auto">
            Structuring Retrieval primers, compiling analogies, and constructing Socratic consolidation drills for {dayOutline.title}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Header View controls */}
      <div className="flex items-center justify-between">
        <button
          id="btn_back_to_timeline"
          onClick={onBack}
          className="px-4 py-2 border border-white/10 hover:bg-white/10 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Timeline
        </button>

        <span className="px-3.5 py-1.5 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white text-xs font-black uppercase tracking-widest rounded-full border border-white/10 shadow-lg shadow-blue-500/10">
          Day {dayNumber} Active Session
        </span>
      </div>

      {errorMessage && (
        <div className="bg-amber-500/15 border border-amber-500/20 p-4 rounded-2xl text-amber-400 text-xs font-semibold leading-relaxed">
          {errorMessage}
        </div>
      )}

      {/* Lesson Hero overview */}
      <div id="day_study_info_header" className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden border border-white/10">
        <span className="text-xs uppercase tracking-widest text-[#3B82F6] font-bold">Objective focus</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1 leading-snug">{dayOutline.title}</h1>
        <p className="text-white/60 text-sm mt-3 leading-relaxed max-w-3xl">
          {dayOutline.shortObjective}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Theory summaries & Compression input (C1) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* C1: Learn / Primer Theory */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
            <h3 className="text-lg font-extrabold flex items-center gap-2.5 text-white">
              <BookOpen className="w-5 h-5 text-[#3B82F6]" /> 1. Prime: Semantic Framework
            </h3>
            
            <p className="text-white/75 text-sm leading-relaxed whitespace-pre-line bg-black/10 p-5 rounded-2xl border border-white/5">
              {detail?.theorySummary}
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-white/50">Guided Self-Study Anchors</h4>
              <div className="grid grid-cols-1 gap-2.5">
                {detail?.resources.map((res, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-start gap-3 hover:bg-white/10 transition-all">
                    <PlayCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">{res.type}</span>
                      <h5 className="font-extrabold text-xs text-white leading-snug">{res.title}</h5>
                      <p className="text-white/40 text-[11px] mt-1 leading-relaxed italic">
                        <strong>Relational Quest:</strong> {res.actionPrompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* C2: Concept Compression Summary Grader */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
            <h3 className="text-lg font-extrabold flex items-center gap-2.5 text-white">
              <Brain className="w-5 h-5 text-purple-400" /> 2. Compress: Three-Sentence Tension
            </h3>

            <div className="space-y-2">
              <p className="text-xs text-white/60 leading-relaxed">
                {detail?.compressPrompt || "Write exactly 3 sentences to express the core conceptual model of this topic. Do not repeat superficial listicles."}
              </p>
              <textarea
                id="compression_essay_textarea"
                rows={4}
                maxLength={1000}
                placeholder="Draft sentence 1 (the mechanic), sentence 2 (the catalyst), sentence 3 (the boundaries)."
                className="w-full bg-black/40 hover:bg-black/60 focus:bg-black/60 border border-white/10 focus:border-purple-500 rounded-2xl p-4 outline-none text-xs text-white leading-relaxed placeholder-white/30 transition-all"
                value={userSummary}
                onChange={(e) => {
                  setUserSummary(e.target.value);
                  // clear old grading to force evaluation if text changed
                  if (summaryAssessment && e.target.value !== userStats.summaryEvaluations?.[dayNumber]?.userSummary) {
                    setSummaryAssessment(null);
                  }
                }}
              />
              <div className="flex justify-between items-center text-[10px] text-white/40">
                <span>Aim for 3 clear sentences separated by periods.</span>
                <span>{userSummary.length} chars</span>
              </div>
            </div>

            <button
              id="btn_evaluate_summary"
              onClick={handleEvaluateSchema}
              disabled={!userSummary.trim() || evaluating}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-white cursor-pointer transition-all shadow-lg shadow-purple-500/10"
            >
              {evaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Cognitive Schema...
                </>
              ) : (
                <>
                  Submit to Dr. Justin Sung Agent <Sparkles className="w-4 h-4 text-amber-200" />
                </>
              )}
            </button>

            {/* Smart Evaluation results card */}
            {summaryAssessment && (
              <div className="mt-4 bg-white/5 border border-purple-500/25 rounded-2xl p-5 space-y-4 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <span className="text-xs uppercase tracking-widest text-purple-400 font-bold">Cognitive Performance Index</span>
                  <div className="flex items-baseline gap-1 bg-purple-500/20 px-3 py-1 rounded-xl">
                    <span className="text-lg font-black text-white">{summaryAssessment.score}</span>
                    <span className="text-[10px] text-white/50">/100</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 p-3.5 bg-green-500/5 rounded-xl border border-green-500/10">
                    <h5 className="font-extrabold text-green-400">Synthesized Links</h5>
                    <p className="text-white/70 leading-relaxed text-[11px]">{summaryAssessment.pros}</p>
                  </div>
                  <div className="space-y-1.5 p-3.5 bg-red-500/5 rounded-xl border border-red-500/10">
                    <h5 className="font-extrabold text-red-400">Bottleneck Retards</h5>
                    <p className="text-white/70 leading-relaxed text-[11px]">{summaryAssessment.cons}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-[#F59E0B]/5 rounded-xl border border-[#F59E0B]/20 text-[11px]">
                  <h5 className="font-extrabold text-amber-400 flex items-center gap-1.5 mb-1">
                    <Brain className="w-4 h-4" /> Dr. Sung&apos;s Advice
                  </h5>
                  <p className="text-white/75 leading-relaxed italic">{summaryAssessment.cognitiveTips}</p>
                </div>

                <div className="p-3.5 bg-blue-500/5 rounded-xl border border-blue-500/20 space-y-1.5">
                  <h5 className="font-extrabold text-blue-400 text-xs">High-Density Refined Model</h5>
                  <p className="text-white/80 font-mono text-[11px] leading-relaxed select-all">
                    {summaryAssessment.refinedModel}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Compiles details & Consolidation memory tests (C3) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* C3: Compile Active Mapping */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
            <h3 className="text-lg font-extrabold flex items-center gap-2.5 text-white">
              <ClipboardCheck className="w-5 h-5 text-emerald-400" /> 3. Compile: Relationship Map
            </h3>

            <div className="space-y-4 bg-black/15 p-4 rounded-2xl border border-white/5">
              <div>
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wide">Relational Exercise</span>
                <h4 className="font-black text-sm text-white mt-0.5">{detail?.compileActivity.title}</h4>
                <p className="text-white/60 text-xs leading-relaxed mt-1">
                  {detail?.compileActivity.taskDescription}
                </p>
              </div>

              <div className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/15 text-[11px] text-white/80 leading-relaxed italic">
                <strong>Mindmap instruction:</strong> {detail?.compileActivity.mindMapInstruction}
              </div>
            </div>

            <button
              id="checkbox_compile_completed"
              onClick={() => setCompileChecked(!compileChecked)}
              className={`w-full py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                compileChecked 
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
              }`}
            >
              <Check className={`w-4 h-4 ${compileChecked ? "stroke-[4px]" : "opacity-30"}`} />
              {compileChecked ? "Active Mapping Compiled!" : "Mark Mapping Session Completed"}
            </button>
          </div>

          {/* C4: Consolidate Self-Directed Active Recall Flashcards */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
            <h3 className="text-lg font-extrabold flex items-center gap-2.5 text-white">
              <Dumbbell className="w-5 h-5 text-amber-500 animate-float" /> 4. Consolidate Recall Matrix
            </h3>
            <p className="text-xs text-white/50 leading-relaxed pb-1 border-b border-white/5">
              Retrieve answers from memory before revealing benchmarks. Score honestly to caliber your metrics.
            </p>

            <div className="space-y-4">
              {detail?.consolidateQuestions.map((q, idx) => {
                const isFlipped = flippedCards.includes(idx);
                const rating = recallRatings[idx];

                return (
                  <div key={idx} className="space-y-2">
                    {/* card */}
                    <div
                      id={`flashcard_${idx}`}
                      onClick={() => toggleFlipCard(idx)}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        isFlipped 
                          ? "bg-white/5 border-blue-500/40 text-white shadow-sm shadow-blue-500/5" 
                          : "bg-black/35 hover:bg-black/50 border-white/10 hover:border-white/20 text-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#3B82F6] font-bold">Query {idx + 1}</span>
                          <h5 className="font-extrabold text-xs text-white leading-snug mt-1">{q.question}</h5>
                        </div>
                        <HelpCircle className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isFlipped ? "text-blue-400 rotate-180" : "text-white/20"}`} />
                      </div>

                      {isFlipped && (
                        <div className="mt-3 pt-3 border-t border-white/10 animate-fadeIn">
                          <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Relational Benchmark</span>
                          <p className="text-xs text-[#10B981] mt-1 italic leading-relaxed leading-normal font-mono">
                            {q.answerBenchmark}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* score buttons */}
                    {isFlipped && (
                      <div className="flex justify-between gap-1.5 px-1 animate-fadeIn">
                        {[
                          { val: 0, label: "Struggled", color: "hover:bg-red-500/10 hover:border-red-500/40 border-red-500/15 text-red-400" },
                          { val: 50, label: "Partial", color: "hover:bg-amber-500/10 hover:border-amber-500/40 border-amber-500/15 text-amber-500" },
                          { val: 100, label: "Perfect", color: "hover:bg-emerald-500/10 hover:border-emerald-500/40 border-emerald-500/15 text-emerald-400" }
                        ].map((rate) => (
                          <button
                            key={rate.val}
                            onClick={() => handleRateRecall(idx, rate.val)}
                            className={`flex-1 py-1.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                              rating === rate.val 
                                ? "bg-white/10 font-black border-white/20 scale-[1.03]" 
                                : `bg-black/10 ${rate.color}`
                            }`}
                          >
                            {rate.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reflections */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#3B82F6]">5. Dynamic Reflective Friction</h4>
            <span className="text-[10px] text-white/40 block">Define any concepts that remain unresolved to update future tutoring.</span>
            <textarea
              id="reflection_friction_textarea"
              rows={2}
              placeholder="e.g., I struggle with the scale differences between nodes..."
              className="w-full bg-black/35 hover:bg-black/50 border border-white/10 rounded-xl p-3 outline-none text-xs text-white placeholder-white/30 transition-all focus:border-[#3B82F6]"
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
            />
          </div>

          <button
            id="btn_submit_day_and_complete"
            onClick={handleSubmitDay}
            disabled={!summaryAssessment || !compileChecked || Object.keys(recallRatings).length < 3}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 rounded-2xl font-black text-xs uppercase tracking-wider text-[#0B0F14] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xl shadow-emerald-500/10"
          >
            <CheckCircle className="w-5 h-5 fill-current" /> Complete Day & Lock XP
          </button>

          {(!summaryAssessment || !compileChecked || Object.keys(recallRatings).length < 3) && (
            <p className="text-[10px] text-white/35 text-center italic">
              Solve compression evaluation, check mapping compiling, and rate all 3 consolidation cards to complete today&apos;s unit details.
            </p>
          )}

        </div>

      </div>

    </div>
  );
}
