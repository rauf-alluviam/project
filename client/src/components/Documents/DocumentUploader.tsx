import React, { useState } from 'react';
import { Upload, X, File, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateFile, formatFileSize, getFileExtension } from '../../utils/fileUtils';
import { ALLOWED_FILE_TYPES } from '../../constants';
import { apiService } from '../../services/api';
import Alert from '../UI/Alert';
import Button from '../UI/Button';

interface DocumentUploaderProps {
  documentId?: string;
  onUploadComplete?: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ 
  documentId, 
  onUploadComplete 
}) => {
  const { user } = useAuth();
  
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validation = validateFile(selectedFile);
      
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const validation = validateFile(droppedFile);
      
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentId || !file || !user) {
      setError('Missing required information');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('notes', notes);
      
      // Upload file using the API service
      await apiService.uploadDocumentVersion(documentId, formData);
      
      // The uploadDocumentVersion should handle the version creation on the backend
      // Reset form
      setFile(null);
      setNotes('');
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      setError('Failed to upload document version');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {documentId ? 'Upload New Version' : 'Upload Document'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer ${
              dragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload
              className={`h-12 w-12 ${
                dragOver ? 'text-blue-500' : 'text-gray-400'
              }`}
            />
            <p className="mt-2 text-sm font-medium text-gray-900">
              Drag and drop your file here
            </p>
            <p className="text-xs text-gray-500">PDF, DOCX, XLSX (max 10MB)</p>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              accept={ALLOWED_FILE_TYPES.join(',')}
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4 flex items-start justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center rounded-md bg-blue-100 text-blue-700 flex-shrink-0">
                <File size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {getFileExtension(file.name).toUpperCase()}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        
        <div className="mt-4">
          <label
            htmlFor="version-notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Version Notes
          </label>
          <textarea
            id="version-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the changes in this version..."
          />
        </div>
        
        {error && (
          <div className="mt-4">
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}
        
        <div className="mt-4">
          <Button
            type="submit"
            disabled={!file || uploading}
            variant="primary"
            size="lg"
            className="w-full"
            icon={uploading ? RefreshCw : undefined}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploader;