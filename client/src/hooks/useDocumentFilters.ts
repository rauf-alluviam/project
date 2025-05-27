import { useState, useMemo } from 'react';
import { Document } from '../types';

export const useDocumentFilters = (documents: Document[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const departments = useMemo(() => {
    return ['all', ...new Set(documents.map(doc => doc.department))];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (doc.machineId && doc.machineId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDepartment = departmentFilter === 'all' || doc.department === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
  }, [documents, searchTerm, departmentFilter]);

  return {
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    departments,
    filteredDocuments
  };
};
