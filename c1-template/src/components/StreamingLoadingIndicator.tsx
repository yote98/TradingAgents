"use client";

import { useEffect, useState } from 'react';
import LottieLoader from './LottieLoader';

/**
 * Shows Lottie animation during AI streaming responses
 * Integrates with C1Chat's streaming state
 */
export default function StreamingLoadingIndicator() {
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    // Monitor for streaming activity by checking for typing indicators
    const observer = new MutationObserver(() => {
      // Look for streaming indicators in the chat
      const streamingIndicators = document.querySelectorAll('[class*="streaming"], [class*="typing"], [class*="loading"]');
      const hasStreamingContent = streamingIndicators.length > 0;
      
      // Also check if there's an active fetch/request
      const isRequestActive = (window as any).__chatRequestActive || false;
      
      setIsStreaming(hasStreamingContent || isRequestActive);
    });

    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    // Listen for custom events from the chat system
    const handleRequestStart = () => {
      (window as any).__chatRequestActive = true;
      setIsStreaming(true);
    };

    const handleRequestEnd = () => {
      (window as any).__chatRequestActive = false;
      setIsStreaming(false);
    };

    window.addEventListener('chat:request:start', handleRequestStart);
    window.addEventListener('chat:request:end', handleRequestEnd);

    return () => {
      observer.disconnect();
      window.removeEventListener('chat:request:start', handleRequestStart);
      window.removeEventListener('chat:request:end', handleRequestEnd);
    };
  }, []);

  if (!isStreaming) return null;

  return (
    <div className="fixed bottom-24 right-8 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-2xl p-5 shadow-2xl border border-emerald-500/30 backdrop-blur-md">
        <LottieLoader message="Analyzing..." size={100} />
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse delay-75"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}
