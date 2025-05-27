import React, { createContext, useContext, useState, useEffect } from 'react';
import { Document, DocumentVersion, QRCode, ScanLog } from '../types';
import { apiService } from '../services/api';

interface DocumentContextType {
  documents: Document[];
  qrCodes: QRCode[];
  scanLogs: ScanLog[];
  loading: boolean;
  error: string | null;
  
  // Document methods
  getDocumentById: (id: string) => Document | undefined;
  getDocumentByQrId: (qrId: string) => Document | undefined;
  addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'qrId'>) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  
  // Version methods
  addDocumentVersion: (documentId: string, version: Omit<DocumentVersion, 'id' | 'documentId' | 'createdAt'>) => Promise<DocumentVersion>;
  getDocumentVersions: (documentId: string) => DocumentVersion[];
  
  // QR Code methods
  generateQRCode: (label: string, documentId: string) => Promise<QRCode>;
  deleteQRCode: (qrId: string) => Promise<void>;
  
  // Scan methods
  recordScan: (documentId: string, userId: string, userName: string, userRole: import("../types").Role) => Promise<void>;
  getDocumentScanLogs: (documentId: string) => ScanLog[];
  
  // Utility methods
  refreshData: () => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [documentsData, scanLogsData] = await Promise.all([
        apiService.getDocuments() as unknown as Promise<Document[]>,
        apiService.getScanLogs() as unknown as Promise<ScanLog[]>
      ]);

      setDocuments(documentsData);
      setScanLogs(scanLogsData);
      
      // Extract QR codes from documents
      const qrCodesData: QRCode[] = documentsData
        .filter(doc => doc.qrId)
        .map(doc => ({
          id: doc.qrId,
          documentId: doc.id,
          label: doc.title,
          createdAt: doc.createdAt
        }));
      setQRCodes(qrCodesData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchAllData();
  };

  // Document methods
  const getDocumentById = (id: string) => {
    return documents.find(doc => doc.id === id);
  };

  const getDocumentByQrId = (qrId: string) => {
    return documents.find(doc => doc.qrId === qrId);
  };

  const addDocument = async (documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'qrId'>) => {
    try {
      const newDocument = await apiService.createDocument(documentData) as unknown as Document;
      setDocuments(prev => [...prev, newDocument]);
      
      // Create QR code entry if the document has one
      if (newDocument.qrId) {
        const qrCode: QRCode = {
          id: newDocument.qrId,
          documentId: newDocument.id,
          label: newDocument.title,
          createdAt: newDocument.createdAt
        };
        setQRCodes(prev => [...prev, qrCode]);
      }
      
      return newDocument;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      const updatedDocument = await apiService.updateDocument(id, updates) as unknown as Document;
      
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? updatedDocument : doc
      ));
      
      // Update QR code if title changed
      if (updates.title && updatedDocument.qrId) {
        setQRCodes(prev => prev.map(qr => 
          qr.documentId === id ? { ...qr, label: updatedDocument.title } : qr
        ));
      }
      
      return updatedDocument;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await apiService.deleteDocument(id);
      
      const document = documents.find(doc => doc.id === id);
      
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      // Remove associated QR code
      if (document?.qrId) {
        setQRCodes(prev => prev.filter(qr => qr.documentId !== id));
      }
      
      // Remove associated scan logs
      setScanLogs(prev => prev.filter(log => log.documentId !== id));
      
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  // Version methods
  const addDocumentVersion = async (
    documentId: string, 
    versionData: Omit<DocumentVersion, 'id' | 'documentId' | 'createdAt'>
  ) => {
    try {
      const newVersion = await apiService.uploadDocumentVersion(documentId, versionData as any) as unknown as DocumentVersion;
      
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentId) {
          return {
            ...doc,
            versions: [...doc.versions, newVersion],
            updatedAt: new Date().toISOString()
          };
        }
        return doc;
      }));
      
      return newVersion;
    } catch (error) {
      console.error('Error adding document version:', error);
      throw error;
    }
  };

  const getDocumentVersions = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    return doc ? doc.versions : [];
  };

  // QR Code methods
  const generateQRCode = async (label: string, documentId: string) => {
    try {
      const qrData = { label, documentId };
      const newQRCode = await apiService.createQRCode(qrData) as unknown as QRCode;
      
      setQRCodes(prev => [...prev, newQRCode]);
      
      // Update document with QR ID
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentId) {
          return { ...doc, qrId: newQRCode.id };
        }
        return doc;
      }));
      
      return newQRCode;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const deleteQRCode = async (qrId: string) => {
    try {
      await apiService.deleteQRCode(qrId);
      
      setQRCodes(prev => prev.filter(qr => qr.id !== qrId));
      
      // Remove QR ID from document
      setDocuments(prev => prev.map(doc => {
        if (doc.qrId === qrId) {
          return { ...doc, qrId: '' };
        }
        return doc;
      }));
      
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw error;
    }
  };

  // Scan methods
  const recordScan = async (
    documentId: string,
    userId: string,
    userName: string,
    userRole: import("../types").Role
  ) => {
    try {
      // Note: This would typically be handled by the backend when a QR code is scanned
      // For now, we'll create a scan log entry locally
      const newScanLog: ScanLog = {
        id: `scan-${Date.now()}`,
        documentId,
        userId,
        userName,
        userRole,
        scanDate: new Date().toISOString(),
        ipAddress: 'Unknown' // This would be determined by the backend
      };
      
      setScanLogs(prev => [...prev, newScanLog]);
    } catch (error) {
      console.error('Error recording scan:', error);
      throw error;
    }
  };

  const getDocumentScanLogs = (documentId: string) => {
    return scanLogs.filter(log => log.documentId === documentId);
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        qrCodes,
        scanLogs,
        loading,
        error,
        getDocumentById,
        getDocumentByQrId,
        addDocument,
        updateDocument,
        deleteDocument,
        addDocumentVersion,
        getDocumentVersions,
        generateQRCode,
        deleteQRCode,
        recordScan,
        getDocumentScanLogs,
        refreshData
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = (): DocumentContextType => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
