export interface OnboardingData {
  skill: string;
  why: string;
  dailyTime: string;
  currentLevel: string;
  bottleneckAnswers: {
    [key: string]: string;
  };
  bottleneck: string;
}

export interface Phase {
  phaseNumber: number;
  title: string;
  daysRange: string;
  description: string;
  milestoneProject: string;
}

export interface DayOutline {
  dayNumber: number;
  phaseNumber: number;
  title: string;
  shortObjective: string;
}

export interface DayDetail {
  dayNumber: number;
  theorySummary: string;
  resources: {
    type: string;
    title: string;
    actionPrompt: string;
  }[];
  compressPrompt: string;
  compileActivity: {
    title: string;
    taskDescription: string;
    mindMapInstruction: string;
  };
  consolidateQuestions: {
    question: string;
    answerBenchmark: string;
  }[];
}

export interface Roadmap {
  skillName: string;
  bottleneckTitle: string;
  bottleneckDiagnostic: string;
  phases: Phase[];
  daysOutline: DayOutline[];
}

export interface UserStats {
  completedDays: number[];
  currentDay: number;
  streak: number;
  xp: number;
  level: number;
  lastActiveDate: string | null;
  deepProcessingScore: number;
  retrievalScore: number;
  consistencyScore: number;
  focusScore: number;
  summaryEvaluations: {
    [dayNum: number]: {
      userSummary: string;
      score: number;
      pros: string;
      cons: string;
      cognitiveTips: string;
      refinedModel: string;
    };
  };
  diagnosticsScores: {
    deepProcessing: number;
    retrieval: number;
    mindset: number;
    selfRegulation: number;
    selfManagement: number;
  };
}

export interface Node {
  id: string;
  label: string;
  category: string;
  x: number;
  y: number;
  description: string;
}

export interface Edge {
  from: string;
  to: string;
  relationship: string;
}

export interface KnowledgeMap {
  nodes: Node[];
  edges: Edge[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}
