import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, QrCode, Clock, Calendar, User } from 'lucide-react';
import { Document } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface DocumentCardProps {
  document: Document;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const latestVersion = document.versions.length > 0 
    ? document.versions[document.versions.length - 1] 
    : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 flex items-center justify-center rounded-md bg-blue-100 text-blue-700">
              <FileText size={20} />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {document.title}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {document.department}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-blue-50 p-1.5 rounded-md text-blue-700">
              <QrCode size={16} />
            </div>
          </div>
        </div>
        
        {document.description && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {document.description}
          </p>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2">
          {document.machineId && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Machine: {document.machineId}
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="mr-1" size={12} />
            v{document.versions.length}
          </span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            {formatDate(document.updatedAt)}
          </div>
          
          <div className="flex items-center">
            <User size={14} className="mr-1" />
            ID: {document.createdBy}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link 
            to={`/documents/${document.id}`}
            className="inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Details
          </Link>
          <Link 
            to={`/view/${document.qrId}`}
            className="inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Document
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;