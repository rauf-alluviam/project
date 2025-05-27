import React from 'react';
import { DocumentVersion } from '../../types';
import { Clock, Download, Calendar, User } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

interface VersionHistoryProps {
  versions: DocumentVersion[];
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ versions }) => {
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Version History</h3>
      
      {sortedVersions.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No versions available
        </div>
      ) : (
        <div className="space-y-4">
          {sortedVersions.map((version) => (
            <div 
              key={version.id} 
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className={`h-8 w-8 flex items-center justify-center rounded-full ${
                    version.versionNumber === Math.max(...versions.map(v => v.versionNumber))
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Clock size={16} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Version {version.versionNumber}
                      {version.versionNumber === Math.max(...versions.map(v => v.versionNumber)) && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Latest
                        </span>
                      )}
                    </p>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(version.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <User size={12} className="mr-1" />
                        ID: {version.createdBy}
                      </span>
                    </div>
                  </div>
                </div>
                
                <a 
                  href={version.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download size={14} className="mr-1" />
                  Download
                </a>
              </div>
              
              {version.notes && (
                <div className="mt-3 pl-11">
                  <p className="text-sm text-gray-600">
                    {version.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VersionHistory;