/**
 * BgmPlay 命令编辑器
 * 用于播放背景音乐
 * 
 * 命令格式: [bgmplay bgm=音乐文件名 volume=1.0]
 * 参数说明:
 * - bgm: BGM文件名（必填）
 * - volume: 音量（可选，0-1，默认1.0）
 */

import React from 'react';
import { CommandCard } from '../../../types/command-card';
import { FormField } from '../../../types/edit-form';
import { LoadingState } from '../../common';
import { useVoices, Audio } from '../../../hooks/useResourceAPI';
import '../../FormEditor/FormEditor.css';

interface BgmPlayEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard, isValid?: boolean) => void;
}

/**
 * BgmPlay 命令编辑器
 */
export const BgmPlayEditor: React.FC<BgmPlayEditorProps> = ({ card, onChange }) => {
  // 从 Database API 加载 BGM 列表
  const { data: bgmList, loading, error, reload } = useVoices(undefined, 'bgm');

  const handleChange = (key: string, value: any) => {
    const newParams = { ...card.params, [key]: value };
    
    // 验证必填字段
    const isValid = !!(newParams.bgm && newParams.bgm.trim() !== '');
    
    onChange({
      ...card,
      params: newParams,
    }, isValid);
  };

  // 加载状态
  if (loading) {
    return <LoadingState message="加载BGM列表中..." />;
  }

  // 错误状态（但允许继续使用文本输入）
  const hasBgmData = !error && bgmList.length > 0;

  // 构建字段列表
  const fields: FormField[] = [
    {
      key: 'bgm',
      label: 'BGM文件名',
      type: hasBgmData ? 'select' : 'text',
      value: card.params.bgm || '',
      options: hasBgmData 
        ? bgmList.map((bgm: Audio) => ({
            label: bgm.audio_name,
            value: bgm.audio_name
          }))
        : [],
      required: true,
      helpText: hasBgmData 
        ? '从数据库中选择BGM文件'
        : '请手动输入BGM文件名（数据库服务未连接或无BGM记录）',
    },
    {
      key: 'volume',
      label: '音量',
      type: 'number',
      value: card.params.volume ?? 1.0,
      required: false,
      helpText: 'BGM音量（0-1，默认为1.0）',
    },
  ];

  // 渲染字段
  const renderField = (field: FormField) => {
    const { key, label, type, value, required, options, helpText } = field;

    return (
      <div key={key} className="form-field">
        <label className="form-label">
          {label}
          {required && <span className="required-indicator"> *</span>}
        </label>

        {type === 'select' && options ? (
          <select
            className="form-input"
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
          >
            <option value="">请选择</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === 'number' ? (
          <input
            type="number"
            className="form-input"
            value={value}
            onChange={(e) => handleChange(key, parseFloat(e.target.value) || 0)}
            step={key === 'volume' ? '0.1' : '1'}
            min={key === 'volume' ? '0' : undefined}
            max={key === 'volume' ? '1' : undefined}
          />
        ) : (
          <input
            type="text"
            className="form-input"
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={`输入${label}`}
          />
        )}

        {helpText && <div className="form-help-text">{helpText}</div>}
      </div>
    );
  };

  return (
    <div className="form-container">
      {/* 如果加载失败，显示警告 */}
      {error && (
        <div className="form-field" style={{ marginBottom: '1rem' }}>
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>⚠️ Database API 未连接</div>
            <div>{error}</div>
            <button 
              onClick={reload}
              style={{ 
                marginTop: '0.5rem',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              重试连接
            </button>
          </div>
        </div>
      )}

      {/* 渲染所有字段 */}
      {fields.map(renderField)}
    </div>
  );
};
