import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

const TransitionRenderer: React.FC<Props> = ({ params, onEdit }) => {
  const isEventType = 
    params.transition === 'ttn_adv_transition_event_change' || 
    params.transition === 'ttn_adv_transition_event_time';
  
  return (
    <ParamCard title="转场设置" onEdit={onEdit}>
      <ParamRow label="过渡效果" value={params.transition || '(未设置)'} />
      <ParamRow label="类型" value={params.type || '(未设置)'} />
      {!isEventType && (
        <ParamRow label="角色" value={params.character || '(未设置)'} />
      )}
    </ParamCard>
  );
};

export default TransitionRenderer;
