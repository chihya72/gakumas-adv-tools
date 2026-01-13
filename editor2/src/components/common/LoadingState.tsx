/**
 * 通用加载状态组件
 * 统一所有编辑器的加载状态显示
 */

import React from 'react';
import '../FormEditor/FormEditor.css';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = '加载中...', 
  size = 'medium' 
}) => (
  <div className={`form-loading form-loading--${size}`}>
    <div className="form-loading__message">{message}</div>
  </div>
);
