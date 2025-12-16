import React from 'react';
import { useReadRankStore } from '../store/useReadRankStore';
import { QuoteCard } from './QuoteCard';
import { SwipeInstructions } from './SwipeInstructions';

export const EvaluationPhase: React.FC = () => {
  const { 
    quotesToEvaluate, 
    currentQuoteIndex, 
    agreedQuotes, 
    disagreedQuotes,
    setPhase 
  } = useReadRankStore();

  const currentQuote = quotesToEvaluate[currentQuoteIndex];
  const progress = quotesToEvaluate.length > 0 
    ? Math.round(((currentQuoteIndex + 1) / quotesToEvaluate.length) * 100)
    : 0;

  const handleComplete = () => {
    // Go directly to ranking phase
    setPhase('ranking');
  };

  if (!currentQuote) {
    return (
      <div className="text-center py-12">
        <p className="ev-text-primary text-lg">No quotes to evaluate.</p>
        <button 
          onClick={handleComplete}
          className="ev-button-primary mt-4"
        >
          Continue to Results
        </button>
      </div>
    );
  }

  const isLastQuote = currentQuoteIndex >= quotesToEvaluate.length - 1;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Progress indicator - more compact */}
      <div className="text-center">
        <p className="ev-text-secondary text-xs md:text-sm">
          Quote {currentQuoteIndex + 1} of {quotesToEvaluate.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
          <div 
            className="ev-light-blue h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quote Card - pass the current index for display */}
      <div className="flex justify-center">
        <QuoteCard 
          key={currentQuote.id} 
          quote={currentQuote} 
          displayNumber={currentQuoteIndex + 1}
        />
      </div>

      {/* Swipe Instructions */}
      <SwipeInstructions />

      {/* Summary of decisions so far - more compact */}
      {(agreedQuotes.length > 0 || disagreedQuotes.length > 0) && (
        <div className="text-center text-xs md:text-sm ev-text-secondary">
          <p>
            Agreed: {agreedQuotes.length} • Disagreed: {disagreedQuotes.length}
          </p>
        </div>
      )}

      {/* Continue Button - Show when on last quote */}
      {isLastQuote && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleComplete}
            className="ev-button-primary text-base md:text-lg px-8 py-3 animate-gentle-pulse"
          >
            Rank Your Priorities →
          </button>
        </div>
      )}
    </div>
  );
};
