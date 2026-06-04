export const SAMPLE_SKILLS = [
  { name: "AI Automation", icon: "Bot", desc: "Agents, workflows, LLM routing, active recall maps" },
  { name: "Crypto Trading", icon: "TrendingUp", desc: "Risk control, market schemas, charting, cycle compression" },
  { name: "Philosophy", icon: "Compass", desc: "Epistemology, critical modeling, dialectics, logical mapping" },
  { name: "Full-Stack Web Dev", icon: "Code", desc: "Schema, systems orchestration, API mapping, server engineering" },
  { name: "Cybersecurity", icon: "Shield", desc: "Threat vectors, penetration compiles, defensive consolidation" },
  { name: "SaaS Business", icon: "Zap", desc: "Value loops, customer compilation, distribution architecture" }
];

export const GOALS = [
  { id: "career", title: "Career pivot or acceleration", desc: "Master high-value skill chains for promotions or job market demand." },
  { id: "freelancing", title: "Freelancing & high-ticket agencies", desc: "Convert concepts into concrete workflows for recurring high margins." },
  { id: "business", title: "Launching a scalable venture", desc: "Automate procedures and build internal systemic models." },
  { id: "school", title: "Academic research & exams", desc: "Compress wide textbook data and achieve deep recall efficiency." },
  { id: "curiosity", title: "Intense personal obsession", desc: "Pure intellectual speed-learning with custom active recall." }
];

export const TIME_COMMITMENTS = [
  { id: "30mins", value: "30 mins/day", label: "30 Mins", desc: "Focus strictly on conceptual compression. Minimal waste." },
  { id: "1hour", value: "1 hour/day", label: "1 Hour", desc: "Balanced compression & structured compilation challenge." },
  { id: "2hours", value: "2 hours/day", label: "2 Hours", desc: "Recommended. Complete compression, compilation, & consolidation." },
  { id: "4hours", value: "4 hours/day", label: "4 Hours", desc: "Extreme speed-mastery. Multiple active projects and maps." }
];

export const LEVEL_OPTIONS = [
  { id: "beginner", title: "Absolute Novice", desc: "Zero conceptual mental model. Starting completely raw.", initialScore: 15 },
  { id: "intermediate", title: "Competent Consumer", desc: "Know basic terms, but struggle to build or translate autonomously.", initialScore: 40 },
  { id: "advanced", title: "Fluent Builder", desc: "Can construct systems. Want to optimize high-level mental models.", initialScore: 70 }
];

export const ASSESSMENT_QUESTIONS = [
  {
    id: "q1",
    question: "When you read a technical article or textbook, how do you capture notes?",
    options: [
      { text: "I highlight key terms and make a neat list of direct quotes or definitions.", type: "retrieval_bottleneck" },
      { text: "I summarize paragraphs in my own words and try to explain them via metaphors.", type: "deep_processing" },
      { text: "I quickly skim, save the bookmark, and jump immediately to try building/coding.", type: "self_regulation" }
    ]
  },
  {
    id: "q2",
    question: "How do you study or prepare for a testing assessment or client meeting?",
    options: [
      { text: "I re-read my notes or re-watch explanations multiple times to digest fully.", type: "retrieval_bottleneck" },
      { text: "I cover the material and write out what I remember onto a blank sheet of paper.", type: "deep_processing" },
      { text: "I simulate mock questions, build a small sample, and teach the concepts to an imaginary friend.", type: "self_management" }
    ]
  },
  {
    id: "q3",
    question: "When a complex system or project breaks, what is your initial cognitive response?",
    options: [
      { text: "I feel frustrated or anxious and look up a direct tutorial or Google query for the exact item.", type: "mindset" },
      { text: "I step back, map out the relationships between the parts, and form a hypothesis on what broke.", type: "deep_processing" },
      { text: "I sequentially change variables at random until the error clears.", type: "self_regulation" }
    ]
  },
  {
    id: "q4",
    question: "If you are studying a dense topic for 2 hours, how is your attention structured?",
    options: [
      { text: "I focus on one single book or subtopic recursively until it is perfectly understood.", type: "self_management" },
      { text: "I interleave two related subtopics, taking brief structured active breaks to space my learning.", type: "self_regulation" },
      { text: "I study while listening to music or chatting, frequently checking references when stuck.", type: "self_regulation" }
    ]
  },
  {
    id: "q5",
    question: "Which statement best describes your belief regarding 'talent' versus 'skill mastery'?",
    options: [
      { text: "Certain fields require high natural IQ or tech background to build mastery.", type: "mindset" },
      { text: "True expertise is purely a result of high-yield active cognitive habits and deliberate training.", type: "mindset" },
      { text: "Talent helps speed things up, but brute-force repetition eventually wins.", type: "mindset" }
    ]
  }
];

export const BOTTLENECKS = {
  RETRIEV_ERR: {
    title: "Passive Retrieval Dependency",
    description: "You tend to rely on re-reading, highlighting, or consuming videos as a safety blanket. This creates the 'Fluency Illusion' (feeling like you understand because the source is clear). When tested under pressure, retrieval failure occurs because your brain didn't construct local pathways."
  },
  DEEP_CONN_ERR: {
    title: "Surface-Level Keyword Trapping",
    description: "You collect terms, lists, and definitions without mapping how they relate. This blocks deep compression. When solving novel projects, you cannot translate because your knowledge is locked in isolated silos instead of unified schemas."
  },
  SELF_REG_ERR: {
    title: "Impulsive Action Overload",
    description: "You jump straight into tutorials or building code without forming a cohesive conceptual skeleton. This leads to heavy trial-and-error fatigue. You cannot debug or pivot because you lack a map of what's happening behind the scenes."
  }
};
