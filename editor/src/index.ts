/**
 * ADV脚本数据模型 - 主导出文件
 * 学園アイドルマスター (Gakumas) 剧情脚本类型系统
 */

// 类型定义
export * from './types/adv-script';

// 工具类
export { ADVDataParser } from './utils/adv-parser';
export { ADVCommandValidator } from './utils/adv-validator';
export { TimelineBuilder } from './utils/timeline-builder';

// 版本信息
export const VERSION = '1.0.0';
export const SCRIPT_FORMAT = 'Unity ADV Script';
export const GAME_NAME = '学園アイドルマスター';
