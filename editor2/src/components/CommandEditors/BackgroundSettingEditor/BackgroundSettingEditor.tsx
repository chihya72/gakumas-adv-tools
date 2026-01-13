import React, { useState, useEffect } from 'react';
import { CommandCard } from '../../../types/command-card';
import { useAvailableBackgroundIds } from '../../../hooks/useAvailableIds';
import { Vector2Input, EmptyState } from '../../common';
import '../../FormEditor/FormEditor.css';

interface BackgroundSettingEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard, isValid?: boolean) => void;
}

interface BackgroundSetting {
  position?: { x: number; y: number };
  scale?: { x: number; y: number };
  angle?: number;
}

/** 2D背景设置编辑器 */
export const BackgroundSettingEditor: React.FC<BackgroundSettingEditorProps> = ({ card, onChange }) => {
  const availableBackgroundIds = useAvailableBackgroundIds('2d');

  // 解析现有的setting
  const parseSetting = (settingStr: string | undefined): BackgroundSetting => {
    if (!settingStr) return {};
    try {
      return JSON.parse(settingStr);
    } catch (e) {
      console.error('解析背景设置失败:', e);
      return {};
    }
  };

  const [formData, setFormData] = useState({
    id: card.params.id || '',
  });

  const [setting, setSetting] = useState<BackgroundSetting>(() => parseSetting(card.params.setting));

  // 同步到父组件
  useEffect(() => {
    const settingJson = JSON.stringify(setting);
    const isValid = !!(formData.id && formData.id.trim() !== '');
    onChange({
      ...card,
      params: {
        ...card.params,
        id: formData.id,
        setting: settingJson,
      },
    }, isValid);
  }, [formData, setting]);

  if (availableBackgroundIds.length === 0) {
    return (
      <EmptyState
        title="无可用的 2D 背景"
        description="请先添加 backgroundgroup 命令，并确保包含 2D 背景资源"
        icon="🖼️"
      />
    );
  }

  return (
    <div className="form-container">
      <div className="form-field">
        <label className="form-label">背景ID (id)</label>
        <select
          className="form-select"
          value={formData.id}
          onChange={(e) => setFormData({ ...formData, id: e.target.value })}
        >
          <option value="">请选择背景...</option>
          {availableBackgroundIds.map((bgId) => (
            <option key={bgId} value={bgId}>
              {bgId}
            </option>
          ))}
        </select>
        <div className="form-help-text">只能选择在 backgroundgroup 中已定义的 2D 背景</div>
      </div>

      <div className="form-section">
        <h4 style={{ margin: '16px 0 8px 0', fontSize: '14px', fontWeight: 600 }}>位置 (Position)</h4>
        <Vector2Input
          value={setting.position || { x: 0, y: 0 }}
          onChange={(position) => setSetting({ ...setting, position })}
          step={0.1}
        />
      </div>

      <div className="form-section">
        <h4 style={{ margin: '16px 0 8px 0', fontSize: '14px', fontWeight: 600 }}>缩放 (Scale)</h4>
        <Vector2Input
          value={setting.scale || { x: 1, y: 1 }}
          onChange={(scale) => setSetting({ ...setting, scale })}
          step={0.01}
        />
      </div>

      <div className="form-field">
        <label className="form-label">角度 (angle)</label>
        <input
          type="number"
          className="form-input"
          value={setting.angle || 0}
          onChange={(e) => setSetting({ ...setting, angle: parseFloat(e.target.value) || 0 })}
          step="1"
        />
        <div className="form-help-text">背景旋转角度（度）</div>
      </div>
    </div>
  );
};
