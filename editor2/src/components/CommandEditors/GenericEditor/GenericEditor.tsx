import React, { useState, useEffect } from 'react';
import { CommandCard } from '../../../types/command-card';
import { FormSection } from '../../../types/edit-form';
import { FormEditor } from '../../FormEditor/FormEditor';

interface GenericEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard) => void;
}

/** 通用命令编辑器 - 用于没有特殊编辑器的命令类型 */
export const GenericEditor: React.FC<GenericEditorProps> = ({ card, onChange }) => {
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

  // 自动从 params 生成表单字段
  const generateFields = () => {
    const fields = Object.entries(formData.params).map(([key, value]) => {
      let type: 'text' | 'number' | 'checkbox' = 'text';
      let fieldValue = value;

      if (typeof value === 'number') {
        type = 'number';
      } else if (typeof value === 'boolean') {
        type = 'checkbox';
      } else if (typeof value === 'object') {
        fieldValue = JSON.stringify(value, null, 2);
      }

      return {
        key,
        label: key,
        type,
        value: fieldValue,
      };
    });

    return fields;
  };

  const sections: FormSection[] = [
    {
      title: '命令参数',
      fields: generateFields() as any,
    },
  ];

  // 如果有 clip 数据，添加时间轴设置
  if (formData.clip) {
    sections.push({
      title: '时间轴设置',
      collapsed: true,
      fields: [
        {
          key: 'startTime',
          label: '开始时间',
          type: 'time',
          value: formData.clip.startTime || 0,
          min: 0,
          step: 0.001,
          helpText: '单位：秒',
        },
        {
          key: 'duration',
          label: '持续时间',
          type: 'time',
          value: formData.clip.duration || 1,
          min: 0,
          step: 0.001,
          helpText: '单位：秒',
        },
      ],
    });
  }

  return <FormEditor sections={sections} onChange={handleFieldChange} />;
};
