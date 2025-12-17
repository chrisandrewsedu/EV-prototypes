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

interface SelectedCategoryInfo {
  category: BudgetCategory;
  depth: number;
}

interface SelectionPath {
  [depth: number]: BudgetCategory;
}

function App() {
  const [activeTab, setActiveTab] = useState('city');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<PathItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectionPath, setSelectionPath] = useState<SelectionPath>({});

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
      // Collapse this category - remove this depth and all deeper from selection path
      setExpandedCategories(prev => {
        const next = new Set(prev);
        next.delete(categoryKey);
        return next;
      });
      setSelectionPath(prev => {
        const next = { ...prev };
        // Remove this depth and all deeper levels
        Object.keys(next).forEach(key => {
          if (parseInt(key) >= categoryDepth) {
            delete next[parseInt(key)];
          }
        });
        return next;
      });
    } else {
      // Expanding - add to selection path
      setSelectionPath(prev => {
        const next = { ...prev };
        next[categoryDepth] = category;
        // Remove any deeper levels when selecting at this level
        Object.keys(next).forEach(key => {
          if (parseInt(key) > categoryDepth) {
            delete next[parseInt(key)];
          }
        });
        return next;
      });
      
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
      setSelectionPath({});
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

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: 'City', onClick: path.length > 1 ? () => handleBreadcrumbClick(0) : undefined }];
    
    // Add selected categories to breadcrumb
    Object.keys(selectionPath)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(depthStr => {
        const depth = parseInt(depthStr);
        const category = selectionPath[depth];
        items.push({
          label: category.name,
          onClick: undefined // Current selection, not clickable
        });
      });
    
    return items;
  }, [selectionPath, path, handleBreadcrumbClick]);

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
            onCollapse={() => {
              handleCategoryClick(category, currentDepth);
            }}
            depth={currentDepth}
            selectionPath={selectionPath}
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

      {breadcrumbItems.length > 1 && <Breadcrumb items={breadcrumbItems} />}

      <div className="main-content">
        {/* Hero Section - Only show at top level */}
        {path.length === 1 && (
          <div className="hero-and-cards-row">
            <div className="hero-section" style={{
              backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/8/85/Monroe_County_Courthouse_in_Bloomington_from_west-southwest.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}>
              <div className="hero-overlay" style={{
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 100%)'
              }}></div>
              <div className="hero-content">
                <h1>{budgetData.metadata.cityName} City Budget</h1>
                <p>Explore how public funds are allocated and spent.</p>
              </div>
            </div>

            <div className="info-cards">
              <div className="info-card">
                <div className="info-card-left">
                  <h3>Total {budgetData.metadata.fiscalYear} Budget</h3>
                  <div className="amount">{formatCurrency(totalBudget)}</div>
                </div>
                <div className="info-card-divider"></div>
                <div className="info-card-right">
                  <h3>City Context</h3>
                  <div className="description">
                    Population ~{budgetData.metadata.population.toLocaleString()} residents
                    <br />
                    ${formatPerResident(totalBudget)} per resident annually
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                selectionPath={selectionPath}
                currentDepth={path.length}
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
