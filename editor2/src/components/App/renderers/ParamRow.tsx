import React from 'react';

interface ParamRowProps {
  label: string;
  value: string | number | null | undefined | any;
  formatter?: (value: any) => string;
}

/**
 * 参数行组件 - 用于在卡片内显示单个参数
 */
export const ParamRow: React.FC<ParamRowProps> = ({ label, value, formatter }) => {
  if (value === null || value === undefined || value === '') return null;
  
  const displayValue = formatter ? formatter(value) : String(value);
  
  return (
    <div className="detail-row">
      <span className="detail-label">{label}:</span>
      <span className="detail-value">{displayValue}</span>
    </div>
  );
};

interface ParamCardProps {
  title: string;
  children: React.ReactNode;
  index?: number;
  onEdit?: () => void;
}

/**
 * 参数卡片组件 - 用于将一组相关参数组织成卡片形式
 */
export const ParamCard: React.FC<ParamCardProps> = ({ title, children, index, onEdit }) => {
  // 检查是否有有效的子元素
  const hasContent = React.Children.toArray(children).some(child => child !== null);
  
  if (!hasContent) return null;
  
  const displayTitle = index !== undefined ? `${title} #${index}` : title;
  
  return (
    <div className="detail-section">
      <div className="detail-section-header">
        <h4>{displayTitle}</h4>
        {onEdit && (
          <button className="detail-edit-btn" onClick={onEdit} title="编辑">
            ✏️
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

/**
 * 添加项按钮组件 - 通用于所有 Group 类型命令
 */
export const AddItemButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => {
  return (
    <div className="detail-section">
      <button 
        className="detail-add-btn" 
        onClick={onClick}
        title={label}
      >
        + {label}
      </button>
    </div>
  );
};
