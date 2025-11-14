'use client';

import { useState, useEffect } from 'react';

export interface Agent {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: 'analyst' | 'coach';
  status?: 'online' | 'offline';
}

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (agent: Agent) => void;
}

const INTERNAL_ANALYSTS: Agent[] = [
  {
    id: 'market',
    name: 'Market Analyst',
    description: 'Technical indicators & price action',
    emoji: '📈',
    type: 'analyst',
    status: 'online'
  },
  {
    id: 'fundamentals',
    name: 'Fundamentals Analyst',
    description: 'Financial metrics & valuations',
    emoji: '💰',
    type: 'analyst',
    status: 'online'
  },
  {
    id: 'news',
    name: 'News Analyst',
    description: 'Breaking news & insider data',
    emoji: '📰',
    type: 'analyst',
    status: 'online'
  },
  {
    id: 'social',
    name: 'Social Media Analyst',
    description: 'Sentiment & social trends',
    emoji: '💬',
    type: 'analyst',
    status: 'online'
  }
];

export default function AgentModal({ isOpen, onClose, onSelect }: AgentModalProps) {
  const [discordCoaches, setDiscordCoaches] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDiscordCoaches();
    }
  }, [isOpen]);

  const fetchDiscordCoaches = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual Discord API call
      // const response = await fetch('/api/discord/coaches');
      // const coaches = await response.json();
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setDiscordCoaches([
        {
          id: 'coach_d',
          name: 'Coach D',
          description: 'Daily trading plans & setups',
          emoji: '📊',
          type: 'coach',
          status: 'online'
        },
        {
          id: 'coach_i',
          name: 'Coach I',
          description: 'Market insights & analysis',
          emoji: '💡',
          type: 'coach',
          status: 'online'
        },
        {
          id: 'coach_s',
          name: 'Coach S',
          description: 'Sentiment & positioning',
          emoji: '🎯',
          type: 'coach',
          status: 'online'
        },
        {
          id: 'coach_n',
          name: 'Coach N',
          description: 'Market signals & trading opportunities',
          emoji: '🐋',
          type: 'coach',
          status: 'online'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch Discord coaches:', error);
      setDiscordCoaches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (agent: Agent) => {
    onSelect(agent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#1a1a1a] border-2 border-[#00ff88]/30 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#2a2a2a] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              🤖 Select Your AI Agent
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Choose an analyst or coach to start your conversation
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Internal Analysts */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-[#00ff88] text-sm font-semibold uppercase tracking-wider">
                ⚡ Internal Analysts
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-[#00ff88]/20 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTERNAL_ANALYSTS.map((agent) => (
                <AgentCard key={agent.id} agent={agent} onSelect={handleSelect} />
              ))}
            </div>
          </section>

          {/* External Coaches */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-[#00ff88] text-sm font-semibold uppercase tracking-wider">
                🌟 External Coaches
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-[#00ff88]/20 to-transparent"></div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00ff88] border-t-transparent"></div>
                <span className="ml-3 text-gray-400">Loading coaches...</span>
              </div>
            ) : discordCoaches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {discordCoaches.map((coach) => (
                  <AgentCard key={coach.id} agent={coach} onSelect={handleSelect} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-gray-700">
                <div className="text-4xl mb-2">😴</div>
                <p className="text-gray-400">Discord coaches unavailable</p>
                <p className="text-gray-500 text-sm mt-1">They'll be back soon!</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
}

function AgentCard({ agent, onSelect }: AgentCardProps) {
  return (
    <button
      onClick={() => onSelect(agent)}
      className="bg-white/5 hover:bg-white/10 border border-[#00ff88]/20 hover:border-[#00ff88]/40 rounded-xl p-5 transition-all duration-200 text-left w-full"
    >
      {/* Emoji */}
      <div className="text-4xl mb-3">
        {agent.emoji}
      </div>

      {/* Name */}
      <h4 className="text-white font-semibold text-lg mb-1">
        {agent.name}
      </h4>

      {/* Description */}
      <p className="text-gray-400 text-sm">
        {agent.description}
      </p>
    </button>
  );
}
