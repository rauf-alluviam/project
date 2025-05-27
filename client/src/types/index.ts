export type Role = 'admin' | 'supervisor' | 'user'; // Backend uses 'user' instead of 'employee'

export interface User {
  id: string;
  username: string; // Backend uses 'username' instead of 'name'
  email: string;
  role: Role;
  department?: string; // Backend has department field
  createdAt?: string;
  updatedAt?: string;
}

export interface Document {
  id: string;
  title: string;
  department: string;
  machineId?: string;
  description?: string;
  qrId: string;
  versions: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  fileUrl: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface ScanLog {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userRole: Role;
  scanDate: string;
  ipAddress?: string;
}

export interface QRCode {
  id: string;
  documentId: string;
  label: string;
  createdAt: string;
}