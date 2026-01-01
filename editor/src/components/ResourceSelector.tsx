import React, { useState, useEffect, useRef } from 'react';
import './ResourceSelector.css';

interface ResourceOption {
  value: string;
  label: string;
  metadata?: any;
}

interface ResourceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  characterId?: string;
  resourceType: 'body' | 'face' | 'hair' | 'motion' | 'facial_motion' | 'environment';
  placeholder?: string;
  className?: string;
  allowCharacterSelection?: boolean; // 是否允许选择角色
  onCharacterChange?: (characterId: string) => void; // 角色变化回调
}

const API_BASE = 'http://localhost:5000/api';

// 角色ID到中文名的映射
const CHARACTER_NAMES: Record<string, string> = {
  'amao': '有村麻央',
  'atbm': '雨夜燕',
  'fktn': '藤田琴音',
  'hmsz': '秦谷美铃',
  'hrnm': '姬崎莉波',
  'hski': '花海咲季',
  'hume': '花海佑芽',
  'jsna': '十王星南',
  'kcna': '仓本千奈',
  'kllj': '葛城莉莉娅',
  'nasr': '根绪亚纱里',
  'shro': '筱泽广',
  'ssmk': '紫云清夏',
  'trda': '舞蹈训练员',
  'trvi': '视觉训练员',
  'trvo': '歌唱训练员',
  'ttmr': '月村手毬',
  'cmmn': '角色通用'
};

export const ResourceSelector: React.FC<ResourceSelectorProps> = ({
  value,
  onChange,
  characterId: externalCharacterId,
  resourceType,
  placeholder = '选择资源...',
  className = '',
  allowCharacterSelection = false,
  onCharacterChange
}) => {
  const [options, setOptions] = useState<ResourceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [internalCharacterId, setInternalCharacterId] = useState<string>('');
  const [allCharacters, setAllCharacters] = useState<string[]>([]);
  const [environmentDimension, setEnvironmentDimension] = useState<'2d' | '3d'>('3d'); // 环境资源的2D/3D选择
  const [allEnvironments, setAllEnvironments] = useState<ResourceOption[]>([]); // 存储所有环境资源
  const [initialized, setInitialized] = useState(false); // 标记是否已初始化
  
  // 使用外部传入的characterId或内部状态
  const characterId = allowCharacterSelection ? internalCharacterId : externalCharacterId;

  // 加载角色列表（如果允许选择角色）
  useEffect(() => {
    if (!allowCharacterSelection) return;

    const loadCharacters = async () => {
      try {
        const response = await fetch(`${API_BASE}/characters`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setAllCharacters(data.data);
        }
      } catch (error) {
        console.error('加载角色列表失败:', error);
      }
    };

    loadCharacters();
  }, [allowCharacterSelection]);
  
  // 从资源名称推断角色ID（仅在初始化时执行一次）
  useEffect(() => {
    if (!allowCharacterSelection || allCharacters.length === 0 || initialized) return;
    
    // 尝试从资源名称推断角色ID
    // 支持多种格式：mdl_chr_xxx-... 或 mot_all_chr_xxx_...
    if (value && value.trim()) {
      // 尝试匹配 mdl_chr_角色ID 格式（模型资源）
      let match = value.match(/mdl_chr_([a-z]+)[-_]/i);
      if (match && allCharacters.includes(match[1])) {
        setInternalCharacterId(match[1]);
        onCharacterChange?.(match[1]);
        setInitialized(true);
        return;
      }
      
      // 尝试匹配 mot_all_chr_角色ID 格式（动作资源）
      match = value.match(/mot_all_chr_([a-z]+)[-_]/i);
      if (match && allCharacters.includes(match[1])) {
        setInternalCharacterId(match[1]);
        onCharacterChange?.(match[1]);
        setInitialized(true);
        return;
      }
      
      // 如果value存在但无法推断角色ID，不做任何操作
      // 这种情况下保持当前的角色选择（如果有的话）
      setInitialized(true);
      return;
    }
    
    // 只有当value为空或不存在时，才使用默认的第一个角色
    // 这适用于新建actor的情况
    if (!value && !internalCharacterId && allCharacters.length > 0) {
      setInternalCharacterId(allCharacters[0]);
      onCharacterChange?.(allCharacters[0]);
      setInitialized(true);
    }
  }, [allCharacters, allowCharacterSelection, initialized, value, internalCharacterId]);

  // 加载资源选项
  useEffect(() => {
    if (resourceType !== 'environment' && !characterId) return;

    const loadOptions = async () => {
      setLoading(true);
      try {
        let url = '';
        
        // 根据资源类型构建API URL
        if (resourceType === 'body' || resourceType === 'face' || resourceType === 'hair') {
          // 模型资源
          url = `${API_BASE}/resources/models?character_id=${characterId}&model_type=${resourceType}`;
        } else if (resourceType === 'motion' || resourceType === 'facial_motion') {
          // 动作资源
          const motionType = resourceType === 'facial_motion' ? 'facial' : '';
          url = `${API_BASE}/resources/motions?character_id=${characterId}`;
          if (motionType) url += `&motion_type=${motionType}`;
        } else if (resourceType === 'environment') {
          // 环境资源
          url = `${API_BASE}/resources/environments`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data) {
          const opts = data.data.map((item: any) => {
            // 根据资源类型获取正确的资源名称字段
            let resourceName = '';
            if (resourceType === 'body' || resourceType === 'face' || resourceType === 'hair') {
              resourceName = item.model_name;
            } else if (resourceType === 'motion' || resourceType === 'facial_motion') {
              resourceName = item.motion_name;
            } else if (resourceType === 'environment') {
              resourceName = item.env_name || item.resource_name;
            }
            
            return {
              value: resourceName,
              label: resourceName,
              metadata: item
            };
          });
          
          if (resourceType === 'environment') {
            // 对于环境资源，保存所有选项并根据维度过滤
            setAllEnvironments(opts);
            const filtered = opts.filter((opt: ResourceOption) => {
              const dimension = opt.metadata?.env_type?.toLowerCase() || '3d';
              return dimension === environmentDimension;
            });
            setOptions(filtered);
          } else {
            setOptions(opts);
          }
        }
      } catch (error) {
        console.error('加载资源选项失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [characterId, resourceType]);
  
  // 环境资源维度切换时重新过滤
  useEffect(() => {
    if (resourceType === 'environment' && allEnvironments.length > 0) {
      const filtered = allEnvironments.filter((opt: ResourceOption) => {
        const dimension = opt.metadata?.env_type?.toLowerCase() || '3d';
        return dimension === environmentDimension;
      });
      setOptions(filtered);
      
      // 如果当前选中的值不在过滤后的列表中，清空或选择第一个
      const currentValueExists = filtered.some(opt => opt.value === value);
      if (!currentValueExists && filtered.length > 0) {
        onChange(filtered[0].value);
      }
    }
  }, [environmentDimension, resourceType, allEnvironments]);

  return (
    <div className={`resource-selector ${className}`}>
      {/* 角色选择器（如果允许） */}
      {allowCharacterSelection && allCharacters.length > 0 && (
        <div className="character-selector-row">
          <select
            className="character-selector-dropdown"
            value={internalCharacterId || ''}
            onChange={(e) => {
              const newCharId = e.target.value;
              if (!newCharId) return; // 防止选择空值
              
              setInternalCharacterId(newCharId);
              onCharacterChange?.(newCharId);
              // 只有在用户主动切换角色时才清空值（不是初始化）
              if (initialized && value && !value.includes(newCharId)) {
                onChange('');
              }
            }}
          >
            {!internalCharacterId && (
              <option value="">请选择角色...</option>
            )}
            {allCharacters.map((charId) => {
              const cnName = CHARACTER_NAMES[charId.toLowerCase()];
              const displayName = cnName ? `${charId.toUpperCase()} (${cnName})` : charId.toUpperCase();
              return (
                <option key={charId} value={charId}>
                  {displayName}
                </option>
              );
            })}
          </select>
        </div>
      )}
      
      {/* 环境资源的2D/3D选择器 */}
      {resourceType === 'environment' && (
        <div className="dimension-selector-row">
          <select
            className="dimension-selector-dropdown"
            value={environmentDimension}
            onChange={(e) => setEnvironmentDimension(e.target.value as '2d' | '3d')}
          >
            <option value="3d">3D 场景</option>
            <option value="2d">2D 场景</option>
          </select>
        </div>
      )}
      
      <div className="resource-selector-input-wrapper">
        <select
          className="resource-selector-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading || (resourceType !== 'environment' && !characterId)}
        >
          {loading ? (
            <option value={value}>{value || '加载中...'}</option>
          ) : options.length === 0 ? (
            <option value={value}>{value || '无可用资源'}</option>
          ) : (
            <>
              {/* 如果当前值不在选项列表中，添加为临时选项 */}
              {value && !options.some(opt => opt.value === value) && (
                <option value={value}>{value} (未找到)</option>
              )}
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </>
          )}
        </select>
      </div>
    </div>
  );
};
