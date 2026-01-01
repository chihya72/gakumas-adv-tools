import React, { useState, useEffect } from 'react';
import { ResourceSelector } from './ResourceSelector';
import './ResourceSelectorModal.css';

interface ResourceSelectorModalProps {
  value: string;
  resourceType: 'body' | 'face' | 'hair' | 'motion' | 'facial_motion' | 'environment';
  onSelect: (value: string) => void;
  onCancel: () => void;
  title?: string;
}

/**
 * 资源选择器模态框
 * 只在用户主动点击选择按钮时打开，此时才连接API加载资源列表
 */
export const ResourceSelectorModal: React.FC<ResourceSelectorModalProps> = ({
  value,
  resourceType,
  onSelect,
  onCancel,
  title = '选择资源'
}) => {
  const [selectedValue, setSelectedValue] = useState(value);

  return (
    <div className="resource-selector-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onCancel();
    }}>
      <div className="resource-selector-modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-content">
          <div className="current-value-display">
            <label>当前值:</label>
            <div className="current-value">{value || '(空)'}</div>
          </div>

          <div className="selector-wrapper">
            <label>选择新值:</label>
            <ResourceSelector
              value={selectedValue}
              onChange={setSelectedValue}
              resourceType={resourceType}
              placeholder={`选择${resourceType}资源...`}
              allowCharacterSelection={true}
            />
          </div>

          <div className="manual-input-section">
            <label>或手动输入:</label>
            <input
              type="text"
              className="manual-input"
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              placeholder="手动输入资源名称..."
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>
            取消
          </button>
          <button
            className="btn-select"
            onClick={() => onSelect(selectedValue)}
            disabled={!selectedValue}
          >
            确定选择
          </button>
        </div>
      </div>
    </div>
  );
};
