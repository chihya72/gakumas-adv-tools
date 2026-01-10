import React from 'react';
import { ParamRow, ParamCard, AddItemButton } from './ParamRow';
import { parseActorGroup } from './parserHelpers';
import { RendererProps } from './index';

const ActorGroupRenderer: React.FC<RendererProps> = ({ params, onEditItem, onAddItem }) => {
  const actors = parseActorGroup(params);
  
  if (actors.length === 0) return null;

  return (
    <>
      {actors.map((actor, index) => (
        <ParamCard 
          key={index} 
          title="角色定义"
          index={actors.length > 1 ? index + 1 : undefined}
          onEdit={onEditItem ? () => onEditItem(index) : undefined}
        >
          <ParamRow label="角色ID" value={actor.id} />
          <ParamRow label="身体模型" value={actor.body} />
          <ParamRow label="头发模型" value={actor.hair} />
          <ParamRow label="脸部模型" value={actor.face} />
        </ParamCard>
      ))}
      {onAddItem && <AddItemButton label="添加角色" onClick={onAddItem} />}
    </>
  );
};

export default ActorGroupRenderer;
