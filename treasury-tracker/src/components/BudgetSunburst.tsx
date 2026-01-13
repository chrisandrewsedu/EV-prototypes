import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import type { BudgetCategory } from '../types/budget';
import './BudgetSunburst.css';

interface BudgetSunburstProps {
  categories: BudgetCategory[];
  navigationPath: BudgetCategory[];
  totalBudget: number;
  onPathClick: (path: BudgetCategory[]) => void;
}

interface HierarchyNode {
  name: string;
  value?: number;
  color?: string;
  category?: BudgetCategory;
  children?: HierarchyNode[];
}

// Type for partition nodes (after partition layout is applied)
type PartitionNode = d3.HierarchyRectangularNode<HierarchyNode>;

const BudgetSunburst: React.FC<BudgetSunburstProps> = ({
  categories,
  navigationPath,
  totalBudget,
  onPathClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build hierarchical data structure for D3
  const hierarchyData = useMemo(() => {
    const buildHierarchy = (cats: BudgetCategory[]): HierarchyNode[] => {
      return cats.map(cat => ({
        name: cat.name,
        value: cat.subcategories && cat.subcategories.length > 0 ? undefined : cat.amount,
        color: cat.color,
        category: cat,
        children: cat.subcategories && cat.subcategories.length > 0
          ? buildHierarchy(cat.subcategories)
          : undefined,
      }));
    };

    return {
      name: 'Budget',
      children: buildHierarchy(categories),
    };
  }, [categories]);

  // Get the path of category names for highlighting
  const currentPathNames = useMemo(() => {
    return navigationPath.map(cat => cat.name);
  }, [navigationPath]);

  // Calculate parent amount for percentage calculation
  const parentAmount = useMemo(() => {
    if (navigationPath.length <= 1) return totalBudget;
    // Parent is the second-to-last item in the path
    return navigationPath[navigationPath.length - 2].amount;
  }, [navigationPath, totalBudget]);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1) + '%';
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth;
    const size = Math.min(containerWidth, 500);
    const radius = size / 2;

    const svg = d3.select(svgRef.current)
      .attr('width', size)
      .attr('height', size)
      .attr('viewBox', `${-size / 2} ${-size / 2} ${size} ${size}`)
      .style('font-family', 'Manrope, sans-serif');

    // Create hierarchy and apply partition layout
    const root = d3.hierarchy<HierarchyNode>(hierarchyData)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create partition layout and apply it
    const partition = d3.partition<HierarchyNode>()
      .size([2 * Math.PI, radius]);

    const partitionedRoot = partition(root);

    // Arc generator
    const arc = d3.arc<PartitionNode>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius / 2)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1 - 1);

    // Build the path from root to a node (excluding root) - returns names
    const getNodePath = (node: PartitionNode): string[] => {
      const nodePath: string[] = [];
      let current: d3.HierarchyNode<HierarchyNode> | null = node;
      while (current && current.parent) {
        nodePath.unshift(current.data.name);
        current = current.parent;
      }
      return nodePath;
    };

    // Build the full category path from root to a node (excluding root) - returns BudgetCategory[]
    const getCategoryPath = (node: PartitionNode): BudgetCategory[] => {
      const categoryPath: BudgetCategory[] = [];
      let current: d3.HierarchyNode<HierarchyNode> | null = node;
      while (current && current.parent) {
        if (current.data.category) {
          categoryPath.unshift(current.data.category);
        }
        current = current.parent;
      }
      return categoryPath;
    };

    // Check if a node is in the current navigation path (including all ancestors)
    const isInCurrentPath = (node: PartitionNode): boolean => {
      if (currentPathNames.length === 0) return false;

      const nodePath = getNodePath(node);

      // A node is in the current path if:
      // 1. Its full path matches a prefix of the navigation path (it's an ancestor)
      // 2. OR its full path equals the navigation path (it's the current selection)

      // Check if nodePath is a prefix of currentPathNames (or equal to it)
      if (nodePath.length > currentPathNames.length) return false;

      // Every element in nodePath must match the corresponding element in currentPathNames
      return nodePath.every((name, i) => name === currentPathNames[i]);
    };

    // Check if a node is the currently selected (deepest) item
    const isCurrentSelection = (node: PartitionNode): boolean => {
      if (currentPathNames.length === 0) return false;

      const nodePath = getNodePath(node);

      return nodePath.length === currentPathNames.length &&
             nodePath.every((name, i) => name === currentPathNames[i]);
    };

    // Get descendants as PartitionNodes
    const nodes = partitionedRoot.descendants().filter(d => d.depth > 0) as PartitionNode[];

    // Find the currently selected node for the callout
    const selectedNode = nodes.find(d => isCurrentSelection(d)) || null;

    // Draw arcs
    svg.selectAll('path.arc')
      .data(nodes)
      .join('path')
      .attr('class', 'arc')
      .attr('d', d => arc(d) || '')
      .attr('fill', d => d.data.color || '#ccc')
      .attr('fill-opacity', d => {
        // Dim segments that are not in the current path when drilling down
        if (currentPathNames.length > 0) {
          if (isInCurrentPath(d)) return 1;
          return 0.3;
        }
        return 1;
      })
      .attr('stroke', d => {
        if (isInCurrentPath(d)) return '#FF5740';
        return 'rgba(255,255,255,0.5)';
      })
      .attr('stroke-width', d => {
        if (isCurrentSelection(d)) return 4;
        if (isInCurrentPath(d)) return 3;
        return 1;
      })
      .style('cursor', d => d.data.category ? 'pointer' : 'default')
      .on('click', (event, d) => {
        event.stopPropagation();
        if (d.data.category) {
          // Build the full path from root to this node and set it as the navigation path
          const fullPath = getCategoryPath(d);
          onPathClick(fullPath);
        }
      })
      .on('mouseenter', function(event, d) {
        // Highlight on hover
        d3.select(this)
          .transition()
          .duration(100)
          .attr('fill-opacity', 1)
          .attr('stroke-width', 3);

        // Show tooltip
        const tooltip = d3.select('#sunburst-tooltip');
        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .html(`
            <div class="tooltip-name">${d.data.name}</div>
            <div class="tooltip-amount">${formatCurrency(d.value || 0)}</div>
            <div class="tooltip-percentage">${formatPercentage(d.value || 0, totalBudget)} of total budget</div>
          `);
      })
      .on('mousemove', function(event) {
        d3.select('#sunburst-tooltip')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseleave', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('fill-opacity', () => {
            if (currentPathNames.length > 0) {
              if (isInCurrentPath(d)) return 1;
              return 0.3;
            }
            return 1;
          })
          .attr('stroke-width', () => {
            if (isCurrentSelection(d)) return 4;
            if (isInCurrentPath(d)) return 3;
            return 1;
          });

        d3.select('#sunburst-tooltip').style('opacity', 0);
      });

    // Add center circle - always shows total budget
    const centerRadius = partitionedRoot.y0 || radius * 0.15;
    svg.append('circle')
      .attr('r', centerRadius)
      .attr('fill', 'var(--muted-blue)')
      .attr('opacity', 0.9);

    // Center text - always shows total budget
    const centerGroup = svg.append('g')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle');

    centerGroup.append('text')
      .attr('y', -8)
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .text('Total Budget');

    centerGroup.append('text')
      .attr('y', 12)
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .attr('font-weight', '700')
      .text(formatCurrency(totalBudget));

    // Draw callout line and update callout box position if there's a selection
    if (selectedNode && currentPathNames.length > 0) {
      // Calculate the centroid of the selected arc
      const midAngle = (selectedNode.x0 + selectedNode.x1) / 2;
      const midRadius = (selectedNode.y0 + selectedNode.y1) / 2;

      // Point on the arc (where the line starts)
      const arcX = Math.sin(midAngle) * midRadius;
      const arcY = -Math.cos(midAngle) * midRadius;

      // Determine which side to place the callout based on angle
      // Right side: angles from -π/2 to π/2 (right half of circle)
      // Left side: angles from π/2 to 3π/2 (left half of circle)
      const isRightSide = midAngle < Math.PI;

      // End point for the line (outside the chart)
      const lineEndX = isRightSide ? radius + 20 : -radius - 20;
      const lineEndY = arcY;

      // Draw the connector line
      svg.append('line')
        .attr('class', 'callout-line')
        .attr('x1', arcX)
        .attr('y1', arcY)
        .attr('x2', lineEndX)
        .attr('y2', lineEndY)
        .attr('stroke', '#FF5740')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,2');

      // Add a small circle at the arc end of the line
      svg.append('circle')
        .attr('cx', arcX)
        .attr('cy', arcY)
        .attr('r', 4)
        .attr('fill', '#FF5740');

      // Update the callout box position via DOM
      const calloutBox = containerRef.current?.querySelector('.sunburst-callout') as HTMLElement;
      if (calloutBox) {
        // Convert SVG coordinates to container coordinates
        const containerCenter = size / 2;
        const boxX = containerCenter + lineEndX;
        const boxY = containerCenter + lineEndY;

        calloutBox.style.display = 'block';
        calloutBox.style.top = `${boxY}px`;

        if (isRightSide) {
          calloutBox.style.left = `${boxX + 10}px`;
          calloutBox.style.right = 'auto';
          calloutBox.classList.remove('left-side');
          calloutBox.classList.add('right-side');
        } else {
          calloutBox.style.right = `${size - boxX + 10}px`;
          calloutBox.style.left = 'auto';
          calloutBox.classList.remove('right-side');
          calloutBox.classList.add('left-side');
        }
      }
    } else {
      // Hide callout box when nothing is selected
      const calloutBox = containerRef.current?.querySelector('.sunburst-callout') as HTMLElement;
      if (calloutBox) {
        calloutBox.style.display = 'none';
      }
    }

  }, [hierarchyData, currentPathNames, navigationPath, totalBudget, onPathClick, formatCurrency]);

  // Get current category info for the callout
  const currentCategory = navigationPath.length > 0 ? navigationPath[navigationPath.length - 1] : null;
  const parentCategory = navigationPath.length > 1 ? navigationPath[navigationPath.length - 2] : null;

  return (
    <div className="sunburst-wrapper">
      <div className="sunburst-container" ref={containerRef}>
        <svg ref={svgRef} className="sunburst-svg" />
        <div id="sunburst-tooltip" className="sunburst-tooltip" />

        {/* Callout box - positioned dynamically */}
        {currentCategory && (
          <div className="sunburst-callout" style={{ display: 'none' }}>
            <div className="callout-name">{currentCategory.name}</div>
            <div className="callout-amount">{formatCurrency(currentCategory.amount)}</div>
            <div className="callout-percentages">
              <div className="callout-percentage">
                <span className="percentage-value">{formatPercentage(currentCategory.amount, totalBudget)}</span>
                <span className="percentage-label">of total budget</span>
              </div>
              {parentCategory && (
                <div className="callout-percentage">
                  <span className="percentage-value">{formatPercentage(currentCategory.amount, parentAmount)}</span>
                  <span className="percentage-label">of {parentCategory.name}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetSunburst;
