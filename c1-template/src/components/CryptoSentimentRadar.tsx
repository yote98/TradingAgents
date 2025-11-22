'use client';

import { RadarChart } from '@crayonai/ui';

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
  // Transform data for RadarChart component
  const radarData = [
    { axis: 'Volatility', value: data.volatility },
    { axis: 'Volume', value: data.volume },
    { axis: 'Momentum', value: data.momentum },
    { axis: 'Fear/Greed', value: data.fearGreed },
    { axis: 'Social', value: data.social },
    { axis: 'Technicals', value: data.technicals },
    { axis: 'On-Chain', value: data.onChain },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {symbol} Sentiment Breakdown
        </h3>
        <span className="text-sm text-muted-foreground">
          Multi-dimensional analysis
        </span>
      </div>

      <RadarChart
        data={radarData}
        width={400}
        height={400}
        color="#10B981"
      />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium">Volatility</div>
          <div className="text-muted-foreground">
            {data.volatility > 70 ? 'High' : data.volatility > 40 ? 'Moderate' : 'Low'}
          </div>
        </div>
        <div>
          <div className="font-medium">Volume</div>
          <div className="text-muted-foreground">
            {data.volume > 70 ? 'High' : data.volume > 40 ? 'Moderate' : 'Low'}
          </div>
        </div>
        <div>
          <div className="font-medium">Momentum</div>
          <div className="text-muted-foreground">
            {data.momentum > 60 ? 'Bullish' : data.momentum < 40 ? 'Bearish' : 'Neutral'}
          </div>
        </div>
        <div>
          <div className="font-medium">Fear/Greed</div>
          <div className="text-muted-foreground">
            {data.fearGreed > 80 ? 'Extreme Greed' : 
             data.fearGreed > 60 ? 'Greed' :
             data.fearGreed > 40 ? 'Neutral' :
             data.fearGreed > 20 ? 'Fear' : 'Extreme Fear'}
          </div>
        </div>
        <div>
          <div className="font-medium">Social Sentiment</div>
          <div className="text-muted-foreground">
            {data.social > 60 ? 'Positive' : data.social < 40 ? 'Negative' : 'Neutral'}
          </div>
        </div>
        <div>
          <div className="font-medium">Technical Signals</div>
          <div className="text-muted-foreground">
            {data.technicals > 60 ? 'Bullish' : data.technicals < 40 ? 'Bearish' : 'Neutral'}
          </div>
        </div>
        <div className="col-span-2">
          <div className="font-medium">On-Chain Activity</div>
          <div className="text-muted-foreground">
            {data.onChain > 70 ? 'High whale activity' : 
             data.onChain > 40 ? 'Moderate activity' : 'Low activity'}
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground border-t pt-4">
        <strong>Note:</strong> Sentiment components are normalized 0-100. 
        Higher values indicate stronger signals in each dimension.
      </div>
    </div>
  );
}
