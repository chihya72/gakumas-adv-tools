/**
 * 通用向量输入组件
 * 支持任意数量和类型的轴输入
 */

import React from 'react';
import '../FormEditor/FormEditor.css';

interface VectorAxis {
  key: string;
  label: string;
  step?: number;
  min?: number;
  max?: number;
}

interface VectorInputProps {
  value: Record<string, number>;
  axes: VectorAxis[];
  onChange: (value: Record<string, number>) => void;
  className?: string;
}

export const VectorInput: React.FC<VectorInputProps> = ({ 
  value, 
  axes, 
  onChange,
  className = ''
}) => {
  const handleAxisChange = (key: string, newValue: number) => {
    onChange({ ...value, [key]: newValue });
  };

  return (
    <div className={`form-vector ${className}`}>
      {axes.map(axis => (
        <div key={axis.key} className="form-vector-item">
          <label>{axis.label}</label>
          <input
            type="number"
            className="form-input-small"
            value={value[axis.key] ?? 0}
            onChange={(e) => handleAxisChange(axis.key, parseFloat(e.target.value) || 0)}
            step={axis.step ?? 0.01}
            min={axis.min}
            max={axis.max}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * 预设的向量输入组件
 */

interface Vector3InputProps {
  value: { x: number; y: number; z: number };
  onChange: (value: { x: number; y: number; z: number }) => void;
  step?: number;
  labels?: { x?: string; y?: string; z?: string };
}

export const Vector3Input: React.FC<Vector3InputProps> = ({ 
  value, 
  onChange, 
  step = 0.01,
  labels = {}
}) => {
  const axes: VectorAxis[] = [
    { key: 'x', label: labels.x || 'X', step },
    { key: 'y', label: labels.y || 'Y', step },
    { key: 'z', label: labels.z || 'Z', step },
  ];

  return <VectorInput value={value} axes={axes} onChange={onChange as any} />;
};

interface Vector2InputProps {
  value: { x: number; y: number };
  onChange: (value: { x: number; y: number }) => void;
  step?: number;
  labels?: { x?: string; y?: string };
}

export const Vector2Input: React.FC<Vector2InputProps> = ({ 
  value, 
  onChange, 
  step = 0.01,
  labels = {}
}) => {
  const axes: VectorAxis[] = [
    { key: 'x', label: labels.x || 'X', step },
    { key: 'y', label: labels.y || 'Y', step },
  ];

  return <VectorInput value={value} axes={axes} onChange={onChange as any} />;
};
