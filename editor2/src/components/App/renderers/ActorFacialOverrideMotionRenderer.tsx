import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';
import { parseFacialOverrideSetting } from './parserHelpers';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

const ActorFacialOverrideMotionRenderer: React.FC<Props> = ({ params, onEdit }) => {
  const setting = parseFacialOverrideSetting(params);

  return (
    <>
      <ParamCard title="表情覆盖设置" onEdit={onEdit}>
        <ParamRow label="角色ID" value={params.id} />
      </ParamCard>

      {setting.faceModels.map((model, index) => (
        <ParamCard 
          key={index}
          title="面部模型"
          index={setting.faceModels.length > 1 ? index + 1 : undefined}
        >
          <ParamRow label="路径" value={model.path} />
          <ParamRow label="索引" value={model.index} />
          <ParamRow label="数值" value={model.value} formatter={(v) => v.toFixed(2)} />
        </ParamCard>
      ))}
    </>
  );
};

export default ActorFacialOverrideMotionRenderer;
