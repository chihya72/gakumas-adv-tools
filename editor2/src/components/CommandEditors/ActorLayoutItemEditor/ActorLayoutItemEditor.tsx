import React, { useState, useEffect } from 'react';
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

  const updatePosition = (axis: 'x' | 'y' | 'z', value: number) => {
    setLocalData(prev => ({
      ...prev,
      transform: {
        ...prev.transform,
        position: { ...prev.transform.position, [axis]: value },
      },
    }));
  };

  const updateRotation = (axis: 'x' | 'y' | 'z', value: number) => {
    setLocalData(prev => ({
      ...prev,
      transform: {
        ...prev.transform,
        rotation: { ...prev.transform.rotation, [axis]: value },
      },
    }));
  };

  const updateScale = (axis: 'x' | 'y' | 'z', value: number) => {
    setLocalData(prev => ({
      ...prev,
      transform: {
        ...prev.transform,
        scale: { ...prev.transform.scale, [axis]: value },
      },
    }));
  };

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
        <div className="form-vector">
          <div className="form-vector-item">
            <label>X</label>
            <input
              type="number"
              className="form-input-small"
              value={localData.transform.position.x}
              onChange={(e) => updatePosition('x', parseFloat(e.target.value) || 0)}
              step="0.01"
            />
          </div>
          <div className="form-vector-item">
            <label>Y</label>
            <input
              type="number"
              className="form-input-small"
              value={localData.transform.position.y}
              onChange={(e) => updatePosition('y', parseFloat(e.target.value) || 0)}
              step="0.01"
            />
          </div>
          <div className="form-vector-item">
            <label>Z</label>
            <input
              type="number"
              className="form-input-small"
              value={localData.transform.position.z}
              onChange={(e) => updatePosition('z', parseFloat(e.target.value) || 0)}
              step="0.01"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4 style={{ margin: '16px 0 8px 0', fontSize: '14px', fontWeight: 600 }}>旋转 (Rotation)</h4>
        <div className="form-vector">
          <div className="form-vector-item">
            <label>X (度)</label>
            <input
              type="number"
              className="form-input-small"
              value={localData.transform.rotation.x}
              onChange={(e) => updateRotation('x', parseFloat(e.target.value) || 0)}
              step="1"
            />
          </div>
          <div className="form-vector-item">
            <label>Y (度)</label>
            <input
              type="number"
              className="form-input-small"
              value={localData.transform.rotation.y}
              onChange={(e) => updateRotation('y', parseFloat(e.target.value) || 0)}
              step="1"
            />
          </div>
          <div className="form-vector-item">
            <label>Z (度)</label>
            <input
              type="number"
              className="form-input-small"
              value={localData.transform.rotation.z}
              onChange={(e) => updateRotation('z', parseFloat(e.target.value) || 0)}
              step="1"
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
              value={localData.transform.scale.x}
              onChange={(e) => updateScale('x', parseFloat(e.target.value) || 1)}
              step="0.1"
            />
          </div>
          <div className="form-vector-item">
            <label>Y</label>
            <input
              type="number"
              className="form-input-small"
              value={localData.transform.scale.y}
              onChange={(e) => updateScale('y', parseFloat(e.target.value) || 1)}
              step="0.1"
            />
          </div>
          <div className="form-vector-item">
            <label>Z</label>
            <input
              type="number"
              className="form-input-small"
              value={localData.transform.scale.z}
              onChange={(e) => updateScale('z', parseFloat(e.target.value) || 1)}
              step="0.1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorLayoutItemEditor;
