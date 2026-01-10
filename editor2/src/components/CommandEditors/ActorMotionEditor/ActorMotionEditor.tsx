import React, { useState, useEffect } from 'react';
import { CommandCard } from '../../../types/command-card';
import { FormSection } from '../../../types/edit-form';
import { FormEditor } from '../../FormEditor/FormEditor';

interface ActorMotionEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard) => void;
}

/** 角色动作命令编辑器 */
export const ActorMotionEditor: React.FC<ActorMotionEditorProps> = ({ card, onChange }) => {
  const [formData, setFormData] = useState(card);

  useEffect(() => {
    onChange(formData);
  }, [formData]);

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      params: {
        ...prev.params,
        [key]: value,
      },
    }));
  };

  const sections: FormSection[] = [
    {
      title: '动作设置',
      fields: [
        {
          key: 'actorName',
          label: '角色名称',
          type: 'text',
          value: formData.params.actorName || '',
          required: true,
          placeholder: '角色标识符',
        },
        {
          key: 'motionName',
          label: '动作名称',
          type: 'file',
          value: formData.params.motionName || '',
          required: true,
          placeholder: '动作资源路径',
        },
        {
          key: 'loopType',
          label: '循环类型',
          type: 'select',
          value: formData.params.loopType || 0,
          options: [
            { label: '不循环', value: 0 },
            { label: '循环播放', value: 1 },
          ],
        },
      ],
    },
    {
      title: '时间轴设置',
      fields: [
        {
          key: 'startTime',
          label: '开始时间',
          type: 'time',
          value: formData.clip?.startTime || 0,
          min: 0,
          step: 0.001,
          helpText: '单位：秒',
        },
        {
          key: 'duration',
          label: '持续时间',
          type: 'time',
          value: formData.clip?.duration || 1,
          min: 0,
          step: 0.001,
          helpText: '单位：秒',
        },
        {
          key: 'timeScale',
          label: '时间缩放',
          type: 'number',
          value: formData.clip?.timeScale || 1,
          min: 0.01,
          max: 10,
          step: 0.1,
          helpText: '动作播放速度倍率',
        },
      ],
    },
    {
      title: '混合设置',
      collapsed: true,
      fields: [
        {
          key: 'blendInDuration',
          label: '淡入时间',
          type: 'time',
          value: formData.clip?.blendInDuration || 0,
          min: 0,
          step: 0.01,
        },
        {
          key: 'blendOutDuration',
          label: '淡出时间',
          type: 'time',
          value: formData.clip?.blendOutDuration || 0,
          min: 0,
          step: 0.01,
        },
      ],
    },
  ];

  return <FormEditor sections={sections} onChange={handleFieldChange} />;
};
