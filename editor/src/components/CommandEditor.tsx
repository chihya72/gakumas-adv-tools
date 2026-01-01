import React, { useState, useEffect } from 'react';
import type { Command } from '../types/adv-script';
import { ResourceSelector } from './ResourceSelector';
import { ResourceSelectorModal } from './ResourceSelectorModal';
import './CommandEditor.css';

interface CommandEditorProps {
  command: Command;
  onSave: (updatedCommand: Command) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

interface ResourceOption {
  value: string;
  label: string;
}

export const CommandEditor: React.FC<CommandEditorProps> = ({ 
  command, 
  onSave, 
  onCancel,
  onDelete 
}) => {
  const [editedCommand, setEditedCommand] = useState<Command>(JSON.parse(JSON.stringify(command)));
  const [resourceOptions, setResourceOptions] = useState<Record<string, ResourceOption[]>>({});
  const [loadingResources, setLoadingResources] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState<{
    arrayKey: string;
    itemIndex: number;
    paramKey: string;
    currentValue: string;
    resourceType: 'body' | 'face' | 'hair' | 'motion' | 'facial_motion' | 'environment';
  } | null>(null);
  const API_BASE = 'http://localhost:5000/api';

  // 加载资源选项
  const loadResourceOptions = async (characterId: string, resourceType: string) => {
    const cacheKey = `${characterId}-${resourceType}`;
    if (resourceOptions[cacheKey]) return; // 已缓存

    setLoadingResources(true);
    try {
      const response = await fetch(
        `${API_BASE}/resources?character_id=${characterId}&resource_type=${resourceType}`
      );
      const data = await response.json();
      
      if (data.success) {
        const options = data.data.map((r: any) => ({
          value: r.resource_name,
          label: r.resource_name
        }));
        setResourceOptions(prev => ({ ...prev, [cacheKey]: options }));
      }
    } catch (error) {
      console.error('加载资源选项失败:', error);
    } finally {
      setLoadingResources(false);
    }
  };

  // 搜索资源
  const searchResources = async (keyword: string, resourceType?: string) => {
    try {
      const response = await fetch(`${API_BASE}/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();
      
      if (data.success) {
        let results = data.data;
        if (resourceType) {
          results = results.filter((r: any) => r.resource_type === resourceType);
        }
        return results.map((r: any) => ({
          value: r.resource_name,
          label: `${r.character_id} - ${r.resource_name}`
        }));
      }
    } catch (error) {
      console.error('搜索资源失败:', error);
    }
    return [];
  };

  // 检测并自动加载资源
  useEffect(() => {
    // actor相关命令 - 加载角色资源
    if (command.type === 'actorgroup' && command.params.actors) {
      const actorMatch = String(command.params.actors).match(/id=(\w+)/);
      if (actorMatch) {
        const characterId = actorMatch[1];
        loadResourceOptions(characterId, 'body');
        loadResourceOptions(characterId, 'face');
        loadResourceOptions(characterId, 'hair');
      }
    }
    
    // motion相关命令
    if (command.type === 'actormotion' && command.params.id) {
      loadResourceOptions(String(command.params.id), 'motion');
    }
    
    // facial motion相关命令
    if (command.type === 'actorfacialmotion' && command.params.id) {
      loadResourceOptions(String(command.params.id), 'facial_motion');
    }
  }, [command]);

  // 解析嵌套命令参数（如 [actor id=xxx body=xxx]）
  const parseNestedParams = (nestedCmd: string): Record<string, string> => {
    const params: Record<string, string> = {};
    // 移除开头的命令类型（如 "[actor " 或 "[background "）
    const match = nestedCmd.match(/^\[(\w+)\s+(.+)\]$/);
    if (!match || !match[2]) return params;
    
    const paramsStr = match[2];
    const regex = /(\w+)=([^\s\]]*)/g;
    let paramMatch;
    while ((paramMatch = regex.exec(paramsStr)) !== null) {
      if (paramMatch[1] !== undefined) {
        params[paramMatch[1]] = paramMatch[2] || '';
      }
    }
    return params;
  };

  // 重建嵌套命令字符串
  const rebuildNestedCmd = (cmdType: string, params: Record<string, any>): string => {
    const paramStr = Object.entries(params)
      .map(([k, v]) => {
        // 如果是对象类型，转换为转义的JSON字符串
        if (typeof v === 'object' && v !== null) {
          const jsonStr = JSON.stringify(v);
          const escapedJson = jsonStr.replace(/"/g, '\\"').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
          return `${k}=${escapedJson}`;
        }
        return `${k}=${v}`;
      })
      .join(' ');
    return `[${cmdType} ${paramStr}]`;
  };

  // 更新嵌套参数（数组中的某个项的某个属性）
  const updateNestedParam = (arrayKey: string, itemIndex: number, paramKey: string, paramValue: string) => {
    setEditedCommand(prev => {
      const arrayValue = prev.params[arrayKey];
      const values = Array.isArray(arrayValue) ? [...arrayValue] : [arrayValue];
      
      if (typeof values[itemIndex] === 'string') {
        const nestedCmd = values[itemIndex] as string;
        const cmdTypeMatch = nestedCmd.match(/^\[(\w+)\s/);
        const cmdType = cmdTypeMatch ? cmdTypeMatch[1] : 'actor';
        
        const params = parseNestedParams(nestedCmd);
        params[paramKey] = paramValue;
        values[itemIndex] = rebuildNestedCmd(cmdType, params);
      }
      
      return {
        ...prev,
        params: {
          ...prev.params,
          [arrayKey]: values
        }
      };
    });
  };

  // 添加嵌套项
  const addNestedItem = (arrayKey: string) => {
    // 根据父命令类型确定子项类型
    let cmdType: string;
    if (arrayKey === 'actors') {
      cmdType = 'actor';
    } else if (arrayKey === 'backgrounds') {
      cmdType = 'background';
    } else if (arrayKey === 'lights') {
      cmdType = 'light';
    } else if (arrayKey === 'layouts') {
      // ⚠️ 关键修复：根据父命令类型确定布局类型
      if (command.type === 'actorlayoutgroup') {
        cmdType = 'actorlayout';
      } else if (command.type === 'backgroundlayoutgroup') {
        cmdType = 'backgroundlayout';
      } else {
        cmdType = 'layout'; // 回退方案
      }
    } else {
      cmdType = 'item';
    }
    
    // 为不同类型设置合适的默认参数
    let defaultParams: any;
    if (cmdType === 'actor') {
      defaultParams = { id: 'new_actor', body: '', face: '', hair: '' };
    } else if (cmdType === 'background') {
      defaultParams = { id: 'new_bg', src: '' };
    } else if (cmdType === 'light') {
      defaultParams = { id: 'new_light' };
    } else if (cmdType === 'actorlayout' || cmdType === 'backgroundlayout' || cmdType === 'layout') {
      // 所有布局类型都需要包含transform对象
      defaultParams = { 
        id: 'new_layout',
        transform: {
          position: { x: 0.0, y: 0.0, z: 0.0 },
          rotation: { x: 0.0, y: 0.0, z: 0.0 },
          scale: { x: 1.0, y: 1.0, z: 1.0 }
        }
      };
    } else {
      defaultParams = { id: 'new_item' };
    }
    
    const newItem = rebuildNestedCmd(cmdType, defaultParams);
    
    setEditedCommand(prev => {
      const arrayValue = prev.params[arrayKey];
      const values = Array.isArray(arrayValue) ? [...arrayValue] : arrayValue ? [arrayValue] : [];
      values.push(newItem);
      
      return {
        ...prev,
        params: {
          ...prev.params,
          [arrayKey]: values
        }
      };
    });
  };

  // 删除嵌套项
  const deleteNestedItem = (arrayKey: string, itemIndex: number) => {
    setEditedCommand(prev => {
      const arrayValue = prev.params[arrayKey];
      const values = Array.isArray(arrayValue) ? [...arrayValue] : [arrayValue];
      values.splice(itemIndex, 1);
      
      return {
        ...prev,
        params: {
          ...prev.params,
          [arrayKey]: values.length > 0 ? values : undefined
        }
      };
    });
  };

  // 更新参数
  const updateParam = (key: string, value: any) => {
    setEditedCommand(prev => ({
      ...prev,
      params: {
        ...prev.params,
        [key]: value
      }
    }));
  };

  // 更新clip
  const updateClip = (key: string, value: any) => {
    if (!editedCommand.clip) return;
    
    setEditedCommand(prev => ({
      ...prev,
      clip: {
        ...prev.clip!,
        [key]: value
      }
    }));
  };

  // 渲染参数编辑器
  const renderParamEditor = (key: string, value: any, customUpdate?: (value: any) => void) => {
    const updateFn = customUpdate || ((newValue: any) => updateParam(key, newValue));
    
    // 检测是否是资源相关的参数
    const isMotionParam = key === 'motion' && (
      command.type === 'actormotion' || 
      command.type === 'actorfacialmotion' ||
      command.type === 'actoradditivemotion'
    );
    
    const isActorParam = key === 'actors' && command.type === 'actorgroup';
    
    // 数字类型
    if (typeof value === 'number') {
      return (
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => updateFn(parseFloat(e.target.value) || 0)}
          className="param-input"
        />
      );
    }
    
    // 布尔类型
    if (typeof value === 'boolean') {
      return (
        <select
          value={value ? 'true' : 'false'}
          onChange={(e) => updateFn(e.target.value === 'true')}
          className="param-input"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }
    
    // 对象类型 - JSON编辑
    if (typeof value === 'object' && value !== null) {
      return (
        <textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              updateFn(parsed);
            } catch (err) {
              // 暂时不更新，等待用户完成输入
            }
          }}
          className="param-textarea"
          rows={Math.min(10, JSON.stringify(value, null, 2).split('\n').length)}
        />
      );
    }
    
    // Motion参数 - 提供搜索和选择
    if (isMotionParam) {
      const characterId = command.params.id || command.params.actorId;
      const resourceType = command.type === 'actorfacialmotion' ? 'facial_motion' : 'motion';
      const cacheKey = characterId ? `${characterId}-${resourceType}` : '';
      const options = cacheKey ? resourceOptions[cacheKey] || [] : [];
      
      return (
        <div className="resource-selector">
          <input
            type="text"
            value={value}
            onChange={(e) => updateFn(e.target.value)}
            className="param-input"
            list={`${key}-options`}
            placeholder="输入或选择资源..."
          />
          {options.length > 0 && (
            <datalist id={`${key}-options`}>
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </datalist>
          )}
          <button
            type="button"
            className="btn-search-resource"
            onClick={async () => {
              const results = await searchResources(String(value), resourceType);
              if (results.length > 0) {
                const selection = window.prompt(
                  `找到 ${results.length} 个结果，输入序号选择:\n` +
                  results.map((r, i) => `${i + 1}. ${r.label}`).join('\n')
                );
                if (selection) {
                  const index = parseInt(selection) - 1;
                  if (results[index]) {
                    updateFn(results[index].value);
                  }
                }
              } else {
                alert('未找到匹配的资源');
              }
            }}
            title="搜索资源"
          >
            🔍
          </button>
        </div>
      );
    }
    
    // Camera Setting参数 - 特殊处理
    if (key === 'setting' && typeof value === 'string' && (command.type === 'camerasetting' || command.type === 'camera')) {
      try {
        const unescapedJson = value.replace(/\\"/g, '"').replace(/\\\{/g, '{').replace(/\\\}/g, '}');
        const settingData = JSON.parse(unescapedJson);
        
        return (
          <div className="camera-setting-editor">
            {/* focalLength */}
            {settingData.focalLength !== undefined && (
              <div className="setting-field">
                <label className="setting-label">焦距 (Focal Length):</label>
                <input
                  type="number"
                  step="0.1"
                  value={settingData.focalLength}
                  onChange={(e) => {
                    const newData = { ...settingData };
                    newData.focalLength = parseFloat(e.target.value) || 0;
                    const escapedJson = JSON.stringify(newData).replace(/"/g, '\\"').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
                    updateFn(escapedJson);
                  }}
                  className="setting-input"
                />
              </div>
            )}
            
            {/* nearClipPlane */}
            {settingData.nearClipPlane !== undefined && (
              <div className="setting-field">
                <label className="setting-label">近裁剪面 (Near Clip):</label>
                <input
                  type="number"
                  step="0.001"
                  value={settingData.nearClipPlane}
                  onChange={(e) => {
                    const newData = { ...settingData };
                    newData.nearClipPlane = parseFloat(e.target.value) || 0;
                    const escapedJson = JSON.stringify(newData).replace(/"/g, '\\"').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
                    updateFn(escapedJson);
                  }}
                  className="setting-input"
                />
              </div>
            )}
            
            {/* farClipPlane */}
            {settingData.farClipPlane !== undefined && (
              <div className="setting-field">
                <label className="setting-label">远裁剪面 (Far Clip):</label>
                <input
                  type="number"
                  step="1"
                  value={settingData.farClipPlane}
                  onChange={(e) => {
                    const newData = { ...settingData };
                    newData.farClipPlane = parseFloat(e.target.value) || 0;
                    const escapedJson = JSON.stringify(newData).replace(/"/g, '\\"').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
                    updateFn(escapedJson);
                  }}
                  className="setting-input"
                />
              </div>
            )}
            
            {/* useOcclusionCulling */}
            {settingData.useOcclusionCulling !== undefined && (
              <div className="setting-field">
                <label className="setting-label">遮挡剔除 (Occlusion Culling):</label>
                <select
                  value={settingData.useOcclusionCulling ? 'true' : 'false'}
                  onChange={(e) => {
                    const newData = { ...settingData };
                    newData.useOcclusionCulling = e.target.value === 'true';
                    const escapedJson = JSON.stringify(newData).replace(/"/g, '\\"').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
                    updateFn(escapedJson);
                  }}
                  className="setting-input"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>
            )}
            
            {/* transform - 使用transform编辑器 */}
            {settingData.transform && (
              <div className="setting-field-full">
                <label className="setting-label">变换 (Transform):</label>
                {renderParamEditor('transform', JSON.stringify(settingData.transform).replace(/"/g, '\\"').replace(/\{/g, '\\{').replace(/\}/g, '\\}'), (newTransformValue) => {
                  const newData = { ...settingData };
                  const unescapedTransform = newTransformValue.replace(/\\"/g, '"').replace(/\\\{/g, '{').replace(/\\\}/g, '}');
                  newData.transform = JSON.parse(unescapedTransform);
                  const escapedJson = JSON.stringify(newData).replace(/"/g, '\\"').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
                  updateFn(escapedJson);
                })}
              </div>
            )}
            
            {/* dofSetting */}
            {settingData.dofSetting && (
              <div className="setting-field-group">
                <label className="setting-label">景深设置 (DOF):</label>
                <div className="dof-fields">
                  <div className="setting-field-inline">
                    <label>启用:</label>
                    <select
                      value={settingData.dofSetting.active ? 'true' : 'false'}
                      onChange={(e) => {
                        const newData = { ...settingData };
                        newData.dofSetting.active = e.target.value === 'true';
                        const escapedJson = JSON.stringify(newData).replace(/"/g, '\\"').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
                        updateFn(escapedJson);
                      }}
                      className="setting-input-small"
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  </div>
                  <div className="setting-field-inline">
                    <label>焦点距离:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settingData.dofSetting.focalPoint}
                      onChange={(e) => {
                        const newData = { ...settingData };
                        newData.dofSetting.focalPoint = parseFloat(e.target.value) || 0;
                        const escapedJson = JSON.stringify(newData).replace(/"/g, '\\"').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
                        updateFn(escapedJson);
                      }}
                      className="setting-input-small"
                    />
                  </div>
                  <div className="setting-field-inline">
                    <label>光圈值:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settingData.dofSetting.fNumber}
                      onChange={(e) => {
                        const newData = { ...settingData };
                        newData.dofSetting.fNumber = parseFloat(e.target.value) || 0;
                        const escapedJson = JSON.stringify(newData).replace(/"/g, '\\"').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
                        updateFn(escapedJson);
                      }}
                      className="setting-input-small"
                    />
                  </div>
                  <div className="setting-field-inline">
                    <label>最大模糊:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settingData.dofSetting.maxBlurSpread}
                      onChange={(e) => {
                        const newData = { ...settingData };
                        newData.dofSetting.maxBlurSpread = parseFloat(e.target.value) || 0;
                        const escapedJson = JSON.stringify(newData).replace(/"/g, '\\"').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
                        updateFn(escapedJson);
                      }}
                      className="setting-input-small"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      } catch (err) {
        console.error('Failed to parse camera setting:', err);
      }
    }
    
    // Transform参数 - 支持对象和转义JSON字符串两种格式
    if (key === 'transform') {
      let transformData: any = null;
      
      // 如果是对象，直接使用
      if (typeof value === 'object' && value !== null) {
        transformData = value;
      }
      // 如果是字符串，尝试解析
      else if (typeof value === 'string') {
        try {
          const unescapedJson = value.replace(/\\"/g, '"').replace(/\\\{/g, '{').replace(/\\\}/g, '}');
          transformData = JSON.parse(unescapedJson);
        } catch (err) {
          console.error('Failed to parse transform string:', err);
        }
      }
      
      if (transformData && transformData.position && transformData.rotation && transformData.scale) {
          // 辅助函数：更新transform数据
          const updateTransform = (updater: (data: any) => void) => {
            const newData = JSON.parse(JSON.stringify(transformData)); // 深拷贝
            updater(newData);
            // 如果原始值是对象，直接更新对象；如果是字符串，转换为转义JSON
            if (typeof value === 'object') {
              updateFn(newData);
            } else {
              const escapedJson = JSON.stringify(newData).replace(/"/g, '\\"').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
              updateFn(escapedJson);
            }
          };
          
          return (
            <div className="transform-editor">
              <div className="transform-section">
                <label className="transform-label">位置 (Position):</label>
                <div className="transform-fields">
                  <div className="transform-field-with-label">
                    <label className="axis-label">X (左右)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={transformData.position.x}
                      onChange={(e) => updateTransform((data) => {
                        data.position.x = parseFloat(e.target.value) || 0;
                      })}
                      className="transform-input"
                    />
                  </div>
                  <div className="transform-field-with-label">
                    <label className="axis-label">Y (高度)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={transformData.position.y}
                      onChange={(e) => updateTransform((data) => {
                        data.position.y = parseFloat(e.target.value) || 0;
                      })}
                      className="transform-input"
                    />
                  </div>
                  <div className="transform-field-with-label">
                    <label className="axis-label">Z (前后)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={transformData.position.z}
                      onChange={(e) => updateTransform((data) => {
                        data.position.z = parseFloat(e.target.value) || 0;
                      })}
                      className="transform-input"
                    />
                  </div>
                </div>
              </div>
              <div className="transform-section">
                <label className="transform-label">旋转 (Rotation):</label>
                <div className="transform-fields">
                  <div className="transform-field-with-label">
                    <label className="axis-label">X (俯仰)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={transformData.rotation.x}
                      onChange={(e) => updateTransform((data) => {
                        data.rotation.x = parseFloat(e.target.value) || 0;
                      })}
                      className="transform-input"
                    />
                  </div>
                  <div className="transform-field-with-label">
                    <label className="axis-label">Y (偏航)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={transformData.rotation.y}
                      onChange={(e) => updateTransform((data) => {
                        data.rotation.y = parseFloat(e.target.value) || 0;
                      })}
                      className="transform-input"
                    />
                  </div>
                  <div className="transform-field-with-label">
                    <label className="axis-label">Z (翻滚)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={transformData.rotation.z}
                      onChange={(e) => updateTransform((data) => {
                        data.rotation.z = parseFloat(e.target.value) || 0;
                      })}
                      className="transform-input"
                    />
                  </div>
                </div>
              </div>
              <div className="transform-section">
                <label className="transform-label">缩放 (Scale):</label>
                <div className="transform-fields">
                  <div className="transform-field-with-label">
                    <label className="axis-label">X (宽度)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transformData.scale.x}
                      onChange={(e) => updateTransform((data) => {
                        data.scale.x = parseFloat(e.target.value) || 0;
                      })}
                      className="transform-input"
                    />
                  </div>
                  <div className="transform-field-with-label">
                    <label className="axis-label">Y (高度)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transformData.scale.y}
                      onChange={(e) => updateTransform((data) => {
                        data.scale.y = parseFloat(e.target.value) || 0;
                      })}
                      className="transform-input"
                    />
                  </div>
                  <div className="transform-field-with-label">
                    <label className="axis-label">Z (深度)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transformData.scale.z}
                      onChange={(e) => updateTransform((data) => {
                        data.scale.z = parseFloat(e.target.value) || 0;
                      })}
                      className="transform-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
      }
    }
    
    // 字符串类型 - 长文本用textarea
    if (typeof value === 'string' && value.length > 50) {
      return (
        <textarea
          value={value}
          onChange={(e) => updateFn(e.target.value)}
          className="param-textarea"
          rows={Math.min(5, value.split('\n').length + 1)}
        />
      );
    }
    
    // 默认文本输入
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => updateFn(e.target.value)}
        className="param-input"
      />
    );
  };

  return (
    <>
      <div className="command-editor-overlay" onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}>
        <div className="command-editor">
        <div className="editor-header">
          <h3>编辑命令</h3>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <div className="editor-content">
          {/* 基本信息 */}
          <div className="editor-section">
            <h4>基本信息</h4>
            <div className="form-group">
              <label>命令类型:</label>
              <input
                type="text"
                value={editedCommand.type}
                disabled
                className="param-input disabled"
                title="命令类型不可修改"
              />
            </div>
          </div>

          {/* 参数编辑 */}
          <div className="editor-section">
            <h4>参数</h4>
            {Object.entries(editedCommand.params).map(([key, value]) => {
              // 检查是否是嵌套命令参数（actors, backgrounds, lights, layouts等）
              const isNestedParam = ['actors', 'backgrounds', 'lights', 'layouts'].includes(key);
              
              if (isNestedParam) {
                // 如果是数组，展示多个嵌套命令
                const values = Array.isArray(value) ? value : [value];
                
                return (
                  <div key={key} className="nested-params-group">
                    <h5 className="nested-group-title">{key} ({values.length})</h5>
                    {values.map((nestedCmd, idx) => {
                      if (typeof nestedCmd === 'string') {
                        const nestedParams = parseNestedParams(nestedCmd);
                        return (
                          <div key={`${key}-${idx}`} className="nested-param-item">
                            <div className="nested-item-header">
                              项 {idx + 1}
                              <button
                                type="button"
                                className="btn-delete-nested"
                                onClick={() => deleteNestedItem(key, idx)}
                                title="删除此项"
                              >
                                🗑️
                              </button>
                            </div>
                            {Object.entries(nestedParams).map(([paramKey, paramValue]) => {
                              // 对于actors的body/face/hair字段，使用输入框+选择按钮
                              const isActorModelField = key === 'actors' && ['body', 'face', 'hair'].includes(paramKey);
                              // 对于backgrounds的src字段，使用输入框+选择按钮
                              const isBackgroundSrcField = key === 'backgrounds' && paramKey === 'src';
                              
                              return (
                                <div key={paramKey} className="form-group nested-param">
                                  <label>{paramKey}:</label>
                                  {paramKey === 'transform' ? (
                                    renderParamEditor(paramKey, paramValue, (newValue) => {
                                      updateNestedParam(key, idx, paramKey, newValue);
                                    })
                                  ) : isActorModelField ? (
                                    <div className="input-with-button">
                                      <input
                                        type="text"
                                        value={paramValue}
                                        onChange={(e) => updateNestedParam(key, idx, paramKey, e.target.value)}
                                        className="param-input"
                                        placeholder={`输入${paramKey}资源名称...`}
                                      />
                                      <button
                                        type="button"
                                        className="btn-select-resource"
                                        onClick={() => setShowResourceModal({
                                          arrayKey: key,
                                          itemIndex: idx,
                                          paramKey: paramKey,
                                          currentValue: paramValue,
                                          resourceType: paramKey as 'body' | 'face' | 'hair'
                                        })}
                                        title="从列表选择"
                                      >
                                        选择
                                      </button>
                                    </div>
                                  ) : isBackgroundSrcField ? (
                                    <div className="input-with-button">
                                      <input
                                        type="text"
                                        value={paramValue}
                                        onChange={(e) => updateNestedParam(key, idx, paramKey, e.target.value)}
                                        className="param-input"
                                        placeholder="输入背景资源名称..."
                                      />
                                      <button
                                        type="button"
                                        className="btn-select-resource"
                                        onClick={() => setShowResourceModal({
                                          arrayKey: key,
                                          itemIndex: idx,
                                          paramKey: paramKey,
                                          currentValue: paramValue,
                                          resourceType: 'environment'
                                        })}
                                        title="从列表选择"
                                      >
                                        选择
                                      </button>
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      value={paramValue}
                                      onChange={(e) => updateNestedParam(key, idx, paramKey, e.target.value)}
                                      className="param-input"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    })}
                    <button
                      type="button"
                      className="btn-add-nested"
                      onClick={() => addNestedItem(key)}
                    >
                      添加{key === 'actors' ? 'actor' : key === 'backgrounds' ? 'background' : '项'}
                    </button>
                  </div>
                );
              }
              
              // 普通参数
              return (
                <div key={key} className="form-group">
                  <label>{key}:</label>
                  {renderParamEditor(key, value)}
                </div>
              );
            })}
          </div>

          {/* Clip编辑 */}
          {editedCommand.clip && (
            <div className="editor-section">
              <h4>时间轴信息 (Clip)</h4>
              <div className="form-group">
                <label>开始时间 (s):</label>
                <input
                  type="number"
                  step="0.001"
                  value={editedCommand.clip.startTime}
                  onChange={(e) => updateClip('startTime', parseFloat(e.target.value))}
                  className="param-input"
                />
              </div>
              <div className="form-group">
                <label>持续时间 (s):</label>
                <input
                  type="number"
                  step="0.001"
                  value={editedCommand.clip.duration}
                  onChange={(e) => updateClip('duration', parseFloat(e.target.value))}
                  className="param-input"
                />
              </div>
              <div className="form-group">
                <label>过渡时间:</label>
                <input
                  type="text"
                  value={editedCommand.clip.transition || ''}
                  onChange={(e) => updateClip('transition', e.target.value)}
                  className="param-input"
                  placeholder="例如: 0.7"
                />
              </div>
            </div>
          )}
        </div>

        <div className="editor-footer">
          <div className="footer-left">
            {onDelete && (
              <button className="btn-delete" onClick={onDelete}>
                🗑️ 删除命令
              </button>
            )}
          </div>
          <div className="footer-right">
            <button className="btn-cancel" onClick={onCancel}>
              取消
            </button>
            <button
              className="btn-save"
              onClick={() => onSave(editedCommand)}
            >
              保存
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* 资源选择器模态框 */}
      {showResourceModal && (
        <ResourceSelectorModal
          value={showResourceModal.currentValue}
          resourceType={showResourceModal.resourceType}
          title={`选择 ${showResourceModal.paramKey} 资源`}
          onSelect={(newValue) => {
            updateNestedParam(
              showResourceModal.arrayKey,
              showResourceModal.itemIndex,
              showResourceModal.paramKey,
              newValue
            );
            setShowResourceModal(null);
          }}
          onCancel={() => setShowResourceModal(null)}
        />
      )}
    </>
  );
};
