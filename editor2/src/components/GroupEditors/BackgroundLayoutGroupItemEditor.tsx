import React, { useState, useEffect } from 'react';
import { useAvailableBackgroundIds } from '../../hooks/useAvailableIds';
import { EmptyState } from '../common';
import '../FormEditor/FormEditor.css';

interface BackgroundLayoutGroupItemEditorProps {
  id: string;
  onChange: (id: string) => void;
  onValidate?: (isValid: boolean) => void;
}

/** 3D背景布局项编辑器 */
export const BackgroundLayoutGroupItemEditor: React.FC<BackgroundLayoutGroupItemEditorProps> = ({ 
  id, 
  onChange,
  onValidate
}) => {
  const [formData, setFormData] = useState({ id });
  const availableBackgroundIds = useAvailableBackgroundIds('3d');

  // 实时通知父组件
  useEffect(() => {
    onChange(formData.id);
    if (onValidate) {
      onValidate(formData.id.trim() !== '');
    }
  }, [formData, onValidate]);

  if (availableBackgroundIds.length === 0) {
    return (
      <EmptyState
        title="无可用的 3D 背景"
        description="请先添加 backgroundgroup 命令，并确保包含 3D 背景资源"
        icon="🎬"
      />
    );
  }

  return (
    <div className="form-container">
      <div className="form-field">
        <label className="form-label">背景ID (id)</label>
        <select
          className="form-select"
          value={formData.id}
          onChange={(e) => setFormData({ id: e.target.value })}
        >
          <option value="">请选择背景...</option>
          {availableBackgroundIds.map((bgId) => (
            <option key={bgId} value={bgId}>
              {bgId}
            </option>
          ))}
        </select>
        <div className="form-help-text">只能选择在 backgroundgroup 中已定义的 3D 背景</div>
      </div>
    </div>
  );
};
