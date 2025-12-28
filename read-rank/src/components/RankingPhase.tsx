import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReadRankStore } from '../store/useReadRankStore';
import { DiamondBadge, GoldBadge } from './BadgeIcons';

interface QuoteCardProps {
  quote: any;
  index: number;
  diamondQuoteId: string | null;
  goldQuoteId: string | null;
  onAssignBadge: (quoteId: string, badge: 'diamond' | 'gold') => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  index,
  diamondQuoteId,
  goldQuoteId,
  onAssignBadge,
}) => {
  const hasDiamond = diamondQuoteId === quote.id;
  const hasGold = goldQuoteId === quote.id;
  const hasBadge = hasDiamond || hasGold;

  // Diamond is disabled on this card if another card has it, or this card has gold
  const diamondDisabled = (diamondQuoteId !== null && !hasDiamond) || hasGold;
  // Gold is disabled on this card if another card has it, or this card has diamond
  const goldDisabled = (goldQuoteId !== null && !hasGold) || hasDiamond;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        layout: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
        opacity: { duration: 0.2 },
        delay: index * 0.08,
      }}
      className="relative"
    >
      <div
        className={`
          ev-quote-card relative overflow-visible
          transition-all duration-300
          ${hasBadge
            ? hasDiamond
              ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20'
              : 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/20'
            : 'hover:shadow-xl hover:-translate-y-0.5'
          }
        `}
      >
        {/* Badge indicator when active - shows in top-left corner */}
        <AnimatePresence>
          {hasBadge && (
            <motion.div
              className="absolute -top-3 -left-3 z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <div
                className={`
                  w-12 h-12 md:w-14 md:h-14 rounded-full
                  flex items-center justify-center
                  shadow-lg ring-4 ring-white
                  ${hasDiamond
                    ? 'bg-gradient-to-br from-cyan-400 to-blue-600'
                    : 'bg-gradient-to-br from-yellow-400 to-amber-600'
                  }
                `}
              >
                {hasDiamond ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 9L12 22L20 9L12 2Z" fill="#E0F7FF" stroke="#0E7490" strokeWidth="0.5"/>
                    <path d="M12 2L4 9H20L12 2Z" fill="#A5F3FC" opacity="0.8"/>
                    <path d="M4 9L12 22L12 9H4Z" fill="#22D3EE" opacity="0.6"/>
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="14" r="8" fill="#FEF3C7" stroke="#92400E" strokeWidth="0.5"/>
                    <circle cx="12" cy="14" r="5.5" fill="none" stroke="#B45309" strokeWidth="0.75"/>
                    <path d="M12 10L13.09 12.26L15.5 12.63L13.75 14.34L14.18 16.73L12 15.58L9.82 16.73L10.25 14.34L8.5 12.63L10.91 12.26L12 10Z" fill="#FFFBEB" stroke="#B45309" strokeWidth="0.3"/>
                  </svg>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quote content */}
        <div className={`${hasBadge ? 'pl-10 md:pl-12' : ''}`}>
          {/* Status label */}
          <div className="flex items-center justify-between mb-3">
            <AnimatePresence mode="wait">
              {hasBadge ? (
                <motion.span
                  key="badge-label"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`
                    font-manrope font-bold text-xs md:text-sm px-2 py-0.5 rounded-full
                    ${hasDiamond
                      ? 'bg-cyan-100 text-cyan-700'
                      : 'bg-amber-100 text-amber-700'
                    }
                  `}
                >
                  {hasDiamond ? 'Your Top Pick' : 'Runner Up'}
                </motion.span>
              ) : (
                <motion.span
                  key="default-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-manrope text-xs md:text-sm text-white/60"
                >
                  Agreed statement
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Quote Text */}
          <div className="font-manrope font-medium text-sm md:text-base leading-relaxed">
            {quote.text}
          </div>

          {/* Badge selection strip - bottom of card */}
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 font-manrope">
                Assign a badge:
              </span>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <DiamondBadge
                    isActive={hasDiamond}
                    isDisabled={diamondDisabled}
                    onClick={() => onAssignBadge(quote.id, 'diamond')}
                    size={28}
                  />
                  <span className={`text-[10px] font-manrope ${hasDiamond ? 'text-cyan-400' : 'text-white/40'}`}>
                    Diamond
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <GoldBadge
                    isActive={hasGold}
                    isDisabled={goldDisabled}
                    onClick={() => onAssignBadge(quote.id, 'gold')}
                    size={28}
                  />
                  <span className={`text-[10px] font-manrope ${hasGold ? 'text-amber-400' : 'text-white/40'}`}>
                    Gold
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const RankingPhase: React.FC = () => {
  const {
    agreedQuotes,
    badgeAssignments,
    assignBadge,
    setPhase,
    setRankedQuotes,
  } = useReadRankStore();

  const handleAssignBadge = (quoteId: string, badge: 'diamond' | 'gold') => {
    assignBadge(quoteId, badge);
  };

  const handleContinue = () => {
    // Convert badge assignments to ranked quotes for the algorithm
    // Diamond = rank 1, Gold = rank 2, others just get added
    setRankedQuotes(agreedQuotes);
    setPhase('results');
  };

  const badgeCount = (badgeAssignments.diamond ? 1 : 0) + (badgeAssignments.gold ? 1 : 0);

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      {/* Instructions */}
      <motion.div
        className="text-center max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="ev-instruction text-sm md:text-lg mb-2">
          Award badges to the statements that resonate with you the most.
        </p>
        <p className="ev-instruction text-xs md:text-sm opacity-75">
          You have one Diamond (top pick) and one Gold (runner up) to award.
          These carry extra weight in finding your best matches.
        </p>

        {/* Badge status indicator */}
        <motion.div
          className="mt-4 flex items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            badgeAssignments.diamond ? 'bg-cyan-500/20' : 'bg-white/10'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              badgeAssignments.diamond ? 'bg-cyan-400' : 'bg-white/30'
            }`} />
            <span className={`text-xs font-manrope ${
              badgeAssignments.diamond ? 'text-cyan-300' : 'text-white/50'
            }`}>
              Diamond {badgeAssignments.diamond ? 'awarded' : 'available'}
            </span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            badgeAssignments.gold ? 'bg-amber-500/20' : 'bg-white/10'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              badgeAssignments.gold ? 'bg-amber-400' : 'bg-white/30'
            }`} />
            <span className={`text-xs font-manrope ${
              badgeAssignments.gold ? 'text-amber-300' : 'text-white/50'
            }`}>
              Gold {badgeAssignments.gold ? 'awarded' : 'available'}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Quote Cards */}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4 md:space-y-6">
          <AnimatePresence>
            {agreedQuotes.map((quote, index) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                index={index}
                diamondQuoteId={badgeAssignments.diamond}
                goldQuoteId={badgeAssignments.gold}
                onAssignBadge={handleAssignBadge}
              />
            ))}
          </AnimatePresence>
        </div>

        {agreedQuotes.length === 0 && (
          <motion.div
            className="ev-quote-card text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-lg mb-4">No statements to review</p>
            <p className="text-sm opacity-80">
              Go back to select statements you agree with first.
            </p>
          </motion.div>
        )}
      </div>

      {/* See Results Button */}
      {agreedQuotes.length > 0 && (
        <motion.div
          className="flex flex-col items-center gap-2 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {badgeCount === 0 && (
            <p className="text-xs text-white/50 font-manrope">
              You can continue without awarding badges
            </p>
          )}
          <motion.button
            onClick={handleContinue}
            className="ev-button-primary text-base md:text-lg px-8 py-3 animate-gentle-pulse"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            See Your Results
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};
