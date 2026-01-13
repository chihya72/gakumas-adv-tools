import React from 'react';
import './EditDialog.css';

interface EditDialogProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  canSave?: boolean; // 是否允许保存，默认为 true
  children: React.ReactNode;
}

export const EditDialog: React.FC<EditDialogProps> = ({
  title,
  isOpen,
  onClose,
  onSave,
  canSave = true, // 默认为 true
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
          <button 
            className="edit-dialog-btn edit-dialog-btn-save" 
            onClick={onSave}
            disabled={!canSave}
            title={!canSave ? '请填写所有必填字段' : ''}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
