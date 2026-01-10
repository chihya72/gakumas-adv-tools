import React, { useState, useEffect } from 'react';
import { CommandCard } from '../../../types/command-card';
import { FormSection } from '../../../types/edit-form';
import { FormEditor } from '../../FormEditor/FormEditor';

interface ClipEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard) => void;
}

/** 时间轴clip编辑器 - 只编辑时间轴相关参数 */
export const ClipEditor: React.FC<ClipEditorProps> = ({ card, onChange }) => {
  const [formData, setFormData] = useState(card);

  useEffect(() => {
    onChange(formData);
  }, [formData]);

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      clip: {
        ...prev.clip!,
        [key]: value,
      },
    }));
  };

  if (!formData.clip) return null;

  const sections: FormSection[] = [
    {
      title: '基本时间',
      fields: [
        {
          key: 'startTime',
          label: '开始时间',
          type: 'time',
          value: formData.clip.startTime || 0,
          min: 0,
          step: 0.001,
          helpText: '单位：秒',
          required: true,
        },
        {
          key: 'duration',
          label: '持续时间',
          type: 'time',
          value: formData.clip.duration || 1,
          min: 0,
          step: 0.001,
          helpText: '单位：秒',
          required: true,
        },
        {
          key: 'clipIn',
          label: 'Clip In',
          type: 'time',
          value: formData.clip.clipIn || 0,
          min: 0,
          step: 0.001,
          helpText: '剪辑起始偏移时间（秒）',
        },
        {
          key: 'timeScale',
          label: '时间缩放',
          type: 'number',
          value: formData.clip.timeScale || 1,
          min: 0.01,
          max: 10,
          step: 0.1,
          helpText: '播放速度倍率，默认1.0',
        },
      ],
    },
    {
      title: '淡入淡出',
      fields: [
        {
          key: 'easeInDuration',
          label: '淡入时间',
          type: 'time',
          value: formData.clip.easeInDuration || 0,
          min: 0,
          step: 0.01,
          helpText: '淡入持续时间（秒）',
        },
        {
          key: 'easeOutDuration',
          label: '淡出时间',
          type: 'time',
          value: formData.clip.easeOutDuration || 0,
          min: 0,
          step: 0.01,
          helpText: '淡出持续时间（秒）',
        },
      ],
    },
    {
      title: '混合设置',
      collapsed: true,
      fields: [
        {
          key: 'blendInDuration',
          label: '混合淡入',
          type: 'time',
          value: formData.clip.blendInDuration ?? -1,
          min: -1,
          step: 0.01,
          helpText: '混合淡入时间（秒），-1为默认',
        },
        {
          key: 'blendOutDuration',
          label: '混合淡出',
          type: 'time',
          value: formData.clip.blendOutDuration ?? -1,
          min: -1,
          step: 0.01,
          helpText: '混合淡出时间（秒），-1为默认',
        },
        {
          key: 'mixInEaseType',
          label: '混入缓动类型',
          type: 'select',
          value: formData.clip.mixInEaseType ?? 1,
          options: [
            { label: '线性', value: 0 },
            { label: '默认', value: 1 },
            { label: 'EaseIn', value: 2 },
            { label: 'EaseOut', value: 3 },
            { label: 'EaseInOut', value: 4 },
          ],
        },
        {
          key: 'mixOutEaseType',
          label: '混出缓动类型',
          type: 'select',
          value: formData.clip.mixOutEaseType ?? 1,
          options: [
            { label: '线性', value: 0 },
            { label: '默认', value: 1 },
            { label: 'EaseIn', value: 2 },
            { label: 'EaseOut', value: 3 },
            { label: 'EaseInOut', value: 4 },
          ],
        },
      ],
    },
  ];

  return <FormEditor sections={sections} onChange={handleFieldChange} />;
};
