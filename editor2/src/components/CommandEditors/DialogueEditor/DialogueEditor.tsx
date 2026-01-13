import React, { useState, useEffect } from 'react';
import { CommandCard } from '../../../types/command-card';
import '../../FormEditor/FormEditor.css';

interface DialogueEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard, isValid?: boolean) => void;
}

/** 对话命令编辑器 - 支持 narration、message 两种类型 */
export const DialogueEditor: React.FC<DialogueEditorProps> = ({ card, onChange }) => {
  const [formData, setFormData] = useState(card);

  useEffect(() => {
    // 验证表单
    const commandType = formData.type;
    let isValid = false;

    if (commandType === 'narration') {
      // 旁白：text 必填
      isValid = !!(formData.params.text && formData.params.text.trim() !== '');
    } else if (commandType === 'message') {
      // 对话：name 和 text 都必填
      isValid = !!(
        formData.params.name && formData.params.name.trim() !== '' &&
        formData.params.text && formData.params.text.trim() !== ''
      );
    }

    onChange(formData, isValid);
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

  const commandType = formData.type;

  return (
    <div className="form-editor">
      {/* 对话类型 */}
      <div className="form-field">
        <label className="form-field-label">
          类型
          <span className="form-field-required">*</span>
        </label>
        <div className="form-field-input">
          <select
            value={commandType}
            onChange={(e) => handleFieldChange('_dialogueType', e.target.value)}
            className="form-select"
          >
            <option value="message">对话 (message)</option>
            <option value="narration">旁白 (narration)</option>
          </select>
        </div>
      </div>

      {/* narration: [narration text=走失儿童中心 clip=...] */}
      {commandType === 'narration' && (
        <div className="form-field">
          <label className="form-field-label">
            旁白文本
            <span className="form-field-required">*</span>
          </label>
          <div className="form-field-input">
            <textarea
              value={formData.params.text || ''}
              onChange={(e) => handleFieldChange('text', e.target.value)}
              className="form-textarea"
              placeholder="输入旁白内容"
              rows={4}
            />
          </div>
        </div>
      )}

      {/* message: [message text=<r\=……そ、そうですか。>……是、是吗。</r> name=麻央 clip=...] */}
      {commandType === 'message' && (
        <>
          <div className="form-field">
            <label className="form-field-label">
              角色名称
              <span className="form-field-required">*</span>
            </label>
            <div className="form-field-input">
              <input
                type="text"
                value={formData.params.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="form-input"
                placeholder="输入角色名称（例如：麻央）"
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-field-label">
              对话文本
              <span className="form-field-required">*</span>
            </label>
            <div className="form-field-input">
              <textarea
                value={formData.params.text || ''}
                onChange={(e) => handleFieldChange('text', e.target.value)}
                className="form-textarea"
                placeholder="输入对话内容&#10;支持Ruby标签: <r\=日文>中文</r>"
                rows={4}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
