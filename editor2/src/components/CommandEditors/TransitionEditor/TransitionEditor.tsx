/**
 * Transition 编辑器 - 场景过渡效果
 * 模式一：简单参数编辑器
 */

import React, { useState, useEffect } from 'react';
import { CommandCard } from '../../../types/command-card';
import { FormSection } from '../../../types/edit-form';
import { FormEditor } from '../../FormEditor/FormEditor';

export interface TransitionEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard, isValid?: boolean) => void;
}

// 可用的过渡效果列表
const TRANSITION_EFFECTS = [
  { value: 'ttn_adv_transition_change_l', label: 'change_l' },
  { value: 'ttn_adv_transition_change_p', label: 'change_p' },
  { value: 'ttn_adv_transition_event_change', label: 'event_change (活动场景切换)' },
  { value: 'ttn_adv_transition_event_time', label: 'event_time (活动时间过渡)' },
  { value: 'ttn_adv_transition_time_l', label: 'time_l' },
  { value: 'ttn_adv_transition_time_p', label: 'time_p' }
];

// 类型选项
const TYPE_OPTIONS = [
  { value: 'In', label: 'In (淡入)' },
  { value: 'Out', label: 'Out (淡出)' }
];

// 可用角色列表（仅包含实际在数据中出现的13名角色）
const CHARACTER_LIST = [
  { value: '', label: '-- 选择角色 --' },
  { value: 'amao', label: 'amao - 有村麻央' },
  { value: 'atbm', label: 'atbm - 雨夜燕' },
  { value: 'fktn', label: 'fktn - 藤田琴音' },
  { value: 'hmsz', label: 'hmsz - 秦谷美铃' },
  { value: 'hrnm', label: 'hrnm - 姬崎莉波' },
  { value: 'hski', label: 'hski - 花海咲季' },
  { value: 'hume', label: 'hume - 花海佑芽' },
  { value: 'jsna', label: 'jsna - 十王星南' },
  { value: 'kcna', label: 'kcna - 仓本千奈' },
  { value: 'kllj', label: 'kllj - 葛城莉莉娅' },
  { value: 'shro', label: 'shro - 筱泽广' },
  { value: 'ssmk', label: 'ssmk - 紫云清夏' },
  { value: 'ttmr', label: 'ttmr - 月村手毬' }
];

export const TransitionEditor: React.FC<TransitionEditorProps> = ({ card, onChange }) => {
  const [formData, setFormData] = useState(card);

  // 初始化时清理不应该存在的character参数
  useEffect(() => {
    const isEventType = 
      formData.params.transition === 'ttn_adv_transition_event_change' || 
      formData.params.transition === 'ttn_adv_transition_event_time';
    
    if (isEventType && formData.params.character !== undefined) {
      const cleanedParams = { ...formData.params };
      delete cleanedParams.character;
      setFormData({
        ...formData,
        params: cleanedParams
      });
    }
  }, []); // 只在mount时执行一次

  useEffect(() => {
    // 验证逻辑：非event类型时，character必须有值且不为空
    const isEventType = 
      formData.params.transition === 'ttn_adv_transition_event_change' || 
      formData.params.transition === 'ttn_adv_transition_event_time';
    
    const isValid = isEventType 
      ? true  // event类型不需要character，总是有效
      : !!(formData.params.character && formData.params.character.trim() !== ''); // 非event类型必须有character
    
    onChange(formData, isValid);
  }, [formData]);

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => {
      // 检查当前的transition类型（使用更新后的值）
      const currentTransition = key === 'transition' ? value : prev.params.transition;
      const isEventType = 
        currentTransition === 'ttn_adv_transition_event_change' || 
        currentTransition === 'ttn_adv_transition_event_time';
      
      // 按正确顺序重建params对象
      const newParams: any = {};
      
      // transition参数
      newParams.transition = key === 'transition' ? value : prev.params.transition;
      
      // type参数
      if (prev.params.type !== undefined || key === 'type') {
        newParams.type = key === 'type' ? value : prev.params.type;
      }
      
      // character参数（仅在非event类型时）
      if (!isEventType) {
        // 允许空值，由验证机制控制保存按钮
        newParams.character = key === 'character' ? value : (prev.params.character || '');
      }
      // event类型时，完全不包含character参数
      
      // clip参数
      if (prev.params.clip !== undefined) {
        newParams.clip = prev.params.clip;
      }

      return {
        ...prev,
        params: newParams
      };
    });
  };

  // 判断当前transition类型是否需要character参数
  const isCharacterDisabled = 
    formData.params.transition === 'ttn_adv_transition_event_change' || 
    formData.params.transition === 'ttn_adv_transition_event_time';

  // 动态调整角色选项列表：保留空选项，通过验证机制控制保存
  const characterOptions = CHARACTER_LIST;

  const sections: FormSection[] = [
    {
      title: '场景过渡设置',
      fields: [
        {
          key: 'transition',
          label: '过渡效果',
          type: 'select',
          value: formData.params.transition || '',
          options: TRANSITION_EFFECTS,
          hint: '选择过渡动画效果类型'
        },
        {
          key: 'type',
          label: '类型',
          type: 'select',
          value: formData.params.type || 'In',
          options: TYPE_OPTIONS,
          hint: 'In: 淡入效果 | Out: 淡出效果'
        },
        {
          key: 'character',
          label: isCharacterDisabled ? '角色 (此类型不需要)' : '角色 *',
          type: 'select',
          value: isCharacterDisabled ? '' : (formData.params.character || ''),
          options: characterOptions,
          hint: isCharacterDisabled 
            ? 'event_change和event_time类型不使用角色参数' 
            : '选择应用过渡效果的角色（必填，未选择时无法保存）',
          disabled: isCharacterDisabled
        }
      ]
    }
  ];

  return <FormEditor sections={sections} onChange={handleFieldChange} />;
};
