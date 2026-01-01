/**
 * ADV脚本数据解析工具
 * 处理嵌套JSON字符串的解析和转换
 */

import type {
  CameraSetting,
  Transform3D,
  Transform2D,
  FacialOverrideSetting,
  ShakeSetting,
} from './adv-script';

export class ADVDataParser {
  /**
   * 解析相机设置JSON字符串
   */
  static parseCameraSetting(jsonStr: string): CameraSetting {
    try {
      return JSON.parse(jsonStr) as CameraSetting;
    } catch (error) {
      console.error('Failed to parse camera setting:', error);
      throw new Error(`Invalid camera setting JSON: ${jsonStr}`);
    }
  }

  /**
   * 解析3D变换JSON字符串
   */
  static parseTransform3D(jsonStr: string): Transform3D {
    try {
      return JSON.parse(jsonStr) as Transform3D;
    } catch (error) {
      console.error('Failed to parse 3D transform:', error);
      throw new Error(`Invalid transform JSON: ${jsonStr}`);
    }
  }

  /**
   * 解析2D变换JSON字符串
   */
  static parseTransform2D(jsonStr: string): Transform2D {
    try {
      return JSON.parse(jsonStr) as Transform2D;
    } catch (error) {
      console.error('Failed to parse 2D transform:', error);
      throw new Error(`Invalid transform JSON: ${jsonStr}`);
    }
  }

  /**
   * 解析面部覆盖设置JSON字符串
   */
  static parseFacialOverrideSetting(jsonStr: string): FacialOverrideSetting {
    try {
      return JSON.parse(jsonStr) as FacialOverrideSetting;
    } catch (error) {
      console.error('Failed to parse facial override setting:', error);
      throw new Error(`Invalid facial override setting JSON: ${jsonStr}`);
    }
  }

  /**
   * 解析震动设置JSON字符串
   */
  static parseShakeSetting(jsonStr: string): ShakeSetting {
    try {
      return JSON.parse(jsonStr) as ShakeSetting;
    } catch (error) {
      console.error('Failed to parse shake setting:', error);
      throw new Error(`Invalid shake setting JSON: ${jsonStr}`);
    }
  }

  /**
   * 将3D变换对象转换为JSON字符串
   */
  static stringifyTransform3D(transform: Transform3D): string {
    return JSON.stringify(transform);
  }

  /**
   * 将2D变换对象转换为JSON字符串
   */
  static stringifyTransform2D(transform: Transform2D): string {
    return JSON.stringify(transform);
  }

  /**
   * 将相机设置转换为JSON字符串
   */
  static stringifyCameraSetting(setting: CameraSetting): string {
    return JSON.stringify(setting);
  }

  /**
   * 将面部覆盖设置转换为JSON字符串
   */
  static stringifyFacialOverrideSetting(setting: FacialOverrideSetting): string {
    return JSON.stringify(setting);
  }

  /**
   * 将震动设置转换为JSON字符串
   */
  static stringifyShakeSetting(setting: ShakeSetting): string {
    return JSON.stringify(setting);
  }

  /**
   * 解析Ruby标签文本
   * 例如: <r\=日本語>中文</r> -> { ruby: "日本語", text: "中文" }
   * 同时支持 <r=日本語> 格式（已解转义）
   */
  static parseRubyText(text: string): Array<{ ruby?: string; text: string }> {
    const result: Array<{ ruby?: string; text: string }> = [];
    // 匹配 <r\=> 或 <r=> 两种形式
    const rubyRegex = /<r\\?=([^>]+)>([^<]+)<\/r>/g;
    
    let lastIndex = 0;
    let match;

    while ((match = rubyRegex.exec(text)) !== null) {
      // 添加Ruby标签之前的普通文本
      if (match.index > lastIndex) {
        const plainText = text.substring(lastIndex, match.index);
        if (plainText) {
          result.push({ text: plainText });
        }
      }

      // 添加Ruby文本
      result.push({
        ruby: match[1],
        text: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    // 添加最后的普通文本
    if (lastIndex < text.length) {
      const plainText = text.substring(lastIndex);
      if (plainText) {
        result.push({ text: plainText });
      }
    }

    return result;
  }

  /**
   * 将Ruby文本数组转换回字符串
   */
  static stringifyRubyText(segments: Array<{ ruby?: string; text: string }>): string {
    return segments
      .map(seg => {
        if (seg.ruby) {
          return `<r\\=${seg.ruby}>${seg.text}</r>`;
        }
        return seg.text;
      })
      .join('');
  }

  /**
   * 清理文本中的转义字符（用于显示）
   */
  static unescapeText(text: string): string {
    return text
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }

  /**
   * 转义文本（用于生成脚本）
   */
  static escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\r\\n')
      .replace(/\t/g, '\\t');
  }

  /**
   * 验证时间值是否有效
   */
  static isValidTime(time: number): boolean {
    return typeof time === 'number' && !isNaN(time) && time >= 0;
  }

  /**
   * 格式化时间显示（秒 -> mm:ss.ms）
   */
  static formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }

  /**
   * 解析时间字符串（mm:ss.ms -> 秒）
   */
  static parseTime(timeStr: string): number {
    const parts = timeStr.split(':');
    if (parts.length !== 2) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }

    const minutes = parseInt(parts[0], 10);
    const secondsParts = parts[1].split('.');
    const seconds = parseInt(secondsParts[0], 10);
    const ms = secondsParts.length > 1 ? parseInt(secondsParts[1].padEnd(3, '0'), 10) : 0;

    return minutes * 60 + seconds + ms / 1000;
  }
}
