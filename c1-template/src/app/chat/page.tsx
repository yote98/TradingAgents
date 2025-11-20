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

const WelcomeMessage = dynamic(() => import("../../components/WelcomeMessage").then(mod => ({ default: mod.default })), { ssr: false });
const ChatWithPriceDisplay = dynamic(() => import("../../components/ChatWithPriceDisplay").then(mod => ({ default: mod.ChatWithPriceDisplay })), { ssr: false });
const ManualPriceDisplay = dynamic(() => import("../../components/ManualPriceDisplay").then(mod => ({ default: mod.ManualPriceDisplay })), { ssr: false });
const StockCard = dynamic(() => import("../../components/StockCard").then(mod => ({ default: mod.StockCard })), { ssr: false });
const StreamingLoadingIndicator = dynamic(() => import("../../components/StreamingLoadingIndicator").then(mod => ({ default: mod.default })), { ssr: false });
const PromptSuggestions = dynamic(() => import("../../components/PromptSuggestions").then(mod => ({ default: mod.default })), { ssr: false });

import { theme, darkTheme, themeMode } from "../../theme";

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true); // Show prompts initially
  const [hasMessages, setHasMessages] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePromptClick = () => {
    // Hide prompts when user clicks one
    setShowPrompts(false);
    setHasMessages(true);
  };

  // Hide prompts when user starts typing or sends a message
  useEffect(() => {
    if (hasMessages) {
      setShowPrompts(false);
    }
  }, [hasMessages]);

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



      {/* Streaming Loading Indicator */}
      {mounted && <StreamingLoadingIndicator />}

      {/* Prompt Suggestions - Shows above input when chat is empty */}
      {mounted && showPrompts && !hasMessages && (
        <div className="fixed bottom-24 left-0 right-0 z-20">
          <PromptSuggestions onPromptClick={handlePromptClick} />
        </div>
      )}

      <div suppressHydrationWarning>
        {mounted && (
          <ThemeProvider theme={theme} darkTheme={darkTheme} mode={themeMode}>
            <C1Chat 
              apiUrl="/api/chat" 
              agentName="AlphaFlow AI"
              disableThemeProvider
            />
          </ThemeProvider>
        )}
      </div>
    </div>
  );
}
