'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SearchFilters {
  q?: string;
  creole_class?: string;
  access_tier?: string;
  tk_labels?: string[];
  regions?: string[];
  community?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: string;
}

interface Props {
  onSearch: (filters: SearchFilters) => void;
  facets?: any;
}

export function AdvancedSearch({ onSearch, facets }: Props) {
  const { t } = useTranslation('common');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="advanced-search">
      <form onSubmit={handleSubmit}>
        <div className="search-box">
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={filters.q || ''}
            onChange={(e) => updateFilter('q', e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            {t('search.results')}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="toggle-advanced"
        >
          {t('search.advanced')} {showAdvanced ? '▲' : '▼'}
        </button>

        {showAdvanced && (
          <div className="advanced-filters">
            <div className="filter-group">
              <label>{t('record.classification')}</label>
              <select
                value={filters.creole_class || ''}
                onChange={(e) => updateFilter('creole_class', e.target.value)}
              >
                <option value="">All</option>
                <option value="C-FOOD">{t('classification.C-FOOD')}</option>
                <option value="C-MED">{t('classification.C-MED')}</option>
                <option value="C-RIT">{t('classification.C-RIT')}</option>
                <option value="C-MUS">{t('classification.C-MUS')}</option>
                <option value="C-CRAFT">{t('classification.C-CRAFT')}</option>
                <option value="C-AGRI">{t('classification.C-AGRI')}</option>
                <option value="C-ORAL">{t('classification.C-ORAL')}</option>
                <option value="C-EDU">{t('classification.C-EDU')}</option>
              </select>
            </div>

            <div className="filter-group">
              <label>{t('record.accessTier')}</label>
              <select
                value={filters.access_tier || ''}
                onChange={(e) => updateFilter('access_tier', e.target.value)}
              >
                <option value="">All</option>
                <option value="public">{t('record.public')}</option>
                <option value="restricted">{t('record.restricted')}</option>
                <option value="secret">{t('record.secret')}</option>
              </select>
            </div>

            <div className="filter-group">
              <label>{t('record.community')}</label>
              <input
                type="text"
                value={filters.community || ''}
                onChange={(e) => updateFilter('community', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Date From</label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => updateFilter('date_from', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Date To</label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => updateFilter('date_to', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>{t('search.sortBy')}</label>
              <select
                value={filters.sort_by || 'createdAt'}
                onChange={(e) => updateFilter('sort_by', e.target.value)}
              >
                <option value="relevance">{t('search.relevance')}</option>
                <option value="createdAt">{t('search.date')}</option>
                <option value="title_ht">{t('search.title')}</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Order</label>
              <select
                value={filters.sort_order || 'DESC'}
                onChange={(e) => updateFilter('sort_order', e.target.value)}
              >
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </select>
            </div>
          </div>
        )}
      </form>

      {facets && (
        <div className="facets">
          <h3>{t('search.filters')}</h3>

          {facets.creole_class && (
            <div className="facet-group">
              <h4>{t('record.classification')}</h4>
              {facets.creole_class.map((facet: any) => (
                <button
                  key={facet.value}
                  onClick={() => updateFilter('creole_class', facet.value)}
                  className="facet-item"
                >
                  {t(`classification.${facet.value}`)} ({facet.count})
                </button>
              ))}
            </div>
          )}

          {facets.community && (
            <div className="facet-group">
              <h4>{t('record.community')}</h4>
              {facets.community.map((facet: any) => (
                <button
                  key={facet.value}
                  onClick={() => updateFilter('community', facet.value)}
                  className="facet-item"
                >
                  {facet.value} ({facet.count})
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
