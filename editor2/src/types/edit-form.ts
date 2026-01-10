/**
 * 编辑表单相关类型定义
 */

import { CommandCard } from './command-card';

/** 表单字段类型 */
export type FieldType = 
  | 'text'          // 文本输入
  | 'number'        // 数字输入
  | 'textarea'      // 多行文本
  | 'select'        // 下拉选择
  | 'checkbox'      // 复选框
  | 'vector3'       // 三维向量 (x, y, z)
  | 'vector2'       // 二维向量 (x, y)
  | 'color'         // 颜色选择器
  | 'file'          // 文件选择
  | 'time';         // 时间输入

/** 表单字段配置 */
export interface FormField {
  /** 字段键名 */
  key: string;
  /** 字段标签 */
  label: string;
  /** 字段类型 */
  type: FieldType;
  /** 字段当前值 */
  value: any;
  /** 是否必填 */
  required?: boolean;
  /** 占位符 */
  placeholder?: string;
  /** 最小值（number类型） */
  min?: number;
  /** 最大值（number类型） */
  max?: number;
  /** 步进值（number类型） */
  step?: number;
  /** 选项列表（select类型） */
  options?: Array<{ label: string; value: any }>;
  /** 帮助文本 */
  helpText?: string;
}

/** 表单节点 - 可以是字段或分组 */
export interface FormSection {
  /** 节点标题 */
  title: string;
  /** 是否默认折叠 */
  collapsed?: boolean;
  /** 字段列表 */
  fields: FormField[];
}

/** 编辑表单数据 */
export interface EditFormData {
  /** 命令类型 */
  type: string;
  /** 表单节点列表 */
  sections: FormSection[];
}

/** 编辑器Props */
export interface CommandEditorProps {
  /** 要编辑的命令卡片 */
  card: CommandCard;
  /** 值变更回调 */
  onChange: (updatedCard: CommandCard) => void;
}
