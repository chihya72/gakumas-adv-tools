import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';
import { parseCameraSetting } from './parserHelpers';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

const CameraSettingRenderer: React.FC<Props> = ({ params, onEdit }) => {
  const setting = parseCameraSetting(params);
  
  if (!setting) return null;

  return (
    <ParamCard title="相机设置" onEdit={onEdit}>
      <ParamRow label="焦距" value={setting.focalLength} />
      {setting.transform?.position && (
        <ParamRow 
          label="位置" 
          value={setting.transform.position}
          formatter={(v) => `x: ${v.x?.toFixed(2)}, y: ${v.y?.toFixed(2)}, z: ${v.z?.toFixed(2)}`}
        />
      )}
      {setting.transform?.rotation && (
        <ParamRow 
          label="旋转" 
          value={setting.transform.rotation}
          formatter={(v) => `x: ${v.x?.toFixed(1)}°, y: ${v.y?.toFixed(1)}°, z: ${v.z?.toFixed(1)}°`}
        />
      )}
      {setting.transform?.scale && (
        <ParamRow 
          label="缩放" 
          value={setting.transform.scale}
          formatter={(v) => `x: ${v.x?.toFixed(2)}, y: ${v.y?.toFixed(2)}, z: ${v.z?.toFixed(2)}`}
        />
      )}
      {setting.dofSetting?.active !== undefined && (
        <ParamRow label="景深" value={String(setting.dofSetting.active)} />
      )}
    </ParamCard>
  );
};

export default CameraSettingRenderer;
