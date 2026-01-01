/**
 * Unity ADV Script 数据模型定义
 * 学園アイドルマスター (Gakumas) 剧情脚本类型系统
 */

// ============================================================================
// 基础类型
// ============================================================================

/** 时间轴Clip数据 - 控制命令的时间和动画 */
export interface ClipData {
  /** 开始时间（秒） */
  startTime: number;
  /** 持续时间（秒） */
  duration: number;
  /** 裁剪开始位置 */
  clipIn: number;
  /** 淡入时长 */
  easeInDuration: number;
  /** 淡出时长 */
  easeOutDuration: number;
  /** 混合淡入时长 */
  blendInDuration: number;
  /** 混合淡出时长 */
  blendOutDuration: number;
  /** 混合淡入缓动类型 */
  mixInEaseType: number;
  /** 混合淡出缓动类型 */
  mixOutEaseType?: number;
  /** 混合淡入曲线 */
  mixInCurve?: any;
  /** 混合淡出曲线 */
  mixOutCurve?: any;
  /** 时间缩放 */
  timeScale: number;
}

/** 3D变换数据 */
export interface Transform3D {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

/** 2D变换数据 */
export interface Transform2D {
  position: { x: number; y: number };
  scale: { x: number; y: number };
  angle: number;
}

/** 相机设置 */
export interface CameraSetting {
  /** 焦距 */
  focalLength: number;
  /** 近裁剪平面 */
  nearClipPlane: number;
  /** 远裁剪平面 */
  farClipPlane: number;
  /** 相机变换 */
  transform: Transform3D;
  /** 景深设置 */
  dofSetting: {
    active: boolean;
    focalPoint: number;
    fNumber: number;
    maxBlurSpread: number;
  };
}

/** 面部模型数据 */
export interface FaceModel {
  path: string;
  index: number;
  value: number;
}

/** 贴花数据 */
export interface Decal {
  // 根据实际数据结构补充
  [key: string]: any;
}

/** 面部覆盖设置 */
export interface FacialOverrideSetting {
  faceModels: FaceModel[];
  decals: Decal[];
}

/** 震动设置 */
export interface ShakeSetting {
  strength: number;
  duration: number;
  interval: number;
  count: number;
  ease: number;
}

// ============================================================================
// 命令参数类型
// ============================================================================

/** 背景组参数 */
export interface BackgroundGroupParams {
  backgrounds: string; // 原始嵌套命令字符串
  id?: string;
  src?: string;
}

/** 背景参数 */
export interface BackgroundParams {
  id: string;
  src: string;
}

/** 背景设置参数 */
export interface BackgroundSettingParams {
  id: string;
  setting?: string; // JSON字符串，解析为Transform2D
}

/** 背景布局组参数 */
export interface BackgroundLayoutGroupParams {
  layouts: string; // 原始嵌套命令字符串
  id?: string;
}

/** 角色组参数 */
export interface ActorGroupParams {
  actors: string; // 原始嵌套命令字符串
  id?: string;
  body?: string;
  face?: string;
  hair?: string;
}

/** 角色参数 */
export interface ActorParams {
  id: string;
  body: string;
  face: string;
  hair: string;
}

/** 角色布局组参数 */
export interface ActorLayoutGroupParams {
  layouts: string; // 原始嵌套命令字符串
  id?: string;
  transform?: string; // JSON字符串，解析为Transform3D
}

/** 角色布局参数 */
export interface ActorLayoutParams {
  id: string;
  transform: string; // JSON字符串，解析为Transform3D
}

/** 角色动作参数 */
export interface ActorMotionParams {
  id: string;
  motion: string;
  transition?: string;
}

/** 角色面部动作参数 */
export interface ActorFacialMotionParams {
  id: string;
  motion: string;
  transition?: string;
}

/** 角色面部覆盖动作参数 */
export interface ActorFacialOverrideMotionParams {
  id: string;
  setting: string; // JSON字符串，解析为FacialOverrideSetting
}

/** 角色附加动作参数 */
export interface ActorAdditiveMotionParams {
  id: string;
  motion: string;
  transition?: string;
}

/** 角色视线目标参数 */
export interface ActorLookTargetParams {
  id: string;
  target?: string; // JSON字符串
  [key: string]: any;
}

/** 角色视线目标过渡参数 */
export interface ActorLookTargetTweenParams {
  id: string;
  from?: string; // JSON字符串
  to?: string; // JSON字符串
  curve?: string; // JSON字符串
  [key: string]: any;
}

/** 角色眨眼参数 */
export interface ActorEyeBlinkParams {
  id: string;
}

/** 角色灯光参数 */
export interface ActorLightingParams {
  setting: string; // JSON字符串，包含actorParameter和actorShadow
}

/** 景深效果参数 */
export interface DofParams {
  setting: string; // JSON字符串，景深设置
  focusSetting?: string; // JSON字符串，焦点设置
}

/** 色彩效果参数 */
export interface ColorEffectParams {
  setting: string; // JSON字符串，色彩调整设置
}

/** 音效参数 */
export interface SeParams {
  se: string;
}

/** 相机设置参数 */
export interface CameraSettingParams {
  setting: string; // JSON字符串，解析为CameraSetting
}

/** 对话消息参数 */
export interface MessageParams {
  /** 对话文本（包含Ruby标签） */
  text: string;
  /** 说话者名称 */
  name: string;
  /** 是否隐藏对话框 */
  hide?: string; // "true" | "false"
  /** 音效 */
  se?: string;
}

/** 语音参数 */
export interface VoiceParams {
  voice: string;
  actorId: string;
  channel: string;
}

/** 淡入淡出参数 */
export interface FadeParams {
  from: string;
  to: string;
}

/** 过渡效果参数 */
export interface TransitionParams {
  transition: string;
  type: "In" | "Out";
  character: string;
}

/** BGM播放参数 */
export interface BgmPlayParams {
  bgm: string;
}

/** BGM停止参数 */
export interface BgmStopParams {
  fadeTime?: string;
}

/** 震动参数 */
export interface ShakeParams {
  setting: string; // JSON字符串，解析为ShakeSetting
}

/** 时间轴参数 */
export interface TimelineParams {
  // 根据实际数据补充
  [key: string]: any;
}

// ============================================================================
// 命令类型联合
// ============================================================================

/** 所有命令参数类型 */
export type CommandParams =
  | BackgroundGroupParams
  | BackgroundParams
  | BackgroundSettingParams
  | BackgroundLayoutGroupParams
  | ActorGroupParams
  | ActorParams
  | ActorLayoutGroupParams
  | ActorLayoutParams
  | ActorMotionParams
  | ActorFacialMotionParams
  | ActorFacialOverrideMotionParams
  | ActorAdditiveMotionParams
  | ActorLookTargetParams
  | ActorLookTargetTweenParams
  | ActorEyeBlinkParams
  | ActorLightingParams
  | DofParams
  | ColorEffectParams
  | SeParams
  | CameraSettingParams
  | MessageParams
  | VoiceParams
  | FadeParams
  | TransitionParams
  | BgmPlayParams
  | BgmStopParams
  | ShakeParams
  | TimelineParams;

/** 命令类型枚举 */
export enum CommandType {
  // 背景相关
  BackgroundGroup = "backgroundgroup",
  Background = "background",
  BackgroundSetting = "backgroundsetting",
  BackgroundLayoutGroup = "backgroundlayoutgroup",
  
  // 角色相关
  ActorGroup = "actorgroup",
  Actor = "actor",
  ActorLayout = "actorlayout",
  ActorLayoutGroup = "actorlayoutgroup",
  ActorMotion = "actormotion",
  ActorFacialMotion = "actorfacialmotion",
  ActorFacialOverrideMotion = "actorfacialoverridemotion",
  ActorAdditiveMotion = "actoradditivemotion",
  ActorLookTarget = "actorlooktarget",
  ActorLookTargetTween = "actorlooktargettween",
  ActorEyeBlink = "actoreyeblink",
  ActorLighting = "actorlighting",
  
  // 相机
  CameraSetting = "camerasetting",
  
  // 对话和音频
  Message = "message",
  Voice = "voice",
  BgmPlay = "bgmplay",
  BgmStop = "bgmstop",
  Se = "se",
  
  // 效果
  Fade = "fade",
  Transition = "transition",
  Shake = "shake",
  Dof = "dof",
  ColorEffect = "coloreffect",
  
  // 时间轴
  Timeline = "timeline",
}

// ============================================================================
// 命令结构
// ============================================================================

/** 基础命令接口 */
export interface BaseCommand<T = CommandParams> {
  /** 命令类型 */
  type: string;
  /** 命令参数 */
  params: T;
  /** 时间轴Clip数据 */
  clip: ClipData | null;
  /** 原始命令行（用于调试） */
  raw_line?: string;
}

/** 具体命令类型（带类型安全） */
export interface BackgroundGroupCommand extends BaseCommand<BackgroundGroupParams> {
  type: CommandType.BackgroundGroup;
}

export interface BackgroundCommand extends BaseCommand<BackgroundParams> {
  type: CommandType.Background;
}

export interface BackgroundSettingCommand extends BaseCommand<BackgroundSettingParams> {
  type: CommandType.BackgroundSetting;
}

export interface ActorGroupCommand extends BaseCommand<ActorGroupParams> {
  type: CommandType.ActorGroup;
}

export interface ActorMotionCommand extends BaseCommand<ActorMotionParams> {
  type: CommandType.ActorMotion;
}

export interface ActorFacialMotionCommand extends BaseCommand<ActorFacialMotionParams> {
  type: CommandType.ActorFacialMotion;
}

export interface ActorFacialOverrideMotionCommand extends BaseCommand<ActorFacialOverrideMotionParams> {
  type: CommandType.ActorFacialOverrideMotion;
}

export interface MessageCommand extends BaseCommand<MessageParams> {
  type: CommandType.Message;
}

export interface VoiceCommand extends BaseCommand<VoiceParams> {
  type: CommandType.Voice;
}

export interface CameraSettingCommand extends BaseCommand<CameraSettingParams> {
  type: CommandType.CameraSetting;
}

export interface FadeCommand extends BaseCommand<FadeParams> {
  type: CommandType.Fade;
}

export interface TransitionCommand extends BaseCommand<TransitionParams> {
  type: CommandType.Transition;
}

export interface BgmPlayCommand extends BaseCommand<BgmPlayParams> {
  type: CommandType.BgmPlay;
}

export interface BgmStopCommand extends BaseCommand<BgmStopParams> {
  type: CommandType.BgmStop;
}

export interface ShakeCommand extends BaseCommand<ShakeParams> {
  type: CommandType.Shake;
}

export interface ActorAdditiveMotionCommand extends BaseCommand<ActorAdditiveMotionParams> {
  type: CommandType.ActorAdditiveMotion;
}

export interface ActorLookTargetCommand extends BaseCommand<ActorLookTargetParams> {
  type: CommandType.ActorLookTarget;
}

export interface ActorLookTargetTweenCommand extends BaseCommand<ActorLookTargetTweenParams> {
  type: CommandType.ActorLookTargetTween;
}

export interface ActorEyeBlinkCommand extends BaseCommand<ActorEyeBlinkParams> {
  type: CommandType.ActorEyeBlink;
}

export interface ActorLightingCommand extends BaseCommand<ActorLightingParams> {
  type: CommandType.ActorLighting;
}

export interface DofCommand extends BaseCommand<DofParams> {
  type: CommandType.Dof;
}

export interface ColorEffectCommand extends BaseCommand<ColorEffectParams> {
  type: CommandType.ColorEffect;
}

export interface SeCommand extends BaseCommand<SeParams> {
  type: CommandType.Se;
}

/** 所有命令类型的联合 */
export type Command =
  | BackgroundGroupCommand
  | BackgroundCommand
  | BackgroundSettingCommand
  | ActorGroupCommand
  | ActorMotionCommand
  | ActorFacialMotionCommand
  | ActorFacialOverrideMotionCommand
  | ActorAdditiveMotionCommand
  | ActorLookTargetCommand
  | ActorLookTargetTweenCommand
  | ActorEyeBlinkCommand
  | ActorLightingCommand
  | MessageCommand
  | VoiceCommand
  | SeCommand
  | CameraSettingCommand
  | FadeCommand
  | TransitionCommand
  | DofCommand
  | ColorEffectCommand
  | BgmPlayCommand
  | BgmStopCommand
  | ShakeCommand
  | BaseCommand; // fallback for unknown types

// ============================================================================
// 脚本文件结构
// ============================================================================

/** ADV脚本文件 */
export interface ADVScript {
  /** 命令列表 */
  commands: Command[];
  /** 元数据 */
  metadata?: {
    /** 文件名 */
    filename?: string;
    /** 总时长（秒） */
    duration?: number;
    /** 命令总数 */
    totalCommands?: number;
    /** 对话消息数 */
    messageCount?: number;
  };
}

// ============================================================================
// 时间轴数据结构
// ============================================================================

/** 时间轴事件 */
export interface TimelineEvent {
  /** 时间戳（秒） */
  time: number;
  /** 事件类型 */
  type: string;
  /** 关联的命令 */
  command: Command;
  /** 持续时间 */
  duration?: number;
}

/** 时间轴轨道 */
export interface TimelineTrack {
  /** 轨道ID */
  id: string;
  /** 轨道名称 */
  name: string;
  /** 轨道类型 */
  type: "dialog" | "camera" | "actor" | "background" | "audio" | "layout" | "effect";
  /** 事件列表 */
  events: TimelineEvent[];
  /** 是否可见 */
  visible?: boolean;
  /** 是否锁定 */
  locked?: boolean;
}

/** 完整时间轴 */
export interface Timeline {
  /** 轨道列表 */
  tracks: TimelineTrack[];
  /** 总时长 */
  duration: number;
  /** 当前播放位置 */
  currentTime?: number;
}

// ============================================================================
// 解析和生成选项
// ============================================================================

/** 解析选项 */
export interface ParseOptions {
  /** 是否保留原始命令行 */
  preserveRawLine?: boolean;
  /** 是否自动解析嵌套的JSON字符串 */
  parseNestedJson?: boolean;
  /** 是否验证数据完整性 */
  validate?: boolean;
}

/** 生成选项 */
export interface GenerateOptions {
  /** 缩进类型 */
  indent?: "tab" | "space";
  /** 缩进大小 */
  indentSize?: number;
  /** 是否格式化输出 */
  formatted?: boolean;
  /** 是否添加注释 */
  comments?: boolean;
}

// ============================================================================
// 类型守卫工具
// ============================================================================

/** 检查是否为对话命令 */
export function isMessageCommand(cmd: Command): cmd is MessageCommand {
  return cmd.type === CommandType.Message;
}

/** 检查是否为相机命令 */
export function isCameraCommand(cmd: Command): cmd is CameraSettingCommand {
  return cmd.type === CommandType.CameraSetting;
}

/** 检查是否为角色动作命令 */
export function isActorMotionCommand(cmd: Command): cmd is ActorMotionCommand {
  return cmd.type === CommandType.ActorMotion;
}

/** 检查是否为语音命令 */
export function isVoiceCommand(cmd: Command): cmd is VoiceCommand {
  return cmd.type === CommandType.Voice;
}

/** 检查命令是否有时间轴数据 */
export function hasClip(cmd: Command): boolean {
  return cmd.clip !== null && cmd.clip.duration > 0;
}
