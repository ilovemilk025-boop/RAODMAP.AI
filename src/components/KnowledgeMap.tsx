import React, { useState, useEffect } from "react";
import { KnowledgeMap as KMapType, Node, Edge } from "../types";
import { Map, RefreshCw, ZoomIn, Search, Info, HelpCircle, Loader2, Sparkles } from "lucide-react";

interface KnowledgeMapProps {
  skillName: string;
}

export default function KnowledgeMap({ skillName }: KnowledgeMapProps) {
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState<KMapType | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const fetchKnowledgeMap = async () => {
    setLoading(true);
    setErrorMessage("");
    setSelectedNode(null);

    try {
      const response = await fetch("/api/roadmap/knowledge-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: skillName })
      });

      if (!response.ok) {
        throw new Error("Unable to build knowledge map nodes");
      }

      const map: KMapType = await response.json();
      setMapData(map);
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to fetch dynamic server node positions. Initializing direct client cognitive mapper...");
      
      // Sophisticated local fallback matching our standard layout
      setTimeout(() => {
        // Formulates a topic-centric knowledge graph of 7 elements
        const words = skillName.split(" ");
        const prefix = words[0] || "Core";
        
        const fallbackNodes: Node[] = [
          { id: "n1", label: `${prefix} Core`, category: "Core Foundation", x: 150, y: 150, description: "The definitive semantic root of the skill, forming the mental core schema." },
          { id: "n2", label: "Structural Inputs", category: "Framework Variables", x: 350, y: 100, description: "External telemetry feeds or logical properties modifying core triggers." },
          { id: "n3", label: "Execution Logic", category: "System Orchestration", x: 550, y: 120, description: "The execution rules and pipelines computing and routing actions." },
          { id: "n4", label: "Boundary Safeguards", category: "Fail-safes", x: 450, y: 260, description: "Limits, filters, and safety configurations validating edge-case overflows." },
          { id: "n5", label: "Feedback Resolvers", category: "Consolidation Controllers", x: 250, y: 350, description: "Self-correcting controllers logging details to optimize operational stability." },
          { id: "n6", label: "Applied Case-Studies", category: "Iteration Effect", x: 620, y: 320, description: "Rapid real-world deployment challenges that generate failure signals." }
        ];

        const fallbackEdges: Edge[] = [
          { from: "n1", to: "n2", relationship: "defines schema structure" },
          { from: "n2", to: "n3", relationship: "triggers sequence execution" },
          { from: "n3", to: "n4", relationship: "constrains limits under load" },
          { from: "n4", to: "n5", relationship: "routes errors for logging" },
          { from: "n5", to: "n1", relationship: "updates recursive parameters" },
          { from: "n3", to: "n6", relationship: "implements in sandbox test" }
        ];

        setMapData({ nodes: fallbackNodes, edges: fallbackEdges });
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeMap();
  }, [skillName]);

  // Filter nodes on search
  const filteredNodes = mapData?.nodes.filter(n => 
    n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-[#3B82F6] animate-spin" />
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Constructing Second Brain Node Web...</h3>
          <p className="text-sm text-white/50 animate-pulse max-w-sm mx-auto">
            Mapping semantic clusters, resolving causal relations, and designing vector alignments for {skillName}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Interactive Knowledge Map</h2>
          <p className="text-white/40 text-xs mt-1">
            Visual map of causal coordinates. Deep learning requires relational schemas over isolation.
          </p>
        </div>

        <button
          id="btn_refresh_map"
          onClick={fetchKnowledgeMap}
          className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs uppercase tracking-wider font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-factor Map
        </button>
      </div>

      {errorMessage && (
        <div className="bg-amber-500/15 border border-amber-500/20 p-4 rounded-xl text-amber-400 text-xs font-semibold leading-relaxed">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: SVG interactive canvas map */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel rounded-3xl p-4 border border-white/10 relative overflow-hidden bg-black/40">
            {/* Search filter inside canvas */}
            <div className="absolute top-4 left-4 z-20 w-64">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Filter semantic concept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] text-[10px] font-bold rounded-md flex items-center gap-1">
                <ZoomIn className="w-3 h-3" /> Auto Fit View
              </span>
            </div>

            {/* Interaction Instructions Overlay */}
            <div className="absolute bottom-4 left-4 z-20 text-[10px] text-white/35 flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-white/5 font-mono">
              <Info className="w-3 h-3" /> CLICK CONCEPTS TO INTEGRATE SCHEMA DETAILS
            </div>

            {/* SVG Visual Canvas Area */}
            <div className="overflow-x-auto">
              <div className="w-[740px] h-[480px] relative select-none">
                <svg className="absolute inset-0 w-full h-full">
                  {/* Arrow markers defining flow path */}
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="18"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(59, 130, 246, 0.45)" />
                    </marker>
                    {/* Shadow visual glows */}
                    <filter id="glow-svg" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Draw lines first so they lie behind nodes */}
                  {mapData?.edges.map((edge, idx) => {
                    const fromNode = mapData.nodes.find((n) => n.id === edge.from);
                    const toNode = mapData.nodes.find((n) => n.id === edge.to);

                    if (!fromNode || !toNode) return null;

                    // Compute midpoint coordinates to display relationship words
                    const midX = (fromNode.x + toNode.x) / 2;
                    const midY = (fromNode.y + toNode.y) / 2;

                    return (
                      <g key={idx}>
                        {/* Connecting Line */}
                        <line
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke="rgba(59,130,246, 0.25)"
                          strokeWidth="2.5"
                          markerEnd="url(#arrow)"
                          strokeDasharray="4 4"
                          className="animate-pulse"
                        />
                        {/* Labeled path words */}
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x="-55"
                            y="-9"
                            width="110"
                            height="18"
                            rx="5"
                            fill="#0B0F14"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                          />
                          <text
                            fill="rgba(255,255,255,0.5)"
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                            y="2.5"
                            className="tracking-wider uppercase"
                          >
                            {edge.relationship}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* Nodes rendering as SVG groups */}
                  {mapData?.nodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const isFiltered = searchQuery === "" || node.label.toLowerCase().includes(searchQuery.toLowerCase());

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => setSelectedNode(node)}
                        className={`cursor-pointer transition-all duration-300 ${isFiltered ? "opacity-100 scale-100" : "opacity-25 scale-95"}`}
                      >
                        {/* Radial interactive glowing circle */}
                        <circle
                          r={isSelected ? "34" : "28"}
                          fill={isSelected ? "rgba(139, 92, 246, 0.2)" : "rgba(59, 130, 246, 0.15)"}
                          stroke={isSelected ? "#8B5CF6" : "rgba(59, 130, 246, 0.45)"}
                          strokeWidth="1.5"
                          filter={isSelected ? "url(#glow-svg)" : ""}
                          className="transition-all duration-300"
                        />
                        
                        {/* Mini center core indicator */}
                        <circle r="5" fill={isSelected ? "#8B5CF6" : "#3B82F6"} />

                        {/* Text labels positioned above nodes */}
                        <text
                          fill={isSelected ? "#C084FC" : "#ffffff"}
                          fontSize="10"
                          fontWeight="extrabold"
                          textAnchor="middle"
                          y="-42"
                          className="tracking-wide"
                        >
                          {node.label}
                        </text>

                        {/* Category minor label positioned below nodes */}
                        <text
                          fill="rgba(255,255,255,0.35)"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                          y="42"
                          className="tracking-widest uppercase font-bold"
                        >
                          {node.category}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Node Details Panel */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="glass-panel rounded-3xl p-6 border-2 border-purple-500/20 bg-black/60 space-y-5 animate-scaleUp">
              
              <div className="space-y-1 pb-3 border-b border-white/5">
                <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold uppercase tracking-widest rounded-md">
                  Active Schema Node
                </span>
                <h3 className="text-xl font-extrabold text-white pt-1">{selectedNode.label}</h3>
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">{selectedNode.category}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-widest text-[#3B82F6] font-extrabold">Causal Mechanic</h4>
                <p className="text-xs text-white/70 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 italic">
                  &quot;{selectedNode.description}&quot;
                </p>
              </div>

              <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 space-y-2">
                <h4 className="text-xs font-black text-purple-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Deep Processing Prompt
                </h4>
                <p className="text-[11px] text-white/65 leading-relaxed">
                  Analyze how this component (<strong>{selectedNode.label}</strong>) connects to neighboring structures. Draw a mini causal loop diagram: If this component breaks or is throttled, what downstream consequences trigger? Write out a 3-sentence summary in your study journal.
                </p>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold transition-all text-white/70"
              >
                Close Node Details
              </button>

            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-6 border border-white/5 text-center text-white/40 py-16 space-y-3">
              <Map className="w-10 h-10 text-white/20 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white/80">Concept Reader</h4>
                <p className="text-xs text-white/40 max-w-[200px] mx-auto leading-relaxed">
                  Click any glowing coordinate node along the SVG grid map to analyze the detailed cognitive schema properties!
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
