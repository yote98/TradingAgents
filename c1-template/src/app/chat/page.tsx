"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import styles from "../page.module.scss";
import dynamic from 'next/dynamic';

// Force dynamic rendering - no static generation
export const dynamicParams = false;
export const revalidate = 0;

// Dynamically import components that use browser APIs
const C1Chat = dynamic(() => import("@thesysai/genui-sdk").then(mod => ({ default: mod.C1Chat })), { ssr: false });
const ThemeProvider = dynamic(() => import("@thesysai/genui-sdk").then(mod => ({ default: mod.ThemeProvider })), { ssr: false });
const AgentModal = dynamic(() => import("../../components/AgentModal").then(mod => ({ default: mod.default })), { ssr: false });
const WelcomeMessage = dynamic(() => import("../../components/WelcomeMessage").then(mod => ({ default: mod.default })), { ssr: false });
const ChatWithPriceDisplay = dynamic(() => import("../../components/ChatWithPriceDisplay").then(mod => ({ default: mod.ChatWithPriceDisplay })), { ssr: false });
const ManualPriceDisplay = dynamic(() => import("../../components/ManualPriceDisplay").then(mod => ({ default: mod.ManualPriceDisplay })), { ssr: false });
const StockCard = dynamic(() => import("../../components/StockCard").then(mod => ({ default: mod.StockCard })), { ssr: false });

import { theme, darkTheme, themeMode } from "../../theme";
import type { Agent } from "../../components/AgentModal";

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    console.log('Selected agent:', agent);
    // TODO: Update chat context with selected agent
  };

  // Import CSS on client side only
  useEffect(() => {
    import("@crayonai/react-ui/styles/index.css");
  }, []);

  if (!mounted) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className={clsx("!h-full !w-full", styles["chat-theme"])} suppressHydrationWarning>
      {/* Back Button - Top Left */}
      <button
        onClick={() => window.location.href = '/'}
        className="fixed top-4 left-4 z-40 px-4 py-2 bg-gray-800/80 backdrop-blur-sm font-semibold rounded-lg hover:bg-gray-700 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 border border-gray-600 hover:border-gray-500"
        style={{ color: '#ffffff' }}
      >
        <span className="text-lg">←</span>
        <span className="text-sm">Back</span>
      </button>

      {/* Agent Selection Button - Top Right */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#14b8a6] font-bold rounded-lg hover:shadow-xl hover:shadow-[#10b981]/30 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 flex items-center gap-2 border-2 border-transparent hover:border-white/20"
          style={{ color: '#000000' }}
        >
          <span className="text-lg">🤖</span>
          <span className="text-sm tracking-tight" style={{ color: '#000000' }}>
            {selectedAgent ? `${selectedAgent.emoji} ${selectedAgent.name}` : 'Select Analyst/Coach'}
          </span>
        </button>
        
        {/* Clear Selection Button */}
        {selectedAgent && (
          <button
            onClick={() => setSelectedAgent(null)}
            className="px-3 py-2 bg-red-500/80 backdrop-blur-sm font-semibold rounded-lg hover:bg-red-600 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-1 border border-red-400"
            style={{ color: '#ffffff' }}
            title="Clear selection"
          >
            <span className="text-lg">✕</span>
          </button>
        )}
      </div>

      {/* Welcome Message */}
      {mounted && <WelcomeMessage />}

      {/* Agent Modal */}
      <AgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAgentSelect}
      />

      <div suppressHydrationWarning>
        {mounted && (
          <ThemeProvider theme={theme} darkTheme={darkTheme} mode={themeMode}>
            <C1Chat 
              apiUrl="/api/chat" 
              agentName={selectedAgent ? selectedAgent.name : "AlphaFlow AI"}
              disableThemeProvider
            />
          </ThemeProvider>
        )}
      </div>
    </div>
  );
}
