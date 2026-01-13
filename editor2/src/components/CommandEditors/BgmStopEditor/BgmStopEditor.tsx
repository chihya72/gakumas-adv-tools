/**
 * BgmStop 命令编辑器
 * 用于停止背景音乐播放
 * 
 * 命令格式: [bgmstop fadeTime=1.0]
 * 参数说明:
 * - fadeTime: 淡出时间（可选，秒，默认1秒）
 */

import React from 'react';
import { CommandCard } from '../../../types/command-card';
import { FormField } from '../../../types/edit-form';
import '../../FormEditor/FormEditor.css';

interface BgmStopEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard, isValid?: boolean) => void;
}

/**
 * BgmStop 命令编辑器
 */
export const BgmStopEditor: React.FC<BgmStopEditorProps> = ({ card, onChange }) => {
  const handleChange = (key: string, value: any) => {
    const newParams = { ...card.params, [key]: value };
    
    onChange({
      ...card,
      params: newParams,
    }, true); // bgmstop 总是有效的
  };

  // 构建字段列表
  const fields: FormField[] = [
    {
      key: 'fadeTime',
      label: '淡出时间',
      type: 'number',
      value: card.params.fadeTime ?? 1,
      required: false,
      helpText: 'BGM淡出时间（秒），0表示立即停止，默认为1',
    },
  ];

  // 渲染字段
  const renderField = (field: FormField) => {
    const { key, label, value, required, helpText } = field;

    return (
      <div key={key} className="form-field">
        <label className="form-label">
          {label}
          {required && <span className="required-indicator"> *</span>}
        </label>

        <input
          type="number"
          className="form-input"
          value={value}
          onChange={(e) => handleChange(key, parseFloat(e.target.value) || 0)}
          step="0.1"
          min="0"
        />

        {helpText && <div className="form-help-text">{helpText}</div>}
      </div>
    );
  };

  return (
    <div className="form-container">
      <div className="form-field" style={{ marginBottom: '1rem' }}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#e3f2fd', 
          border: '1px solid #2196f3',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#1976d2' }}>
            🎵 停止BGM播放
          </div>
          <div style={{ color: '#424242' }}>
            停止当前播放的背景音乐。可设置淡出时间实现平滑过渡。
          </div>
        </div>
      </div>

      {/* 渲染所有字段 */}
      {fields.map(renderField)}
    </div>
  );
};
