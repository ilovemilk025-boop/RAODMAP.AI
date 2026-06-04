import React, { useState } from "react";
import { OnboardingData, Roadmap } from "../types";
import { SAMPLE_SKILLS, GOALS, TIME_COMMITMENTS, LEVEL_OPTIONS, ASSESSMENT_QUESTIONS, BOTTLENECKS } from "../data/defaultOnboarding";
import { Bot, Compass, TrendingUp, Code, Shield, Zap, BookOpen, Clock, Play, ArrowRight, Brain, Sparkles, Loader2, AlertCircle } from "lucide-react";

interface OnboardingProps {
  onComplete: (data: OnboardingData, generatedRoadmap: Roadmap) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [skill, setSkill] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [why, setWhy] = useState("");
  const [dailyTime, setDailyTime] = useState("1 hour/day");
  const [currentLevel, setCurrentLevel] = useState("Beginner");
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [diagnosing, setDiagnosing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [computedBottleneck, setComputedBottleneck] = useState<string>("");

  const handleSelectSkill = (s: string) => {
    setSkill(s);
    setCustomSkillInput("");
  };

  const handleNext = () => {
    if (step === 1) {
      const activeSkill = skill || customSkillInput;
      if (!activeSkill) return;
      setStep(2);
    } else if (step === 2) {
      if (!why) return;
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleAnswerSelect = (questionId: string, optionType: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionType }));
  };

  // Determine Justin Sung learning bottleneck based on diagnostic questions
  const runCognitiveDiagnosis = () => {
    setDiagnosing(true);
    setTimeout(() => {
      let retrievalCount = 0;
      let deepCount = 0;
      let regulationCount = 0;

      Object.values(answers).forEach((type) => {
        if (type === "retrieval_bottleneck") retrievalCount++;
        if (type === "deep_processing") deepCount++;
        if (type === "self_regulation" || type === "self_management") {
          regulationCount++;
        }
      });

      // Default to passive retrieval bottleneck if split equally (very common)
      let selectedBottleneck = "RETRIEV_ERR";
      if (deepCount <= retrievalCount && deepCount <= regulationCount) {
        selectedBottleneck = "DEEP_CONN_ERR";
      } else if (regulationCount > retrievalCount) {
        selectedBottleneck = "SELF_REG_ERR";
      } else {
        selectedBottleneck = "RETRIEV_ERR";
      }

      setComputedBottleneck(selectedBottleneck);
      setStep(6);
      setDiagnosing(false);
    }, 1200);
  };

  const generateCurriculum = async () => {
    setIsGenerating(true);
    setGenerationError("");

    const chosenSkill = skill || customSkillInput;
    const resolvedBottleneckInfo = BOTTLENECKS[computedBottleneck as keyof typeof BOTTLENECKS];

    try {
      const response = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: chosenSkill,
          why,
          dailyTime,
          currentLevel,
          learningStyleBottleneck: resolvedBottleneckInfo?.title || "Passive Retrieval"
        }),
      });

      if (!response.ok) {
        throw new Error("Generation failed on API level");
      }

      const generatedRoadmap: Roadmap = await response.json();
      
      const finishedOnboarding: OnboardingData = {
        skill: chosenSkill,
        why,
        dailyTime,
        currentLevel,
        bottleneckAnswers: answers,
        bottleneck: computedBottleneck
      };

      onComplete(finishedOnboarding, generatedRoadmap);
    } catch (err: any) {
      console.error(err);
      setGenerationError("Failed to communicate with AI server. Generating local fallbacks...");
      
      // Build an automated robust client-side fallback matching Dr. Justin Sung principles
      setTimeout(() => {
        const fallbackRoadmap: Roadmap = {
          skillName: chosenSkill,
          bottleneckTitle: resolvedBottleneckInfo?.title || "Passive Retrieval Dependency",
          bottleneckDiagnostic: resolvedBottleneckInfo?.description || "You struggle to retrieve knowledge dynamically due to passive consumer reading.",
          phases: [
            { phaseNumber: 1, title: "Foundation & Conceptual Connection-building", daysRange: "Days 1-10", description: "Establish semantic relationships across low-level facts before jumping to code/action.", milestoneProject: "Create a handwritten comprehensive concept link map mapping all elements." },
            { phaseNumber: 2, title: "Core Practice & Cognitive Schema expansion", daysRange: "Days 11-20", description: "Build intermediate mental models. Translate passive resources into structured explanations.", milestoneProject: "Conduct Socratic test challenge evaluating boundary constraints of the concept." },
            { phaseNumber: 3, title: "System-level Integration", daysRange: "Days 21-30", description: "Deploy active compilation by integrating elements into custom mock simulations.", milestoneProject: "Construct a local sandbox solution resolving an complex integrated case." },
            { phaseNumber: 4, title: "Project-Based Iteration", daysRange: "Days 31-40", description: "Apply the Iteration Effect. Complete and break projects sequentially to generate failure signals.", milestoneProject: "Build, break, and refactor 3 independent rapid mini-projects." },
            { phaseNumber: 5, title: "Flow, Transfer & Teaching Mastery", daysRange: "Days 41-45", description: "Solidify long-term consolidation through analogy maps and teaching models.", milestoneProject: "Record/Write a master tutorial explaining the hardest concepts with original analogies." }
          ],
          daysOutline: Array.from({ length: 45 }, (_, i) => {
            const d = i + 1;
            let phase = 1;
            let pTitle = "Intro Mechanics";
            if (d > 10) { phase = 2; pTitle = "Core Schema Construction"; }
            if (d > 20) { phase = 3; pTitle = "Systematic Assemblies"; }
            if (d > 30) { phase = 4; pTitle = "Active Implementation"; }
            if (d > 40) { phase = 5; pTitle = "Teaching & Transfer"; }
            return {
              dayNumber: d,
              phaseNumber: phase,
              title: `${pTitle} - Day ${d}`,
              shortObjective: `Deploy active retrieval and conceptual compression modeling on ${chosenSkill} fundamental variables.`
            };
          })
        };

        const finishedOnboarding: OnboardingData = {
          skill: chosenSkill,
          why,
          dailyTime,
          currentLevel,
          bottleneckAnswers: answers,
          bottleneck: computedBottleneck
        };

        onComplete(finishedOnboarding, fallbackRoadmap);
      }, 1500);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Bot": return <Bot className="w-5 h-5 text-blue-400" />;
      case "TrendingUp": return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case "Compass": return <Compass className="w-5 h-5 text-purple-400" />;
      case "Code": return <Code className="w-5 h-5 text-sky-400" />;
      case "Shield": return <Shield className="w-5 h-5 text-[#8B5CF6]" />;
      case "Zap": return <Zap className="w-5 h-5 text-orange-400" />;
      default: return <BookOpen className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white overflow-y-auto flex flex-col relative px-4 py-8 md:py-16">
      {/* Background radial blobs */}
      <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-200px] right-[-100px] w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col justify-center z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span className="text-sm font-semibold tracking-wide text-white/80 uppercase">LearnAnything45 Operating System</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-200 to-purple-400 bg-clip-text text-transparent">
            Cognitive Learning OS
          </h1>
          <p className="mt-2 text-white/50 text-sm max-w-md mx-auto">
            Applying neuroscientific mental-model mapping and Justin Sung&apos;s Three C Protocol to convert information into raw mastery.
          </p>
        </div>

        {/* Content Box */}
        <div id="onboarding_onboarding_form" className="glass-panel rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <span className="text-xs uppercase tracking-widest text-[#3B82F6] font-bold">Step {step} of 6</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-300 ${i <= step ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-white/10"}`}></div>
              ))}
            </div>
          </div>

          {/* STEP 1: Skill Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-1">What skill do you want to master?</h2>
                <p className="text-white/50 text-sm">Select a highly tuned cognitive template or type any customized skill of your choice.</p>
              </div>

              {/* Curated Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {SAMPLE_SKILLS.map((item) => (
                  <button
                    key={item.name}
                    id={`curated_${item.name.replace(/\s+/g, '_')}`}
                    onClick={() => handleSelectSkill(item.name)}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl text-left border transition-all duration-300 ${
                      skill === item.name && !customSkillInput
                        ? "bg-blue-500/10 border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                        : "bg-white/5 border-white/15 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="mt-0.5 p-2 bg-white/5 rounded-xl border border-white/10">
                      {renderIcon(item.icon)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      <p className="text-white/40 text-xs mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Or enter your own personalized skill</label>
                <input
                  type="text"
                  id="custom_skill_text_input"
                  placeholder="e.g., Quantum Computing, Stoicism, Growth Hacking, Chess Strategy"
                  value={customSkillInput}
                  onChange={(e) => {
                    setCustomSkillInput(e.target.value);
                    setSkill("");
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-blue-500 outline-none rounded-2xl px-5 py-4 text-white placeholder-white/30 font-medium transition-all"
                />
              </div>

              <button
                id="btn_onboarding_step1_next"
                onClick={handleNext}
                disabled={!skill && !customSkillInput}
                className="w-full mt-6 py-4 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 disabled:hover:bg-[#3B82F6] rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 text-white cursor-pointer"
              >
                Let&apos;s Choose Goal <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: Goal Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Why are you mastering this?</h2>
                <p className="text-white/50 text-sm">Aligns cognitive load and phases to your actual application goals.</p>
              </div>

              <div className="space-y-3">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    id={`onb_goal_pill_${g.id}`}
                    onClick={() => setWhy(g.title)}
                    className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left border transition-all ${
                      why === g.title
                        ? "bg-blue-500/10 border-blue-500/80"
                        : "bg-white/5 border-white/15 hover:bg-white/10"
                    }`}
                  >
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${why === g.title ? "border-blue-500" : "border-white/30"}`}>
                      {why === g.title && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{g.title}</h4>
                      <p className="text-white/40 text-xs mt-1 leading-relaxed">{g.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  id="btn_onboarding_step2_back"
                  onClick={() => setStep(1)}
                  className="px-5 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold transition-all text-sm"
                >
                  Back
                </button>
                <button
                  id="btn_onboarding_step2_next"
                  onClick={handleNext}
                  disabled={!why}
                  className="flex-1 py-4 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-40 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 cursor-pointer text-sm"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Time Commitments */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Set Daily Available Time</h2>
                <p className="text-white/50 text-sm">We tailor compilation benchmarks to match realistic pacing constraints.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {TIME_COMMITMENTS.map((tc) => (
                  <button
                    key={tc.id}
                    id={`onb_time_pill_${tc.id}`}
                    onClick={() => setDailyTime(tc.value)}
                    className={`p-5 rounded-2xl text-left border transition-all ${
                      dailyTime === tc.value
                        ? "bg-blue-500/10 border-blue-500/80"
                        : "bg-white/5 border-white/15 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-between mb-2">
                      <h4 className="font-extrabold text-white text-base">{tc.label}</h4>
                      <Clock className={`w-4 h-4 ${dailyTime === tc.value ? "text-blue-400" : "text-white/30"}`} />
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed">{tc.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  id="btn_onboarding_step3_back"
                  onClick={() => setStep(2)}
                  className="px-5 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold transition-all text-sm"
                >
                  Back
                </button>
                <button
                  id="btn_onboarding_step3_next"
                  onClick={handleNext}
                  className="flex-1 py-4 bg-[#3B82F6] hover:bg-[#2563EB] rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 cursor-pointer text-sm"
                >
                  Next: Skill Level <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Skill Level Selection */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Current Skill Competency</h2>
                <p className="text-white/50 text-sm">Positions your starting conceptual density baseline.</p>
              </div>

              <div className="space-y-3">
                {LEVEL_OPTIONS.map((lv) => (
                  <button
                    key={lv.id}
                    id={`onb_level_pill_${lv.id}`}
                    onClick={() => setCurrentLevel(lv.title)}
                    className={`w-full p-4 rounded-2xl text-left border transition-all ${
                      currentLevel === lv.title
                        ? "bg-blue-500/10 border-blue-500/80"
                        : "bg-white/5 border-white/15 hover:bg-white/10"
                    }`}
                  >
                    <h4 className="font-bold text-sm text-white mb-1">{lv.title}</h4>
                    <p className="text-white/40 text-xs leading-relaxed">{lv.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold transition-all text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 bg-[#3B82F6] hover:bg-[#2563EB] rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 cursor-pointer text-sm"
                >
                  Begin Cognitive Test <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Learning Style Diagnostic Test (Justin Sung Principles) */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3.5 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                <Brain className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-blue-400 font-bold">Cognitive Style Analyzer</h4>
                  <p className="text-white/70 text-xs mt-1 leading-relaxed">
                    This brief diagnostic maps your processing bottlenecks (concept connections, self-regulation, memory translation limits).
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {ASSESSMENT_QUESTIONS.map((q, qIndex) => (
                  <div key={q.id} className="space-y-3 border-b border-white/5 pb-5 last:border-b-0 last:pb-0">
                    <h3 className="text-sm font-semibold leading-relaxed text-white">
                      {qIndex + 1}. {q.question}
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5">
                      {q.options.map((opt, optIndex) => {
                        const isSelected = answers[q.id] === opt.type;
                        return (
                          <button
                            key={optIndex}
                            id={`opt_${q.id}_${optIndex}`}
                            onClick={() => handleAnswerSelect(q.id, opt.type)}
                            className={`w-full p-3.5 rounded-xl text-left text-xs font-semibold leading-normal border transition-all ${
                              isSelected
                                ? "bg-purple-500/15 border-purple-500/60 text-purple-200"
                                : "bg-white/5 border-white/10 hover:bg-white/10 text-white/75"
                            }`}
                          >
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(4)}
                  className="px-5 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold transition-all text-sm"
                >
                  Back
                </button>
                <button
                  id="btn_submit_diagnostic"
                  onClick={runCognitiveDiagnosis}
                  disabled={Object.keys(answers).length < ASSESSMENT_QUESTIONS.length || diagnosing}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:from-blue-500 disabled:to-purple-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-purple-500/10 cursor-pointer text-sm"
                >
                  {diagnosing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Cognition...
                    </>
                  ) : (
                    <>
                      Run Analytics Diagnosis <Sparkles className="w-4 h-4 ml-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Cognition Diagnostics Reveal & Generate */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-amber-500/15 rounded-2xl mb-2 relative">
                  <span className="absolute inset-0 bg-amber-500/15 rounded-2xl blur-lg"></span>
                  <AlertCircle className="w-8 h-8 text-amber-400 relative z-10" />
                </div>
                <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Cognitive Impediment Discovered</p>
                <h3 className="text-2xl font-extrabold text-[#FBBF24]">
                  {BOTTLENECKS[computedBottleneck as keyof typeof BOTTLENECKS]?.title}
                </h3>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3.5">
                <p className="text-xs text-white/55 leading-relaxed italic">
                  &quot;{BOTTLENECKS[computedBottleneck as keyof typeof BOTTLENECKS]?.description}&quot;
                </p>
                <div className="pt-3 border-t border-white/5">
                  <h4 className="text-xs uppercase tracking-widest text-[#3B82F6] font-bold mb-2">How we crack this bottleneck:</h4>
                  <ul className="text-xs text-white/70 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-[#3B82F6] font-bold mt-0.5">✓</span>
                      <span><strong>Dynamic Compression Cycles:</strong> Forcing 3-sentence translations instead of highlighting.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#3B82F6] font-bold mt-0.5">✓</span>
                      <span><strong>Compilation Mapping:</strong> Making interactive link paths to build durable schemas.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#3B82F6] font-bold mt-0.5">✓</span>
                      <span><strong>Self-Calibrating Milestones:</strong> Days adapt to target recovery and boost attention management.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {isGenerating ? (
                <div className="text-center py-6 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-white">Generating 45-Day Cognitive Roadmaps...</h4>
                    <p className="text-xs text-white/40 animate-pulse max-w-sm mx-auto">
                      Dr. Justin Sung agent is structuring semantic links, consolidation drills, and the active recall schedules...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  {generationError && (
                    <div className="bg-red-500/10 border border-red-500/35 p-3.5 rounded-xl text-red-400 text-xs font-semibold leading-relaxed">
                      {generationError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(5)}
                      className="px-5 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold transition-all text-sm"
                    >
                      Back
                    </button>
                    <button
                      id="btn_onboarding_generate_roadmap"
                      onClick={generateCurriculum}
                      className="flex-1 py-4 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] hover:scale-[1.02] active:scale-[0.98] rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-blue-500/20 cursor-pointer text-sm"
                    >
                      Initialize 45-Day Operating System <Sparkles className="w-5 h-5 text-amber-200" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
