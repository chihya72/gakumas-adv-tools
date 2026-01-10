import React, { useState, useEffect } from 'react';
import { CommandCard } from '../../../types/command-card';
import { FormSection } from '../../../types/edit-form';
import { FormEditor } from '../../FormEditor/FormEditor';

interface CameraSettingEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard) => void;
}

interface CameraSettingData {
  focalLength?: number;
  nearClipPlane?: number;
  farClipPlane?: number;
  transform?: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
  };
  dofSetting?: {
    active: boolean;
    focalPoint?: number;
    fNumber?: number;
    maxBlurSpread?: number;
  };
}

/** 解析 setting JSON 字符串 */
const parseSetting = (settingStr: string | undefined): CameraSettingData => {
  if (!settingStr) {
    return {
      focalLength: 30.0,
      nearClipPlane: 0.1,
      farClipPlane: 1000.0,
      transform: {
        position: { x: 0, y: 1.3, z: 1.8 },
        rotation: { x: 0, y: 180, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      dofSetting: {
        active: false,
        focalPoint: 4.0,
        fNumber: 4.0,
        maxBlurSpread: 3.0,
      },
    };
  }
  
  try {
    // 移除转义符（如果有的话）：\{ -> {, \} -> }
    const cleanedSetting = settingStr.replace(/\\/g, '');
    return JSON.parse(cleanedSetting);
  } catch (e) {
    console.error('解析相机设置失败:', e);
    return {};
  }
};

/** 序列化 setting 对象为 JSON 字符串（带转义格式 \{...\}） */
const serializeSetting = (data: CameraSettingData): string => {
  const json = JSON.stringify(data);
  // 转义所有的大括号，格式为 \{...\}
  return json.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
};

/** 相机设置命令编辑器 */
export const CameraSettingEditor: React.FC<CameraSettingEditorProps> = ({ card, onChange }) => {
  const [setting, setSetting] = useState<CameraSettingData>(() => parseSetting(card.params.setting));
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化完成后标记
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // 监听外部 card 的变化（比如用户直接编辑原始命令），同步到编辑器
  useEffect(() => {
    if (isInitialized) {
      const currentSettingStr = serializeSetting(setting);
      // 只有当外部 setting 真的不同时才更新
      if (card.params.setting !== currentSettingStr) {
        const newSetting = parseSetting(card.params.setting);
        setSetting(newSetting);
      }
    }
  }, [card.params.setting, isInitialized]);

  // 监听编辑器的修改，实时同步到父组件
  useEffect(() => {
    if (isInitialized) {
      const updatedCard = {
        ...card,
        params: {
          ...card.params,
          setting: serializeSetting(setting),
        },
      };
      onChange(updatedCard);
    }
  }, [setting, isInitialized]);

  const handleFieldChange = (key: string, value: any) => {
    setSetting(prev => {
      const newSetting = { ...prev };
      
      // 处理嵌套字段
      if (key === 'position' || key === 'rotation' || key === 'scale') {
        newSetting.transform = {
          ...newSetting.transform,
          [key]: value,
        };
      } else if (key === 'dofActive') {
        newSetting.dofSetting = {
          ...newSetting.dofSetting,
          active: value,
        };
      } else if (key === 'focalPoint' || key === 'fNumber' || key === 'maxBlurSpread') {
        newSetting.dofSetting = {
          ...newSetting.dofSetting,
          [key]: value,
        };
      } else {
        // 顶层字段
        (newSetting as any)[key] = value;
      }
      
      return newSetting;
    });
  };

  const sections: FormSection[] = [
    {
      title: '相机基本设置',
      fields: [
        {
          key: 'focalLength',
          label: '焦距',
          type: 'number',
          value: setting.focalLength ?? 30.0,
          min: 1,
          max: 179,
          step: 0.1,
          helpText: '相机焦距，影响视野范围',
        },
        {
          key: 'nearClipPlane',
          label: '近裁剪面',
          type: 'number',
          value: setting.nearClipPlane ?? 0.1,
          min: 0.01,
          step: 0.01,
          helpText: '相机能看到的最近距离',
        },
        {
          key: 'farClipPlane',
          label: '远裁剪面',
          type: 'number',
          value: setting.farClipPlane ?? 1000.0,
          min: 1,
          step: 10,
          helpText: '相机能看到的最远距离',
        },
      ],
    },
    {
      title: '相机位置',
      fields: [
        {
          key: 'position',
          label: '位置',
          type: 'vector3',
          value: setting.transform?.position || { x: 0, y: 1.3, z: 1.8 },
          step: 0.01,
        },
        {
          key: 'rotation',
          label: '旋转',
          type: 'vector3',
          value: setting.transform?.rotation || { x: 0, y: 180, z: 0 },
          step: 1,
          helpText: '欧拉角，单位：度',
        },
        {
          key: 'scale',
          label: '缩放',
          type: 'vector3',
          value: setting.transform?.scale || { x: 1, y: 1, z: 1 },
          step: 0.01,
          helpText: '一般保持为 1',
        },
      ],
    },
    {
      title: '景深设置',
      collapsed: true,
      fields: [
        {
          key: 'dofActive',
          label: '启用景深',
          type: 'checkbox',
          value: setting.dofSetting?.active ?? false,
        },
        {
          key: 'focalPoint',
          label: '焦点距离',
          type: 'number',
          value: setting.dofSetting?.focalPoint ?? 4.0,
          min: 0.1,
          step: 0.1,
          helpText: '焦点所在距离',
        },
        {
          key: 'fNumber',
          label: '光圈值 (F-Number)',
          type: 'number',
          value: setting.dofSetting?.fNumber ?? 4.0,
          min: 0.1,
          step: 0.1,
          helpText: '光圈大小，值越小景深效果越强',
        },
        {
          key: 'maxBlurSpread',
          label: '最大模糊范围',
          type: 'number',
          value: setting.dofSetting?.maxBlurSpread ?? 3.0,
          min: 0,
          step: 0.1,
          helpText: '模糊的最大扩散程度',
        },
      ],
    },
  ];

  return <FormEditor sections={sections} onChange={handleFieldChange} />;
};
