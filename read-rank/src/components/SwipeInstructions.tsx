import React from 'react';

export const SwipeInstructions: React.FC = () => {
  return (
    <div className="flex justify-between items-center max-w-md mx-auto px-4">
      {/* Disagree (Left) */}
      <div className="flex flex-col items-center space-y-1">
        <div className="text-ev-black font-manrope font-medium text-xs md:text-sm text-center max-w-20">
          Disagree
        </div>
        <div className="w-6 h-6 md:w-8 md:h-8 border-l-2 border-b-2 border-ev-black transform rotate-45"></div>
      </div>

      {/* Card Indicator */}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-ev-muted-blue flex items-center justify-center">
        <div className="w-5 h-5 md:w-6 md:h-6 bg-ev-white rounded-full"></div>
      </div>

      {/* Agree (Right) */}
      <div className="flex flex-col items-center space-y-1">
        <div className="w-6 h-6 md:w-8 md:h-8 border-r-2 border-b-2 border-ev-black transform -rotate-45"></div>
        <div className="text-ev-black font-manrope font-medium text-xs md:text-sm text-center max-w-20">
          Agree
        </div>
      </div>
    </div>
  );
};
