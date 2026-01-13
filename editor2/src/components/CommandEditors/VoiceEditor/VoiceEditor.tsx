/**
 * Voice 命令编辑器
 * 用于播放角色语音
 */

import React from 'react';
import { CommandCard } from '../../../types/command-card';
import { FormField } from '../../../types/edit-form';
import { LoadingState, ErrorState, EmptyState } from '../../common';
import { useAvailableActorIds } from '../../../hooks/useAvailableIds';
import { useVoices, Audio } from '../../../hooks/useResourceAPI';
import '../../FormEditor/FormEditor.css';

interface VoiceEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard, isValid?: boolean) => void;
}

/**
 * Voice 命令编辑器
 * 格式: [voice voice=语音文件名 actorId=角色ID channel=1]
 */
export const VoiceEditor: React.FC<VoiceEditorProps> = ({ card, onChange }) => {
  const availableActorIds = useAvailableActorIds();
  const currentActorId = card.params.actorId || (availableActorIds.length > 0 ? availableActorIds[0] : '');
  const { data: voices, loading, error, reload } = useVoices(currentActorId);

  const handleChange = (key: string, value: any) => {
    const newParams = { ...card.params, [key]: value };
    const isValid = !!(newParams.actorId && newParams.actorId.trim() !== '' && 
                       newParams.voice && newParams.voice.trim() !== '');
    
    onChange({
      ...card,
      params: newParams,
    }, isValid);
  };

  // 加载状态
  if (loading) {
    return <LoadingState message="加载语音列表中..." />;
  }

  // 错误状态
  if (error) {
    return <ErrorState message="加载语音列表失败" details={error} onRetry={reload} />;
  }

  // 无可用角色
  if (availableActorIds.length === 0) {
    return (
      <EmptyState
        title="无可用角色"
        description="请先添加 actorgroup 命令定义角色"
        icon="⚠️"
      />
    );
  }

  // 构建字段列表
  const fields: FormField[] = [
    {
      key: 'actorId',
      label: '角色ID',
      type: 'select',
      value: card.params.actorId || '',
      options: availableActorIds.map(id => ({ label: id, value: id })),
      required: true,
      helpText: '只能选择在 actorgroup 中已定义的角色',
    },
    {
      key: 'voice',
      label: '语音文件名',
      type: voices.length > 0 ? 'select' : 'text',
      value: card.params.voice || '',
      options: voices.map((v: Audio) => ({
        label: v.audio_name,
        value: v.audio_name
      })),
      required: true,
      helpText: voices.length > 0 
        ? '从数据库中选择语音文件'
        : '请手动输入语音文件名（数据库无此角色的语音记录）',
    },
    {
      key: 'channel',
      label: '音频通道',
      type: 'number',
      value: card.params.channel ?? 1,
      required: false,
      helpText: '音频播放通道（默认为1）',
    },
  ];

  // 直接渲染字段，不使用折叠的 section
  const renderField = (field: FormField) => {
    const { key, label, type, value, required, options, helpText } = field;

    return (
      <div key={key} className="form-field">
        <label className="form-field-label">
          {label}
          {required && <span className="form-field-required">*</span>}
        </label>
        
        <div className="form-field-input">
          {type === 'select' && (
            <select
              value={value ?? ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="form-select"
            >
              {options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          {type === 'text' && (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="form-input"
            />
          )}
          {type === 'number' && (
            <input
              type="number"
              value={value ?? ''}
              onChange={(e) => handleChange(key, parseFloat(e.target.value))}
              className="form-input"
            />
          )}
        </div>

        {helpText && <div className="form-field-help">{helpText}</div>}
      </div>
    );
  };

  return (
    <div className="form-editor">
      {fields.map(renderField)}
    </div>
  );
};
