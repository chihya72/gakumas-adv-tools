/**
 * 通用错误状态组件
 * 统一所有编辑器的错误显示和重试功能
 */

import React from 'react';
import '../FormEditor/FormEditor.css';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  details?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message, 
  onRetry,
  details 
}) => (
  <div className="form-error">
    <div className="form-error__icon">⚠️</div>
    <div className="form-error__message">{message}</div>
    {details && <div className="form-error__details">{details}</div>}
    {onRetry && (
      <button className="form-retry-btn" onClick={onRetry}>
        重试
      </button>
    )}
  </div>
);
