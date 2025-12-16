import React from 'react';
import { useReadRankStore } from '../store/useReadRankStore';
import { EvaluationPhase } from './EvaluationPhase';
import { RankingPhase } from './RankingPhase';
import { ResultsPhase } from './ResultsPhase';

export const PhaseContainer: React.FC = () => {
  const { phase } = useReadRankStore();

  const renderPhase = () => {
    switch (phase) {
      case 'evaluation':
        return <EvaluationPhase />;
      case 'ranking':
        return <RankingPhase />;
      case 'results':
        return <ResultsPhase />;
      default:
        return <EvaluationPhase />;
    }
  };

  return (
    <div className="min-h-[60vh]">
      {renderPhase()}
    </div>
  );
};