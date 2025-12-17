import React, { useState, useCallback } from 'react';
import type { BudgetCategory } from '../types/budget';

interface BudgetBarProps {
  categories: BudgetCategory[];
  onCategoryClick: (category: BudgetCategory) => void;
  selectionPath: { [depth: number]: BudgetCategory };
  currentDepth: number;
}

const BudgetBar: React.FC<BudgetBarProps> = ({ categories, onCategoryClick, selectionPath, currentDepth }) => {
  const [hoveredCategory, setHoveredCategory] = useState<BudgetCategory | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const formatCurrency = useCallback((amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((percentage: number) => {
    return (Math.round(percentage * 10) / 10).toFixed(1);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, category: BudgetCategory) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCategoryClick(category);
    }
  };

  return (
    <div className="budget-bar-wrapper">
      <div 
        className="budget-bar" 
        onMouseMove={handleMouseMove}
        role="group"
        aria-label="Budget allocation by department"
      >
        {categories.map((category, index) => {
          const isSelected = selectionPath[currentDepth]?.name === category.name;
          return (
            <div
              key={`${category.name}-${index}`}
              className={`budget-segment ${isSelected ? 'selected' : ''}`}
              style={{
                width: `${category.percentage}%`,
                backgroundColor: category.color,
              }}
              onClick={() => onCategoryClick(category)}
              onMouseEnter={() => setHoveredCategory(category)}
              onMouseLeave={() => setHoveredCategory(null)}
              onKeyDown={(e) => handleKeyDown(e, category)}
              tabIndex={0}
              role="button"
              aria-label={`${category.name}: ${formatCurrency(category.amount)}, ${formatPercentage(category.percentage)}% of budget. ${isSelected ? 'Currently selected. ' : ''}Click to expand.`}
            >
              {isSelected && (
                <div className="selection-badge" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              {category.percentage >= 8 && (
                <div className="segment-label" aria-hidden="true">
                  <div className="segment-name">{category.name}</div>
                  <div className="segment-percentage">{formatPercentage(category.percentage)}%</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {hoveredCategory && (
        <div
          className="budget-tooltip"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
          }}
          role="tooltip"
          aria-hidden="true"
        >
          <div className="tooltip-name">{hoveredCategory.name}</div>
          <div className="tooltip-amount">
            {formatCurrency(hoveredCategory.amount)} ({formatPercentage(hoveredCategory.percentage)}%)
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetBar;
