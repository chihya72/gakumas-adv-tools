/**
 * Unity ADV Script 数据模型定义 V2
 * 卡片流式布局编辑器类型系统
 */

// 导入原有类型（精简版）
export interface ClipData {
  startTime: number;
  duration: number;
  clipIn: number;
  easeInDuration: number;
  easeOutDuration: number;
  blendInDuration: number;
  blendOutDuration: number;
  mixInEaseType: number;
  mixOutEaseType?: number;
  timeScale: number;
}

export interface Transform3D {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface Transform2D {
  position: { x: number; y: number };
  scale: { x: number; y: number };
  angle: number;
}

// 命令类型枚举
export enum CommandType {
  BackgroundGroup = "backgroundgroup",
  Background = "background",
  BackgroundSetting = "backgroundsetting",
  BackgroundLayoutGroup = "backgroundlayoutgroup",
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
  CameraSetting = "camerasetting",
  Dialogue = "dialogue",
  Message = "message",
  Narration = "narration",
  ChoiceGroup = "choicegroup",
  Voice = "voice",
  BgmPlay = "bgmplay",
  BgmStop = "bgmstop",
  Se = "se",
  Fade = "fade",
  Transition = "transition",
  Shake = "shake",
  Dof = "dof",
  ColorEffect = "coloreffect",
  Timeline = "timeline",
}

// 基础命令接口
export interface BaseCommand {
  type: string;
  params: Record<string, any>;
  clip: ClipData | null;
  raw_line?: string;
  // 新增：文件位置信息，用于无 clip 时的排序
  filePosition?: number;
}

// ============================================================================
// 卡片相关类型
// ============================================================================

/** 卡片数据 - 对应一个命令 */
export interface CommandCard extends BaseCommand {
  /** 卡片唯一ID */
  id: string;
  /** 卡片显示标题 */
  title: string;
  /** 排序键 - 用于排序 */
  sortKey: number;
  /** 是否选中 */
  selected?: boolean;
  /** 是否高亮 */
  highlighted?: boolean;
  /** 是否已被编辑修改 */
  isModified?: boolean;
}

/** 卡片分组 - 按时间或类型分组 */
export interface CardGroup {
  /** 分组ID */
  id: string;
  /** 分组标题 */
  title: string;
  /** 分组开始时间（如果是时间分组） */
  startTime?: number;
  /** 分组结束时间（如果是时间分组） */
  endTime?: number;
  /** 卡片列表 */
  cards: CommandCard[];
}

/** 卡片过滤选项 */
export interface CardFilterOptions {
  /** 按命令类型过滤 */
  types?: CommandType[];
  /** 按时间范围过滤 */
  timeRange?: {
    start: number;
    end: number;
  };
  /** 搜索文本 */
  searchText?: string;
  /** 只显示有clip的命令 */
  onlyWithClip?: boolean;
}

/** 卡片排序选项 */
export interface CardSortOptions {
  /** 排序方式 */
  mode: "time" | "filePosition" | "type";
  /** 是否倒序 */
  reverse?: boolean;
}

// ============================================================================
// 工具函数
// ============================================================================

/** 从命令创建卡片 */
export function createCardFromCommand(
  command: BaseCommand,
  index: number
): CommandCard {
  // 计算排序键：有 clip 用 startTime，否则用文件位置
  const sortKey = command.clip
    ? command.clip.startTime
    : command.filePosition ?? index;

  // 生成标题
  const title = generateCardTitle(command);

  return {
    ...command,
    id: `card-${index}-${Date.now()}`,
    title,
    sortKey,
  };
}

/** 生成卡片标题 */
export function generateCardTitle(command: BaseCommand): string {
  const type = command.type;
  const params = command.params;

  switch (type) {
    case CommandType.Message:
    case 'message':
      return `💬 对话 - ${params.name || "未知"}: ${truncateText(params.text, 30)}`;
    case CommandType.Narration:
    case 'narration':
      return `📖 旁白: ${truncateText(params.text, 30)}`;
    case CommandType.ChoiceGroup:
    case 'choicegroup':
      // 尝试解析选项数量
      const choicesCount = (params.choices || '').split('|||').filter((c: string) => c.trim()).length;
      return `🔘 选项 (${choicesCount}个)`;
    case CommandType.Dialogue:
    case 'dialogue':
      // 兼容性处理：根据 params 判断具体类型
      if (params.name) return `💬 对话 - ${params.name}: ${truncateText(params.text, 30)}`;
      return `📖 旁白: ${truncateText(params.text, 30)}`;
    case CommandType.ActorGroup:
      // actors 字符串被 ||| 分隔，提取所有角色ID
      if (params.actors && typeof params.actors === 'string') {
        const actorSegments = params.actors.split('|||');
        const ids = actorSegments
          .map(seg => {
            const match = seg.match(/id=(\w+)/);
            return match ? match[1] : null;
          })
          .filter(id => id !== null);
        if (ids.length > 0) return `角色: ${ids.join(', ')}`;
      }
      return `角色: ${params.id || "未知"}`;
    case CommandType.Actor:
      return `角色: ${params.id || "未知"}`;
    case CommandType.ActorMotion:
      return `动作: ${params.id} - ${params.motion}`;
    case CommandType.ActorFacialMotion:
      return `表情: ${params.id} - ${params.motion}`;
    case CommandType.ActorFacialOverrideMotion:
      return `表情覆盖: ${params.id}`;
    case CommandType.CameraSetting:
      return `相机设置`;
    case CommandType.Background:
    case CommandType.BackgroundGroup:
      // 对于 backgroundgroup，需要从 backgrounds 字符串中提取所有背景 id
      if (params.backgrounds && typeof params.backgrounds === 'string') {
        const backgroundSegments = params.backgrounds.split('|||');
        const ids = backgroundSegments
          .map(seg => {
            const idMatch = seg.match(/id=(\S+)/);
            return idMatch ? idMatch[1] : null;
          })
          .filter(id => id !== null);
        if (ids.length > 0) return `背景: ${ids.join(', ')}`;
      }
      return `背景: ${params.id || params.src || "未知"}`;
    case CommandType.BackgroundSetting:
      // 2D 背景设置 - 显示位置信息
      try {
        const setting = params.setting ? JSON.parse(params.setting) : null;
        if (setting?.position) {
          const pos = setting.position;
          return `2D背景: ${params.id || '未知'} (${pos.x?.toFixed(1)}, ${pos.y?.toFixed(1)})`;
        }
      } catch (e) {
        // 解析失败，使用默认显示
      }
      return `2D背景设置: ${params.id || "未知"}`;
    case 'backgroundlayoutgroup':
      // 3D 背景布局组
      if (params.layouts && typeof params.layouts === 'string') {
        const idMatch = params.layouts.match(/id=(\w+)/);
        if (idMatch) return `3D背景布局: ${idMatch[1]}`;
      }
      return `3D背景布局`;
    case CommandType.Voice:
      return `语音: ${params.voice}`;
    case CommandType.BgmPlay:
      return `BGM: ${params.bgm}`;
    case CommandType.BgmStop:
      return `BGM停止`;
    case CommandType.Se:
      return `音效: ${params.se}`;
    case CommandType.Fade:
      const from = params.from !== undefined ? params.from : '?';
      const to = params.to !== undefined ? params.to : '?';
      return `淡入淡出: ${from} → ${to}`;
    case CommandType.Transition:
      const transitionName = params.transition ? params.transition.replace('ttn_adv_transition_', '') : '?';
      const transitionType = params.type || '?';
      const isEventType = params.transition === 'ttn_adv_transition_event_change' || params.transition === 'ttn_adv_transition_event_time';
      if (isEventType) {
        return `场景过渡: ${transitionName} (${transitionType})`;
      } else {
        const transitionChar = params.character || '(未选择)';
        return `场景过渡: ${transitionName} (${transitionType}) - ${transitionChar}`;
      }
    case CommandType.Shake:
      return `震动`;
    case CommandType.Dof:
      return `景深效果`;
    case CommandType.ColorEffect:
      return `色彩效果`;
    case 'actorlayoutgroup':
      // 从 layouts 字符串中提取角色ID
      if (params.layouts && typeof params.layouts === 'string') {
        const idMatch = params.layouts.match(/id=(\w+)/);
        if (idMatch) return `角色布局: ${idMatch[1]}`;
      }
      return `角色布局`;
    case 'actorlooktarget':
      return `视线目标: ${params.id || "未知"}`;
    default:
      return `${type}`;
  }
}

/** 截断文本 */
function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/** 按排序选项排序卡片 */
export function sortCards(
  cards: CommandCard[],
  options: CardSortOptions
): CommandCard[] {
  // 分离出 backgroundgroup 和 actorgroup
  const backgroundCards = cards.filter(card => card.type === 'backgroundgroup');
  const actorGroupCards = cards.filter(card => card.type === 'actorgroup');
  const otherCards = cards.filter(card => card.type !== 'backgroundgroup' && card.type !== 'actorgroup');

  // 对其他卡片进行排序
  const sorted = [...otherCards];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (options.mode) {
      case "time":
        // 有 clip 的按 startTime 排，没有的按 filePosition 排
        const aTime = a.clip?.startTime ?? a.filePosition ?? 0;
        const bTime = b.clip?.startTime ?? b.filePosition ?? 0;
        comparison = aTime - bTime;
        break;

      case "filePosition":
        // 按文件位置排序
        comparison = (a.filePosition ?? 0) - (b.filePosition ?? 0);
        break;

      case "type":
        // 按类型排序
        comparison = a.type.localeCompare(b.type);
        break;
    }

    return options.reverse ? -comparison : comparison;
  });

  // 合并结果: backgroundgroup 在第一个，actorgroup 在第二个，其他按排序顺序
  return [...backgroundCards, ...actorGroupCards, ...sorted];
}

/** 过滤卡片 */
export function filterCards(
  cards: CommandCard[],
  options: CardFilterOptions
): CommandCard[] {
  return cards.filter((card) => {
    // 按类型过滤
    if (options.types && options.types.length > 0) {
      if (!options.types.includes(card.type as CommandType)) {
        return false;
      }
    }

    // 按时间范围过滤
    if (options.timeRange && card.clip) {
      const { start, end } = options.timeRange;
      if (card.clip.startTime < start || card.clip.startTime > end) {
        return false;
      }
    }

    // 只显示有 clip 的
    if (options.onlyWithClip && !card.clip) {
      return false;
    }

    // 搜索文本
    if (options.searchText && options.searchText.trim()) {
      const searchLower = options.searchText.toLowerCase();
      const titleMatch = card.title.toLowerCase().includes(searchLower);
      const typeMatch = card.type.toLowerCase().includes(searchLower);
      const paramsMatch = JSON.stringify(card.params)
        .toLowerCase()
        .includes(searchLower);
      
      if (!titleMatch && !typeMatch && !paramsMatch) {
        return false;
      }
    }

    return true;
  });
}

/** 按时间分组卡片 */
export function groupCardsByTime(
  cards: CommandCard[],
  intervalSeconds: number = 5
): CardGroup[] {
  if (cards.length === 0) return [];

  // 按 sortKey 排序
  const sorted = sortCards(cards, { mode: "time" });

  const groups: CardGroup[] = [];
  let currentGroup: CardGroup | null = null;

  for (const card of sorted) {
    const cardTime = card.clip?.startTime ?? card.filePosition ?? 0;
    const groupIndex = Math.floor(cardTime / intervalSeconds);
    const groupStart = groupIndex * intervalSeconds;
    const groupEnd = groupStart + intervalSeconds;

    if (!currentGroup || currentGroup.startTime !== groupStart) {
      currentGroup = {
        id: `group-${groupStart}`,
        title: formatTimeRange(groupStart, groupEnd),
        startTime: groupStart,
        endTime: groupEnd,
        cards: [],
      };
      groups.push(currentGroup);
    }

    currentGroup.cards.push(card);
  }

  return groups;
}

/** 格式化时间范围 */
function formatTimeRange(start: number, end: number): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/** 格式化时间 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

/** 获取命令的图标 */
export function getCommandIcon(type: string): string {
  return "";
}

/** 获取命令的颜色类别 */
export function getCommandColorClass(type: string): string {
  if (type === CommandType.Message) return "message";
  if (type.startsWith("actor")) return "actor";
  if (type.startsWith("background")) return "background";
  if (type === CommandType.CameraSetting) return "camera";
  if (type.startsWith("bgm") || type === CommandType.Voice || type === CommandType.Se) return "audio";
  return "effect";
}
