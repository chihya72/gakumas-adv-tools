/**
 * TXT脚本解析器
 * 直接解析Unity ADV脚本的.txt格式文件
 * 移植自Python parser.py
 */

import type { Command, ClipData, ADVScript } from '../types/adv-script';

/**
 * 从JSON字符串解析ClipData
 */
function parseClipData(jsonStr: string): ClipData | null {
  try {
    const data = JSON.parse(jsonStr);
    return {
      startTime: data._startTime !== undefined ? data._startTime : 0.0,
      duration: data._duration !== undefined ? data._duration : 0.0,
      clipIn: data._clipIn,
      easeInDuration: data._easeInDuration !== undefined ? data._easeInDuration : 0.0,
      easeOutDuration: data._easeOutDuration !== undefined ? data._easeOutDuration : 0.0,
      blendInDuration: data._blendInDuration !== undefined ? data._blendInDuration : -1.0,
      blendOutDuration: data._blendOutDuration !== undefined ? data._blendOutDuration : -1.0,
      mixInEaseType: data._mixInEaseType,
      mixOutEaseType: data._mixOutEaseType,
      mixInCurve: data._mixInCurve,
      mixOutCurve: data._mixOutCurve,
      timeScale: data._timeScale !== undefined ? data._timeScale : 1.0,
    };
  } catch {
    // 静默失败，返回null
    return null;
  }
}

/**
 * 提取结构化值（JSON对象或数组）
 * @returns [提取的值, 消耗的字符数]
 */
function extractStructuredValue(text: string, start: number): [string, number] {
  if (start >= text.length) {
    return ["", 0];
  }

  // 处理转义的JSON（\{ 和 \}）
  if (text.substring(start, start + 2) === '\\{' || text.substring(start, start + 2) === '\\[') {
    const openChar = text[start + 1];
    const closeChar = openChar === '{' ? '}' : ']';
    let depth = 0;
    let i = start;
    const result: string[] = [];

    while (i < text.length) {
      if (i + 1 < text.length && text[i] === '\\') {
        const nextChar = text[i + 1];
        if (nextChar && '{}[]'.includes(nextChar)) {
          // 转义的括号，去掉反斜杠
          result.push(nextChar);
          if (nextChar === openChar) {
            depth += 1;
          } else if (nextChar === closeChar) {
            depth -= 1;
            if (depth === 0) {
              return [result.join(''), i + 2 - start];
            }
          }
          i += 2;
        } else if (nextChar === '"') {
          // 转义的引号，保留为正常引号（JSON需要）
          result.push('"');
          i += 2;
        } else if (nextChar && 'rn'.includes(nextChar)) {
          // \r \n 保留转义
          result.push('\\');
          result.push(nextChar);
          i += 2;
        } else {
          // 其他转义，保留
          const currentChar = text[i];
          if (currentChar) result.push(currentChar);
          if (nextChar) result.push(nextChar);
          i += 2;
        }
      } else {
        // 未转义的字符（包括未转义的括号）
        const char = text[i];
        if (char) result.push(char);
        // 未转义的括号也需要计入深度
        if (char === openChar) {
          depth += 1;
        } else if (char === closeChar) {
          depth -= 1;
          if (depth === 0) {
            return [result.join(''), i + 1 - start];
          }
        }
        i += 1;
      }
    }

    return [result.join(''), text.length - start];
  }
  // 普通的JSON（未转义）
  else if (start < text.length && '{['.includes(text[start]!)) {
    const openChar = text[start]!;
    const closeChar = openChar === '{' ? '}' : ']';
    let depth = 0;
    let i = start;

    while (i < text.length) {
      if (text[i] === '\\') {
        i += 2; // 跳过转义字符
        continue;
      } else if (text[i] === openChar) {
        depth += 1;
      } else if (text[i] === closeChar) {
        depth -= 1;
        if (depth === 0) {
          return [text.substring(start, i + 1), i + 1 - start];
        }
      }
      i += 1;
    }

    return [text.substring(start), text.length - start];
  }

  return ["", 0];
}

/**
 * 解析参数字符串
 */
function parseParams(paramsStr: string): Record<string, any> {
  const params: Record<string, any> = {};

  // 找到所有参数名的位置（必须是空格或开头+参数名+等号的模式）
  // 但要排除嵌套在括号内的参数
  const paramPositions: Array<[number, string]> = [];

  // 第一个参数可能在字符串开头
  const firstMatch = /^(\w+)=/.exec(paramsStr);
  if (firstMatch && firstMatch[1]) {
    paramPositions.push([0, firstMatch[1]]);
  }

  // 后续参数必须在空格之后，且不在括号嵌套内
  let depth = 0;
  let escapeNext = false;
  
  for (let i = 0; i < paramsStr.length; i++) {
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    const char = paramsStr[i];
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    // 跟踪括号深度
    if (char === '[' || char === '{') {
      depth++;
    } else if (char === ']' || char === '}') {
      depth--;
    }
    
    // 只在顶层（depth=0）查找参数
    if (depth === 0 && /\s/.test(char || '')) {
      // 检查空格后是否跟着参数名=
      const remaining = paramsStr.substring(i + 1);
      const match = /^(\w+)=/.exec(remaining);
      if (match && match[1]) {
        paramPositions.push([i + 1, match[1]]);
      }
    }
  }

  // 如果没有参数，返回空字典
  if (paramPositions.length === 0) {
    return params;
  }

  // 解析每个参数
  for (let idx = 0; idx < paramPositions.length; idx++) {
    const paramInfo = paramPositions[idx];
    if (!paramInfo) continue;
    
    const [pos, key] = paramInfo;

    // 找到等号后的位置
    const equalPos = paramsStr.indexOf('=', pos) + 1;

    // 先检查是否是结构化值（JSON对象或数组）
    let valueStart = equalPos;
    while (valueStart < paramsStr.length) {
      const ch = paramsStr[valueStart];
      if (ch && /\s/.test(ch)) {
        valueStart += 1;
      } else {
        break;
      }
    }

    // 如果是结构化值，使用 extractStructuredValue 来确定真实长度
    let isStructured = false;
    if (valueStart < paramsStr.length) {
      // 先检查转义的括号（双字符）
      const twoChars = paramsStr.substring(valueStart, valueStart + 2);
      if (twoChars === '\\{' || twoChars === '\\[') {
        isStructured = true;
      }
      // 再检查普通括号（单字符）
      else {
        const ch = paramsStr[valueStart];
        if (ch && '{['.includes(ch)) {
          isStructured = true;
        }
      }
    }

    let value: string;
    
    if (isStructured) {
      const [extractedValue] = extractStructuredValue(paramsStr, valueStart);
      value = extractedValue;
    } else {
      // 普通值：确定值的结束位置
      if (idx < paramPositions.length - 1) {
        // 下一个参数之前的位置（不包括前导空格）
        const nextParam = paramPositions[idx + 1];
        if (nextParam) {
          let nextParamStart = nextParam[0];
          // 回溯找到非空白字符的位置
          let endPos = nextParamStart;
          while (endPos > equalPos) {
            const ch = paramsStr[endPos - 1];
            if (ch && /\s/.test(ch)) {
              endPos -= 1;
            } else {
              break;
            }
          }
          value = paramsStr.substring(equalPos, endPos);
        } else {
          value = paramsStr.substring(equalPos).trim();
        }
      } else {
        value = paramsStr.substring(equalPos).trim();
      }
    }

    // 处理重复的参数名：将它们收集到数组中
    if (key in params) {
      // 已经存在这个key
      const existing = params[key];
      if (Array.isArray(existing)) {
        // 已经是数组，追加新值
        existing.push(value);
      } else {
        // 转换为数组
        params[key] = [existing, value];
      }
    } else {
      // 第一次出现，直接赋值
      params[key] = value;
    }
  }

  return params;
}

/**
 * ADV脚本解析器
 */
export class TXTParser {
  private commands: Command[] = [];

  /**
   * 解析TXT文件内容
   */
  parseContent(content: string): Command[] {
    this.commands = [];

    // 手动查找所有命令（正确处理嵌套括号）
    let i = 0;
    while (i < content.length) {
      if (content[i] === '[') {
        // 找到命令开始
        i += 1;

        // 提取命令类型（到第一个空格或]）
        const commandStart = i;
        while (i < content.length) {
          const ch = content[i];
          if (ch && !' \t\n\r]'.includes(ch)) {
            i += 1;
          } else {
            break;
          }
        }
        const commandType = content.substring(commandStart, i);

        // 跳过空白
        while (i < content.length) {
          const ch = content[i];
          if (ch && ' \t\n\r'.includes(ch)) {
            i += 1;
          } else {
            break;
          }
        }

        // 提取参数直到找到匹配的]
        const paramsStart = i;
        let depth = 1; // 已经遇到了开头的[
        let escapeNext = false;

        while (i < content.length && depth > 0) {
          if (escapeNext) {
            escapeNext = false;
            i += 1;
            continue;
          }

          const char = content[i];
          if (char === '\\') {
            escapeNext = true;
          } else if (char === '[') {
            depth += 1;
          } else if (char === ']') {
            depth -= 1;
            if (depth === 0) {
              // 找到匹配的结束]
              const paramsStr = content.substring(paramsStart, i).trim();

              // 解析参数
              const params = parseParams(paramsStr);

              // 提取clip数据
              let clipData: ClipData | null = null;
              if ('clip' in params) {
                const clipStr = params.clip;
                delete params.clip;
                clipData = parseClipData(clipStr);
              }

              const command: Command = {
                type: commandType,
                params: params,
                clip: clipData,
              };

              this.commands.push(command);
              break;
            }
          }
          i += 1;
        }
      } else {
        i += 1;
      }
    }

    return this.commands;
  }

  /**
   * 获取时间轴摘要
   */
  getTimelineSummary(): {
    totalCommands: number;
    duration: number;
    commandTypes: Record<string, number>;
    hasTimeline: boolean;
  } {
    if (this.commands.length === 0) {
      return { totalCommands: 0, duration: 0, commandTypes: {}, hasTimeline: false };
    }

    const commandsWithTime = this.commands.filter(cmd => cmd.clip);

    if (commandsWithTime.length === 0) {
      return {
        totalCommands: this.commands.length,
        duration: 0,
        commandTypes: {},
        hasTimeline: false,
      };
    }

    const maxTime = Math.max(
      ...commandsWithTime.map(cmd => (cmd.clip!.startTime + cmd.clip!.duration))
    );

    // 统计命令类型
    const typeCounts: Record<string, number> = {};
    for (const cmd of this.commands) {
      typeCounts[cmd.type] = (typeCounts[cmd.type] || 0) + 1;
    }

    return {
      totalCommands: this.commands.length,
      duration: maxTime,
      commandTypes: typeCounts,
      hasTimeline: commandsWithTime.length > 0,
    };
  }

  /**
   * 导出为ADVScript格式
   */
  exportToADVScript(filename: string): ADVScript {
    const summary = this.getTimelineSummary();
    const messageCount = this.commands.filter(cmd => cmd.type === 'message').length;

    return {
      commands: this.commands,
      metadata: {
        filename,
        totalCommands: summary.totalCommands,
        duration: summary.duration,
        messageCount,
      },
    };
  }
}

/**
 * 从TXT文件内容解析ADV脚本
 */
export function parseTXTContent(content: string, filename: string): ADVScript {
  const parser = new TXTParser();
  parser.parseContent(content);
  return parser.exportToADVScript(filename);
}
