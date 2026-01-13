import React, { useState, useEffect } from 'react';
import { CommandCard } from '../../../types/command-card';
import { parseBackgroundGroup } from '../../App/renderers/parserHelpers';
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
  const [availableBackgroundIds, setAvailableBackgroundIds] = useState<string[]>([]);

  // 从全局获取可用的背景ID列表（仅2D背景）
  useEffect(() => {
    const getAllCards = (): CommandCard[] => {
      return (window as any).__editorCards || [];
    };
    
    const cards = getAllCards();
    const bgIds: string[] = [];
    
    for (const c of cards) {
      if (c.type === 'backgroundgroup') {
        const backgrounds = parseBackgroundGroup(c.params);
        backgrounds.forEach((bg: any) => {
          // 判断是否为2D背景：路径包含 Sprite2D、2d、Texture2D 等关键词
          const is2D = bg.src && (
            bg.src.includes('Sprite2D') ||
            bg.src.includes('/2d/') ||
            bg.src.includes('Texture2D') ||
            bg.src.includes('_2d_')
          );
          
          if (bg.id && is2D && !bgIds.includes(bg.id)) {
            bgIds.push(bg.id);
          }
        });
      }
    }
    
    setAvailableBackgroundIds(bgIds);
  }, []);

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

  const updatePosition = (axis: 'x' | 'y', value: number) => {
    setSetting(prev => ({
      ...prev,
      position: { ...prev.position, x: prev.position?.x || 0, y: prev.position?.y || 0, [axis]: value },
    }));
  };

  const updateScale = (axis: 'x' | 'y', value: number) => {
    setSetting(prev => ({
      ...prev,
      scale: { ...prev.scale, x: prev.scale?.x || 1, y: prev.scale?.y || 1, [axis]: value },
    }));
  };

  return (
    <div className="form-container">
      <div className="form-field">
        <label className="form-label">背景ID (id)</label>
        <select
          className="form-select"
          value={formData.id}
          onChange={(e) => setFormData({ ...formData, id: e.target.value })}
          disabled={availableBackgroundIds.length === 0}
        >
          <option value="">
            {availableBackgroundIds.length > 0 ? '请选择背景...' : '无可用背景，请先添加 backgroundgroup'}
          </option>
          {availableBackgroundIds.map((bgId) => (
            <option key={bgId} value={bgId}>
              {bgId}
            </option>
          ))}
        </select>
        <div className="form-help-text">
          {availableBackgroundIds.length > 0 
            ? '只能选择在 backgroundgroup 中已定义的 2D 背景'
            : '⚠️ 未找到已定义的 2D 背景，请先添加 backgroundgroup 命令（2D背景）'
          }
        </div>
      </div>

      <div className="form-section">
        <h4 style={{ margin: '16px 0 8px 0', fontSize: '14px', fontWeight: 600 }}>位置 (Position)</h4>
        <div className="form-vector">
          <div className="form-vector-item">
            <label>X</label>
            <input
              type="number"
              className="form-input-small"
              value={setting.position?.x || 0}
              onChange={(e) => updatePosition('x', parseFloat(e.target.value) || 0)}
              step="0.1"
            />
          </div>
          <div className="form-vector-item">
            <label>Y</label>
            <input
              type="number"
              className="form-input-small"
              value={setting.position?.y || 0}
              onChange={(e) => updatePosition('y', parseFloat(e.target.value) || 0)}
              step="0.1"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4 style={{ margin: '16px 0 8px 0', fontSize: '14px', fontWeight: 600 }}>缩放 (Scale)</h4>
        <div className="form-vector">
          <div className="form-vector-item">
            <label>X</label>
            <input
              type="number"
              className="form-input-small"
              value={setting.scale?.x || 1}
              onChange={(e) => updateScale('x', parseFloat(e.target.value) || 1)}
              step="0.01"
            />
          </div>
          <div className="form-vector-item">
            <label>Y</label>
            <input
              type="number"
              className="form-input-small"
              value={setting.scale?.y || 1}
              onChange={(e) => updateScale('y', parseFloat(e.target.value) || 1)}
              step="0.01"
            />
          </div>
        </div>
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
