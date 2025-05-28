import React from 'react';
import { PlusCircle, Search, Filter, ChevronDown, X } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { useAuth } from '../context/AuthContext';
import { useDocumentFilters } from '../hooks/useDocumentFilters';
import { useToggle } from '../hooks/useToggle';
import DocumentCard from '../components/Documents/DocumentCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';
import LinkButton from '../components/UI/LinkButton';
import Badge from '../components/UI/Badge';
import Input from '../components/UI/Input';

const DocumentsPage: React.FC = () => {
  const { documents, loading } = useDocuments();
  const { hasPermission } = useAuth();
  const {
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    departments,
    filteredDocuments
  } = useDocumentFilters(documents);
  const { value: showFilterMenu, toggle: toggleFilterMenu, setFalse: closeFilterMenu } = useToggle();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading documents..." />
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organization's documents and SOPs
          </p>
        </div>
        
        {hasPermission('supervisor') && (
          <div className="mt-4 md:mt-0">
            <LinkButton
              to="/documents/new"
              variant="primary"
              size="md"
              icon={PlusCircle}
            >
              Add Document
            </LinkButton>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex-grow">
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={Search}
          />
        </div>
        
        <div className="relative">
          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={Filter}
            className="inline-flex items-center"
            onClick={toggleFilterMenu}
          >
            Filter
            <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
          </Button>
          
          {showFilterMenu && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <div className="px-4 py-2 text-sm text-gray-700 font-medium">Department</div>
                {departments.map((dept) => (
                  <button
                    key={dept}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      departmentFilter === dept ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setDepartmentFilter(dept);
                      closeFilterMenu();
                    }}
                  >
                    {dept === 'all' ? 'All Departments' : dept}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {departmentFilter !== 'all' && (
        <div className="mb-6 flex">
          <Badge variant="primary" size="md" className="flex items-center">
            Department: {departmentFilter}
            <button
              type="button"
              className="ml-2 text-blue-600 hover:text-blue-800"
              onClick={() => setDepartmentFilter('all')}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
      
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <div className="flex justify-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || departmentFilter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Get started by creating a new document'}
          </p>
          
          {hasPermission('supervisor') && !(searchTerm || departmentFilter !== 'all') && (
            <div className="mt-6">
              <LinkButton
                to="/documents/new"
                variant="primary"
                size="md"
                icon={PlusCircle}
              >
                Add Document
              </LinkButton>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map(document => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;