import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';
import { parseBackgroundSetting } from './parserHelpers';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

const BackgroundSettingRenderer: React.FC<Props> = ({ params, onEdit }) => {
  const setting = parseBackgroundSetting(params);
  
  return (
    <ParamCard title="背景设置" onEdit={onEdit}>
      <ParamRow label="背景ID" value={params.id} />
      {setting?.position && (
        <ParamRow 
          label="位置" 
          value={setting.position}
          formatter={(v) => `x: ${v.x?.toFixed(1)}, y: ${v.y?.toFixed(1)}`}
        />
      )}
      {setting?.scale && (
        <ParamRow 
          label="缩放" 
          value={setting.scale}
          formatter={(v) => `x: ${v.x?.toFixed(2)}, y: ${v.y?.toFixed(2)}`}
        />
      )}
      {setting?.angle !== undefined && (
        <ParamRow 
          label="角度" 
          value={setting.angle}
          formatter={(v) => `${v}°`}
        />
      )}
    </ParamCard>
  );
};

export default BackgroundSettingRenderer;
