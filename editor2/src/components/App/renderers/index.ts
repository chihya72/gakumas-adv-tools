/**
 * Renderer 映射表 - 集中管理所有命令类型的渲染器
 * 避免在 App.tsx 中使用冗长的 switch-case
 */

import BackgroundGroupRenderer from './BackgroundGroupRenderer';
import BackgroundSettingRenderer from './BackgroundSettingRenderer';
import BackgroundLayoutGroupRenderer from './BackgroundLayoutGroupRenderer';
import ActorGroupRenderer from './ActorGroupRenderer';
import ActorMotionRenderer from './ActorMotionRenderer';
import ActorFacialMotionRenderer from './ActorFacialMotionRenderer';
import ActorFacialOverrideMotionRenderer from './ActorFacialOverrideMotionRenderer';
import ActorLookTargetRenderer from './ActorLookTargetRenderer';
import CameraSettingRenderer from './CameraSettingRenderer';
import ActorLayoutGroupRenderer from './ActorLayoutGroupRenderer';
import TransitionRenderer from './TransitionRenderer';
import FadeRenderer from './FadeRenderer';
import DialogueRenderer from './DialogueRenderer';
import BgmPlayRenderer from './BgmPlayRenderer';
import BgmStopRenderer from './BgmStopRenderer';
import CommonParamsRenderer from './CommonParamsRenderer';

export interface RendererProps {
  params: Record<string, any>;
  onEdit?: () => void;
  onEditItem?: (index: number) => void;  // 编辑具体某个项（用于 group 类型）
  onAddItem?: () => void;                // 添加新项（用于 group 类型）
}

export type RendererComponent = React.ComponentType<RendererProps>;

/**
 * 命令类型到渲染器的映射表
 * 添加新的命令类型时，只需在此添加映射即可
 */
export const RENDERER_MAP: Record<string, RendererComponent> = {
  backgroundgroup: BackgroundGroupRenderer,
  backgroundsetting: BackgroundSettingRenderer,
  backgroundlayoutgroup: BackgroundLayoutGroupRenderer,
  actorgroup: ActorGroupRenderer,
  actormotion: ActorMotionRenderer,
  actorfacialmotion: ActorFacialMotionRenderer,
  actorfacialoverridemotion: ActorFacialOverrideMotionRenderer,
  actorlooktarget: ActorLookTargetRenderer,
  camerasetting: CameraSettingRenderer,
  actorlayoutgroup: ActorLayoutGroupRenderer,
  transition: TransitionRenderer,
  fade: FadeRenderer,
  dialogue: DialogueRenderer,
  message: DialogueRenderer,
  narration: DialogueRenderer,
  select: DialogueRenderer, // select 使用相同的对话渲染器
  bgmplay: BgmPlayRenderer,
  bgmstop: BgmStopRenderer,
};

/**
 * 获取指定命令类型的渲染器
 * @param type 命令类型
 * @returns 对应的渲染器组件，如果未找到则返回通用渲染器
 */
export function getRenderer(type: string): RendererComponent {
  return RENDERER_MAP[type.toLowerCase()] || CommonParamsRenderer;
}

// 导出所有渲染器供直接使用
export {
  BackgroundGroupRenderer,
  BackgroundSettingRenderer,
  BackgroundLayoutGroupRenderer,
  ActorGroupRenderer,
  ActorMotionRenderer,
  ActorFacialMotionRenderer,
  CameraSettingRenderer,
  ActorLayoutGroupRenderer,
  TransitionRenderer,
  FadeRenderer,
  DialogueRenderer,
  BgmPlayRenderer,
  BgmStopRenderer,
  CommonParamsRenderer,
};
