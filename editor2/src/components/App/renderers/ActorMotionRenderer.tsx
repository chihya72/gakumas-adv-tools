import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

const ActorMotionRenderer: React.FC<Props> = ({ params, onEdit }) => (
  <ParamCard title="动作设置" onEdit={onEdit}>
    <ParamRow label="角色ID" value={params.id} />
    <ParamRow label="动作名称" value={params.motion} />
  </ParamCard>
);

export default ActorMotionRenderer;
