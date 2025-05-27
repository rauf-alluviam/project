import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  type = 'danger'
}) => {
  const typeStyles = {
    danger: {
      variant: 'danger' as const,
      icon: '⚠️',
      iconBg: 'bg-red-100'
    },
    warning: {
      variant: 'warning' as const,
      icon: '⚠️',
      iconBg: 'bg-yellow-100'
    },
    info: {
      variant: 'primary' as const,
      icon: 'ℹ️',
      iconBg: 'bg-blue-100'
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="sm:flex sm:items-start">
        <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${typeStyles[type].iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
          <span className="text-lg">{typeStyles[type].icon}</span>
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
        <Button
          type="button"
          disabled={isLoading}
          onClick={onConfirm}
          variant={typeStyles[type].variant}
          size="sm"
        >
          {isLoading ? 'Loading...' : confirmText}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          variant="secondary"
          size="sm"
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
