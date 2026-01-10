import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';
import { parseBackgroundLayoutGroup } from './parserHelpers';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

const BackgroundLayoutGroupRenderer: React.FC<Props> = ({ params, onEdit }) => {
  const layouts = parseBackgroundLayoutGroup(params);
  
  if (layouts.length === 0) return null;

  return (
    <>
      {layouts.map((layout, index) => (
        <ParamCard 
          key={index} 
          title="背景布局"
          index={layouts.length > 1 ? index + 1 : undefined}
          onEdit={onEdit}
        >
          <ParamRow label="背景ID" value={layout.id} />
        </ParamCard>
      ))}
    </>
  );
};

export default BackgroundLayoutGroupRenderer;
