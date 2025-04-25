import React from 'react';

export const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 bg-gray-100 p-4 rounded-lg max-w-[80%]">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm text-gray-600"></span>
    </div>
  );
};