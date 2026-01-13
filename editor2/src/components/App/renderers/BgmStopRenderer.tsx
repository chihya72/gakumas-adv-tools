/**
 * BgmStop 渲染器 - 显示BGM停止命令
 */

import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

const BgmStopRenderer: React.FC<Props> = ({ params, onEdit }) => (
  <ParamCard title="停止BGM" onEdit={onEdit}>
    {params.fadeTime !== undefined && params.fadeTime !== null && params.fadeTime > 0 ? (
      <ParamRow label="淡出时间" value={`${params.fadeTime}秒`} />
    ) : (
      <div style={{ 
        padding: '0.5rem', 
        color: '#666', 
        fontSize: '0.875rem',
        fontStyle: 'italic' 
      }}>
        立即停止BGM
      </div>
    )}
  </ParamCard>
);

export default BgmStopRenderer;
