import React from 'react';
import { CommandCard } from '../../../types/command-card';
import { ActorResourceEditor } from '../ActorResourceEditor/ActorResourceEditor';

interface ActorMotionEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard, isValid?: boolean) => void;
}

/** 角色动作命令编辑器 */
export const ActorMotionEditor: React.FC<ActorMotionEditorProps> = (props) => (
  <ActorResourceEditor 
    {...props} 
    config={{ 
      resourceType: 'character', 
      resourceLabel: '动作名称' 
    }} 
  />
);

