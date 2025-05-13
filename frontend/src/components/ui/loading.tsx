import React from "react";

interface LoadingProps {
    isLoading: boolean;
}

export const Loading: React.FC<LoadingProps> = ({isLoading}) => {
    console.log(isLoading);
    
    if (!isLoading) return null;
    
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
;}
    
