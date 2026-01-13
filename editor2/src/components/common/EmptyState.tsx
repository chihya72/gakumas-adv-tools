/**
 * 通用空状态组件
 * 用于显示无数据时的提示信息
 */

import React from 'react';
import '../FormEditor/FormEditor.css';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description,
  icon = '📭',
  action 
}) => (
  <div className="form-empty">
    <div className="form-empty__icon">{icon}</div>
    <div className="form-empty__title">{title}</div>
    {description && <div className="form-empty__description">{description}</div>}
    {action && (
      <button className="form-empty__action" onClick={action.onClick}>
        {action.label}
      </button>
    )}
  </div>
);
