import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { useUsers } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import UserTable from '../components/Users/UserTable';
import UserFormModal from '../components/Users/UserFormModal';
import PasswordChangeModal from '../components/Users/PasswordChangeModal';
import UserStats from '../components/Users/UserStats';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import Alert from '../components/UI/Alert';

const UsersPage: React.FC = () => {
  const { 
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
  } = useUsers();
  const { hasPermission } = useAuth();

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Loading states for individual operations
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (hasPermission('admin')) {
      fetchUsers();
      fetchUserStats();
    }
  }, [hasPermission, fetchUsers, fetchUserStats]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesDepartment = !departmentFilter || user.department === departmentFilter;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = Array.from(new Set(users.map(user => user.department).filter(Boolean)));

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const handleUserSubmit = async (userData: Partial<User> & { password?: string }) => {
    try {
      setModalLoading(true);
      if (isEditing && selectedUser) {
        await updateUser(selectedUser.id, userData);
      } else {
        await createUser(userData as Partial<User> & { password: string });
      }
      setShowUserModal(false);
    } catch (error) {
      // Error is handled by context
    } finally {
      setModalLoading(false);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!selectedUser) return;
    
    try {
      setModalLoading(true);
      await changeUserPassword(selectedUser.id, password);
      setShowPasswordModal(false);
    } catch (error) {
      // Error is handled by context
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setDeleteLoading(true);
      await deleteUser(selectedUser.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error is handled by context
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setDepartmentFilter('');
  };

  if (!hasPermission('admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You don't have permission to access user management</p>
        </div>
      </div>
    );
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage system users, roles, and permissions
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Error Alert */}      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => {}}
        />
      )}

      {/* User Statistics */}
      <UserStats stats={userStats} loading={loading} />

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users by username, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
              <option value="user">User</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {(searchTerm || roleFilter || departmentFilter) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <UserTable
        users={filteredUsers}
        loading={loading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onChangePassword={handleChangePassword}
      />

      {/* User Form Modal */}
      <UserFormModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSubmit={handleUserSubmit}
        user={selectedUser}
        title={isEditing ? 'Edit User' : 'Create New User'}
        isLoading={modalLoading}
      />

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
        user={selectedUser}
        isLoading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.username}"? This action cannot be undone.`}
        confirmText="Delete User"
        type="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default UsersPage;
