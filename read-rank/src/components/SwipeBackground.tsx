import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

interface SwipeBackgroundProps {
  dragX: MotionValue<number>;
  isDragging: boolean;
}

export const SwipeBackground: React.FC<SwipeBackgroundProps> = ({ dragX, isDragging }) => {
  // Base visibility - only show when dragging
  const baseOpacity = isDragging ? 1 : 0;

  // Direction-based intensity: the side you drag toward gets more visible
  // Dragging right (positive x) = agree side more visible
  // Dragging left (negative x) = disagree side more visible
  const agreeIntensity = useTransform(dragX, [-50, 0, 150], [0.15, 0.3, 1]);
  const disagreeIntensity = useTransform(dragX, [-150, 0, 50], [1, 0.3, 0.15]);

  return (
    <div
      className="swipe-background-container"
      style={{ opacity: baseOpacity }}
    >
      {/* Disagree (Left) Zone */}
      <motion.div
        className="swipe-zone swipe-zone-disagree"
        style={{ opacity: disagreeIntensity }}
      >
        <div className="swipe-zone-content">
          <svg
            className="swipe-zone-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span className="swipe-zone-label">DISAGREE</span>
        </div>
      </motion.div>

      {/* Agree (Right) Zone */}
      <motion.div
        className="swipe-zone swipe-zone-agree"
        style={{ opacity: agreeIntensity }}
      >
        <div className="swipe-zone-content">
          <svg
            className="swipe-zone-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="swipe-zone-label">AGREE</span>
        </div>
      </motion.div>
    </div>
  );
};
