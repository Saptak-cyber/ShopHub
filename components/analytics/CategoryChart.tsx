"use client";

import { Card } from "../ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CategoryChartProps {
  data: Array<{
    category: string;
    revenue: number;
    orders: number;
  }>;
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.category,
    value: item.revenue,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Revenue by Category</h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px'
            }}
            formatter={(value: number | undefined) => `$${(value ?? 0).toFixed(2)}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
