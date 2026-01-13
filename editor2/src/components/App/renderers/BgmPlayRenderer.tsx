/**
 * BgmPlay 渲染器 - 显示BGM播放命令的参数
 */

import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

const BgmPlayRenderer: React.FC<Props> = ({ params, onEdit }) => (
  <ParamCard title="BGM播放" onEdit={onEdit}>
    <ParamRow label="BGM文件" value={params.bgm || '未设置'} />
    {params.volume !== undefined && params.volume !== null && (
      <ParamRow label="音量" value={params.volume} />
    )}
  </ParamCard>
);

export default BgmPlayRenderer;
