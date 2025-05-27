import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DocumentProvider } from './context/DocumentContext';
import { UserProvider } from './context/UserContext';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import NewDocumentPage from './pages/NewDocumentPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import DocumentViewerPage from './pages/DocumentViewerPage';
import ErrorBoundary from './components/UI/ErrorBoundary';

// Protected route component
const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode, 
  requiredRole?: 'admin' | 'supervisor' | 'user' 
}) => {
  const { isAuthenticated, hasPermission, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <DocumentProvider>
            <UserProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/view/:qrId" element={<DocumentViewerPage />} />
                
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="documents/new" element={<NewDocumentPage />} />
                  <Route path="documents/:id" element={<DocumentDetailPage />} />
                  <Route 
                    path="reports" 
                    element={
                      <ProtectedRoute requiredRole="supervisor">
                        <ReportsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="users" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <UsersPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="qr-codes" element={<DocumentsPage />} />
                </Route>
              </Routes>
            </UserProvider>
          </DocumentProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;