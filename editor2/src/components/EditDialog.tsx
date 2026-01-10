import React from 'react';
import './EditDialog.css';

interface EditDialogProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

export const EditDialog: React.FC<EditDialogProps> = ({
  title,
  isOpen,
  onClose,
  onSave,
  children,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="edit-dialog-overlay" onClick={handleOverlayClick}>
      <div className="edit-dialog">
        <div className="edit-dialog-header">
          <h3>{title}</h3>
          <button className="edit-dialog-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="edit-dialog-content">
          {children}
        </div>

        <div className="edit-dialog-footer">
          <button className="edit-dialog-btn edit-dialog-btn-cancel" onClick={onClose}>
            取消
          </button>
          <button className="edit-dialog-btn edit-dialog-btn-save" onClick={onSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
