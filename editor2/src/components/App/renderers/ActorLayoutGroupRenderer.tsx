import React from 'react';
import { ParamRow, ParamCard, AddItemButton } from './ParamRow';
import { parseActorLayoutGroup } from './parserHelpers';
import { RendererProps } from './index';

const ActorLayoutGroupRenderer: React.FC<RendererProps> = ({ params, onEdit, onEditItem, onAddItem }) => {
  const layouts = parseActorLayoutGroup(params);
  
  if (layouts.length === 0) return null;

  return (
    <>
      {params.reset !== undefined && (
        <ParamCard title="布局设置" onEdit={onEdit}>
          <ParamRow label="重置" value={String(params.reset)} />
        </ParamCard>
      )}
      {layouts.map((layout, index) => (
        <ParamCard 
          key={index} 
          title="角色布局"
          index={layouts.length > 1 ? index + 1 : undefined}
          onEdit={onEditItem ? () => onEditItem(index) : undefined}
        >
          <ParamRow label="角色ID" value={layout.id} />
          {layout.transform.position && (
            <ParamRow 
              label="位置" 
              value={layout.transform.position}
              formatter={(v) => `x: ${v.x?.toFixed(2) || 0}, y: ${v.y?.toFixed(2) || 0}, z: ${v.z?.toFixed(2) || 0}`}
            />
          )}
          {layout.transform.rotation && (
            <ParamRow 
              label="旋转" 
              value={layout.transform.rotation}
              formatter={(v) => `x: ${v.x?.toFixed(2) || 0}°, y: ${v.y?.toFixed(2) || 0}°, z: ${v.z?.toFixed(2) || 0}°`}
            />
          )}
          {layout.transform.scale && (
            <ParamRow 
              label="缩放" 
              value={layout.transform.scale}
              formatter={(v) => `x: ${v.x?.toFixed(2) || 1}, y: ${v.y?.toFixed(2) || 1}, z: ${v.z?.toFixed(2) || 1}`}
            />
          )}
        </ParamCard>
      ))}
      {onAddItem && <AddItemButton onClick={onAddItem} label="添加角色布局" />}
    </>
  );
};

export default ActorLayoutGroupRenderer;
