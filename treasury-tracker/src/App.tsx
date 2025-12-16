import React, { useState, useMemo, useCallback, useEffect } from 'react'
import NavigationTabs from './components/NavigationTabs';
import SearchBar from './components/SearchBar';
import YearSelector from './components/YearSelector';
import Breadcrumb from './components/Breadcrumb';
import BudgetBar from './components/BudgetBar';
import CategoryDetail from './components/CategoryDetail';
import type { BudgetCategory, BudgetData } from './types/budget';
import { loadBudgetData } from './data/dataLoader';
import './App.css'

interface PathItem {
  label: string;
  categories: BudgetCategory[];
  parent?: BudgetCategory;
}

function App() {
  const [activeTab, setActiveTab] = useState('city');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<PathItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Load budget data on mount and when year changes
  useEffect(() => {
    setLoading(true);
    loadBudgetData(parseInt(selectedYear))
      .then(data => {
        setBudgetData(data);
        setPath([{ label: 'City', categories: data.categories }]);
        setExpandedCategories(new Set()); // Clear expanded categories when changing years
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load budget data:', error);
        setLoading(false);
      });
  }, [selectedYear]);

  const tabs = [
    { id: 'city', label: 'City' },
    { id: 'state', label: 'State' },
    { id: 'federal', label: 'Federal' }
  ];

  const years = ['2025', '2024', '2023', '2022', '2021'];

  const handleCategoryClick = useCallback((category: BudgetCategory, depth?: number) => {
    const categoryDepth = depth ?? path.length;
    const categoryKey = `${categoryDepth}-${category.name}`;
    
    if (expandedCategories.has(categoryKey)) {
      // Collapse this category
      setExpandedCategories(prev => {
        const next = new Set(prev);
        next.delete(categoryKey);
        return next;
      });
    } else {
      // When expanding a new category at the top level (depth 1), clear all others
      if (categoryDepth === 1) {
        setExpandedCategories(new Set([categoryKey]));
      } else {
        // For deeper levels, just add to expanded
        setExpandedCategories(prev => new Set(prev).add(categoryKey));
      }
    }
  }, [path.length, expandedCategories]);

  const handleBreadcrumbClick = useCallback((index: number) => {
    if (index < path.length - 1) {
      setPath(path.slice(0, index + 1));
      setExpandedCategories(new Set());
    }
  }, [path]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const breadcrumbItems = useMemo(
    () => path.map((item, index) => ({
      label: item.label,
      onClick: index < path.length - 1 ? () => handleBreadcrumbClick(index) : undefined
    })),
    [path, handleBreadcrumbClick]
  );

  const formatPerResident = (total: number) => {
    if (!budgetData) return '$0';
    const perResident = total / budgetData.metadata.population;
    return `${perResident.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="app">
        <div className="main-content" style={{ padding: '4rem', textAlign: 'center' }}>
          <h2>Loading budget data...</h2>
        </div>
      </div>
    );
  }

  // Show error state
  if (!budgetData || path.length === 0) {
    return (
      <div className="app">
        <div className="main-content" style={{ padding: '4rem', textAlign: 'center' }}>
          <h2>Unable to load budget data</h2>
          <p>Please check the console for errors.</p>
        </div>
      </div>
    );
  }

  // Now we're safe to compute derived values
  const currentCategories = path[path.length - 1].categories;
  const totalBudget = currentCategories.reduce((sum, cat) => sum + cat.amount, 0);

  // Filter categories based on search query
  const filterCategories = (categories: BudgetCategory[], query: string): BudgetCategory[] => {
    if (!query.trim()) return categories;
    
    const lowerQuery = query.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(lowerQuery) ||
      (cat.description && cat.description.toLowerCase().includes(lowerQuery))
    );
  };

  const filteredCategories = filterCategories(currentCategories, searchQuery);
  const displayCategories = searchQuery ? filteredCategories : currentCategories;

  // Recursive function to render category details and their nested expansions
  const renderCategoryDetails = (categories: BudgetCategory[], currentDepth: number): React.ReactNode => {
    return categories.map((category) => {
      const categoryKey = `${currentDepth}-${category.name}`;
      const isExpanded = expandedCategories.has(categoryKey);
      
      if (!isExpanded) return null;

      return (
        <React.Fragment key={categoryKey}>
          <CategoryDetail
            category={category}
            onSubcategoryClick={(subcat) => {
              if (subcat.subcategories) {
                handleCategoryClick(subcat, currentDepth + 1);
              }
            }}
            onCollapse={() => handleCategoryClick(category, currentDepth)}
            depth={currentDepth}
          />
          {/* Recursively render nested expanded subcategories */}
          {category.subcategories && renderCategoryDetails(category.subcategories, currentDepth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="app">
      <div className="header">
        <div className="header-content">
          <NavigationTabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          <div className="search-year-container">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery} 
            />
            <YearSelector 
              selectedYear={selectedYear}
              years={years}
              onYearChange={setSelectedYear}
            />
          </div>
        </div>
      </div>

      {path.length > 1 && <Breadcrumb items={breadcrumbItems} />}

      <div className="main-content">
        {/* Hero Section - Only show at top level */}
        {path.length === 1 && (
          <>
            <div className="hero-section">
              <div className="hero-overlay"></div>
              <div className="hero-content">
                <h1>{budgetData.metadata.cityName} City Budget</h1>
                <p>Explore how public funds are allocated and spent.</p>
              </div>
            </div>

            <div className="info-cards">
              <div className="info-card">
                <h3>Total {budgetData.metadata.fiscalYear} Budget</h3>
                <div className="amount">{formatCurrency(totalBudget)}</div>
              </div>
              <div className="info-card">
                <h3>City Context</h3>
                <div className="description">
                  Serving approximately {budgetData.metadata.population.toLocaleString()} residents
                  <br />
                  {formatPerResident(totalBudget)} per resident annually
                </div>
              </div>
            </div>
          </>
        )}

        {/* Search Results Message */}
        {searchQuery && (
          <div className="search-results-message">
            {displayCategories.length > 0 ? (
              <p>Found {displayCategories.length} {displayCategories.length === 1 ? 'result' : 'results'} for "{searchQuery}"</p>
            ) : (
              <p>No results found for "{searchQuery}"</p>
            )}
          </div>
        )}

        {/* Budget Visualization Section */}
        <div className="budget-section">
          <div className="section-header">
            <h2>
              {path.length === 1 
                ? `How ${budgetData.metadata.cityName} spends its budget` 
                : `${path[path.length - 1].label}`}
            </h2>
            {path.length > 1 && (
              <YearSelector 
                selectedYear={selectedYear}
                years={years}
                onYearChange={setSelectedYear}
              />
            )}
          </div>
          <p className="section-description">
            {path.length === 1 
              ? 'Each segment shows the share of the total budget going to a department. Click to explore.'
              : 'Click any category to see detailed breakdown and subcategories.'}
          </p>
          
          {displayCategories.length > 0 ? (
            <>
              <BudgetBar 
                categories={displayCategories}
                onCategoryClick={handleCategoryClick}
              />

              {/* Render expanded category details recursively */}
              {renderCategoryDetails(displayCategories, path.length)}
            </>
          ) : (
            <div className="no-results">
              <p>Try adjusting your search query</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
