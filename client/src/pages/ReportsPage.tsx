import React, { useState } from 'react';
import { useDocuments } from '../context/DocumentContext';
import ScanLogsTable from '../components/Reports/ScanLogsTable';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';

const ReportsPage: React.FC = () => {
  const { documents, scanLogs, loading } = useDocuments();
  const [currentTab, setCurrentTab] = useState<'scans' | 'department'>('scans');
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading reports..." />
      </div>
    );
  }
  
  // Department analytics
  const departmentData = documents.reduce((acc, doc) => {
    const dept = doc.department;
    
    if (!acc[dept]) {
      acc[dept] = {
        documentCount: 0,
        scanCount: 0
      };
    }
    
    acc[dept].documentCount += 1;
    
    // Count scans for this department's documents
    const scansForDeptDocs = scanLogs.filter(log => {
      const scanDocId = log.documentId;
      return doc.id === scanDocId;
    });
    
    acc[dept].scanCount += scansForDeptDocs.length;
    
    return acc;
  }, {} as Record<string, { documentCount: number; scanCount: number }>);
  
  const departmentArray = Object.entries(departmentData).map(([name, data]) => ({
    name,
    ...data
  }));
  
  // Sort departments by document count (descending)
  departmentArray.sort((a, b) => b.documentCount - a.documentCount);

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            View document usage and scan activity
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={currentTab}
            onChange={(e) => setCurrentTab(e.target.value as 'scans' | 'department')}
          >
            <option value="scans">Scan Logs</option>
            <option value="department">Department Analytics</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentTab('scans')}
                className={`${
                  currentTab === 'scans'
                    ? 'border-blue-700 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm bg-transparent border-0 hover:bg-transparent`}
              >
                Scan Logs
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentTab('department')}
                className={`${
                  currentTab === 'department'
                    ? 'border-blue-700 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm bg-transparent border-0 hover:bg-transparent`}
              >
                Department Analytics
              </Button>
            </nav>
          </div>
        </div>
      </div>
      
      {currentTab === 'scans' && (
        <div className="space-y-6">
          <ScanLogsTable logs={scanLogs} />
        </div>
      )}
      
      {currentTab === 'department' && (
        <div className="space-y-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Department Statistics</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Scans
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Scans per Document
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departmentArray.map((dept) => (
                    <tr key={dept.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Badge variant="secondary" size="sm">
                          {dept.name}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge 
                          variant={dept.documentCount > 5 ? "success" : dept.documentCount > 2 ? "warning" : "secondary"} 
                          size="sm"
                        >
                          {dept.documentCount}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge 
                          variant={dept.scanCount > 10 ? "primary" : dept.scanCount > 5 ? "info" : "secondary"} 
                          size="sm"
                        >
                          {dept.scanCount}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dept.documentCount > 0 
                          ? (dept.scanCount / dept.documentCount).toFixed(1) 
                          : '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Documents per Department</h3>
            <div className="h-64">
              <div className="flex h-full items-end">
                {departmentArray.map((dept, idx) => (
                  <div key={dept.name} className="flex flex-col items-center mx-2 flex-1">
                    <div 
                      className="w-full bg-blue-600 rounded-t"
                      style={{ 
                        height: `${Math.max(5, (dept.documentCount / Math.max(...departmentArray.map(d => d.documentCount))) * 100)}%`,
                        backgroundColor: `hsl(${210 + idx * 30}, 70%, 50%)` 
                      }}
                    ></div>
                    <div className="mt-2 text-xs font-medium text-gray-700 truncate max-w-full text-center">
                      {dept.name}
                    </div>
                    <div className="text-xs text-gray-500">{dept.documentCount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;