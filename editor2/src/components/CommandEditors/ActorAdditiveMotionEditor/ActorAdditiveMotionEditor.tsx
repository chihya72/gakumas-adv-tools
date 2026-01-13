/**
 * 角色叠加动画命令编辑器
 * actoradditivemotion 命令
 * 
 * 命令格式：[actoradditivemotion id=角色ID motion=动作名称]
 * 
 * 特点：
 * - motion 参数为叠加动画，通常包含 "-add_" 后缀
 * - 实际游戏数据中仅有3种叠加动画：yes-001, yes-002, no-001
 */

import React from 'react';
import { CommandCard } from '../../../types/command-card';
import { FormField } from '../../../types/edit-form';
import { LoadingState, ErrorState, EmptyState } from '../../common';
import { useAvailableActorIds } from '../../../hooks/useAvailableIds';
import { useMotions } from '../../../hooks/useResourceAPI';
import '../../FormEditor/FormEditor.css';

interface ActorAdditiveMotionEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard, isValid?: boolean) => void;
}

/**
 * 角色叠加动画编辑器
 * 支持 id, motion, weight 参数
 */
export const ActorAdditiveMotionEditor: React.FC<ActorAdditiveMotionEditorProps> = ({ 
  card, 
  onChange,
}) => {
  const availableActorIds = useAvailableActorIds();
  const { data: allMotions, loading, error, reload } = useMotions('character');

  // 过滤出叠加动画（通常包含 -add_ 的动作）
  const additiveMotions = allMotions.filter(m => 
    m.motion_name.includes('-add_') || m.motion_name.includes('add-')
  );

  const handleChange = (key: string, value: any) => {
    const newParams = { ...card.params, [key]: value };
    
    // 验证必填字段
    const isValid = !!(
      newParams.id && newParams.id.trim() !== '' && 
      newParams.motion && newParams.motion.trim() !== ''
    );
    
    onChange({
      ...card,
      params: newParams,
    }, isValid);
  };

  // 加载状态
  if (loading) {
    return <LoadingState message="加载叠加动画列表中..." />;
  }

  // 错误状态
  if (error) {
    return <ErrorState message="加载叠加动画列表失败" details={error} onRetry={reload} />;
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
      key: 'id',
      label: '角色ID',
      type: 'select',
      value: card.params.id || '',
      options: availableActorIds.map(id => ({ label: id, value: id })),
      required: true,
      helpText: '只能选择在 actorgroup 中已定义的角色',
    },
    {
      key: 'motion',
      label: '叠加动画名称',
      type: 'select',
      value: card.params.motion || '',
      options: additiveMotions.length > 0 
        ? additiveMotions.map(m => {
            let label = m.motion_name;
            if (m.character_id) label += ` (${m.character_id})`;
            if (m.action_type) label += ` - ${m.action_type}`;
            return { label, value: m.motion_name };
          })
        : allMotions.map(m => {
            let label = m.motion_name;
            if (m.character_id) label += ` (${m.character_id})`;
            if (m.action_type) label += ` - ${m.action_type}`;
            return { label, value: m.motion_name };
          }),
      required: true,
      helpText: additiveMotions.length > 0 
        ? '已自动过滤出叠加动画（包含 -add_ 的动作）' 
        : '未找到叠加动画，显示所有动作',
    },
  ];

  // 渲染字段
  const renderField = (field: FormField) => {
    const { key, label, type, value, required, options, helpText, min, max, step } = field;

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
              <option value="">-- 请选择 --</option>
              {options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          {type === 'number' && (
            <input
              type="number"
              value={value ?? ''}
              onChange={(e) => handleChange(key, parseFloat(e.target.value))}
              className="form-input"
              step={step}
              min={min}
              max={max}
            />
          )}
        </div>

        {helpText && <div className="form-field-help">{helpText}</div>}
      </div>
    );
  };

  return (
    <div className="form-editor">
      <div className="form-editor-header">
        <h3 className="form-editor-title">角色叠加动画</h3>
        <p className="form-editor-description">
          配置角色的叠加动画效果（如点头、摇头等附加动作）
        </p>
      </div>
      {fields.map(renderField)}
    </div>
  );
};
