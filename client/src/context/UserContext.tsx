import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from '../types';
import apiService from '../services/api';
import { useErrorHandler } from '../hooks/useErrorHandler';

interface UserStats {
  totalUsers: number;
  recentUsers: number;
  roleStats: Record<string, number>;
  departmentStats: Record<string, number>;
}

interface UserContextType {
  users: User[];
  userStats: UserStats | null;
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchUserStats: () => Promise<void>;
  createUser: (userData: Partial<User> & { password: string }) => Promise<User>;
  updateUser: (id: string, userData: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  changeUserPassword: (id: string, password: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUsers();
      setUsers(response);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await apiService.getUserStats();
      setUserStats(response);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
    }
  }, [handleError]);

  const createUser = useCallback(async (userData: Partial<User> & { password: string }): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await apiService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      // Refresh stats after creating user
      fetchUserStats();
      return newUser;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, fetchUserStats]);

  const updateUser = useCallback(async (id: string, userData: Partial<User>): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await apiService.updateUser(id, userData);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      // Refresh stats if role or department changed
      if (userData.role || userData.department) {
        fetchUserStats();
      }
      return updatedUser;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, fetchUserStats]);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      // Refresh stats after deleting user
      fetchUserStats();
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, fetchUserStats]);

  const changeUserPassword = useCallback(async (id: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.updateUserPassword(id, password);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const value: UserContextType = {
    users,
    userStats,
    loading,
    error,
    fetchUsers,
    fetchUserStats,
    createUser,
    updateUser,
    deleteUser,
    changeUserPassword
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};