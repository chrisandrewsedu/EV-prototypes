/**
 * Budget Data Types
 */

export interface BudgetCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  subcategories?: BudgetCategory[];
  description?: string;
  whyMatters?: string;
  historicalChange?: number;
  items?: number; // Number of line items aggregated into this category
}

export interface BudgetData {
  metadata: {
    cityName: string;
    fiscalYear: number;
    population: number;
    totalBudget: number;
    generatedAt: string;
    hierarchy: string[];
    dataSource: string;
  };
  categories: BudgetCategory[];
}
