import { useState, useMemo } from 'react';
import { ScanLog } from '../types';

type SortField = keyof ScanLog;
type SortDirection = 'asc' | 'desc';

export const useSortableTable = <T extends Record<string, any>>(
  data: T[],
  defaultSortField: keyof T,
  defaultSortDirection: SortDirection = 'desc'
) => {
  const [sortField, setSortField] = useState<keyof T>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    sortedData,
    handleSort
  };
};
