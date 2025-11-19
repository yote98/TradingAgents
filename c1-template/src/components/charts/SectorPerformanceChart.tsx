"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SectorData {
  sector: string;
  return: number;
}

interface SectorPerformanceChartProps {
  data: SectorData[];
}

export default function SectorPerformanceChart({ data }: SectorPerformanceChartProps) {
  return (
    <div className="w-full h-80 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">Sector Performance</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="sector" 
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Return']}
          />
          <Bar dataKey="return" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.return >= 0 ? '#10B981' : '#EF4444'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
