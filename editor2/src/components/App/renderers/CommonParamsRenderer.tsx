import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

/**
 * 通用参数渲染器 - 智能显示所有参数
 * 作为其他特定渲染器的 fallback
 */
const CommonParamsRenderer: React.FC<Props> = ({ params, onEdit }) => {
  // 过滤掉特殊参数（已经在其他地方处理的）
  const excludedKeys = ['actors', 'backgrounds', 'layouts', 'setting'];
  
  // 获取所有需要显示的参数
  const displayParams = Object.entries(params)
    .filter(([key]) => !excludedKeys.includes(key))
    .filter(([, value]) => value !== null && value !== undefined && value !== '');

  if (displayParams.length === 0) return null;

  // 参数友好名称映射
  const labelMap: Record<string, string> = {
    id: 'ID',
    src: '资源',
    body: '身体模型',
    face: '脸部模型',
    hair: '头发模型',
    motion: '动作',
    voice: '语音',
    bgm: 'BGM',
    se: '音效',
    text: '文本',
    name: '名称',
    type: '类型',
    duration: '持续时间',
    transition: '过渡',
    character: '角色',
    color: '颜色',
  };

  // 格式化值的显示
  const formatValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <ParamCard title="参数" onEdit={onEdit}>
      {displayParams.map(([key, value]) => (
        <ParamRow 
          key={key}
          label={labelMap[key] || key}
          value={value}
          formatter={formatValue}
        />
      ))}
    </ParamCard>
  );
};

export default CommonParamsRenderer;
