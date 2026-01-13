import { CommandCard } from '../../types/command-card';

/**
 * 将命令卡片序列化为ADV脚本文本
 */

/**
 * 序列化 clip 数据为 JSON 字符串
 * 关键：使用自定义序列化来确保反斜杠转义与原始格式一致
 * 同时保持数字格式（如 0.0 而不是 0）
 */
function serializeClipToJson(clip: any): string {
  if (!clip) return '';

  // 构建 clip 对象，确保字段顺序和原始格式一致
  const clipObj: any = {
    _startTime: clip.startTime ?? 0,
    _duration: clip.duration ?? 0,
  };

  // 如果有 clipIn，添加在第3个位置
  if (clip.clipIn !== undefined) {
    clipObj._clipIn = clip.clipIn;
  }

  // 继续添加其他标准字段
  clipObj._easeInDuration = clip.easeInDuration ?? 0;
  clipObj._easeOutDuration = clip.easeOutDuration ?? 0;
  clipObj._blendInDuration = clip.blendInDuration ?? -1;
  clipObj._blendOutDuration = clip.blendOutDuration ?? -1;
  clipObj._mixInEaseType = clip.mixInEaseType ?? 1;

  // 如果有 mixInCurve，添加
  if (clip.mixInCurve !== undefined) {
    clipObj._mixInCurve = clip.mixInCurve;
  }

  // 如果有 mixOutEaseType，添加
  if (clip.mixOutEaseType !== undefined) {
    clipObj._mixOutEaseType = clip.mixOutEaseType;
  }

  // 如果有 mixOutCurve，添加
  if (clip.mixOutCurve !== undefined) {
    clipObj._mixOutCurve = clip.mixOutCurve;
  }

  clipObj._timeScale = clip.timeScale ?? 1.0;

  // 使用 JSON.stringify 生成 JSON 字符串
  let jsonStr = JSON.stringify(clipObj);
  
  // 修复数字格式：将所有整数转换为浮点数形式
  // 0 -> 0.0, -1 -> -1.0, 1 -> 1.0, 2 -> 2.0 等
  // 但不影响已经是小数的数字
  jsonStr = jsonStr.replace(/:(-?\d+)([,\}])/g, (_match, num, after) => {
    return `:${num}.0${after}`;
  });
  
  // 转义：为 JSON 中的 { 和 } 添加反斜杠
  // 注意：只转义大括号，不转义其他字符
  const escapedJson = jsonStr.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
  
  return escapedJson;
}

/**
 * 序列化嵌套的 JSON 参数（如 setting, transform 等）
 * 与 clip 类似，需要转义大括号，但不转义引号
 */
function serializeJsonParam(obj: any): string {
  if (!obj) return '';
  
  let jsonStr = JSON.stringify(obj);
  
  // 修复数字格式：将所有整数转换为浮点数形式
  jsonStr = jsonStr.replace(/:(-?\d+)([,\}])/g, (_match, num, after) => {
    return `:${num}.0${after}`;
  });
  
  // 只转义大括号，不转义引号
  const escapedJson = jsonStr.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
  
  return escapedJson;
}

/**
 * 序列化单个命令卡片为 ADV 命令字符串
 */
export function serializeCommand(card: CommandCard): string {
  // 命令类型
  const commandType = card.type;
  
  // 序列化参数
  const paramParts: string[] = [];
  
  // 特殊处理 backgroundgroup 的 backgrounds 参数
  if (commandType === 'backgroundgroup' && card.params.backgrounds) {
    const backgroundsStr = card.params.backgrounds;
    const backgrounds = backgroundsStr.split('|||');
    
    backgrounds.forEach((bg: string) => {
      // 每个 background 项应该已经是格式化的字符串，如 "background id=entrance src=..."
      paramParts.push(`backgrounds=[${bg}]`);
    });
  }
  // 特殊处理 actorgroup 的 actors 参数
  else if (commandType === 'actorgroup' && card.params.actors) {
    const actorsStr = card.params.actors;
    const actors = actorsStr.split('|||');
    
    actors.forEach((actor: string) => {
      // 每个 actor 项应该已经是格式化的字符串，如 "actor id=amao body=..."
      paramParts.push(`actors=[${actor}]`);
    });
  }
  // 特殊处理 actorlayoutgroup 和 backgroundlayoutgroup 的 layouts 参数
  else if ((commandType === 'actorlayoutgroup' || commandType === 'backgroundlayoutgroup') && card.params.layouts) {
    const layoutsStr = card.params.layouts;
    const layouts = layoutsStr.split('|||');
    
    layouts.forEach((layout: string) => {
      // 每个 layout 项应该已经是格式化的字符串
      paramParts.push(`layouts=[${layout}]`);
    });
    
    // 处理其他参数（如 reset）
    for (const [key, value] of Object.entries(card.params)) {
      if (key === 'layouts') continue; // 已处理
      if (value === null || value === undefined || value === '') continue;
      
      if (typeof value === 'string') {
        paramParts.push(`${key}=${value}`);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        paramParts.push(`${key}=${value}`);
      }
    }
  }
  // 通用参数处理
  else {
    // 遍历所有参数
    for (const [key, value] of Object.entries(card.params)) {
      if (value === null || value === undefined || value === '') continue;
      
      // 处理不同类型的参数
      if (typeof value === 'string') {
        // 检查是否是 JSON 字符串（未转义的）
        if (value.startsWith('{') && value.endsWith('}')) {
          try {
            // 验证是否是有效的 JSON
            JSON.parse(value);
            // 如果是有效的 JSON，需要转义大括号
            const escapedJson = value.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
            paramParts.push(`${key}=${escapedJson}`);
          } catch {
            // 不是有效的 JSON，直接使用
            paramParts.push(`${key}=${value}`);
          }
        } else {
          paramParts.push(`${key}=${value}`);
        }
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        paramParts.push(`${key}=${value}`);
      } else if (typeof value === 'object') {
        // 对象类型参数（如 setting, transform 等）需要序列化为 JSON
        const jsonStr = serializeJsonParam(value);
        paramParts.push(`${key}=${jsonStr}`);
      }
    }
  }
  
  // 如果有 clip，添加 clip 参数
  if (card.clip) {
    const clipStr = serializeClipToJson(card.clip);
    paramParts.push(`clip=${clipStr}`);
  }
  
  // 组合完整命令
  const fullCommand = `[${commandType} ${paramParts.join(' ')}]`;
  
  return fullCommand;
}

/**
 * 将多个命令卡片序列化为完整的 ADV 脚本文本
 * @param cards 命令卡片数组（保持编辑器中的当前顺序）
 * @returns ADV 脚本文本
 */
export function serializeScript(cards: CommandCard[]): string {
  // 直接使用当前编辑器中的卡片顺序，不重新排序
  // 序列化每个命令
  const lines = cards.map(card => serializeCommand(card));
  
  // 在末尾添加 [timeline] 命令
  lines.push('[timeline]');
  
  // 用换行符连接
  return lines.join('\n');
}

/**
 * 导出脚本为文本文件
 * @param cards 命令卡片数组
 * @param filename 文件名
 */
export function exportScriptToFile(cards: CommandCard[], filename: string = 'export.txt') {
  const scriptText = serializeScript(cards);
  
  // 创建 Blob 对象，UTF-8 无 BOM
  const blob = new Blob([scriptText], { type: 'text/plain;charset=utf-8' });
  
  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // 触发下载
  document.body.appendChild(link);
  link.click();
  
  // 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
