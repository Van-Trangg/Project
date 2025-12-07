// src/components/StatsChart.jsx

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// This function receives the raw value from the dataKey and returns the formatted string.
const formatXAxisTick = (value) => {
  return monthNames[value - 1] || 'N/A'; // Add a fallback for safety
};

// The tooltip formatter remains the same, as its payload structure is different and works correctly.
const customTooltipLabel = (label, payload) => {
  if (payload && payload.length) {
    const { month, year } = payload[0].payload;
    const monthName = monthNames[month - 1] || 'N/A';
    return `${monthName} ${year}`;
  }
  return label;
};

const StatsChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 0,
          left: -30,
          bottom: 0,
        }}
        barCategoryGap="20%" // Adds space between each month's stacked bar
        barGap={0} // Ensures no gap within the stack
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          tickFormatter={formatXAxisTick}
          tick={{ fill: '#6b7280', fontSize: 12 }} 
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip 
          labelFormatter={customTooltipLabel}
          contentStyle={{ 
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            color: '#f3f4f6'
          }}
        />
        <Bar dataKey="checkin_points" stackId="a" fill="#d56a8aff" name="Thưởng Check-in" />
        <Bar dataKey="daily_reward_points" stackId="a" fill="#e391a4ff" name="Thuởng đăng nhập" />
        <Bar dataKey="other_points" stackId="a" fill="#eacdd5ff" name="Thuởng mời bạn" />
        
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StatsChart;