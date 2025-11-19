"use client";

interface PromptSuggestionsProps {
  onPromptClick?: (prompt: string) => void;
}

export default function PromptSuggestions({ onPromptClick }: PromptSuggestionsProps) {
  const suggestions = [
    "Analyze NVIDIA (NVDA) - valuation, financial, and performance.",
    "Market briefing: top movers, sector trends, and macro highlights.",
    "S&P 500 top performers this week and driving sectors.",
  ];

  const handleClick = (prompt: string) => {
    // Copy to clipboard
    navigator.clipboard.writeText(prompt);
    
    // Try to find and focus the input field
    setTimeout(() => {
      // Try multiple selectors to find the chat input
      const inputField = document.querySelector('textarea, input[type="text"], [contenteditable="true"]') as HTMLElement;
      if (inputField) {
        inputField.focus();
        
        // Flash green border
        inputField.style.border = '2px solid #22c55e';
        inputField.style.boxShadow = '0 0 10px rgba(34, 197, 94, 0.5)';
        
        // Show a tooltip
        const tooltip = document.createElement('div');
        tooltip.textContent = '✓ Copied! Press Ctrl+V to paste';
        tooltip.style.cssText = 'position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; z-index: 9999; animation: fadeIn 0.3s;';
        document.body.appendChild(tooltip);
        
        setTimeout(() => {
          inputField.style.border = '';
          inputField.style.boxShadow = '';
          tooltip.remove();
        }, 2000);
      }
    }, 100);
    
    // Hide the prompt cards after clicking
    if (onPromptClick) {
      onPromptClick(prompt);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-4">
      {/* Suggestion Cards - Playground Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleClick(suggestion)}
            className="group relative bg-gray-800/40 hover:bg-gray-700/60 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600 rounded-lg p-4 text-left transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              {/* Lightbulb icon */}
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-sm text-gray-300 leading-relaxed">
                {suggestion}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
