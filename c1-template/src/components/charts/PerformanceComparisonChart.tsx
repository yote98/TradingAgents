"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ComparisonData {
  name: string;
  [key: string]: string | number;
}

interface PerformanceComparisonChartProps {
  data: ComparisonData[];
  metrics: string[];
  title?: string;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function PerformanceComparisonChart({ 
  data, 
  metrics, 
  title = "Performance Comparison" 
}: PerformanceComparisonChartProps) {
  return (
    <div className="w-full h-96 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            label={{ value: 'Value', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
          />
          {metrics.map((metric, index) => (
            <Bar 
              key={metric}
              dataKey={metric} 
              fill={COLORS[index % COLORS.length]}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
