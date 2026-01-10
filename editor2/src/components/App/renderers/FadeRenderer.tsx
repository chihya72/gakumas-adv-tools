import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

const FadeRenderer: React.FC<Props> = ({ params, onEdit }) => (
  <ParamCard title="淡入淡出设置" onEdit={onEdit}>
    <ParamRow label="从" value={params.from} />
    <ParamRow label="到" value={params.to} />
    <ParamRow label="类型" value={params.type} />
    <ParamRow 
      label="持续时间" 
      value={params.duration} 
      formatter={(v) => `${v}s`}
    />
    <ParamRow label="颜色" value={params.color} />
  </ParamCard>
);

export default FadeRenderer;
