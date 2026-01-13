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
  </ParamCard>
);

export default FadeRenderer;
