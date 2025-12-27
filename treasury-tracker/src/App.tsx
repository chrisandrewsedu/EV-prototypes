import { useState, useMemo, useCallback, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react';
import NavigationTabs from './components/NavigationTabs';
import SearchBar from './components/SearchBar';
import YearSelector from './components/YearSelector';
import Breadcrumb from './components/Breadcrumb';
import BudgetBar from './components/BudgetBar';
import CategoryList from './components/CategoryList';
import LineItemsTable from './components/LineItemsTable';
import type { BudgetCategory, BudgetData } from './types/budget';
import { loadBudgetData } from './data/dataLoader';
import './App.css'

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

function App() {
  const [activeTab, setActiveTab] = useState('city');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [navigationPath, setNavigationPath] = useState<BudgetCategory[]>([]);

  // Load budget data on mount and when year changes
  useEffect(() => {
    setLoading(true);
    loadBudgetData(parseInt(selectedYear))
      .then(data => {
        setBudgetData(data);
        setNavigationPath([]); // Reset navigation when changing years
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

  const handleCategoryClick = useCallback((category: BudgetCategory) => {
    // Navigate into category if it has subcategories OR if it has line items (lowest level)
    if (category.subcategories && category.subcategories.length > 0) {
      setNavigationPath([...navigationPath, category]);
    } else if (category.lineItems && category.lineItems.length > 0) {
      // Navigate to show the line items for this category
      setNavigationPath([...navigationPath, category]);
    }
  }, [navigationPath]);

  const handleBack = useCallback(() => {
    setNavigationPath(navigationPath.slice(0, -1));
  }, [navigationPath]);

  const handleBreadcrumbClick = useCallback((index: number) => {
    // index 0 = back to overview
    setNavigationPath(navigationPath.slice(0, index));
  }, [navigationPath]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [
      { 
        label: 'City', 
        onClick: navigationPath.length > 0 ? () => handleBreadcrumbClick(0) : undefined 
      }
    ];
    
    navigationPath.forEach((category, index) => {
      items.push({
        label: category.name,
        onClick: index < navigationPath.length - 1 
          ? () => handleBreadcrumbClick(index + 1)
          : undefined // Current selection, not clickable
      });
    });
    
    return items;
  }, [navigationPath, handleBreadcrumbClick]);

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
  if (!budgetData) {
    return (
      <div className="app">
        <div className="main-content" style={{ padding: '4rem', textAlign: 'center' }}>
          <h2>Unable to load budget data</h2>
          <p>Please check the console for errors.</p>
        </div>
      </div>
    );
  }

  // Determine what to display
  // If we're at a category with line items but no subcategories, show line items
  const currentCategory = navigationPath.length > 0 ? navigationPath[navigationPath.length - 1] : null;
  const showLineItems = currentCategory && 
                        currentCategory.lineItems && 
                        currentCategory.lineItems.length > 0 &&
                        (!currentCategory.subcategories || currentCategory.subcategories.length === 0);
  
  const currentCategories = navigationPath.length === 0
    ? budgetData.categories // Top level
    : navigationPath[navigationPath.length - 1].subcategories || [];

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
        {navigationPath.length === 0 && (
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
                  <div className="amount">{formatCurrency(budgetData.metadata.totalBudget)}</div>
                </div>
                <div className="info-card-divider"></div>
                <div className="info-card-right">
                  <h3>City Context</h3>
                  <div className="description">
                    Population ~{budgetData.metadata.population.toLocaleString()} residents
                    <br />
                    ${formatPerResident(budgetData.metadata.totalBudget)} per resident annually
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back button when navigated into categories */}
        {navigationPath.length > 0 && (
          <button
            onClick={handleBack}
            className="back-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              backgroundColor: 'var(--white)',
              border: '1px solid var(--medium-gray)',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Manrope, sans-serif',
              color: 'var(--muted-blue)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--muted-blue)';
              e.currentTarget.style.backgroundColor = 'var(--light-gray)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--medium-gray)';
              e.currentTarget.style.backgroundColor = 'var(--white)';
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
            Back to {navigationPath.length === 1 ? 'Overview' : navigationPath[navigationPath.length - 2].name}
          </button>
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
              {navigationPath.length === 0 
                ? `How ${budgetData.metadata.cityName} spends its budget` 
                : navigationPath[navigationPath.length - 1].name}
            </h2>
            {navigationPath.length > 1 && (
              <YearSelector 
                selectedYear={selectedYear}
                years={years}
                onYearChange={setSelectedYear}
              />
            )}
          </div>
          <p className="section-description">
            {navigationPath.length === 0 
              ? 'Each segment shows the share of the total budget. Tap any category below to explore its breakdown.'
              : showLineItems
                ? 'Detailed line items showing individual expenditures and actual amounts spent.'
                : 'The colored backgrounds show each subcategory\'s relative size. Tap to explore further or use the back button to return.'}
          </p>
          
          {showLineItems ? (
            // Show line items table at the lowest level
            <LineItemsTable 
              lineItems={currentCategory!.lineItems!}
              categoryName={currentCategory!.name}
            />
          ) : displayCategories.length > 0 ? (
            <>
              {/* Visual budget bar (non-interactive) */}
              <BudgetBar categories={displayCategories} />

              {/* Interactive category list */}
              <CategoryList 
                categories={displayCategories}
                onCategoryClick={handleCategoryClick}
              />
            </>
          ) : (
            <div className="no-results">
              <p>Try adjusting your search query</p>
            </div>
          )}
        </div>

        {/* Info tip */}
        {navigationPath.length === 0 && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-gray)'
          }}>
            <strong>💡 Tip:</strong> Tap any category to drill down into its budget breakdown. Use breadcrumbs or the back button to navigate back.
          </div>
        )}
      </div>
    </div>
  )
}

export default App
