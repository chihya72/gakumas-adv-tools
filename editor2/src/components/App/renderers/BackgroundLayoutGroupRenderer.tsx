import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';
import { parseBackgroundLayoutGroup } from './parserHelpers';

interface Props {
  params: Record<string, any>;
  onEditItem?: (index: number) => void;
}

const BackgroundLayoutGroupRenderer: React.FC<Props> = ({ params, onEditItem }) => {
  const layouts = parseBackgroundLayoutGroup(params);
  
  if (layouts.length === 0) return null;

  return (
    <>
      {layouts.map((layout, index) => (
        <ParamCard 
          key={index} 
          title="3D背景布局"
          index={layouts.length > 1 ? index + 1 : undefined}
          onEdit={onEditItem ? () => onEditItem(index) : undefined}
        >
          <ParamRow label="背景ID" value={layout.id} />
        </ParamCard>
      ))}
    </>
  );
};

export default BackgroundLayoutGroupRenderer;
