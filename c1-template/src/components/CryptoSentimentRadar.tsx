'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export interface CryptoSentimentData {
  volatility: number;      // 0-100
  volume: number;          // 0-100
  momentum: number;        // 0-100 (price momentum)
  fearGreed: number;       // 0-100 (from Fear & Greed Index)
  social: number;          // 0-100 (social sentiment)
  technicals: number;      // 0-100 (technical indicators)
  onChain: number;         // 0-100 (on-chain metrics like whale activity)
}

interface CryptoSentimentRadarProps {
  data: CryptoSentimentData;
  symbol: string;
}

export function CryptoSentimentRadar({ data, symbol }: CryptoSentimentRadarProps) {
  // Transform data for radar chart
  const radarData = [
    { dimension: 'Volatility', value: data.volatility, fullMark: 100 },
    { dimension: 'Volume', value: data.volume, fullMark: 100 },
    { dimension: 'Momentum', value: data.momentum, fullMark: 100 },
    { dimension: 'Fear/Greed', value: data.fearGreed, fullMark: 100 },
    { dimension: 'Social', value: data.social, fullMark: 100 },
    { dimension: 'Technicals', value: data.technicals, fullMark: 100 },
    { dimension: 'On-Chain', value: data.onChain, fullMark: 100 },
  ];

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {symbol} Sentiment Breakdown
        </h3>
        <span className="text-sm text-muted-foreground">
          Multi-dimensional analysis
        </span>
      </div>

      {/* Radar Chart */}
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#888', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#888' }} />
            <Radar
              name={symbol}
              dataKey="value"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Sentiment bars visualization */}
      <div className="space-y-3">

        {/* Volatility */}
        <SentimentBar 
          label="Volatility" 
          value={data.volatility}
          description={data.volatility > 70 ? 'High' : data.volatility > 40 ? 'Moderate' : 'Low'}
        />
        
        {/* Volume */}
        <SentimentBar 
          label="Volume" 
          value={data.volume}
          description={data.volume > 70 ? 'High' : data.volume > 40 ? 'Moderate' : 'Low'}
        />
        
        {/* Momentum */}
        <SentimentBar 
          label="Momentum" 
          value={data.momentum}
          description={data.momentum > 60 ? 'Bullish' : data.momentum < 40 ? 'Bearish' : 'Neutral'}
        />
        
        {/* Fear/Greed */}
        <SentimentBar 
          label="Fear/Greed" 
          value={data.fearGreed}
          description={
            data.fearGreed > 80 ? 'Extreme Greed' : 
            data.fearGreed > 60 ? 'Greed' :
            data.fearGreed > 40 ? 'Neutral' :
            data.fearGreed > 20 ? 'Fear' : 'Extreme Fear'
          }
          highlight={data.fearGreed <= 20 || data.fearGreed >= 80}
        />
        
        {/* Social */}
        <SentimentBar 
          label="Social" 
          value={data.social}
          description={data.social > 60 ? 'Positive' : data.social < 40 ? 'Negative' : 'Neutral'}
        />
        
        {/* Technicals */}
        <SentimentBar 
          label="Technicals" 
          value={data.technicals}
          description={data.technicals > 60 ? 'Bullish' : data.technicals < 40 ? 'Bearish' : 'Neutral'}
        />
        
        {/* On-Chain */}
        <SentimentBar 
          label="On-Chain" 
          value={data.onChain}
          description={
            data.onChain > 70 ? 'High whale activity' : 
            data.onChain > 40 ? 'Moderate activity' : 'Low activity'
          }
        />
      </div>

      <div className="text-xs text-muted-foreground border-t pt-4">
        <strong>Note:</strong> Sentiment components are normalized 0-100. 
        Higher values indicate stronger signals in each dimension.
      </div>
    </div>
  );
}

// Helper component for sentiment bars
function SentimentBar({ 
  label, 
  value, 
  description,
  highlight = false 
}: { 
  label: string; 
  value: number; 
  description: string;
  highlight?: boolean;
}) {
  const getColor = () => {
    if (highlight) return 'bg-yellow-500';
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-blue-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{description}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-right">{value}/100</div>
    </div>
  );
}
