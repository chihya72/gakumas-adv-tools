import React from 'react';
import { CommandCard } from '../../../types/command-card';
import { ActorResourceEditor } from '../ActorResourceEditor/ActorResourceEditor';

interface ActorFacialMotionEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard, isValid?: boolean) => void;
}

/** 角色表情命令编辑器 */
export const ActorFacialMotionEditor: React.FC<ActorFacialMotionEditorProps> = (props) => (
  <ActorResourceEditor 
    {...props} 
    config={{ 
      resourceType: 'facial', 
      resourceLabel: '表情名称',
      additionalFields: [
        {
          key: 'transition',
          label: '过渡时间',
          type: 'number',
          value: props.card.params.transition !== undefined ? props.card.params.transition : 0,
          step: 0.1,
          min: 0,
          helpText: '表情切换的过渡时间（秒）',
        },
      ],
    }} 
  />
);
