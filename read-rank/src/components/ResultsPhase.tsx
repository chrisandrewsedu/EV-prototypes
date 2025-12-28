import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useReadRankStore } from '../store/useReadRankStore';
import { mockCandidates } from '../data/mockData';
import { fetchMatchingResults } from '../utils/matchingAlgorithm';

interface AlignmentGaugeProps {
  percentage: number;
  size?: number;
  strokeColor?: string;
}

const AlignmentGauge: React.FC<AlignmentGaugeProps> = ({ percentage, size = 120, strokeColor = "white" }) => {
  const motionPercentage = useMotionValue(0);
  const displayPercentage = useTransform(motionPercentage, (value) => Math.round(value));

  useEffect(() => {
    animate(motionPercentage, percentage, { duration: 1.5, ease: "easeOut" });
  }, [percentage, motionPercentage]);

  const radius = (size - 12) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="12"
          fill="transparent"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      
      {/* Percentage Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="font-manrope font-extrabold text-xl md:text-2xl text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.span>{displayPercentage}</motion.span>%
        </motion.span>
      </div>
    </div>
  );
};

interface CandidateRowProps {
  candidate: any;
  rank: number;
}

const CandidateRow: React.FC<CandidateRowProps> = ({ candidate, rank }) => {
  const getBackgroundClass = (percentage: number) => {
    if (percentage >= 85) return 'bg-ev-coral';
    if (percentage >= 50) return 'bg-ev-yellow';
    return 'bg-ev-muted-blue';
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 85) return 'text-white'; // coral background
    if (percentage >= 50) return 'text-ev-black'; // yellow background, darker text
    return 'text-white'; // muted blue background, lighter text
  };

  const backgroundClass = getBackgroundClass(candidate.alignmentPercent);

  const getGaugeStrokeColor = (percentage: number) => {
    if (percentage >= 85) return "white";
    if (percentage >= 50) return "#00657c";
    return "white";
  };

  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.15, duration: 0.5 }}
    >
      <div className={`${backgroundClass} rounded-lg overflow-hidden shadow-lg`}>
        {/* Mobile Layout: Stack vertically */}
        <div className="md:hidden p-4">
          {/* Top Row: Rank and Gauge */}
          <div className="flex items-center justify-between mb-3">
            <div className="font-manrope font-extrabold text-2xl text-white">
              #{rank}
            </div>
            <AlignmentGauge 
              percentage={candidate.alignmentPercent} 
              size={80}
              strokeColor={getGaugeStrokeColor(candidate.alignmentPercent)} 
            />
          </div>
          
          {/* Middle Row: Photo and Info */}
          <div className="flex items-center space-x-3">
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className={`font-manrope font-bold text-lg ${getTextColor(candidate.alignmentPercent)} truncate`}>
                {candidate.name}
              </div>
              <div className={`font-manrope text-xs ${getTextColor(candidate.alignmentPercent)} opacity-70`}>
                {candidate.office}
              </div>
              <div className={`font-manrope text-sm ${getTextColor(candidate.alignmentPercent)} opacity-80`}>
                {candidate.party}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout: Side by side */}
        <div className="hidden md:grid grid-cols-[auto_1fr_auto] gap-6 p-6 items-center">
          {/* Rank */}
          <div className="font-manrope font-extrabold text-3xl text-white">
            #{rank}
          </div>

          {/* Candidate Photo & Info */}
          <div className="flex items-center space-x-4">
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white"
            />
            <div>
              <div className={`font-manrope font-bold text-xl ${getTextColor(candidate.alignmentPercent)}`}>
                {candidate.name}
              </div>
              <div className={`font-manrope text-sm ${getTextColor(candidate.alignmentPercent)} opacity-70`}>
                {candidate.office}
              </div>
              <div className={`font-manrope text-base ${getTextColor(candidate.alignmentPercent)} opacity-80`}>
                {candidate.party}
              </div>
            </div>
          </div>

          {/* Alignment Gauge */}
          <div className="flex justify-center">
            <AlignmentGauge 
              percentage={candidate.alignmentPercent} 
              strokeColor={getGaugeStrokeColor(candidate.alignmentPercent)} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ResultsPhase: React.FC = () => {
  const { rankedQuotes, agreedQuotes, badgeAssignments } = useReadRankStore();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      try {
        // Combine ranked quotes with agreed quotes for the matching algorithm
        const allQuotes = [...rankedQuotes, ...agreedQuotes.filter(q =>
          !rankedQuotes.find(rq => rq.id === q.id)
        )];

        const matchingResults = await fetchMatchingResults(
          rankedQuotes,
          allQuotes,
          mockCandidates,
          badgeAssignments
        );

        setResults(matchingResults);
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [rankedQuotes, agreedQuotes, badgeAssignments]);

  const handleRestart = () => {
    // Reset the store
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <motion.div
          className="inline-block w-8 h-8 border-4 border-ev-coral border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="mt-4 ev-text-primary text-base md:text-lg">
          Calculating your candidate matches...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      {/* Results intro text */}
      <motion.div 
        className="text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="ev-text-primary text-base md:text-xl">
          Your anonymous rankings uncovered the best candidate fit for your views
        </p>
      </motion.div>

      {/* Results Table */}
      <div className="max-w-5xl mx-auto">
        {/* Table Header - Desktop only */}
        <motion.div 
          className="hidden md:block bg-ev-white border-2 border-ev-coral rounded-t-lg overflow-hidden mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="bg-ev-coral grid grid-cols-[auto_1fr_auto] gap-6 p-4 items-center">
            <div className="font-manrope font-semibold text-ev-white">Rank</div>
            <div className="font-manrope font-semibold text-ev-white">Candidate</div>
            <div className="font-manrope font-semibold text-ev-white text-center">Alignment</div>
          </div>
        </motion.div>

        {/* Results Rows */}
        <div>
          {results.map((candidate, index) => (
            <CandidateRow 
              key={candidate.candidateId} 
              candidate={candidate} 
              rank={index + 1}
            />
          ))}
        </div>
      </div>

      {/* Load More Button (for future expansion) */}
      {results.length >= 6 && (
        <div className="text-center">
          <button className="ev-button-primary">
            Load More Candidates
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <motion.div 
        className="text-center max-w-lg mx-auto bg-ev-light-blue bg-opacity-10 rounded-lg p-4 md:p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <h3 className="ev-heading text-lg md:text-xl mb-3 md:mb-4">Your Profile Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="font-manrope font-bold text-xl md:text-2xl text-ev-coral">
              {rankedQuotes.length}
            </div>
            <div className="text-xs md:text-sm ev-text-primary">Quotes Ranked</div>
          </div>
          <div>
            <div className="font-manrope font-bold text-xl md:text-2xl text-ev-coral">
              {agreedQuotes.length}
            </div>
            <div className="text-xs md:text-sm ev-text-primary">Total Agreed</div>
          </div>
        </div>
      </motion.div>

      {/* Try Another Topic Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleRestart}
          className="ev-button-primary text-base md:text-lg px-8 py-3"
        >
          Try Another Topic
        </button>
      </div>
    </div>
  );
};
