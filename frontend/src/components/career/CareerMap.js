import React, { useState, useMemo, useCallback } from "react";
import { ReactFlow, Controls, Background, Handle, Position, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { generateCareerRoadmap } from "../../services/gemini";
import { Loader2, Sparkles, Map as MapIcon, Star, ChevronDown, ChevronRight } from "lucide-react";
import dagre from "dagre";

const extractLabelText = (label) => {
  if (typeof label === "string" || typeof label === "number") return label;
  if (!label) return "Unknown";
  try {
    if (label.props && Array.isArray(label.props.children)) {
       const strChild = label.props.children[0];
       if (strChild && strChild.props && typeof strChild.props.children === 'string') {
         return strChild.props.children;
       }
    }
  } catch(e) {}
  return "Unknown Topic";
};

const nodeWidth = 260;
const nodeHeight = 150;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction, ranksep: 150, nodesep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'TB' ? 'top' : 'left';
    node.sourcePosition = direction === 'TB' ? 'bottom' : 'right';

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges };
};

const CustomNode = ({ data }) => {
  return (
    <div className={`career-ui-node status-${data.status}`}>
      <Handle type="target" position={Position.Top} className="career-ui-handle" />
      <div className="career-ui-node-inner">
        <div className="career-ui-header">
          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
          <strong className="career-ui-title">{data.label}</strong>
        </div>
        
        <div className={`career-ui-badge badge-${data.status}`}>
          {data.status === 'completed' ? 'Completed' : data.status === 'in-progress' ? 'In Progress' : 'Not Started'}
        </div>

        {data.description && (
          <div className="career-ui-desc">
            {data.description}
          </div>
        )}

        <div className="career-ui-footer">
          <div className="career-ui-avatars">
            <div className="career-ui-avatar-icon">
              L
            </div>
            <span className="career-ui-avatar-text">Level {data.level}</span>
          </div>

          <div className="career-ui-actions">
            <input 
              type="checkbox" 
              className="career-ui-checkbox" 
              checked={data.status === "completed"}
              onChange={(e) => { e.stopPropagation(); data.onCheck && data.onCheck(e.target.checked); }} 
              title={data.status === "completed" ? "Mark incomplete" : "Mark complete"}
            />
            {data.hasChildren && (
              <div 
                className="career-ui-children-count"
                onClick={(e) => { e.stopPropagation(); data.onToggle && data.onToggle(); }}
                title="Total Sub-nodes"
              >
                {data.childrenCount || 0}
              </div>
            )}
            {data.hasChildren && (
              <div 
                className="career-ui-toggle-btn"
                onClick={(e) => { e.stopPropagation(); data.onToggle && data.onToggle(); }}
                title={data.isCollapsed ? "Expand hierarchy" : "Collapse hierarchy"}
              >
                {data.isCollapsed ? <ChevronRight className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
              </div>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="career-ui-handle" />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const CareerMap = ({ nodes, edges, hasRoadmap, setRoadmapData }) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  const [checkedIds, setCheckedIds] = useState(new Set());

  const handleToggleCollapse = useCallback((nodeId) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const { nodes: visibleNodes, edges: visibleEdges } = useMemo(() => {
    try {
      if (!nodes || nodes.length === 0) return { nodes: [], edges: [] };
      
      const safeNodes = nodes.map(n => ({ ...n, id: String(n.id) }));
      const safeEdges = edges.map(e => ({
         ...e, 
         id: String(e.id || `e${e.source}-${e.target}`),
         source: String(e.source),
         target: String(e.target)
      }));

      // Find hidden descendants
      const hiddenSet = new Set();
      const stack = Array.from(collapsedIds).map(String);
      while (stack.length > 0) {
        const current = stack.pop();
        safeEdges.forEach(e => {
          if (e.source === current && !hiddenSet.has(e.target)) {
            hiddenSet.add(e.target);
            stack.push(e.target);
          }
        });
      }
      
      let vNodes = safeNodes.filter(n => !hiddenSet.has(n.id));
      
      const validNodeIds = new Set(vNodes.map(n => n.id));
      let vEdges = safeEdges.filter(e => validNodeIds.has(e.source) && validNodeIds.has(e.target));

      // Calculate true children mapping to fix disappearing toggle bug
      const trueChildrenMap = new Map();
      safeEdges.forEach(e => {
        trueChildrenMap.set(e.source, (trueChildrenMap.get(e.source) || 0) + 1);
      });

      // Calculate Depth Levels Topologically
      const incomingEdgesCount = new Map();
      safeNodes.forEach(n => incomingEdgesCount.set(n.id, 0));
      safeEdges.forEach(e => {
        incomingEdgesCount.set(e.target, (incomingEdgesCount.get(e.target) || 0) + 1);
      });
      
      const nodeLevels = new Map();
      let queue = [];
      safeNodes.forEach(n => {
        if (incomingEdgesCount.get(n.id) === 0) {
          nodeLevels.set(n.id, 0);
          queue.push({ id: n.id, level: 0 });
        }
      });
      
      while (queue.length > 0) {
        const { id, level } = queue.shift();
        safeEdges.forEach(e => {
          if (e.source === id) {
            const currentLevel = nodeLevels.get(e.target) || 0;
            if (level + 1 > currentLevel) {
              nodeLevels.set(e.target, level + 1);
              queue.push({ id: e.target, level: level + 1 });
            }
          }
        });
      }

      // Calculate Checkbox Tree Structure recursively
      const leafCache = new Map();
      const getLeafStats = (id) => {
         if (leafCache.has(id)) return leafCache.get(id);
         let total = 0;
         let completed = 0;
         let children = safeEdges.filter(e => e.source === id).map(e => e.target);
         if (children.length === 0) {
            total = 1;
            completed = checkedIds.has(id) ? 1 : 0;
         } else {
            children.forEach(childId => {
               const stats = getLeafStats(childId);
               total += stats.totalLeaves;
               completed += stats.completedLeaves;
            });
         }
         const result = { totalLeaves: total, completedLeaves: completed };
         leafCache.set(id, result);
         return result;
      };

      const nodeStatuses = new Map();
      safeNodes.forEach(n => {
         const stats = getLeafStats(n.id);
         let status = "not-started";
         if (stats.totalLeaves > 0) {
            if (stats.completedLeaves === stats.totalLeaves) status = "completed";
            else if (stats.completedLeaves > 0) status = "in-progress";
         }
         nodeStatuses.set(n.id, status);
      });

      const getLeafIds = (id) => {
         let leaves = [];
         let children = safeEdges.filter(e => e.source === id).map(e => e.target);
         if (children.length === 0) {
            leaves.push(id);
         } else {
            children.forEach(childId => leaves.push(...getLeafIds(childId)));
         }
         return leaves;
      };

      vNodes = vNodes.map((n) => ({
        ...n,
        type: "custom", 
        data: {
          ...n.data,
          label: extractLabelText(n.data.label),
          isCollapsed: collapsedIds.has(n.id),
          hasChildren: trueChildrenMap.has(n.id),
          childrenCount: trueChildrenMap.get(n.id) || 0,
          level: nodeLevels.get(n.id) || 0,
          status: nodeStatuses.get(n.id) || "not-started",
          onToggle: () => handleToggleCollapse(n.id),
          onCheck: (isChecked) => {
             const leaves = getLeafIds(n.id);
             setCheckedIds(prev => {
                const next = new Set(prev);
                if (isChecked) leaves.forEach(l => next.add(l));
                else leaves.forEach(l => next.delete(l));
                return next;
             });
          }
        }
      }));

      const layouted = getLayoutedElements(vNodes, vEdges);
      return { nodes: layouted.nodes, edges: layouted.edges };
    } catch (e) {
      console.error("Layout calculation failed:", e);
      const fallbackNodes = (Array.isArray(nodes) ? nodes : []).map((n, i) => ({
         ...n,
         id: String(n.id),
         type: "custom",
         position: n.position || { x: 100, y: i * 150 },
         data: { ...n.data, label: extractLabelText(n.data?.label) }
      }));
      return { nodes: fallbackNodes, edges: Array.isArray(edges) ? edges : [] };
    }
  }, [nodes, edges, collapsedIds, handleToggleCollapse, checkedIds]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    try {
      const roadmap = await generateCareerRoadmap(prompt);
      if (roadmap && roadmap.nodes && roadmap.edges) {
        const styledNodes = roadmap.nodes.map((node) => ({
          ...node,
          id: node.id.toString(),
          type: "custom", // Force our beautiful custom node type
          data: { ...node.data },
        }));

        const styledEdges = roadmap.edges.map((edge) => ({
          ...edge,
          id: edge.id || `e${edge.source}-${edge.target}`,
          animated: true,
          style: { stroke: "#3b82f6", strokeWidth: 1.5, strokeDasharray: "4, 4" },
        }));

        setRoadmapData({
          title: prompt,
          nodes: styledNodes,
          edges: styledEdges,
          type: prompt.toLowerCase().includes("user") ? "u.js" : "js",
        });
        setCollapsedIds(new Set());
      } else {
        setError(
          "Received an unexpected format from the AI. Please try again.",
        );
        console.error("Invalid Roadmap Output: ", roadmap);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasRoadmap) {
    return (
      <div className="career-map-empty">
        <div className="glass-card max-w-2xl w-full p-8 md:p-12 rounded-3xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 rounded-full mb-6 relative border border-blue-500/20">
              <Sparkles className="w-12 h-12 text-blue-500 animate-pulse" />
              <MapIcon className="w-6 h-6 text-purple-500 absolute bottom-2 right-2" />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-6 drop-shadow-sm">
              Design Your Career Path
            </h1>

            <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
              Tell us what you want to master, and our AI will generate a
              comprehensive, step-by-step learning roadmap tailored just for
              you.
            </p>

            <form
              onSubmit={handleGenerate}
              className="w-full relative shadow-xl rounded-2xl"
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Backend with Go, AI Engineer, Fullstack React..."
                className="w-full bg-white border border-gray-200 text-gray-800 rounded-2xl py-5 px-6 pr-36 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all text-lg placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-8 font-bold transition-all disabled:opacity-50 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  "Map It"
                )}
              </button>
            </form>

            {error && (
              <p className="text-red-600 mt-6 text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        fitView
        className="touch-none bg-gray-50/30"
        minZoom={0.1}
      >
        <Background color="#e2e8f0" gap={20} size={2} />
        <Controls className="bg-white border-gray-200 fill-gray-500 text-gray-700 rounded-lg overflow-hidden shadow-md" />
        <MiniMap 
           nodeColor="#3b82f6" 
           nodeBorderRadius={4}
           maskColor="rgba(241, 245, 249, 0.7)"
           className="bg-white border border-gray-200 rounded-lg shadow-sm"
        />
      </ReactFlow>
    </div>
  );
};

export default CareerMap;
