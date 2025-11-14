"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import "@crayonai/react-ui/styles/index.css";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SimpleChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/c1-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: {
            role: 'user',
            content: input,
            id: 'user-' + Date.now()
          },
          threadId: 'simple-chat-thread',
          responseId: 'response-' + Date.now()
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          assistantMessage += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantMessage };
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="jade-theme" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0f0f0f',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      ['--jade-primary' as string]: '#14b8a6',
      ['--jade-bg' as string]: '#0f0f0f',
      ['--jade-surface' as string]: '#1a1a1a',
      ['--jade-border' as string]: 'rgba(255, 255, 255, 0.1)',
    } as React.CSSProperties}>
      
      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem',
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '8rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
            <h2 style={{ color: '#ffffff', fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '600' }}>
              AlphaFlow AI
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
              Multi-agent trading analysis system
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              background: msg.role === 'user' ? '#14b8a6' : '#1a1a1a',
              color: msg.role === 'user' ? '#ffffff' : '#e2e8f0',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              {msg.role === 'assistant' ? (
                <div className="markdown-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <div>{msg.content}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              background: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
            }}>
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        borderTop: '1px solid #1a4d44',
        background: '#0f2d28',
        padding: '1.5rem',
      }}>
        <form onSubmit={sendMessage} style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          gap: '0.75rem',
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about stocks, market analysis, risk management..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.875rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #1a4d44',
              background: '#0a1f1c',
              color: '#ffffff',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              padding: '0.875rem 1.75rem',
              borderRadius: '8px',
              border: 'none',
              background: isLoading || !input.trim() ? '#0d7a6f' : '#14b8a6',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !input.trim() ? 0.5 : 1,
            }}
          >
            Send
          </button>
        </form>
      </div>

      <style jsx global>{`
        .jade-theme .markdown-content {
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .jade-theme .markdown-content h1,
        .jade-theme .markdown-content h2,
        .jade-theme .markdown-content h3 {
          color: #14b8a6;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        .jade-theme .markdown-content h1 { font-size: 1.5rem; }
        .jade-theme .markdown-content h2 { font-size: 1.25rem; }
        .jade-theme .markdown-content h3 { font-size: 1.1rem; }
        .jade-theme .markdown-content p {
          margin-bottom: 0.75rem;
        }
        .jade-theme .markdown-content ul,
        .jade-theme .markdown-content ol {
          margin-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .jade-theme .markdown-content li {
          margin-bottom: 0.25rem;
        }
        .jade-theme .markdown-content code {
          background: rgba(20, 184, 166, 0.1);
          padding: 0.2rem 0.4rem;
          borderRadius: 4px;
          fontFamily: 'Courier New', monospace;
          fontSize: 0.9em;
          color: #14b8a6;
        }
        .jade-theme .markdown-content pre {
          background: #0a1f1c;
          padding: 1rem;
          borderRadius: 8px;
          overflow-x: auto;
          marginBottom: 0.75rem;
          border: 1px solid #1a4d44;
        }
        .jade-theme .markdown-content pre code {
          background: none;
          padding: 0;
          color: #e2e8f0;
        }
        .jade-theme .markdown-content strong {
          color: #14b8a6;
          fontWeight: 600;
        }
        .jade-theme .markdown-content table {
          width: 100%;
          borderCollapse: collapse;
          marginBottom: 0.75rem;
        }
        .jade-theme .markdown-content th,
        .jade-theme .markdown-content td {
          border: 1px solid #1a4d44;
          padding: 0.5rem;
          textAlign: left;
        }
        .jade-theme .markdown-content th {
          background: rgba(20, 184, 166, 0.1);
          fontWeight: 600;
          color: #14b8a6;
        }
      `}</style>
    </div>
  );
}
