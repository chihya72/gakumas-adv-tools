/**
 * ActorFacialOverrideMotion 命令编辑器
 * 用于覆盖角色表情设置
 */

import React, { useState, useEffect } from 'react';
import { CommandCard } from '../../../types/command-card';
import { EmptyState } from '../../common';
import { useAvailableActorIds } from '../../../hooks/useAvailableIds';
import '../../FormEditor/FormEditor.css';

interface FaceModel {
  path: string;
  index: number;
  value: number;
}

interface FacialOverrideSetting {
  faceModels: FaceModel[];
  decals: any[];
}

interface ActorFacialOverrideMotionEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard, isValid?: boolean) => void;
}

/**
 * ActorFacialOverrideMotion 命令编辑器
 * 格式: [actorfacialoverridemotion id=角色ID setting=\{JSON\}]
 */
export const ActorFacialOverrideMotionEditor: React.FC<ActorFacialOverrideMotionEditorProps> = ({ 
  card, 
  onChange 
}) => {
  const availableActorIds = useAvailableActorIds();
  const [actorId, setActorId] = useState<string>(card.params.id || '');
  const [setting, setSetting] = useState<FacialOverrideSetting>(() => {
    // 解析现有的 setting 参数
    if (card.params.setting) {
      try {
        // 处理转义的JSON：将 \{ 替换为 { 等
        let settingStr = card.params.setting;
        if (typeof settingStr === 'string') {
          // 移除转义符
          settingStr = settingStr.replace(/\\{/g, '{').replace(/\\}/g, '}');
        }
        const parsed = JSON.parse(settingStr);
        return parsed;
      } catch (e) {
        console.error('Failed to parse setting:', e);
      }
    }
    // 默认值
    return {
      faceModels: [{ path: 'Root_Face', index: 0, value: 1.0 }],
      decals: []
    };
  });

  // 无可用角色
  if (availableActorIds.length === 0) {
    return (
      <EmptyState
        title="无可用角色"
        description="请先添加 actorgroup 命令定义角色"
        icon="⚠️"
      />
    );
  }

  // 更新卡片数据
  useEffect(() => {
    // 序列化 setting 为 JSON 字符串，并添加转义
    const settingJson = JSON.stringify(setting);
    // 添加转义：{ → \{, } → \}
    const escapedSetting = settingJson.replace(/{/g, '\\{').replace(/}/g, '\\}');
    
    const isValid = !!(actorId && actorId.trim() !== '');
    
    onChange({
      ...card,
      params: {
        ...card.params,
        id: actorId,
        setting: escapedSetting
      }
    }, isValid);
  }, [actorId, setting]);

  const handleFaceModelChange = (index: number, field: keyof FaceModel, value: any) => {
    const newFaceModels = [...setting.faceModels];
    newFaceModels[index] = { ...newFaceModels[index], [field]: value };
    setSetting({ ...setting, faceModels: newFaceModels });
  };

  const handleAddFaceModel = () => {
    setSetting({
      ...setting,
      faceModels: [...setting.faceModels, { path: 'Root_Face', index: 0, value: 1.0 }]
    });
  };

  const handleRemoveFaceModel = (index: number) => {
    const newFaceModels = setting.faceModels.filter((_, i) => i !== index);
    setSetting({ ...setting, faceModels: newFaceModels });
  };

  return (
    <div className="form-editor">
      {/* 角色ID */}
      <div className="form-field">
        <label className="form-field-label">
          角色ID
          <span className="form-field-required">*</span>
        </label>
        <div className="form-field-input">
          <select
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
            className="form-select"
          >
            {availableActorIds.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
        <div className="form-field-help">只能选择在 actorgroup 中已定义的角色</div>
      </div>

      {/* Face Models */}
      <div className="form-field">
        <label className="form-field-label">表情模型覆盖</label>
        <div style={{ marginTop: '8px' }}>
          {setting.faceModels.map((model, index) => (
            <div key={index} style={{ 
              marginBottom: '12px', 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong>模型 #{index + 1}</strong>
                {setting.faceModels.length > 1 && (
                  <button
                    onClick={() => handleRemoveFaceModel(index)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    删除
                  </button>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Index</label>
                  <input
                    type="number"
                    value={model.index}
                    onChange={(e) => handleFaceModelChange(index, 'index', parseInt(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Value</label>
                  <input
                    type="number"
                    value={model.value}
                    onChange={(e) => handleFaceModelChange(index, 'value', parseFloat(e.target.value) || 0)}
                    className="form-input"
                    step="0.1"
                    min="-1"
                    max="1"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={handleAddFaceModel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            + 添加表情模型
          </button>
        </div>
        <div className="form-field-help">
          定义要覆盖的表情模型参数。Index 为表情索引（0-73），Value 为强度（-1.0 到 1.0，负值表示反向效果）。
          <a 
            href="https://github.com/chihya72/gakumas-adv-tools/wiki/%E8%A1%A8%E6%83%85-Index-%E5%8F%82%E8%80%83%E8%A1%A8" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ marginLeft: '4px', color: '#0066cc', textDecoration: 'underline' }}
          >
            查看完整 Index 参考表
          </a>
        </div>
      </div>
    </div>
  );
};
