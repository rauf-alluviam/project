import React, { useState } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { Link } from 'react-router-dom';

/**
 * This component lists all documents with their QR IDs for testing
 * and provides direct links to view them
 */
const QRLinksDebugger: React.FC = () => {
  const { documents, loading } = useDocuments();
  const [showDetails, setShowDetails] = useState(false);
  
  if (loading) {
    return <div>Loading documents...</div>;
  }
  
  // Filter documents that have qrId
  const documentsWithQrId = documents.filter(doc => doc.qrId);
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Document QR Links Debugger</h2>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      <div className="text-sm text-gray-500 mb-4">
        {documentsWithQrId.length} documents with QR IDs out of {documents.length} total documents.
      </div>
      
      <ul className="divide-y divide-gray-200">
        {documentsWithQrId.map(doc => (
          <li key={doc.id} className="py-3">
            <div className="flex justify-between items-center">
              <div>
                <strong className="font-medium">{doc.title}</strong>
                {showDetails && (
                  <div className="text-xs text-gray-500 mt-1">
                    <div>Document ID: {doc.id}</div>
                    <div>QR ID: {doc.qrId}</div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Link 
                  to={`/documents/${doc.id}`}
                  className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded"
                >
                  Details
                </Link>
                <Link 
                  to={`/view/${doc.qrId}`}
                  target="_blank"
                  className="text-sm px-3 py-1 bg-green-50 text-green-700 rounded"
                >
                  View QR
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      {documentsWithQrId.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No documents with QR IDs found.
        </div>  
      )}
    </div>
  );
};

export default QRLinksDebugger;
