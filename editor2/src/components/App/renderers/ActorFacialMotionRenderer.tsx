import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

const ActorFacialMotionRenderer: React.FC<Props> = ({ params, onEdit }) => (
  <ParamCard title="表情设置" onEdit={onEdit}>
    <ParamRow label="角色ID" value={params.id} />
    <ParamRow label="表情名称" value={params.motion} />
    {params.transition !== undefined && params.transition !== 0 && (
      <ParamRow 
        label="过渡时间" 
        value={params.transition} 
        formatter={(v) => `${v}s`}
      />
    )}
  </ParamCard>
);

export default ActorFacialMotionRenderer;
