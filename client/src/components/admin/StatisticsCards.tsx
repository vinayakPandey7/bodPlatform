import React from 'react';
import { Box } from '@mui/material';

interface StatItem {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface StatisticsCardsProps {
  stats: StatItem[];
}

const getIconClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    'bg-blue-500': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-green-500': 'bg-gradient-to-br from-green-500 to-green-600',
    'bg-purple-500': 'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-yellow-500': 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    'bg-red-500': 'bg-gradient-to-br from-red-500 to-red-600',
    'bg-indigo-500': 'bg-gradient-to-br from-indigo-500 to-indigo-600',
  };
  
  return colorMap[color] || 'bg-gradient-to-br from-gray-500 to-gray-600';
};

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-xl shadow-lg ${getIconClasses(stat.color)}`}>
              <div className="w-6 h-6 text-white [&>svg]:text-white [&>svg]:w-6 [&>svg]:h-6">
                {stat.icon}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards; 