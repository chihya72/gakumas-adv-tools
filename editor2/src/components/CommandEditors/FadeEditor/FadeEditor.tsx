import React, { useState, useEffect } from 'react';
import { CommandCard } from '../../../types/command-card';
import '../../FormEditor/FormEditor.css';

interface FadeEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard) => void;
}

export const FadeEditor: React.FC<FadeEditorProps> = ({ card, onChange }) => {
  const [formData, setFormData] = useState({
    from: card.params.from ?? 1,
    to: card.params.to ?? 0,
  });

  useEffect(() => {
    onChange({
      ...card,
      params: {
        ...card.params,
        from: formData.from,
        to: formData.to,
      },
    });
  }, [formData]);

  return (
    <div className="form-container">
      <div className="form-field">
        <label className="form-label">from</label>
        <input
          type="number"
          className="form-input"
          value={formData.from}
          onChange={(e) => setFormData({ ...formData, from: parseFloat(e.target.value) || 0 })}
          step="0.1"
        />
        <div className="form-help-text">淡入淡出起始值（通常为 0 或 1）</div>
      </div>

      <div className="form-field">
        <label className="form-label">to</label>
        <input
          type="number"
          className="form-input"
          value={formData.to}
          onChange={(e) => setFormData({ ...formData, to: parseFloat(e.target.value) || 0 })}
          step="0.1"
        />
        <div className="form-help-text">淡入淡出结束值（通常为 0 或 1）</div>
      </div>
    </div>
  );
};
