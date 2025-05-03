import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = "Finalizando a sessão..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50">
      {/* Semi-transparent gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/80 via-purple-500/80 to-indigo-700/80 backdrop-blur-sm"></div>
      
      <div className="relative flex flex-col items-center p-8 rounded-lg text-white">
        {/* Loading spinner */}
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
        
        {/* Message */}
        <h3 className="text-xl font-medium mb-2">{message}</h3>
        <p className="text-white/80">Por favor, aguarde enquanto preparamos o resumo da sua sessão</p>
      </div>
    </div>
  );
}; 