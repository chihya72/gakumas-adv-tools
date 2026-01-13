/**
 * 通用角色资源编辑器
 * 统一 actormotion 和 actorfacialmotion 的实现
 */

import React from 'react';
import { CommandCard } from '../../../types/command-card';
import { FormSection, FormField } from '../../../types/edit-form';
import { FormEditor } from '../../FormEditor/FormEditor';
import { LoadingState, ErrorState, EmptyState } from '../../common';
import { useAvailableActorIds } from '../../../hooks/useAvailableIds';
import { useMotions } from '../../../hooks/useResourceAPI';

interface ActorResourceEditorConfig {
  resourceType: 'character' | 'facial';
  resourceLabel: string;
  additionalFields?: FormField[];
}

interface ActorResourceEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard, isValid?: boolean) => void;
  config: ActorResourceEditorConfig;
}

/**
 * 通用角色资源编辑器
 * 用于 actormotion 和 actorfacialmotion
 */
export const ActorResourceEditor: React.FC<ActorResourceEditorProps> = ({ 
  card, 
  onChange, 
  config 
}) => {
  const availableActorIds = useAvailableActorIds();
  const { data: motions, loading, error, reload } = useMotions(config.resourceType);

  const handleChange = (key: string, value: any) => {
    const newParams = { ...card.params, [key]: value };
    const isValid = !!(newParams.id && newParams.id.trim() !== '' && 
                       newParams.motion && newParams.motion.trim() !== '');
    
    onChange({
      ...card,
      params: newParams,
    }, isValid);
  };

  // 加载状态
  if (loading) {
    return <LoadingState message={`加载${config.resourceLabel}列表中...`} />;
  }

  // 错误状态
  if (error) {
    return <ErrorState message={`加载${config.resourceLabel}列表失败`} details={error} onRetry={reload} />;
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

  // 构建表单
  const sections: FormSection[] = [
    {
      title: '基本设置',
      fields: [
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
          label: config.resourceLabel,
          type: 'select',
          value: card.params.motion || '',
          options: motions.map(m => {
            let label = m.motion_name;
            if (m.character_id) label += ` (${m.character_id})`;
            if (m.action_type) label += ` - ${m.action_type}`;
            return { label, value: m.motion_name };
          }),
          required: true,
          helpText: '从数据库中选择资源',
        },
        ...(config.additionalFields || []),
      ],
    },
  ];

  return <FormEditor sections={sections} onChange={handleChange} />;
};
