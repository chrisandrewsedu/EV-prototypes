import React from 'react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb navigation">
      <ol className="breadcrumb-content">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <li className="breadcrumb-separator" aria-hidden="true">
                ›
              </li>
            )}
            <li>
              {item.onClick ? (
                <button
                  className="breadcrumb-item breadcrumb-button"
                  onClick={item.onClick}
                  aria-current={index === items.length - 1 ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ) : (
                <span
                  className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}
                  aria-current={index === items.length - 1 ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
