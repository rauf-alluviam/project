import React, { useState } from 'react';
import { ScanLog } from '../../types';
import { Search } from 'lucide-react';
import { useSortableTable } from '../../hooks/useSortableTable';
import { formatDateTime } from '../../utils/dateUtils';
import { getRoleBadgeClasses, getRoleDisplayName } from '../../utils/roleUtils';

interface ScanLogsTableProps {
  logs: ScanLog[];
}

const ScanLogsTable: React.FC<ScanLogsTableProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredLogs = logs.filter(log => 
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.documentId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const { sortedData, sortField, sortDirection, handleSort } = useSortableTable<ScanLog>(
    filteredLogs,
    'scanDate',
    'desc'
  );

  const SortIcon = ({ field }: { field: keyof ScanLog }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? 
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg> : 
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-medium text-gray-900">Scan Logs</h3>
          
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Search logs..."
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('scanDate')}
              >
                <div className="flex items-center">
                  Date & Time
                  <SortIcon field="scanDate" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('userName')}
              >
                <div className="flex items-center">
                  User
                  <SortIcon field="userName" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('userRole')}
              >
                <div className="flex items-center">
                  Role
                  <SortIcon field="userRole" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('documentId')}
              >
                <div className="flex items-center">
                  Document ID
                  <SortIcon field="documentId" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                IP Address
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No scan logs found
                </td>
              </tr>
            ) : (
              sortedData.map((log: ScanLog) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(log.scanDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={getRoleBadgeClasses(log.userRole)}>
                      {getRoleDisplayName(log.userRole)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.documentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ipAddress || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScanLogsTable;