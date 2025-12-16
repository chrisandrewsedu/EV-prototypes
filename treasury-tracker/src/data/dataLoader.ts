/**
 * Data Loader
 * 
 * Handles loading budget data from either processed JSON or fallback mock data
 */

import type { BudgetCategory, BudgetData } from '../types/budget';

let cachedData: BudgetData | null = null;

/**
 * Load budget data from processed JSON file for a specific year
 */
export async function loadBudgetData(year: number = 2025): Promise<BudgetData> {
  const cacheKey = `budget-${year}`;
  
  // Check cache first
  if (cachedData && cachedData.metadata.fiscalYear === year) {
    return cachedData;
  }

  try {
    // Try to load processed data for the specified year
    const response = await fetch(`/data/budget-${year}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load budget data for year ${year}: ${response.status}`);
    }
    
    const data: BudgetData = await response.json();
    cachedData = data;
    return data;
    
  } catch (error) {
    console.error('Error loading processed budget data:', error);
    console.log('Falling back to mock data...');
    
    // Fall back to mock data
    const { bloomingtonBudget2025, totalBudget2025 } = await import('./budgetData');
    
    const fallbackData: BudgetData = {
      metadata: {
        cityName: 'Bloomington',
        fiscalYear: 2025,
        population: 85000,
        totalBudget: totalBudget2025,
        generatedAt: new Date().toISOString(),
        hierarchy: ['mock', 'data'],
        dataSource: 'budgetData.ts (mock)'
      },
      categories: bloomingtonBudget2025
    };
    
    cachedData = fallbackData;
    return fallbackData;
  }
}

/**
 * Clear the cache (useful for testing or reloading data)
 */
export function clearCache() {
  cachedData = null;
}
