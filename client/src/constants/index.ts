// File validation constants
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FILE_TYPE_LABELS = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX'
} as const;

// Role hierarchy constants
export const ROLE_HIERARCHY = {
  admin: 3,
  supervisor: 2,
  user: 1
} as const;

// Navigation items
export const NAV_ITEMS = [  { path: '/', label: 'Dashboard', roles: ['admin', 'supervisor', 'user'] },
  { path: '/documents', label: 'Documents', roles: ['admin', 'supervisor', 'user'] },
  { path: '/qr-codes', label: 'QR Codes', roles: ['admin', 'supervisor', 'user'] },
  { path: '/users', label: 'Users', roles: ['admin'] },
  { path: '/reports', label: 'Reports', roles: ['admin', 'supervisor'] }
] as const;

// UI Constants
export const ITEMS_PER_PAGE = 10;
export const DEBOUNCE_DELAY = 300;

// Date format options
export const DATE_FORMAT_OPTIONS = {
  short: { year: 'numeric', month: 'short', day: 'numeric' } as const,
  long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' } as const
};

// Color themes for different statuses
export const STATUS_COLORS = {
  success: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-800', 
    border: 'border-red-200'
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200'
  }
} as const;
