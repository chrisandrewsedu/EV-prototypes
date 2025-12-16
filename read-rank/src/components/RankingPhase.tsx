import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, useSensor, useSensors, DragOverlay, MouseSensor, TouchSensor } from '@dnd-kit/core';
import type { DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useReadRankStore } from '../store/useReadRankStore';

interface SortableQuoteCardProps {
  quote: any;
  index: number;
  totalQuotes: number;
  isDragOverlay?: boolean;
}

const SortableQuoteCard: React.FC<SortableQuoteCardProps> = ({ quote, index, totalQuotes, isDragOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: quote.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate priority color gradient (green → yellow → orange → red)
  const getPriorityColor = (idx: number, total: number) => {
    if (total === 1) return { bg: 'bg-gradient-to-br from-green-500 to-green-600', text: 'text-green-600' };
    const ratio = idx / Math.max(total - 1, 1);
    if (ratio < 0.25) return { bg: 'bg-gradient-to-br from-green-500 to-green-600', text: 'text-green-600' };
    if (ratio < 0.5) return { bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', text: 'text-emerald-600' };
    if (ratio < 0.75) return { bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600', text: 'text-yellow-600' };
    return { bg: 'bg-gradient-to-br from-orange-500 to-orange-600', text: 'text-orange-600' };
  };

  const priorityColor = getPriorityColor(index, totalQuotes);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDragging ? 0.4 : 1, 
        y: 0,
      }}
      transition={{ 
        layout: { 
          duration: 0.2, 
          ease: [0.25, 0.1, 0.25, 1],
        },
        opacity: { duration: 0.15 }
      }}
      className="relative"
    >
      <div
        className={`
          ev-quote-card relative overflow-visible
          ${!isDragOverlay && !isDragging ? 'cursor-grab hover:shadow-2xl hover:-translate-y-1' : ''}
          ${isDragging ? 'cursor-grabbing opacity-40 ring-2 ring-ev-light-blue ring-dashed' : ''}
          ${isDragOverlay ? 'cursor-grabbing shadow-2xl rotate-2 scale-105' : ''}
          transition-all duration-200
        `}
        {...attributes}
        {...listeners}
      >
        {/* Rank Badge - Prominent and Clear */}
        <div className="absolute -top-3 -left-3 z-10">
          <motion.div 
            className={`
              ${priorityColor.bg}
              text-white font-manrope font-extrabold
              w-12 h-12 md:w-14 md:h-14 rounded-full
              flex items-center justify-center
              shadow-lg
              ring-4 ring-white
            `}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: index * 0.1,
              type: 'spring',
              stiffness: 260,
              damping: 20
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <span className="text-lg md:text-xl">#{index + 1}</span>
          </motion.div>
        </div>

        {/* Priority Label */}
        <div className="flex items-center justify-between mb-3 pl-10 md:pl-12">
          <div className="flex items-center gap-2">
            {/* Drag Handle Icon */}
            <div className="flex flex-col gap-0.5 opacity-60">
              <div className="w-4 md:w-5 h-0.5 bg-white rounded-full"></div>
              <div className="w-4 md:w-5 h-0.5 bg-white rounded-full"></div>
              <div className="w-4 md:w-5 h-0.5 bg-white rounded-full"></div>
            </div>
            <span className={`font-manrope font-bold text-xs md:text-sm ${priorityColor.text} bg-white px-2 py-0.5 rounded-full`}>
              {index === 0 ? '🏆 Most Aligned' :  `#${index + 1} Priority`}
            </span>
          </div>
        </div>

        {/* Quote Text */}
        <div className="font-manrope font-medium text-sm md:text-base leading-relaxed pl-1">
          {quote.text}
        </div>

        {/* Quote ID */}
        <div className="mt-3 text-xs opacity-50 font-manrope pl-1">
          Quote {quote.id.replace('q', '')}
        </div>
      </div>
    </motion.div>
  );
};

export const RankingPhase: React.FC = () => {
  const { agreedQuotes, setPhase, setRankedQuotes } = useReadRankStore();
  const [quotes, setQuotes] = useState(agreedQuotes);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setQuotes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeQuote = activeId ? quotes.find(q => q.id === activeId) : null;
  const activeIndex = activeQuote ? quotes.findIndex(q => q.id === activeId) : -1;

  const handleContinue = () => {
    // Update the store with the new ranking
    setRankedQuotes(quotes);
    setPhase('results');
  };

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
          Drag the cards to order them by what matters most to you—your top choice should be the statement that best reflects your views.
        </p>
        <p className="ev-instruction text-xs md:text-sm opacity-75">
          💡 Your #1 choice will have the greatest impact on finding candidates who align with your values.
        </p>
      </motion.div>

      {/* Ranking Interface */}
      <div className="max-w-2xl mx-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={quotes} strategy={verticalListSortingStrategy}>
            <div className="space-y-4 md:space-y-6">
              <AnimatePresence>
                {quotes.map((quote, index) => (
                  <SortableQuoteCard 
                    key={quote.id} 
                    quote={quote} 
                    index={index} 
                    totalQuotes={quotes.length}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeQuote ? (
              <div className="max-w-2xl">
                <SortableQuoteCard 
                  quote={activeQuote} 
                  index={activeIndex} 
                  totalQuotes={quotes.length}
                  isDragOverlay
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {quotes.length === 0 && (
          <motion.div 
            className="ev-quote-card text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-lg mb-4">No statements to rank</p>
            <p className="text-sm opacity-80">
              Go back to select statements you agree with first.
            </p>
          </motion.div>
        )}
      </div>

      {/* See Results Button */}
      {quotes.length > 0 && (
        <motion.div
          className="flex justify-center pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={handleContinue}
            className="ev-button-primary text-base md:text-lg px-8 py-3 animate-gentle-pulse"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            See Your Results →
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};
