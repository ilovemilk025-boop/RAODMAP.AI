import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, MessageSquare, Sparkles, Loader2, Play, RefreshCw, Layers } from "lucide-react";

interface AITutorProps {
  skillName: string;
  currentDay: number;
  currentDayObjective?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

type TutorMode = "TEACHER" | "SOCRATIC" | "COACH" | "INTERVIEWER";

export default function AITutor({ skillName, currentDay, currentDayObjective }: AITutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello there! I am your cognitive learning coach specialized in **${skillName}**. 

I structure our dialogue focusing on Justin Sung principles: creating mental loops, forcing conceptual translations, and reinforcing active recall.

Choose your preferred tutoring dynamic on the side menu, or click any prompt starting triggers to initialize our session!`
    }
  ]);

  const [mode, setMode] = useState<TutorMode>("TEACHER");
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomScrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputMessage;
    if (!rawText.trim() || sending) return;

    const userMessage: Message = { role: "user", content: rawText };
    setMessages((prev) => [...prev, userMessage]);
    
    if (!textToSend) setInputMessage("");
    setSending(true);

    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: skillName,
          currentDayUnit: currentDay,
          currentDayObjective: currentDayObjective || "Orchestrate cognitive structures",
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content
          })),
          mode
        })
      });

      if (!response.ok) {
        throw new Error("Chat api failed");
      }

      const report = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: report.reply }]);
    } catch (err) {
      console.error(err);
      
      // Let's create an elegant fallback response mimicking the mode
      setTimeout(() => {
        let fallbackReply = `[API Offline Fallback] Under **${mode} Mode**: Let's analyze how you compress this concepts. Can you explain the main mechanism in your own sentences?`;
        
        if (mode === "SOCRATIC") {
          fallbackReply = `[Socratic Fallback] Intriguing query. Instead of a direct definition of ${skillName}, I challenge you with this: If we remove the central stabilizer, how do downstream variable nodes respond? Explain that dynamic.`;
        } else if (mode === "COACH") {
          fallbackReply = `[Study Coach Fallback] Let's zoom into your active retrieval habits regarding **${skillName}**. Are you noticing any friction or fatigue during the 3-sentence summary drafts on Day ${currentDay}? Tell me where your attention slips.`;
        } else if (mode === "INTERVIEWER") {
          fallbackReply = `[Interviewer Fallback] Excellent. Let's run a rapid-fire knowledge test. Give me a clear real-world analogy of how this parameter behaves. Highlight its primary failure stress-condition.`;
        }

        setMessages((prev) => [...prev, { role: "assistant", content: fallbackReply }]);
      }, 1000);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `Dialogue reset. I am ready to resume our session in **${mode} Mode** relating to **${skillName}** on Day ${currentDay}. What concepts shall we compress?`
      }
    ]);
  };

  // Curated prompts that provide immense tool value
  const QUICK_PROMPTS = [
    { text: "Explain a central concept with an analogy", label: "Analogies" },
    { text: "Launch Socratic active recall questions to test me", label: "Socratic Test" },
    { text: "I feel stuck/overwhelmed: Analyze my study friction", label: "Attention Coaching" },
    { text: "Challenge me with a concrete client simulation problem", label: "PBL Case Study" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">AI Cognitive Tutor</h2>
          <p className="text-white/40 text-xs mt-1">
            Durable neural learning tutor designed to guide mental schema reconstruction.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs uppercase tracking-wider font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Chat log
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Selector Modes */}
        <div className="col-span-1 space-y-4">
          <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3.5">
            <h3 className="text-xs uppercase tracking-widest text-[#3B82F6] font-bold">Select Active Mentoring Persona</h3>
            <p className="text-[10px] text-white/55 leading-normal pb-3 border-b border-white/5">
              Adjusts teaching profiles based on Dr Justin Sung and socratic dialectic theories.
            </p>

            <div className="space-y-2">
              {[
                { id: "TEACHER", title: "Teacher Metaphorist", desc: "Builds physical core metaphors linking systems and boundaries.", color: "border-blue-500/20 text-blue-400 font-bold bg-blue-500/5 select-none" },
                { id: "SOCRATIC", title: "Socratic Questioner", desc: "Do not answer directly. Probes holes, boundary errors, and contradictions.", color: "border-purple-500/20 text-purple-400 font-bold bg-purple-500/5 select-none" },
                { id: "COACH", title: "Attention Habits Coach", desc: "Monitors processing capacity, retrieval timelines, and study blocks.", color: "border-orange-500/20 text-orange-400 font-bold bg-orange-500/5 select-none" },
                { id: "INTERVIEWER", title: "Active Assessor", desc: "Fires direct, extreme test constraints testing retrieval under load.", color: "border-emerald-500/20 text-emerald-400 font-bold bg-emerald-500/5 select-none" }
              ].map((m) => {
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id as TutorMode);
                      // Append a system comment in chat log about changing the mode
                      setMessages((prev) => [...prev, {
                        role: "assistant",
                        content: `*System stance shifted into **${m.title} Mode**. Let's orient our training accordingly.*`
                      }]);
                    }}
                    className={`w-full p-4 rounded-2xl text-left border text-xs leading-normal transition-all duration-300 ${
                      isSelected 
                        ? m.color + " ring-1 ring-white/10 shadow-lg"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
                    }`}
                  >
                    <h4 className="font-extrabold text-sm">{m.title}</h4>
                    <p className="text-[10px] text-white/40 mt-1 leading-relaxed">{m.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Conversational Stream */}
        <div className="col-span-1 lg:col-span-3 flex flex-col h-[520px] glass-panel rounded-3xl border border-white/10 relative overflow-hidden bg-black/35">
          
          {/* Header info strip */}
          <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-xs font-extrabold text-white">Coach Sung Agent</h4>
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{mode} ACTIVE DIALOGUE MODE</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          </div>

          {/* Quick Prompts strip */}
          <div className="p-3 bg-black/10 border-b border-white/5 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            {QUICK_PROMPTS.map((qp, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(qp.text)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[10px] font-semibold text-white/80 shrink-0 transition-all cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Scrollable messages block */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, idx) => {
              const isAssistant = m.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                      isAssistant
                        ? "bg-white/5 border border-white/5 text-white/90 rounded-tl-none whitespace-pre-wrap"
                        : "bg-blue-600 border border-blue-500/30 text-white rounded-tr-none shadow-md"
                    }`}
                  >
                    {/* Render helper blocks with basic styling */}
                    <div className="prose prose-invert max-w-none">
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/5 text-white/60 rounded-2xl p-4 text-xs flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span>Dr. Justin Sung agent resolving schemas...</span>
                </div>
              </div>
            )}
            <div ref={bottomScrollRef} />
          </div>

          {/* Prompt Entry Box */}
          <div className="p-4 bg-black/35 border-t border-white/5 flex gap-2.5">
            <input
              type="text"
              placeholder="Ask the coach to challenge, verify, or build analogies..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-white/5 border border-white/10 hover:bg-white/15 focus:bg-white/10 outline-none rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 transition-all focus:border-[#3B82F6]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || sending}
              className="px-4 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-30 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
