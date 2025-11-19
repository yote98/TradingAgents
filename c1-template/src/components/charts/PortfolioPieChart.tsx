"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PortfolioData {
  name: string;
  value: number;
  color?: string;
}

interface PortfolioPieChartProps {
  data: PortfolioData[];
  title?: string;
}

const DEFAULT_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6'];

export default function PortfolioPieChart({ data, title = "Portfolio Allocation" }: PortfolioPieChartProps) {
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }));

  return (
    <div className="w-full bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataWithColors}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {dataWithColors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Allocation']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
