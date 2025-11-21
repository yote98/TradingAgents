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

  // Detect when user sends a message by watching for input activity
  useEffect(() => {
    if (!mounted) return;

    const detectMessageSent = () => {
      // Check multiple selectors for messages
      const messageElements = document.querySelectorAll(
        '[class*="message"], [class*="Message"], [role="article"], ' +
        '[class*="chat"], [class*="Chat"], [class*="thread"], ' +
        'div[class*="crayon-shell-thread"]'
      );
      
      // Also check if there's any substantial content in the chat area
      const chatContent = document.querySelector('[class*="thread"], [class*="chat-container"]');
      const hasContent = chatContent && chatContent.textContent && chatContent.textContent.length > 100;
      
      if (messageElements.length > 0 || hasContent) {
        setHasMessages(true);
        setShowPrompts(false);
      }
    };

    // Initial check
    detectMessageSent();

    // Watch for DOM changes (messages being added)
    const observer = new MutationObserver(() => {
      detectMessageSent();
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      characterData: true
    });

    // Also check on any user interaction
    const handleUserActivity = () => {
      setTimeout(detectMessageSent, 300);
    };

    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('click', handleUserActivity);
    document.addEventListener('input', handleUserActivity);

    // Periodic check as fallback
    const intervalCheck = setInterval(detectMessageSent, 1000);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('click', handleUserActivity);
      document.removeEventListener('input', handleUserActivity);
      clearInterval(intervalCheck);
    };
  }, [mounted]);

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
        <div 
          className="fixed bottom-24 left-0 right-0 z-20 transition-opacity duration-300"
          style={{ opacity: showPrompts ? 1 : 0, pointerEvents: showPrompts ? 'auto' : 'none' }}
        >
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
