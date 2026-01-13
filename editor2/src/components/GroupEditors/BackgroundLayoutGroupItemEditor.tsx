import React, { useState, useEffect } from 'react';
import { CommandCard } from '../../types/command-card';
import { parseBackgroundGroup } from '../App/renderers/parserHelpers';
import '../FormEditor/FormEditor.css';

interface BackgroundLayoutGroupItemEditorProps {
  id: string;
  onChange: (id: string) => void;
  onValidate?: (isValid: boolean) => void; // 验证回调
}

/** 3D背景布局项编辑器 */
export const BackgroundLayoutGroupItemEditor: React.FC<BackgroundLayoutGroupItemEditorProps> = ({ 
  id, 
  onChange,
  onValidate
}) => {
  const [formData, setFormData] = useState({ id });
  const [availableBackgroundIds, setAvailableBackgroundIds] = useState<string[]>([]);

  // 从 backgroundgroup 中提取 3D 背景 ID
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
          // 判断是否为3D背景：路径不包含 Sprite2D、Texture2D 等 2D 关键词
          const is3D = bg.src && !(
            bg.src.includes('Sprite2D') ||
            bg.src.includes('/2d/') ||
            bg.src.includes('Texture2D') ||
            bg.src.includes('_2d_')
          );
          
          if (bg.id && is3D && !bgIds.includes(bg.id)) {
            bgIds.push(bg.id);
          }
        });
      }
    }
    
    setAvailableBackgroundIds(bgIds);
  }, []);

  // 实时通知父组件
  useEffect(() => {
    onChange(formData.id);
    // 验证：id 不能为空
    if (onValidate) {
      onValidate(formData.id.trim() !== '');
    }
  }, [formData, onValidate]);

  return (
    <div className="form-container">
      <div className="form-field">
        <label className="form-label">背景ID (id)</label>
        <select
          className="form-select"
          value={formData.id}
          onChange={(e) => setFormData({ id: e.target.value })}
          disabled={availableBackgroundIds.length === 0}
        >
          <option value="">
            {availableBackgroundIds.length > 0 
              ? '请选择背景...' 
              : '无可用3D背景，请先添加 backgroundgroup'}
          </option>
          {availableBackgroundIds.map((bgId) => (
            <option key={bgId} value={bgId}>
              {bgId}
            </option>
          ))}
        </select>
        <div className="form-help-text">
          {availableBackgroundIds.length > 0 
            ? '只能选择在 backgroundgroup 中已定义的 3D 背景'
            : '⚠️ 未找到已定义的 3D 背景，请先添加 backgroundgroup 命令（3D背景）'
          }
        </div>
      </div>
    </div>
  );
};
