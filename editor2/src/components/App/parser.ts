import { BaseCommand } from '../../types/command-card';

// ============================================================================
// Clip 处理相关函数 - 职责分离
// ============================================================================

/**
 * 从字符串中提取 clip JSON 字符串
 * @param paramsAndClip 包含参数和clip的字符串
 * @returns { clipStr: 原始JSON字符串, remainingParams: 移除clip后的参数字符串 }
 */
function extractClipString(paramsAndClip: string): { clipStr: string; remainingParams: string } {
  // 查找 clip= 并提取完整的 JSON（支持嵌套大括号）
  const clipMatch = paramsAndClip.match(/clip=\\?\{/);
  if (!clipMatch) {
    return { clipStr: '', remainingParams: paramsAndClip };
  }

  const clipStartIndex = clipMatch.index!;
  const afterClipEquals = paramsAndClip.substring(clipStartIndex + 5); // 跳过 "clip="
  
  // 从 clip= 后面开始，找到完整的 JSON
  // 计数转义的大括号 \{ 和 \}
  let depth = 0;
  let jsonEndIndex = -1;
  
  for (let i = 0; i < afterClipEquals.length; i++) {
    if (afterClipEquals[i] === '\\' && i + 1 < afterClipEquals.length) {
      if (afterClipEquals[i + 1] === '{') {
        depth++;
        i++; // 跳过 {
      } else if (afterClipEquals[i + 1] === '}') {
        depth--;
        if (depth === 0) {
          jsonEndIndex = i + 1; // 包含 }
          break;
        }
        i++; // 跳过 }
      }
    }
  }
  
  if (jsonEndIndex === -1) {
    return { clipStr: '', remainingParams: paramsAndClip };
  }

  // 提取完整的 clip JSON 字符串（包含 \{ ... \}）
  const rawClipJson = afterClipEquals.substring(0, jsonEndIndex + 1);
  // 移除所有转义符
  const clipStr = rawClipJson.replace(/\\/g, '');
  
  // 从 paramsAndClip 中移除整个 clip=\{...\} 部分
  const clipFullLength = 5 + jsonEndIndex + 1; // "clip=" + JSON
  const beforeClip = paramsAndClip.substring(0, clipStartIndex);
  const afterClip = paramsAndClip.substring(clipStartIndex + clipFullLength);
  const remainingParams = (beforeClip + afterClip).trim();

  return { clipStr, remainingParams };
}

/**
 * 解析 clip JSON 字符串为对象
 * @param clipStr JSON 字符串
 * @param commandType 命令类型（用于日志）
 * @returns 解析后的 clip 对象，失败返回 null
 */
function parseClipJson(clipStr: string, commandType: string): any | null {
  if (!clipStr) return null;

  try {
    return JSON.parse(clipStr);
  } catch (e) {
    console.warn(`解析 ${commandType} 的 clip JSON 失败:`, e);
    return null;
  }
}

/**
 * 规范化 clip 数据格式
 * @param clipData 原始 clip 数据对象
 * @returns 规范化后的 clip 对象
 */
function normalizeClipData(clipData: any): any {
  // 基础格式（9个通用属性）
  const clip: any = {
    startTime: clipData._startTime ?? 0,
    duration: clipData._duration ?? 0,
    easeInDuration: clipData._easeInDuration ?? 0,
    easeOutDuration: clipData._easeOutDuration ?? 0,
    blendInDuration: clipData._blendInDuration ?? -1,
    blendOutDuration: clipData._blendOutDuration ?? -1,
    mixInEaseType: clipData._mixInEaseType ?? 1,
    mixOutEaseType: clipData._mixOutEaseType ?? 1,
    timeScale: clipData._timeScale ?? 1.0,
  };
  
  // 扩展格式（额外的3个属性）
  if (clipData._clipIn !== undefined) {
    clip.clipIn = clipData._clipIn;
  }
  if (clipData._mixInCurve !== undefined) {
    clip.mixInCurve = clipData._mixInCurve;
  }
  if (clipData._mixOutCurve !== undefined) {
    clip.mixOutCurve = clipData._mixOutCurve;
  }

  return clip;
}

/**
 * 从字符串中提取并解析 clip（整合函数）
 * @param paramsAndClip 包含参数和clip的字符串
 * @param commandType 命令类型
 * @returns { clip: 解析后的clip对象, paramsStr: 移除clip后的参数字符串 }
 */
function extractAndParseClip(paramsAndClip: string, commandType: string): { clip: any; paramsStr: string } {
  const { clipStr, remainingParams } = extractClipString(paramsAndClip);
  const clipData = parseClipJson(clipStr, commandType);
  const clip = clipData ? normalizeClipData(clipData) : null;

  return { clip, paramsStr: remainingParams };
}

// ADV 脚本解析器 - 解析方括号格式的命令
export function parseAdvScript(content: string): BaseCommand[] {
  const commands: BaseCommand[] = [];
  let lineIndex = 0;

  // 手动解析命令，处理嵌套的方括号
  let pos = 0;
  while (pos < content.length) {
    // 查找下一个 [
    const openBracket = content.indexOf('[', pos);
    if (openBracket === -1) break;
    
    // 从 [ 后面找到命令类型
    const afterOpen = content.substring(openBracket + 1);
    const typeMatch = afterOpen.match(/^(\w+)\s+/);
    if (!typeMatch) {
      pos = openBracket + 1;
      continue;
    }
    
    const commandType = typeMatch[1];
    const paramsStart = openBracket + 1 + typeMatch[0].length;
    
    // 找到匹配的 ]，需要处理嵌套的 []
    let depth = 1;
    let i = paramsStart;
    let closeBracket = -1;
    
    while (i < content.length && depth > 0) {
      if (content[i] === '[') {
        depth++;
      } else if (content[i] === ']') {
        depth--;
        if (depth === 0) {
          closeBracket = i;
          break;
        }
      }
      i++;
    }
    
    if (closeBracket === -1) {
      pos = openBracket + 1;
      continue;
    }
    
    const paramsAndClip = content.substring(paramsStart, closeBracket);
    const fullMatch = content.substring(openBracket, closeBracket + 1);
    
    try {
      // 提取并解析 clip
      const { paramsStr, clip } = extractAndParseClip(paramsAndClip, commandType);

      // 解析参数
      const params: Record<string, any> = {};
      
      // 特殊处理：对于 actorgroup 的 actors 参数
      if (commandType === 'actorgroup') {
        const allActors: string[] = [];
        let i = 0;
        
        while (i < paramsStr.length) {
          const actorIndex = paramsStr.indexOf('actors=[', i);
          if (actorIndex === -1) break;
          
          let start = actorIndex + 'actors=['.length;
          let depth = 1;
          let end = start;
          
          while (end < paramsStr.length && depth > 0) {
            if (paramsStr[end] === '[') depth++;
            else if (paramsStr[end] === ']') depth--;
            end++;
          }
          
          if (depth === 0) {
            const actorContent = paramsStr.substring(start, end - 1);
            allActors.push(actorContent);
          }
          
          i = end;
        }
        
        if (allActors.length > 0) {
          params['actors'] = allActors.join('|||');
        }
      } else if (commandType === 'backgroundgroup') {
        // 特殊处理：对于 backgroundgroup 的 backgrounds 参数
        const allBackgrounds: string[] = [];
        let i = 0;
        
        while (i < paramsStr.length) {
          const bgIndex = paramsStr.indexOf('backgrounds=[', i);
          if (bgIndex === -1) break;
          
          let start = bgIndex + 'backgrounds=['.length;
          let depth = 1;
          let end = start;
          
          while (end < paramsStr.length && depth > 0) {
            if (paramsStr[end] === '[') depth++;
            else if (paramsStr[end] === ']') depth--;
            end++;
          }
          
          if (depth === 0) {
            const bgContent = paramsStr.substring(start, end - 1);
            allBackgrounds.push(bgContent);
          }
          
          i = end;
        }
        
        if (allBackgrounds.length > 0) {
          params['backgrounds'] = allBackgrounds.join('|||');
        }
      } else if (commandType === 'actorlayoutgroup' || commandType === 'backgroundlayoutgroup') {
        // 特殊处理：对于 actorlayoutgroup 和 backgroundlayoutgroup 的 layouts 参数
        const allLayouts: string[] = [];
        let i = 0;
        
        while (i < paramsStr.length) {
          const layoutIndex = paramsStr.indexOf('layouts=[', i);
          if (layoutIndex === -1) break;
          
          let start = layoutIndex + 'layouts=['.length;
          let depth = 1;
          let end = start;
          
          while (end < paramsStr.length && depth > 0) {
            if (paramsStr[end] === '[') depth++;
            else if (paramsStr[end] === ']') depth--;
            end++;
          }
          
          if (depth === 0) {
            const layoutContent = paramsStr.substring(start, end - 1);
            allLayouts.push(layoutContent);
          }
          
          i = end;
        }
        
        if (allLayouts.length > 0) {
          params['layouts'] = allLayouts.join('|||');
        }
        
        // 不再解析其他参数，因为 layouts 后面通常只有 clip
        // 如果有其他参数（如 reset），需要单独处理
      } else if (commandType === 'message' || commandType === 'select') {
        // 特殊处理：对于 message 和 select 的 text 参数（可能包含空格）
        const textMatch = paramsStr.match(/text=(.+?)(?:\s+\w+=|\s+clip=|$)/);
        if (textMatch) {
          params['text'] = textMatch[1].trim();
        }
        
        // 解析其他参数
        const paramRegex = /(\w+)=(?:([^\s\[\]]+)|\[([^\]]*)\])/g;
        let paramMatch;
        
        while ((paramMatch = paramRegex.exec(paramsStr)) !== null) {
          const [, key, simpleValue, nestedValue] = paramMatch;
          if (key === 'text') continue; // 跳过text，已经特殊处理
          
          let value = simpleValue || nestedValue || '';
          
          // 处理转义的 JSON 字符串
          if (value.startsWith('\\{')) {
            value = value.replace(/\\/g, '');
          }
          
          params[key] = value;
        }
      } else {
        // 通用参数解析
        // 找到所有参数名的位置
        const paramNames: Array<{ index: number; name: string }> = [];
        const paramNameRegex = /(\w+)=/g;
        let match;
        
        while ((match = paramNameRegex.exec(paramsStr)) !== null) {
          paramNames.push({ index: match.index, name: match[1] });
        }
        
        // 为每个参数提取值
        for (let i = 0; i < paramNames.length; i++) {
          const { index, name } = paramNames[i];
          const valueStart = index + name.length + 1; // 跳过 "name="
          const nextParamIndex = i + 1 < paramNames.length ? paramNames[i + 1].index : paramsStr.length;
          
          let value = paramsStr.substring(valueStart, nextParamIndex).trim();
          
          // 处理转义的 JSON 字符串（\{ ... \}）
          if (value.startsWith('\\{')) {
            // 提取完整的转义 JSON
            let depth = 0;
            let jsonEnd = 0;
            
            for (let j = 0; j < value.length; j++) {
              if (j + 1 < value.length && value[j] === '\\') {
                if (value[j + 1] === '{') {
                  depth++;
                  j++; // 跳过 {
                } else if (value[j + 1] === '}') {
                  depth--;
                  if (depth === 0) {
                    jsonEnd = j + 2; // 包含 \}
                    break;
                  }
                  j++; // 跳过 }
                }
              }
            }
            
            if (jsonEnd > 0) {
              value = value.substring(0, jsonEnd).replace(/\\/g, '');
            }
          }
          
          params[name] = value;
        }
      }

      commands.push({
        type: commandType.toLowerCase(),
        params,
        clip,
        raw_line: fullMatch,
        filePosition: lineIndex++,
      });
    } catch (e) {
      console.error('解析命令出错:', e);
    }
    
    // 移动到下一个位置
    pos = closeBracket + 1;
  }

  console.log(`总共解析了 ${commands.length} 个命令`);
  console.log(`有 clip 的命令:`, commands.filter(c => c.clip).length);
  return commands;
}
