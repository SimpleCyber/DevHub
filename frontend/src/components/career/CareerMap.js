import React, { useState, useCallback } from 'react';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { generateCareerRoadmap } from '../../services/gemini';
import { Loader2, Sparkles, Map as MapIcon } from 'lucide-react';

const CareerMap = ({ nodes, edges, hasRoadmap, setRoadmapData }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const roadmap = await generateCareerRoadmap(prompt);
      if (roadmap && roadmap.nodes && roadmap.edges) {
        // Pre-process nodes if they don't have types to use a default or custom style
        const styledNodes = roadmap.nodes.map((node, index) => ({
          ...node,
          id: node.id.toString(),
          position: node.position || { x: index % 2 === 0 ? 100 : 300, y: index * 150 }, // fallback position
          style: {
            background: '#ffffff', 
            color: '#1f2937', 
            border: '2px solid #3b82f6', 
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.15)'
          },
        }));

        const styledEdges = roadmap.edges.map(edge => ({
          ...edge,
          id: edge.id || `e${edge.source}-${edge.target}`,
          animated: true,
          style: { stroke: '#8b5cf6', strokeWidth: 2 }
        }));

        setRoadmapData({
          title: prompt,
          nodes: styledNodes,
          edges: styledEdges,
          type: prompt.toLowerCase().includes('user') ? 'u.js' : 'js'
        });
      } else {
        setError('Received an unexpected format from the AI. Please try again.');
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
              Tell us what you want to master, and our AI will generate a comprehensive, step-by-step learning roadmap tailored just for you.
            </p>
            
            <form onSubmit={handleGenerate} className="w-full relative shadow-xl rounded-2xl">
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
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Map It'}
              </button>
            </form>
            
            {error && <p className="text-red-600 mt-6 text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-200">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        fitView
        className="touch-none"
        minZoom={0.1}
      >
        <Background color="#94a3b8" gap={20} size={2} />
        <Controls className="bg-white border-gray-200 fill-gray-500 text-gray-700 rounded-lg overflow-hidden shadow-md" />
      </ReactFlow>
    </div>
  );
};

export default CareerMap;
