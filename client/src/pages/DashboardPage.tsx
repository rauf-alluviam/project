import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, QrCode, Users, Clock, List, CheckSquare, AlertTriangle, Plus } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { useAuth } from '../context/AuthContext';
import DocumentCard from '../components/Documents/DocumentCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import LinkButton from '../components/UI/LinkButton';
import { formatTime } from '../utils/dateUtils';

const DashboardPage: React.FC = () => {
  const { documents, scanLogs, loading } = useDocuments();
  const { hasPermission } = useAuth();

  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const recentScans = [...scanLogs]
    .sort((a, b) => new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime())
    .slice(0, 5);

  const documentsByDepartment = documents.reduce((acc, doc) => {
    acc[doc.department] = (acc[doc.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        {hasPermission('supervisor') && (
          <LinkButton
            to="/documents/new"
            variant="primary"
            size="md"
            icon={Plus}
          >
            New Document
          </LinkButton>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <FileText className="h-6 w-6 text-blue-700" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Documents</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">{documents.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/documents" className="font-medium text-blue-700 hover:text-blue-900">
                View all
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-teal-100 rounded-md p-3">
                <QrCode className="h-6 w-6 text-teal-700" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active QR Codes</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">{documents.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/qr-codes" className="font-medium text-teal-700 hover:text-teal-900">
                View all
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-purple-700" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Recent Scans</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">{scanLogs.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/reports" className="font-medium text-purple-700 hover:text-purple-900">
                View details
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                <Users className="h-6 w-6 text-amber-700" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Departments</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      {Object.keys(documentsByDepartment).length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/reports" className="font-medium text-amber-700 hover:text-amber-900">
                View breakdown
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Documents</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentDocuments.map(document => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
          {recentDocuments.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <p className="text-gray-500">No documents found</p>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Scans</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentScans.map(scan => {
                const doc = documents.find(d => d.id === scan.documentId);
                return (
                  <li key={scan.id} className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                          <FileText size={20} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc ? doc.title : `Document ${scan.documentId}`}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          Scanned by: {scan.userName}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        {formatTime(scan.scanDate)}
                      </div>
                    </div>
                  </li>
                );
              })}
              {recentScans.length === 0 && (
                <li className="px-4 py-4 text-center text-gray-500">
                  No recent scans
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {hasPermission('supervisor') && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Tasks</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LinkButton
              to="/documents/new"
              variant="secondary"
              size="md"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mb-3">
                <Plus size={24} />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Add Document</h3>
              <p className="mt-1 text-xs text-gray-500">Upload new documentation</p>
            </LinkButton>
            
            <LinkButton
              to="/qr-codes"
              variant="secondary"
              size="md"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 mb-3">
                <QrCode size={24} />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Generate QR</h3>
              <p className="mt-1 text-xs text-gray-500">Create new QR codes</p>
            </LinkButton>
            
            <LinkButton
              to="/documents"
              variant="secondary"
              size="md"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mb-3">
                <CheckSquare size={24} />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Manage Documents</h3>
              <p className="mt-1 text-xs text-gray-500">Update document versions</p>
            </LinkButton>
            
            <LinkButton
              to="/reports"
              variant="secondary"
              size="md"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-3">
                <List size={24} />
              </div>
              <h3 className="text-sm font-medium text-gray-900">View Reports</h3>
              <p className="mt-1 text-xs text-gray-500">Check document usage</p>
            </LinkButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;