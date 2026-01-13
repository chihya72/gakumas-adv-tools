/**
 * 命令编辑器索引
 * 根据命令类型返回对应的编辑器组件
 */

import React from 'react';
import { CommandCard } from '../../types/command-card';
import { DialogueEditor } from './DialogueEditor/DialogueEditor';
import { CameraSettingEditor } from './CameraSettingEditor/CameraSettingEditor';
import { ActorMotionEditor } from './ActorMotionEditor/ActorMotionEditor';
import { ActorFacialMotionEditor } from './ActorFacialMotionEditor/ActorFacialMotionEditor';
import { BackgroundSettingEditor } from './BackgroundSettingEditor/BackgroundSettingEditor';
import { FadeEditor } from './FadeEditor/FadeEditor';
import { TransitionEditor } from './TransitionEditor/TransitionEditor';
import { GenericEditor } from './GenericEditor/GenericEditor';

export interface CommandEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard) => void;
}

type EditorComponent = React.FC<CommandEditorProps>;

/** 命令编辑器映射表 */
const editorMap: Record<string, EditorComponent> = {
  'message': DialogueEditor,
  'narration': DialogueEditor,
  'dialogue': DialogueEditor,
  'camerasetting': CameraSettingEditor,
  'backgroundsetting': BackgroundSettingEditor,
  'actormotion': ActorMotionEditor,
  'actorfacialmotion': ActorFacialMotionEditor,
  'fade': FadeEditor,
  'transition': TransitionEditor,
  // 可以继续添加更多特殊编辑器
};

/**
 * 获取命令对应的编辑器组件
 * @param commandType 命令类型
 * @returns 编辑器组件
 */
export function getCommandEditor(commandType: string): EditorComponent {
  return editorMap[commandType.toLowerCase()] || GenericEditor;
}

/**
 * 检查命令类型是否有专用编辑器
 * @param commandType 命令类型
 */
export function hasSpecialEditor(commandType: string): boolean {
  return commandType.toLowerCase() in editorMap;
}

// 导出所有编辑器组件
export {
  DialogueEditor,
  CameraSettingEditor,
  BackgroundSettingEditor,
  ActorMotionEditor,
  ActorFacialMotionEditor,
  FadeEditor,
  TransitionEditor,
  GenericEditor,
};
