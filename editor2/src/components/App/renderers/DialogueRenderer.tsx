import React from 'react';
import { ParamRow, ParamCard } from './ParamRow';

interface Props {
  params: Record<string, any>;
  onEdit?: () => void;
}

const DialogueRenderer: React.FC<Props> = ({ params, onEdit }) => {
  // 判断对话类型
  const isMessage = params.name !== undefined;
  const isNarration = !isMessage;

  return (
    <ParamCard title="对话内容" onEdit={onEdit}>
      {isMessage && (
        <>
          <ParamRow label="类型" value="💬 对话" />
          <ParamRow label="角色名" value={params.name} />
          <ParamRow label="文本" value={params.text} />
        </>
      )}
      {isNarration && (
        <>
          <ParamRow label="类型" value="📖 旁白" />
          <ParamRow label="文本" value={params.text} />
        </>
      )}
    </ParamCard>
  );
};

export default DialogueRenderer;
