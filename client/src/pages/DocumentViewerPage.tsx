import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, ArrowLeft, Download, Info, AlertTriangle } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import LinkButton from '../components/UI/LinkButton';
import Badge from '../components/UI/Badge';

const DocumentViewerPage: React.FC = () => {
  const { qrId } = useParams<{ qrId: string }>();
  const { getDocumentByQrId, recordScan, loading } = useDocuments();
  const { user, isAuthenticated } = useAuth();
  const [scanRecorded, setScanRecorded] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [fileLoading, setFileLoading] = useState(true);
  
  // Move all hook calls to the top, before any conditional logic
  useEffect(() => {
    if (qrId && user && !scanRecorded && isAuthenticated) {
      const document = getDocumentByQrId(qrId);
      if (document) {
        recordScan(
          document.id || '',
          user.id,
          user.name,
          user.role
        ).then(() => {
          setScanRecorded(true);
        });
      }
    }
  }, [qrId, user, recordScan, getDocumentByQrId, scanRecorded, isAuthenticated]);

  // Get document and file URL
  const document = qrId ? getDocumentByQrId(qrId) : null;
  
  // Handle both new version structure and legacy direct file storage
  const latestVersion = document?.versions && document.versions.length > 0 
    ? document.versions.reduce((latest, current) => 
        current.versionNumber > latest.versionNumber ? current : latest, document.versions[0])
    : null;
  
  // Get file URL from either the latest version or directly from document
  const documentData = document as any;
  let fileUrl = latestVersion?.fileUrl || documentData?.file_url || documentData?.fileUrl;
  
  // Construct the full URL if it's a relative path
  if (fileUrl && !fileUrl.startsWith('http')) {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');
    fileUrl = SERVER_BASE_URL + fileUrl;
  }
  
  const versionNumber = latestVersion?.versionNumber || documentData?.current_version || 1;
  
  // Test file accessibility
  const testFileAccess = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('File access test failed:', error);
      return false;
    }
  };

  // Check if URL is localhost (which has CSP issues with iframes)
  const isLocalhost = fileUrl && (fileUrl.includes('localhost') || fileUrl.includes('127.0.0.1'));
  
  useEffect(() => {
    if (fileUrl) {
      setFileLoading(true);
      // Skip accessibility test for localhost due to CSP restrictions
      if (isLocalhost) {
        setFileError(false);
        setFileLoading(false);
      } else {
        testFileAccess(fileUrl).then(accessible => {
          setFileError(!accessible);
          setFileLoading(false);
        });
      }
    } else {
      setFileLoading(false);
    }
  }, [fileUrl, isLocalhost]);

  // Helper functions
  const handleIframeError = () => {
    setFileError(true);
    setFileLoading(false);
  };

  const handleIframeLoad = () => {
    setFileLoading(false);
  };

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toLowerCase() || '';
  };

  const fileExtension = fileUrl ? getFileExtension(fileUrl) : '';

  // NOW handle all the conditional renders after all hooks have been called
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
  
  console.log('File URL:', fileUrl);
  console.log('Document data:', documentData);
  
  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">File Not Available</h1>
          <p className="mt-2 text-gray-600">The file for this document is not available or has been moved</p>
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
                <div>
                  <span className="text-sm text-gray-500">Version {versionNumber}</span>
                  <Badge variant="secondary">{document.department}</Badge>
                  {document.machineId && <Badge variant="primary">Machine: {document.machineId}</Badge>}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-3 sm:mt-0">
              <a
                href={fileUrl}
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
          {/* Document Viewer Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Document Content</h2>
            
            {/* Document Viewer */}
            <div className="w-full bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative" style={{ minHeight: '600px' }}>
              {fileLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                  <LoadingSpinner size="lg" text="Loading document..." />
                </div>
              )}
              
              {fileError && (
                <div className="flex flex-col items-center justify-center p-12" style={{ minHeight: '600px' }}>
                  <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Cannot Load Document</h3>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    The document could not be loaded. This might be due to CORS restrictions, file permissions, or the file being unavailable.
                  </p>
                  <p className="text-xs text-gray-400 mb-6">File URL: {fileUrl}</p>
                  <a
                    href={fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </a>
                </div>
              )}
              
              {!fileError && fileUrl && (
                <>
                  {/* Handle localhost CSP restrictions */}
                  {isLocalhost ? (
                    <div className="flex flex-col items-center justify-center p-12" style={{ minHeight: '600px' }}>
                      <FileText className="h-16 w-16 text-blue-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Local Development Mode</h3>
                      <p className="text-sm text-gray-500 text-center mb-4">
                        Document preview is not available for localhost due to Content Security Policy restrictions.
                      </p>
                      <p className="text-xs text-gray-400 mb-6">File: {fileUrl}</p>
                      <div className="flex space-x-3">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Open in New Tab
                        </a>
                        <a
                          href={fileUrl}
                          download
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* PDF Viewer - Only for non-localhost */}
                      {fileExtension === 'pdf' && (
                        <iframe
                          src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                          title="Document Preview"
                          width="100%"
                          height="600px"
                          className="w-full h-full border-0"
                          style={{ minHeight: '600px' }}
                          onError={handleIframeError}
                          onLoad={handleIframeLoad}
                        />
                      )}
                      
                      {/* Office Documents - Only for non-localhost */}
                      {(['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(fileExtension)) && (
                        <iframe
                          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                          title="Document Preview"
                          width="100%"
                          height="600px"
                          className="w-full h-full border-0"
                          style={{ minHeight: '600px' }}
                          onError={handleIframeError}
                          onLoad={handleIframeLoad}
                        />
                      )}
                      
                      {/* Text Files - Only for non-localhost */}
                      {['txt', 'csv', 'log'].includes(fileExtension) && (
                        <div className="p-6 w-full h-full overflow-auto" style={{ minHeight: '600px' }}>
                          <iframe
                            src={fileUrl}
                            title="Document Preview"
                            width="100%"
                            height="100%"
                            className="w-full h-full border-0 bg-white"
                            style={{ minHeight: '540px' }}
                            onError={handleIframeError}
                            onLoad={handleIframeLoad}
                          />
                        </div>
                      )}
                      
                      {/* Image Files - These work fine with localhost */}
                      {(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension)) && (
                        <div className="flex items-center justify-center p-6" style={{ minHeight: '600px' }}>
                          <img
                            src={fileUrl}
                            alt="Document"
                            className="max-w-full max-h-full object-contain"
                            onError={handleIframeError}
                            onLoad={handleIframeLoad}
                          />
                        </div>
                      )}
                      
                      {/* Fallback for unsupported file types */}
                      {!(['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt', 'csv', 'log', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension)) && (
                        <div className="flex flex-col items-center justify-center p-12" style={{ minHeight: '600px' }}>
                          <FileText className="h-16 w-16 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h3>
                          <p className="text-sm text-gray-500 text-center mb-2">
                            File type: {fileExtension.toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-500 text-center mb-6">
                            This file type cannot be previewed in the browser. Please download the file to view its contents.
                          </p>
                          <a
                            href={fileUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download File
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
            
         
          </div>
          
          {/* Document Information Section */}
          <div className="border-t border-gray-200 p-6">
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">{document.title}</h3>
                {document.description && (
                  <p className="mt-1 text-sm text-gray-600">{document.description}</p>
                )}
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
                  <Badge variant="success" className="mt-1">v{versionNumber}</Badge>
                </div>
                
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {new Date(document.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {latestVersion && latestVersion.notes && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-gray-500">Version Notes</p>
                  <p className="mt-1 text-gray-900">{latestVersion.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default DocumentViewerPage;