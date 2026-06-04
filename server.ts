import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
const aiClient = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Middleware to check if GenAI client is ready
const requireAI = (req: Request, res: Response, next: () => void) => {
  if (!aiClient) {
    return res.status(500).json({
      error: "Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.",
    });
  }
  next();
};

// 1. Endpoint: Generate 45-Day Course Outline Skeleton (extremely fast and structured)
app.post("/api/roadmap/generate", requireAI, async (req: Request, res: Response) => {
  const { skill, why, dailyTime, currentLevel, learningStyleBottleneck } = req.body;

  if (!skill) {
    return res.status(400).json({ error: "Skill parameter is required" });
  }

  const prompt = `
    You are Dr. Justin Sung, an expert in cognitive science and learning design. 
    Create an immersive, structured, and psychologically optimized 45-day learning roadmap to master the skill: "${skill}". 
    The user is learning this for: "${why || "general mastery"}".
    They commit: "${dailyTime || "1 hour/day"}".
    Current level: "${currentLevel || "Beginner"}".
    Cognitive bottleneck diagnosed: "${learningStyleBottleneck || "Retrieval Practice / Active Recall"}".

    Structure requirements:
    - Divide the roadmap into exactly 5 Phases:
      1. Phase 1 (Days 1-10): Foundation & Conceptual Connection-building
      2. Phase 2 (Days 11-20): Core Practice & Cognitive Schema expansion
      3. Phase 3 (Days 21-30): System-level integration (active compilation)
      4. Phase 4 (Days 31-40): Project-Based Iteration (the Iteration Effect)
      5. Phase 5 (Days 41-45): Flow, Transfer & Teaching Mastery
    - Map out an overview list of all 45 days. Each day MUST have a clear, specific semantic title and a short objective.
    - Provide a custom diagnostic summary of why their diagnosed bottleneck ("${learningStyleBottleneck}") restricts their learning, and how this customized 45-day roadmap targets and cracks this bottleneck.
  `;

  try {
    const response = await aiClient!.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite cognitive specialist and master curriculum developer. You format your output strictly as a JSON object conforming to the requested schema. Ensure the 45 days array contains exactly 45 elements, sequentially numbered from 1 to 45.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["skillName", "bottleneckTitle", "bottleneckDiagnostic", "phases", "daysOutline"],
          properties: {
            skillName: { type: Type.STRING },
            bottleneckTitle: { type: Type.STRING },
            bottleneckDiagnostic: { type: Type.STRING, description: "A motivating and deep diagnostic from Dr. Justin Sung modeling how their bottleneck blocks them and how the Three C Protocol overcomes it." },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["phaseNumber", "title", "daysRange", "description", "milestoneProject"],
                properties: {
                  phaseNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  daysRange: { type: Type.STRING },
                  description: { type: Type.STRING },
                  milestoneProject: { type: Type.STRING, description: "A high-impact project applying the Iteration Effect for this phase." }
                }
              }
            },
            daysOutline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["dayNumber", "phaseNumber", "title", "shortObjective"],
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  phaseNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  shortObjective: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Roadmap generation failed:", error);
    res.status(500).json({ error: "Failed to generate roadmap: " + error.message });
  }
});

// 2. Endpoint: Generate Day Detail (Three C Protocol: Compression, Compilation, Consolidation)
app.post("/api/roadmap/day-detail", requireAI, async (req: Request, res: Response) => {
  const { skillName, phaseTitle, dayNumber, dayTitle, shortObjective } = req.body;

  if (!skillName || !dayNumber || !dayTitle) {
    return res.status(400).json({ error: "Missing required day outline parameters" });
  }

  const prompt = `
    You are Dr. Justin Sung. Generate the complete deep learning package for Day ${dayNumber} of learning "${skillName}".
    Day Title: "${dayTitle}"
    Day Objective: "${shortObjective}"
    Current Phase: "${phaseTitle}"

    Apply cognitive science principles:
    - **Learn (Retrieval Primer)**: Offer a brief conceptual summary explaining the deep 'why' and mental model. Provide 2 highly engaging curated self-study resource suggestions (e.g., specific search topics or book concepts) that force them to map relationships.
      - For each resource, you MUST provide a real, highly useful clickable URL.
      - The URL should lead to authoritative research sites (e.g., specific Wikipedia article URL or special research search URL like "https://en.wikipedia.org/wiki/Special:Search?search=Search+Query", a Google Scholar search URL like "https://scholar.google.com/scholar?q=Search+Query", a YouTube video search query like "https://www.youtube.com/results?search_query=Search+Query", or reference docs like Stanford Encyclopedia of Philosophy, MDN Web Docs, etc. based on the specific concept).
      - Ensure the URL query string is correctly encoded and relevant to "${dayTitle}". Never output fake or placeholder URLs. 
    - **Compress (Concept Compression)**: Give a highly engaging prompt for the user to write their own 3-sentence summary that forces them to integrate multiple files of information.
    - **Compile (Active Mapping)**: Describe an active task that cannot be done passively (e.g. constructing an analogy, drawing a relationship node map, or testing a boundary condition).
    - **Consolidate (Self-Directed Recall)**: Provide 3 high-yield active recall flashcard questions. Each question must have a precise hidden benchmark answer.
  `;

  try {
    const response = await aiClient!.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are Dr. Justin Sung. Format your day study guide in clear JSON matching the response schema completely. Make the theory extremely insightful, avoiding trivial bulleted summaries.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["dayNumber", "theorySummary", "resources", "compressPrompt", "compileActivity", "consolidateQuestions"],
          properties: {
            dayNumber: { type: Type.INTEGER },
            theorySummary: { type: Type.STRING, description: "A deep 2-3 paragraph explanation of the cognitive mechanics of the concept." },
            resources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["type", "title", "actionPrompt", "url"],
                properties: {
                  type: { type: Type.STRING, description: "Video, Article, Book Chapter, or Experiment" },
                  title: { type: Type.STRING },
                  actionPrompt: { type: Type.STRING, description: "What specific relationship the user must look for while researching this resource." },
                  url: { type: Type.STRING, description: "A valid, real absolute HTTPS URL (Wikipedia, Google Scholar, YouTube Search, etc.) to investigate the topic." }
                }
              }
            },
            compressPrompt: { type: Type.STRING },
            compileActivity: {
              type: Type.OBJECT,
              required: ["title", "taskDescription", "mindMapInstruction"],
              properties: {
                title: { type: Type.STRING },
                taskDescription: { type: Type.STRING },
                mindMapInstruction: { type: Type.STRING }
              }
            },
            consolidateQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["question", "answerBenchmark"],
                properties: {
                  question: { type: Type.STRING },
                  answerBenchmark: { type: Type.STRING, description: "The core cognitive connections they must recall to count this as correct." }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Day detail generation failed:", error);
    res.status(500).json({ error: "Failed to generate day details: " + error.message });
  }
});

// 3. Endpoint: Evaluate 3-sentence summary (The Compression check)
app.post("/api/roadmap/evaluate-summary", requireAI, async (req: Request, res: Response) => {
  const { concept, userSummary } = req.body;

  if (!concept || !userSummary) {
    return res.status(400).json({ error: "Missing concept or summary text" });
  }

  const prompt = `
    You are Dr. Justin Sung evaluating a student's Three C Compression attempt.
    The concept is: "${concept}"
    The student's 3-sentence summary attempt: "${userSummary}"

    Analyze using these cognitive dimensions:
    - Conceptual density (did they pack relationships or just use filler buzzwords?)
    - Semantic translation (did they use their own words/analogies or did they copy standard definitions?)
    - Logical narrative (is there a clear, cohesive thread connecting sentence 1, 2, and 3?)

    Provide:
    1. Score out of 100
    2. Positives: What relationships they successfully synthesized.
    3. Weakness: What they missed or regurgitated passively.
    4. Improved Example: A model 3-sentence summary showing how to compress the same concept and raise density.
  `;

  try {
    const response = await aiClient!.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a constructive but scientifically precise cognitive assessor. Return evaluation strictly in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["score", "pros", "cons", "cognitiveTips", "refinedModel"],
          properties: {
            score: { type: Type.INTEGER },
            pros: { type: Type.STRING },
            cons: { type: Type.STRING },
            cognitiveTips: { type: Type.STRING, description: "A quick lesson regarding deep processing or schema construction." },
            refinedModel: { type: Type.STRING, description: "The ultimate 3-sentence consolidated model they should save to their notes." }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Summary evaluation failed:", error);
    res.status(500).json({ error: "Summary evaluation failed: " + error.message });
  }
});

// 4. Endpoint: Socratic/Coach AI Tutor Chat
app.post("/api/tutor/chat", requireAI, async (req: Request, res: Response) => {
  const { skill, currentDayUnit, currentDayObjective, messages, mode } = req.body;

  if (!skill || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Required parameters are missing (skill, messages)" });
  }

  // Choose a persona based on selected mode
  const modeInstructions = {
    TEACHER: "Explain complex concepts clearly, using creative analogies. Break terms down into physical/cognitive connections. Keep asking if the user has any analogical model of their own.",
    SOCRATIC: "Do NOT explain directly. Instead, ask high-yield guiding questions that provoke the user to notice their own gaps, reason out contradictions, and discover the core principles themselves.",
    COACH: "Focus on active study habits, time management, mindset, and attention. Ask them how they are structuring their retrieval sessions. Address any friction or overwhelm in their study schedule.",
    INTERVIEWER: "Actively test the user's knowledge on this day's concepts. Ask challenging 'what-if' edge cases and evaluate their responses with professional rigor. Offer feedback after their answer."
  };

  const selectedInstruction = modeInstructions[mode as keyof typeof modeInstructions] || modeInstructions.TEACHER;

  const systemPrompt = `
    You are an expert, highly encouraging, and demanding Learning Coach powered by Dr. Justin Sung's principles.
    Your topic of tutoring is: "${skill}".
    The user is currently studying: Day ${currentDayUnit || "Active study Session"} with the objective: "${currentDayObjective || "Integrate concepts"}".

    Your primary instructional stance is: 
    "${selectedInstruction}"

    Rules:
    - Never be robotic. Speak like a brilliant personal master.
    - Encourage active cognitive load (Compression, Compilation, Consolidation).
    - Promote relationships over definitions.
    - Use clear markdown files formatting for notes or structures in chat. Keep answers highly readable with clean separation.
  `;

  try {
    // We can translate messages to Gemini content format.
    // Ensure we handle standard role translation ('user' and 'model').
    const chatContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await aiClient!.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("AI Tutor chat failed:", error);
    res.status(500).json({ error: "AI Tutor failed to respond: " + error.message });
  }
});

// 5. Endpoint: Generate Knowledge Map nodes dynamically (returns SVG connection nodes/schema data)
app.post("/api/roadmap/knowledge-map", requireAI, async (req: Request, res: Response) => {
  const { skill, existingMap } = req.body;

  if (!skill) {
    return res.status(400).json({ error: "Skill parameter is required" });
  }

  const prompt = `
    You are Dr. Justin Sung. Formulate a rich knowledge graph mapping details of the skill: "${skill}".
    In cognitive science, we group concepts into high-level nodes, and map active, labeled relationships (e.g., 'API configulates Webhooks', 'Backtesting validates Strategy').
    Create exactly 6-10 major nodes with structured coordinate positions (between x: 50-700, y: 50-450) and labeled directional edges (with connecting links).
  `;

  try {
    const response = await aiClient!.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a cognitive mapping software backend. Return exactly standard JSON mapping nodes and links according to the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["nodes", "edges"],
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "label", "category", "x", "y", "description"],
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  category: { type: Type.STRING },
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER },
                  description: { type: Type.STRING, description: "One sentence definition of the concept in Dr. Justin Sung style." }
                }
              }
            },
            edges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["from", "to", "relationship"],
                properties: {
                  from: { type: Type.STRING },
                  to: { type: Type.STRING },
                  relationship: { type: Type.STRING, description: "Active verb describing how these two concepts connect (e.g. 'triggers', 'limits', 'scales')." }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Knowledge map failed:", error);
    res.status(500).json({ error: "Failed to generate knowledge map: " + error.message });
  }
});

// Configure Vite or serve production site
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LearnAnything45 Server] Running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
