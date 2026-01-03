/**
 * FilterTabs Component - T145
 * Task status filter navigation
 * Spec: User Story 6 - Filter tasks by status
 */

'use client';

import React, { KeyboardEvent } from 'react';

type FilterOption = 'all' | 'active' | 'completed';

interface FilterTabsProps {
  currentFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export default function FilterTabs({
  currentFilter,
  onFilterChange,
}: FilterTabsProps) {
  const filters: FilterOption[] = ['all', 'active', 'completed'];

  // T148: Keyboard navigation support
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, filter: FilterOption) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFilterChange(filter);
    }
  };

  return (
    <div className="border-b border-white/30 bg-white/20 backdrop-blur-md rounded-t-2xl" role="tablist" aria-label="Filter tasks">
      <div className="flex gap-2 p-2">
        {filters.map((filter) => (
          <button
            key={filter}
            role="tab"
            aria-selected={currentFilter === filter}
            aria-controls="task-list"
            // T149: 44px height for touch targets
            className={`min-h-[44px] px-6 py-2 text-sm font-medium capitalize transition-all duration-300 ease-out relative ${
              currentFilter === filter
                ? 'text-white bg-white/30 backdrop-blur-lg border-b-4 border-white shadow-lg scale-105'
                : 'text-white/80 hover:text-white border-b-4 border-transparent hover:border-white/50 hover:bg-white/20 hover:scale-105'
            } focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded-t-xl`}
            onClick={() => onFilterChange(filter)}
            onKeyDown={(e) => handleKeyDown(e, filter)}
            data-testid={`filter-${filter}`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
