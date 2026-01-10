import React, { useState, useEffect } from 'react';
import { CommandCard } from '../../../types/command-card';
import { FormSection } from '../../../types/edit-form';
import { FormEditor } from '../../FormEditor/FormEditor';

interface DialogueEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard) => void;
}

/** 对话命令编辑器 - 支持 narration、message 两种类型 */
export const DialogueEditor: React.FC<DialogueEditorProps> = ({ card, onChange }) => {
  const [formData, setFormData] = useState(card);

  useEffect(() => {
    onChange(formData);
  }, [formData]);

  const handleFieldChange = (key: string, value: any) => {
    // 特殊处理：类型切换
    if (key === '_dialogueType') {
      handleTypeChange(value);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      params: {
        ...prev.params,
        [key]: value,
      },
    }));
  };

  // 处理对话类型切换
  const handleTypeChange = (newType: string) => {
    setFormData(prev => {
      const newParams: Record<string, any> = {};
      
      // 保留通用字段
      if (prev.params.text) newParams.text = prev.params.text;
      
      // 根据新类型设置默认字段
      if (newType === 'message') {
        newParams.name = prev.params.name || '';
      } else if (newType === 'choicegroup') {
        newParams.choices = prev.params.choices || '';
      }
      
      return {
        ...prev,
        type: newType,
        params: newParams,
      };
    });
  };

  // 根据命令类型生成不同的表单字段
  const getSections = (): FormSection[] => {
    const commandType = formData.type;

    const sections: FormSection[] = [
      {
        title: '对话类型',
        fields: [
          {
            key: '_dialogueType',
            label: '类型',
            type: 'select',
            value: commandType,
            options: [
              { label: '对话 (message)', value: 'message' },
              { label: '旁白 (narration)', value: 'narration' },
            ],
          },
        ],
      },
    ];

    // narration: [narration text=走失儿童中心 clip=...]
    if (commandType === 'narration') {
      sections.push({
        title: '旁白内容',
        fields: [
          {
            key: 'text',
            label: '旁白文本',
            type: 'textarea',
            value: formData.params.text || '',
            required: true,
            placeholder: '输入旁白内容',
          },
        ],
      });
    }

    // message: [message text=<r\=……そ、そうですか。>……是、是吗。</r> name=麻央 clip=...]
    if (commandType === 'message') {
      sections.push({
        title: '对话内容',
        fields: [
          {
            key: 'name',
            label: '角色名称',
            type: 'text',
            value: formData.params.name || '',
            required: true,
            placeholder: '输入角色名称（例如：麻央）',
          },
          {
            key: 'text',
            label: '对话文本',
            type: 'textarea',
            value: formData.params.text || '',
            required: true,
            placeholder: '输入对话内容\n支持Ruby标签: <r\\=日文>中文</r>',
          },
        ],
      });
    }

    // 返回构建的表单
    return sections;
  };

  const sections = getSections();

  return <FormEditor sections={sections} onChange={handleFieldChange} />;
};
