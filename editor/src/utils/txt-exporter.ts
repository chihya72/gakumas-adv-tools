/**
 * TXT格式导出工具
 * 将JSON命令转换回原始的txt命令格式
 */

import type { Command } from '../types/adv-script';

export class TxtExporter {
  /**
   * 将命令数组导出为txt格式字符串
   */
  static exportToTxt(commands: Command[]): string {
    const lines = commands.map(cmd => this.commandToTxtLine(cmd));
    return lines.join('\n');
  }

  /**
   * 将单个命令转换为txt行
   */
  private static commandToTxtLine(cmd: Command): string {
    const parts: string[] = [];

    // 添加命令类型
    parts.push(`[${cmd.type}`);

    // 添加参数
    const paramParts: string[] = [];
    
    Object.entries(cmd.params).forEach(([key, value]) => {
      // 处理数组值：重复参数名而不是用JSON数组
      if (Array.isArray(value)) {
        value.forEach(item => {
          const formattedValue = this.formatParamValue(item);
          if (formattedValue !== '') {
            paramParts.push(`${key}=${formattedValue}`);
          }
        });
      } else {
        const formattedValue = this.formatParamValue(value);
        if (formattedValue !== '') {
          paramParts.push(`${key}=${formattedValue}`);
        }
      }
    });

    // 如果有clip数据，添加clip参数（必须在paramParts.join之前）
    if (cmd.clip) {
      // 过滤掉 undefined 字段，只保留实际存在的字段
      const clipData: any = {};
      if (cmd.clip.startTime !== undefined) clipData._startTime = cmd.clip.startTime;
      if (cmd.clip.duration !== undefined) clipData._duration = cmd.clip.duration;
      if (cmd.clip.clipIn !== undefined) clipData._clipIn = cmd.clip.clipIn;
      if (cmd.clip.easeInDuration !== undefined) clipData._easeInDuration = cmd.clip.easeInDuration;
      if (cmd.clip.easeOutDuration !== undefined) clipData._easeOutDuration = cmd.clip.easeOutDuration;
      if (cmd.clip.blendInDuration !== undefined) clipData._blendInDuration = cmd.clip.blendInDuration;
      if (cmd.clip.blendOutDuration !== undefined) clipData._blendOutDuration = cmd.clip.blendOutDuration;
      if (cmd.clip.mixInEaseType !== undefined) clipData._mixInEaseType = cmd.clip.mixInEaseType;
      if (cmd.clip.mixOutEaseType !== undefined) clipData._mixOutEaseType = cmd.clip.mixOutEaseType;
      if (cmd.clip.mixInCurve !== undefined) clipData._mixInCurve = cmd.clip.mixInCurve;
      if (cmd.clip.mixOutCurve !== undefined) clipData._mixOutCurve = cmd.clip.mixOutCurve;
      if (cmd.clip.timeScale !== undefined) clipData._timeScale = cmd.clip.timeScale;
      
      const clipJson = this.serializeWithFloatPrecision(clipData);
      paramParts.push(`clip=${this.escapeJsonString(clipJson)}`);
    }

    if (paramParts.length > 0) {
      parts.push(' ' + paramParts.join(' '));
    }

    parts.push(']');

    return parts.join('');
  }

  /**
   * 序列化对象，保持浮点数精度（保留.0）
   */
  private static serializeWithFloatPrecision(obj: any): string {
    const jsonStr = JSON.stringify(obj);
    // 只对clip的特定浮点数字段的整数值添加.0
    // _mixInEaseType 和 _mixOutEaseType 是整数枚举，不需要.0
    const floatFields = [
      '_startTime', '_duration', '_clipIn', '_easeInDuration', '_easeOutDuration',
      '_blendInDuration', '_blendOutDuration', '_timeScale'
    ];
    
    let result = jsonStr;
    for (const field of floatFields) {
      // 匹配该字段后跟整数的情况，并添加.0
      result = result.replace(
        new RegExp(`"${field}":(-?\\d+)([,}])`, 'g'),
        `"${field}":$1.0$2`
      );
    }
    return result;
  }

  /**
   * 格式化参数值
   */
  private static formatParamValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'boolean') {
      return value.toString();
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    if (typeof value === 'string') {
      // 如果字符串看起来像JSON对象（包含引号和冒号），需要转义花括号
      const trimmed = value.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}') && trimmed.includes('"') && trimmed.includes(':')) {
        // 这是一个JSON对象字符串，需要转义花括号
        return this.escapeJsonString(value);
      }
      // 普通字符串（如 {user}）直接返回，不转义
      return value;
    }

    if (typeof value === 'object') {
      // 对象或数组，转换为JSON字符串并转义
      const jsonStr = this.serializeWithFloatPrecision(value);
      return this.escapeJsonString(jsonStr);
    }

    return String(value);
  }

  /**
   * 转义JSON字符串用于txt格式
   * 只转义花括号，不转义引号和方括号
   */
  private static escapeJsonString(jsonStr: string): string {
    return jsonStr
      .replace(/{/g, '\\{')     // 转义左花括号
      .replace(/}/g, '\\}');    // 转义右花括号
  }

  /**
   * 下载为txt文件
   */
  static downloadAsTxt(commands: Command[], filename: string): void {
    const txtContent = this.exportToTxt(commands);
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 释放URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}
