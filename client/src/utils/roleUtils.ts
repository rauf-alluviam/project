import { Role } from '../types';

export const getRoleDisplayName = (role: Role): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export const getRoleBadgeClasses = (role: Role): string => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  switch (role) {
    case 'admin':
      return `${baseClasses} bg-purple-100 text-purple-800`;
    case 'supervisor':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'user':
      return `${baseClasses} bg-green-100 text-green-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

export const canUserEdit = (userRole: Role, requiredRole: Role = 'supervisor'): boolean => {  const roleHierarchy: Record<Role, number> = {
    'admin': 3,
    'supervisor': 2,
    'user': 1
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
