import axios, { AxiosInstance } from 'axios';
import { User } from '../types';

// API configuration and base service layer
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // Include cookies for authentication
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token to headers if available
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );// Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Return the data directly if it's wrapped in a success response
        if (response.data.success !== undefined) {
          return response.data.data;
        }
        return response.data;
      },      (error) => {
        // Handle errors consistently
        const message = error.response?.data?.message || 
                       error.response?.data?.error || 
                       error.message || 
                       'An unexpected error occurred';
        
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message
        });        // Handle authentication errors
        if (error.response?.status === 401) {
          // Clear token but don't redirect here to avoid loops
          localStorage.removeItem('token');
          // Let the component handle the redirect based on auth state
        }
        
        throw new Error(message);
      }
    );
  }  // Auth methods
  async login(email: string, password: string): Promise<{ token: string }> {
    const response = await this.client.post('/auth/login', { email, password });
    return response as unknown as { token: string };
  }

  async logout(): Promise<void> {
    await this.client.get('/auth/logout');
  }

  async getMe(): Promise<User> {
    const response = await this.client.get('/auth/me');
    return response as unknown as User;
  }

  // Document methods
  async getDocuments() {
    return this.client.get('/documents');
  }

  async getDocument(id: string) {
    return this.client.get(`/documents/${id}`);
  }

  async createDocument(documentData: any) {
    return this.client.post('/documents', documentData);
  }

  async uploadDocument(formData: FormData) {
    return this.client.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async updateDocument(id: string, documentData: any) {
    return this.client.put(`/documents/${id}`, documentData);
  }

  async deleteDocument(id: string) {
    return this.client.delete(`/documents/${id}`);
  }

  async getDocumentVersions(id: string) {
    return this.client.get(`/documents/${id}/versions`);
  }

  async uploadDocumentVersion(id: string, formData: FormData) {
    return this.client.post(`/documents/${id}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // QR Code methods
  async createQRCode(qrData: any) {
    return this.client.post('/qrcodes', qrData);
  }

  async getQRCode(qrId: string) {
    return this.client.get(`/qrcodes/${qrId}`);
  }

  async updateQRCode(qrId: string, qrData: any) {
    return this.client.put(`/qrcodes/${qrId}`, qrData);
  }

  async deleteQRCode(qrId: string) {
    return this.client.delete(`/qrcodes/${qrId}`);
  }

  async viewDocumentByQR(qrId: string) {
    return this.client.get(`/qrcodes/${qrId}/view`);
  }

  async getQRCodeStats(qrId: string) {
    return this.client.get(`/qrcodes/${qrId}/stats`);
  }

  // Logs and Analytics methods
  async getScanLogs(filters?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
    }
    return this.client.get(`/logs/scan?${params.toString()}`);
  }

  async getScanAnalytics(filters?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
    }
    return this.client.get(`/logs/analytics?${params.toString()}`);
  }

  // File methods
  async uploadFile(formData: FormData) {
    return this.client.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteFile(fileId: string) {
    return this.client.delete(`/files/${fileId}`);
  }

  // User management methods
  async getUsers(filters?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
    }
    return this.client.get(`/users?${params.toString()}`);
  }

  async getUser(id: string) {
    return this.client.get(`/users/${id}`);
  }

  async createUser(userData: any) {
    return this.client.post('/users', userData);
  }

  async updateUser(id: string, userData: any) {
    return this.client.put(`/users/${id}`, userData);
  }

  async deleteUser(id: string) {
    return this.client.delete(`/users/${id}`);
  }

  async updateUserPassword(id: string, password: string) {
    return this.client.put(`/users/${id}/password`, { password });
  }

  async getUserStats() {
    return this.client.get('/users/stats');
  }

  async generateQRCode(documentId: string) {
    // Use the existing createQRCode method with proper payload
    const qrData = {
      document_id: documentId,
    };
    return this.client.post('/qrcodes', qrData);
  }
}

export const apiService = new ApiService();
export default apiService;
