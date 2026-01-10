import React from 'react';
import { ParamRow, ParamCard, AddItemButton } from './ParamRow';
import { parseBackgroundGroup } from './parserHelpers';
import { RendererProps } from './index';

const BackgroundGroupRenderer: React.FC<RendererProps> = ({ params, onEditItem, onAddItem }) => {
  const backgrounds = parseBackgroundGroup(params);
  
  if (backgrounds.length === 0) return null;

  return (
    <>
      {backgrounds.map((bg, index) => (
        <ParamCard 
          key={index} 
          title="背景设置"
          index={backgrounds.length > 1 ? index + 1 : undefined}
          onEdit={onEditItem ? () => onEditItem(index) : undefined}
        >
          <ParamRow label="背景ID" value={bg.id} />
          <ParamRow label="资源路径" value={bg.src} />
        </ParamCard>
      ))}
      {onAddItem && <AddItemButton label="添加背景设置" onClick={onAddItem} />}
    </>
  );
};

export default BackgroundGroupRenderer;
