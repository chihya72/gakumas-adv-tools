import React, { useState, useEffect } from 'react';
import { Vector3Input } from '../../common';
import '../../FormEditor/FormEditor.css';

interface ActorLayoutItemEditorProps {
  id: string;
  transform: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
  };
  availableActorIds: string[];
  onChange: (data: { id: string; transform: any }) => void;
}

const ActorLayoutItemEditor: React.FC<ActorLayoutItemEditorProps> = ({ 
  id, 
  transform, 
  availableActorIds,
  onChange 
}) => {
  const [localData, setLocalData] = useState({
    id,
    transform: {
      position: transform.position || { x: 0, y: 0, z: 0 },
      rotation: transform.rotation || { x: 0, y: 0, z: 0 },
      scale: transform.scale || { x: 1, y: 1, z: 1 },
    },
  });

  // 通知父组件变更
  useEffect(() => {
    onChange(localData);
  }, [localData]);

  return (
    <div className="actor-layout-item-editor">
      <div className="form-field">
        <label className="form-label">角色ID</label>
        <select
          className="form-select"
          value={localData.id}
          onChange={(e) => setLocalData({ ...localData, id: e.target.value })}
        >
          <option value="">请选择角色...</option>
          {availableActorIds.map((actorId) => (
            <option key={actorId} value={actorId}>
              {actorId}
            </option>
          ))}
        </select>
        <div className="form-help-text">只能选择在 actorgroup 中已定义的角色</div>
      </div>

      <div className="form-section">
        <h4 style={{ margin: '16px 0 8px 0', fontSize: '14px', fontWeight: 600 }}>位置 (Position)</h4>
        <Vector3Input
          value={localData.transform.position}
          onChange={(position) => setLocalData({
            ...localData,
            transform: { ...localData.transform, position }
          })}
          step={0.01}
        />
      </div>

      <div className="form-section">
        <h4 style={{ margin: '16px 0 8px 0', fontSize: '14px', fontWeight: 600 }}>旋转 (Rotation)</h4>
        <Vector3Input
          value={localData.transform.rotation}
          onChange={(rotation) => setLocalData({
            ...localData,
            transform: { ...localData.transform, rotation }
          })}
          step={1}
          labels={{ x: 'X (度)', y: 'Y (度)', z: 'Z (度)' }}
        />
      </div>

      <div className="form-section">
        <h4 style={{ margin: '16px 0 8px 0', fontSize: '14px', fontWeight: 600 }}>缩放 (Scale)</h4>
        <Vector3Input
          value={localData.transform.scale}
          onChange={(scale) => setLocalData({
            ...localData,
            transform: { ...localData.transform, scale }
          })}
          step={0.1}
        />
      </div>
    </div>
  );
};

export default ActorLayoutItemEditor;
