import React, { useState, useEffect } from 'react';
import CareerMap from './CareerMap';
import CareerChat from './CareerChat';
import './CareerPath.css';
import { Sidebar } from '../sidebar/sidebar';
import { useSidebar } from '../context/SidebarContext';
import { careerPathStorage } from '../utils/firebaseStorage';
import { auth } from '../../firebase';
import { Plus, X as CloseIcon, Layout, Bot, ChevronRight } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { chatWithGemini } from '../../services/gemini';

const CareerPath = () => {
  const { isOpen } = useSidebar();
  const [tabs, setTabs] = useState([]); // Array of { id, title, nodes, edges, hasRoadmap }
  const [activeTabId, setActiveTabId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  // Load saved paths on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const savedPaths = await careerPathStorage.getByUserId(user.uid);
          if (savedPaths.length > 0) {
            const formattedTabs = savedPaths.map(path => ({
              id: path.id,
              title: path.title || 'Career Path',
              nodes: path.nodes || [],
              edges: path.edges || [],
              messages: path.messages || [{ 
                role: 'model', 
                parts: [{ text: "Hi! I'm your AI Career Guide. Feel free to ask me anything about your generated roadmap, or ask for general career advice!" }]
              }],
              hasRoadmap: true,
              type: path.type || 'default'
            }));
            setTabs(formattedTabs);
            setActiveTabId(formattedTabs[0].id);
          } else {
            // Start with an empty "New Path" tab if nothing saved
            const newTabId = 'new-' + Date.now();
            setTabs([{
              id: newTabId,
              title: 'New Path',
              nodes: [],
              edges: [],
              messages: [{ 
                role: 'model', 
                parts: [{ text: "Hi! I'm your AI Career Guide. Feel free to ask me anything about your generated roadmap, or ask for general career advice!" }]
              }],
              hasRoadmap: false
            }]);
            setActiveTabId(newTabId);
          }
        } catch (err) {
          console.error("Error loading paths:", err);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const activeTab = tabs.find(t => t.id === activeTabId);

  const handleAddTab = () => {
    const newTabId = 'new-' + Date.now();
    const newTab = {
      id: newTabId,
      title: 'New Path',
      nodes: [],
      edges: [],
      messages: [{ 
        role: 'model', 
        parts: [{ text: "Hi! I'm your AI Career Guide. Feel free to ask me anything about your generated roadmap, or ask for general career advice!" }]
      }],
      hasRoadmap: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
  };

  const handleCloseTab = (id, e) => {
    e.stopPropagation();
    const tabToClose = tabs.find(t => t.id === id);
    
    // If it's a saved tab, maybe we don't delete from DB here, just close?
    // User requirement: "Tabs... opening different items creates new tabs"
    // For now, let's just remove from local active tabs
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    
    if (activeTabId === id && newTabs.length > 0) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    } else if (newTabs.length === 0) {
      handleAddTab();
    }
  };

  const handleSendMessage = async (text) => {
    if (!activeTabId || !text.trim()) return;

    const userMessage = { role: 'user', parts: [{ text }] };
    const updatedTabsWithUser = tabs.map(tab => {
      if (tab.id === activeTabId) {
        return { ...tab, messages: [...(tab.messages || []), userMessage] };
      }
      return tab;
    });
    setTabs(updatedTabsWithUser);

    try {
      const chatHistory = activeTab.messages || [];
      const responseText = await chatWithGemini(chatHistory, text);
      const modelMessage = { role: 'model', parts: [{ text: responseText }] };
      
      const updatedTabsWithModel = updatedTabsWithUser.map(tab => {
        if (tab.id === activeTabId) {
          const newMessages = [...tab.messages, modelMessage];
          // Save to Firestore if it's not a temporary ID
          if (!tab.id.startsWith('new-') && userId) {
            careerPathStorage.update(tab.id, { messages: newMessages });
          }
          return { ...tab, messages: newMessages };
        }
        return tab;
      });
      setTabs(updatedTabsWithModel);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = { role: 'model', parts: [{ text: "Sorry, I'm having trouble connecting right now." }] };
      setTabs(prev => prev.map(tab => tab.id === activeTabId ? { ...tab, messages: [...tab.messages, errorMessage] } : tab));
    }
  };

  const updateActiveTabData = async (roadmapData) => {
    const updatedTabs = tabs.map(tab => {
      if (tab.id === activeTabId) {
        return {
          ...tab,
          title: roadmapData.title || tab.title,
          nodes: roadmapData.nodes,
          edges: roadmapData.edges,
          hasRoadmap: true,
          type: roadmapData.type || 'js'
        };
      }
      return tab;
    });
    setTabs(updatedTabs);

    // Save to Firestore
    if (userId) {
      try {
        if (activeTabId.startsWith('new-')) {
          const savedPath = await careerPathStorage.create(userId, {
            title: roadmapData.title,
            nodes: roadmapData.nodes,
            edges: roadmapData.edges,
            messages: activeTab.messages,
            type: roadmapData.type || 'js'
          });
          // Update temp ID to actual DB ID
          setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, id: savedPath.id } : t));
          setActiveTabId(savedPath.id);
        } else {
          await careerPathStorage.update(activeTabId, {
            nodes: roadmapData.nodes,
            edges: roadmapData.edges
          });
        }
      } catch (err) {
        console.error("Error saving path:", err);
      }
    }
  };

  if (loading) return (
    <div className="flex bg-[#e9effe] min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="bg-[#e9effe] min-h-screen font-sans">
      <Sidebar />
      <div 
        className="overflow-hidden bg-blue-50 min-h-screen mt-14 sm:mt-0 transition-all duration-300 relative"
        style={{ marginLeft: isOpen ? "256px" : "64px" }}
      >
        <div className="career-path-container flex flex-col h-screen">
          {/* VS Code Style Tabs Bar */}
          <div className="career-tabs-bar flex items-center bg-gray-900 overflow-x-auto custom-scrollbar no-scrollbar h-11 border-b border-gray-800">
            {tabs.map((tab) => (
              <div 
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-all border-r border-gray-800 relative group truncate max-w-[200px] ${
                  activeTabId === tab.id 
                    ? 'bg-gray-800 text-white border-t-2 border-t-purple-500' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <span className={`text-xs font-mono ${
                  tab.type === 'u.js' ? 'text-yellow-500' : 'text-blue-400'
                }`}>
                  {tab.hasRoadmap ? (tab.type === 'u.js' ? 'U' : 'JS') : 'Ø'}
                </span>
                <span className="text-sm truncate">
                  {tab.title}{tab.hasRoadmap ? (tab.type === 'u.js' ? '.u.js' : '.js') : ''}
                </span>
                <CloseIcon 
                  className={`w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded-sm transition-opacity`}
                  onClick={(e) => handleCloseTab(tab.id, e)}
                />
              </div>
            ))}
            <button 
              onClick={handleAddTab}
              className="p-3 text-gray-400 hover:text-white transition-colors"
              title="New Career Path"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <div className={`career-map-wrapper ${chatOpen ? 'chat-open' : ''}`}>
              <CareerMap 
                nodes={activeTab?.nodes || []} 
                edges={activeTab?.edges || []}
                hasRoadmap={activeTab?.hasRoadmap || false}
                setRoadmapData={updateActiveTabData}
              />
            
            {/* Toggle Chat Button */}
            {!chatOpen && activeTab?.hasRoadmap && (
              <button 
                className="chat-toggle-btn group"
                onClick={() => setChatOpen(true)}
                title="Open AI Career Guide"
              >
                <Bot className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>
            )}
            </div>

            <div className={`career-chat-wrapper ${chatOpen ? 'open' : ''}`}>
              <button 
                className="chat-close-btn"
                onClick={() => setChatOpen(false)}
                title="Close Chat"
              >
                <ChevronRight className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
              <CareerChat 
                messages={activeTab?.messages || []} 
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerPath;
