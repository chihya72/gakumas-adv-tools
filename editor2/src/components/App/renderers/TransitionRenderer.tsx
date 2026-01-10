import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

const TransitionRenderer: React.FC<Props> = ({ params, onEdit }) => (
  <ParamCard title="转场设置" onEdit={onEdit}>
    <ParamRow label="过渡效果" value={params.transition} />
    <ParamRow label="类型" value={params.type} />
    <ParamRow label="角色" value={params.character} />
  </ParamCard>
);

export default TransitionRenderer;
