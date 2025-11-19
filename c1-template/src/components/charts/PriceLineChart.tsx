"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PriceData {
  date: string;
  price: number;
  volume?: number;
}

interface PriceLineChartProps {
  data: PriceData[];
  title?: string;
  showArea?: boolean;
}

export default function PriceLineChart({ data, title = "Price History", showArea = true }: PriceLineChartProps) {
  const ChartComponent = showArea ? AreaChart : LineChart;
  
  return (
    <div className="w-full h-80 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            domain={['auto', 'auto']}
            label={{ value: 'Price ($)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          />
          {showArea ? (
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#10B981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          ) : (
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={false}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
