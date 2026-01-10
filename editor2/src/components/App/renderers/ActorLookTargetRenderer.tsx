import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';
import { parseLookTargetSetting } from './parserHelpers';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

const ActorLookTargetRenderer: React.FC<Props> = ({ params, onEdit }) => {
  const target = parseLookTargetSetting(params);

  return (
    <>
      {target && (
        <ParamCard title="视线目标设置" onEdit={onEdit}>
          <ParamRow label="角色ID" value={params.id} />
          <ParamRow label="类型" value={target.type} />
          {target.actorId && <ParamRow label="目标角色" value={target.actorId} />}
          <ParamRow label="骨骼" value={target.bones} />
          <ParamRow label="方位角" value={target.azimuth} formatter={(v) => `${v}°`} />
          <ParamRow label="仰角" value={target.elevation} formatter={(v) => `${v}°`} />
          <ParamRow label="总权重" value={target.weight} formatter={(v) => v.toFixed(2)} />
          <ParamRow label="眼睛权重" value={target.eyesWeight} formatter={(v) => v.toFixed(2)} />
          <ParamRow label="头部权重" value={target.headWeight} formatter={(v) => v.toFixed(2)} />
          <ParamRow label="身体权重" value={target.bodyWeight} formatter={(v) => v.toFixed(2)} />
          {target.transform?.position && (
            <ParamRow
              label="位置"
              value={target.transform.position}
              formatter={(v) => `x: ${v.x?.toFixed(2)}, y: ${v.y?.toFixed(2)}, z: ${v.z?.toFixed(2)}`}
            />
          )}
          {target.transform?.rotation && (
            <ParamRow
              label="旋转"
              value={target.transform.rotation}
              formatter={(v) => `x: ${v.x?.toFixed(1)}°, y: ${v.y?.toFixed(1)}°, z: ${v.z?.toFixed(1)}°`}
            />
          )}
          {target.transform?.scale && (
            <ParamRow
              label="缩放"
              value={target.transform.scale}
              formatter={(v) => `x: ${v.x?.toFixed(2)}, y: ${v.y?.toFixed(2)}, z: ${v.z?.toFixed(2)}`}
            />
          )}
        </ParamCard>
      )}
    </>
  );
};

export default ActorLookTargetRenderer;
