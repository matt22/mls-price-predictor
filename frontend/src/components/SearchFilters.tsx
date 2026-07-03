import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import '../styles/SearchFilters.css';

interface SearchFiltersProps {
  onSearch: (filters: SearchParams) => void;
}

export interface SearchParams {
  city?: string;
  state?: string;
  zipCode?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  propertyType?: string;
}

export function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchParams>({});

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const handleChange = (key: keyof SearchParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  return (
    <div className="search-filters">
      <button 
        className="filter-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={20} />
        Filters
      </button>

      {isOpen && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>City</label>
            <input
              type="text"
              placeholder="Enter city"
              value={filters.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>State</label>
            <input
              type="text"
              placeholder="CA, TX, NY..."
              value={filters.state || ''}
              onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
              maxLength={2}
            />
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Min Price</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="filter-group">
              <label>Max Price</label>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Beds</label>
              <input
                type="number"
                placeholder="Beds"
                min={0}
                value={filters.beds || ''}
                onChange={(e) => handleChange('beds', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="filter-group">
              <label>Baths</label>
              <input
                type="number"
                placeholder="Baths"
                min={0}
                value={filters.baths || ''}
                onChange={(e) => handleChange('baths', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          <button className="search-button" onClick={handleSearch}>
            <Search size={20} />
            Search
          </button>
        </div>
      )}
    </div>
  );
}
