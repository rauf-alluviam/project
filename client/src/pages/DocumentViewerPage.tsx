import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, ArrowLeft, Download, Info, AlertTriangle } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import LinkButton from '../components/UI/LinkButton';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';

const DocumentViewerPage: React.FC = () => {
  const { qrId } = useParams<{ qrId: string }>();
  const { getDocumentByQrId, recordScan, loading } = useDocuments();
  const { user, isAuthenticated } = useAuth();
  const [scanRecorded, setScanRecorded] = useState(false);
  
  useEffect(() => {
    if (qrId && user && !scanRecorded) {
      recordScan(
        getDocumentByQrId(qrId)?.id || '',
        user.id,
        user.name,
        user.role
      ).then(() => {
        setScanRecorded(true);
      });
    }
  }, [qrId, user, recordScan, getDocumentByQrId, scanRecorded]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading document..." />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Authentication Required</h1>
          <p className="mt-2 text-gray-600">Please log in to view this document</p>
          <LinkButton
            to="/login"
            variant="primary"
            size="sm"
          >
            Go to Login
          </LinkButton>
        </div>
      </div>
    );
  }
  
  console.log("Looking for document with qrId:", qrId);
  
  // Handle case when qrId is undefined or not a string
  if (!qrId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Invalid QR Code</h1>
          <p className="mt-2 text-gray-600">This QR code is invalid or has been tampered with</p>
          <LinkButton
            to="/"
            variant="primary"
            size="sm"
            className="mt-4"
          >
            Go to Dashboard
          </LinkButton>
        </div>
      </div>
    );
  }
  
  const document = getDocumentByQrId(qrId);
  console.log("Found document:", document);
  
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Document Not Found</h1>
          <p className="mt-2 text-gray-600">The document you're looking for doesn't exist or has been removed</p>
          <p className="mt-2 text-xs text-gray-500">QR ID: {qrId}</p>
          <LinkButton
            to="/"
            variant="primary"
            size="sm"
          >
            Go to Dashboard
          </LinkButton>
        </div>
      </div>
    );
  }
  
  const latestVersion = document.versions.length > 0 
    ? document.versions.reduce((latest, current) => 
        current.versionNumber > latest.versionNumber ? current : latest, document.versions[0])
    : null;
  
  if (!latestVersion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">No Versions Available</h1>
          <p className="mt-2 text-gray-600">This document doesn't have any uploaded versions yet</p>
          <LinkButton
            to="/"
            variant="primary"
            size="sm"
          >
            Go to Dashboard
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center">
              <LinkButton
                to="/"
                variant="secondary"
                size="sm"
                icon={ArrowLeft}
                className="mr-4"
              >
                Back
              </LinkButton>
              <div>
                <h1 className="text-xl font-bold text-gray-900 truncate">{document.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">Version {latestVersion.versionNumber}</span>
                  <Badge variant="secondary">{document.department}</Badge>
                  {document.machineId && <Badge variant="primary">Machine: {document.machineId}</Badge>}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-3 sm:mt-0">
              <a
                href={latestVersion.fileUrl}
                download
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="mr-1.5 h-4 w-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 flex flex-col items-center justify-center">
            <FileText className="h-16 w-16 text-blue-700" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">Document Preview</h2>
            <p className="mt-1 text-sm text-gray-500">
              In a real implementation, the document would be displayed here using a PDF or document viewer.
            </p>
            <div className="mt-6 w-full max-w-3xl bg-gray-50 border border-gray-200 rounded-lg p-6">
              {/* Embed the original document if it's a PDF */}
              {latestVersion.fileUrl && latestVersion.fileUrl.endsWith('.pdf') && (
                <iframe
                  src={latestVersion.fileUrl}
                  title="Document Preview"
                  width="100%"
                  height="600px"
                  className="rounded border border-gray-200 mb-6"
                />
              )}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900">{document.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{document.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Department</p>
                    <Badge variant="secondary" className="mt-1">{document.department}</Badge>
                  </div>
                  
                  {document.machineId && (
                    <div>
                      <p className="text-gray-500">Machine ID</p>
                      <Badge variant="primary" className="mt-1">{document.machineId}</Badge>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-gray-500">Version</p>
                    <Badge variant="success" className="mt-1">v{latestVersion.versionNumber}</Badge>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {new Date(document.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {latestVersion.notes && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-500">Version Notes</p>
                    <p className="mt-1 text-gray-900">{latestVersion.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 rounded-lg p-4 flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <Info className="h-5 w-5 text-blue-700" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Document Information</h3>
            <p className="mt-1 text-sm text-blue-700">
              You're viewing this document via QR code {qrId}. Your access has been logged for security purposes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentViewerPage;