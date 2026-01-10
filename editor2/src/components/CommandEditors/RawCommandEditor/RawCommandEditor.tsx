import React from 'react';
import { CommandCard } from '../../../types/command-card';

interface RawCommandEditorProps {
  card: CommandCard;
  onChange: (card: CommandCard) => void;
}

export const RawCommandEditor: React.FC<RawCommandEditorProps> = ({ card, onChange }) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...card,
      raw_line: e.target.value,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      <div style={{ fontSize: '14px', color: '#666' }}>
        直接编辑原始命令文本，保存后将重新解析并更新卡片内容：
      </div>
      <textarea
        value={card.raw_line || ''}
        onChange={handleTextChange}
        style={{
          width: '100%',
          minHeight: '200px',
          padding: '10px',
          fontFamily: 'monospace',
          fontSize: '13px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          resize: 'vertical',
        }}
        placeholder="输入命令文本..."
      />
      <div style={{ fontSize: '12px', color: '#999' }}>
        提示：修改后需要点击保存按钮才能生效
      </div>
    </div>
  );
};
