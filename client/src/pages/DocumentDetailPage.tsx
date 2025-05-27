import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { useAuth } from '../context/AuthContext';
import QRCodeGenerator from '../components/QR/QRCodeGenerator';
import DocumentUploader from '../components/Documents/DocumentUploader';
import VersionHistory from '../components/Documents/VersionHistory';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import LinkButton from '../components/UI/LinkButton';
import Button from '../components/UI/Button';
import { formatDateTime } from '../utils/dateUtils';

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocumentById, deleteDocument, loading, getDocumentVersions } = useDocuments();
  const { hasPermission, user } = useAuth();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading document..." />
      </div>
    );
  }
  
  const document = id ? getDocumentById(id) : undefined;
  
  if (!document) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <AlertTriangle className="h-12 w-12" />
          </div>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Document not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The document you're looking for doesn't exist or has been removed.
        </p>
        <div className="mt-6">
          <Link
            to="/documents"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Documents
          </Link>
        </div>
      </div>
    );
  }
  
  const handleDeleteDocument = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await deleteDocument(id);
      navigate('/documents');
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const versions = getDocumentVersions(document.id);
  const latestVersion = versions.length > 0 
    ? versions.reduce((latest, current) => 
        current.versionNumber > latest.versionNumber ? current : latest, versions[0])
    : null;

  return (
    <div>
      <div className="mb-6">
        <LinkButton
          to="/documents"
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          Back to Documents
        </LinkButton>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h1 className="text-lg leading-6 font-medium text-gray-900">{document.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Document details and versions</p>
          </div>
          
          {hasPermission('supervisor') && (
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
              
              <LinkButton
                to={`/documents/${document.id}/edit`}
                variant="secondary"
                size="sm"
                icon={Edit}
              >
                Edit
              </LinkButton>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Title</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{document.title}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{document.department}</dd>
            </div>
            {document.machineId && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Machine ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{document.machineId}</dd>
              </div>
            )}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {document.description || 'No description provided'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDateTime(document.createdAt)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDateTime(document.updatedAt)}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">QR Code ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {document.qrId}
              </dd>
            </div>
            {latestVersion && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Latest Version</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex items-center">
                    <span>Version {latestVersion.versionNumber}</span>
                    <a 
                      href={latestVersion.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-4 inline-flex items-center px-2.5 py-0.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-gray-50 hover:bg-gray-100"
                    >
                      <Download size={12} className="mr-1" />
                      Download
                    </a>
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <VersionHistory versions={versions} />
        </div>
        
        <div className="space-y-6">
          <QRCodeGenerator 
            documentId={document.id} 
            documentTitle={document.title} 
            existingQrId={document.qrId}
          />
          
          {hasPermission('supervisor') && (
            <DocumentUploader documentId={document.id} />
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteDocument}
          title="Delete Document"
          message="Are you sure you want to delete this document? This action cannot be undone. All versions and QR codes associated with this document will also be deleted."
          confirmText="Delete"
          type="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default DocumentDetailPage;