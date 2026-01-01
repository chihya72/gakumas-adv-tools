import React, { useState, useMemo } from 'react';
import type { Command } from '../types/adv-script';
import { ADVDataParser } from '../utils/adv-parser';
import './CommandList.css';

interface CommandListProps {
  commands: Command[];
  currentTime: number;
  onCommandSelect?: (cmd: Command) => void;
  onCommandEdit?: (commandIndex: number, command: Command) => void;
}

export const CommandList: React.FC<CommandListProps> = ({
  commands,
  currentTime,
  onCommandSelect,
  onCommandEdit,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  // 命令类型中文映射
  const getCommandTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      'message': '对话',
      'voice': '语音',
      'se': '音效',
      'actormotion': '肢体动作',
      'actorfacialmotion': '面部表情',
      'actorfacialoverridemotion': '表情覆盖',
      'actoradditivemotion': '叠加动作',
      'actoreyeblink': '眨眼',
      'actorlooktarget': '视线目标',
      'actorlooktargettween': '视线过渡',
      'actorlighting': '角色灯光',
      'actorgroup': '角色组',
      'actorlayoutgroup': '角色布局',
      'backgroundgroup': '背景组',
      'backgroundlayoutgroup': '背景布局',
      'camerasetting': '相机设置',
      'dof': '景深效果',
      'coloreffect': '色彩效果',
      'shake': '镜头抖动',
      'fade': '淡入淡出',
      'transition': '转场效果',
      'bgmplay': 'BGM播放',
      'bgmstop': 'BGM停止',
    };
    return typeMap[type] || type;
  };

  // 过滤后的命令列表
  const filteredCommands = useMemo(() => {
    let result = commands;

    // 按类型过滤
    if (filterType !== 'all') {
      result = result.filter(cmd => cmd.type === filterType);
    }

    // 按文本搜索
    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter(cmd => {
        const typeMatch = cmd.type.toLowerCase().includes(search);
        const paramsMatch = JSON.stringify(cmd.params).toLowerCase().includes(search);
        return typeMatch || paramsMatch;
      });
    }

    return result;
  }, [commands, filterType, searchText]);

  // 获取所有命令类型
  const commandTypes = useMemo(() => {
    const types = new Set(commands.map(cmd => cmd.type));
    return ['all', ...Array.from(types).sort()];
  }, [commands]);

  // 判断命令是否在当前时间活动
  const isCommandActive = (cmd: Command): boolean => {
    if (!cmd.clip) return false;
    return cmd.clip.startTime <= currentTime && 
           currentTime < cmd.clip.startTime + cmd.clip.duration;
  };

  // 渲染参数值
  const renderParamValue = (value: any): string => {
    if (typeof value === 'string') {
      // 解析JSON转义：\\\\ -> \\, \\" -> "
      let displayValue = value
        .replace(/\\\\/g, '\\')    // 双反斜杠转单反斜杠
        .replace(/\\"/g, '"')      // 转义引号转引号
        .replace(/\\r\\n/g, ' ')  // \r\n显示为空格（简化显示）
        .replace(/\\n/g, ' ');
      
      if (displayValue.length > 60) {
        return displayValue.substring(0, 60) + '...';
      }
      return displayValue;
    }
    return JSON.stringify(value);
  };

  return (
    <div className="command-list">
      {/* 工具栏 */}
      <div className="command-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索命令..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          {commandTypes.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? '所有类型' : getCommandTypeName(type)}
            </option>
          ))}
        </select>
        <div className="result-count">
          {filteredCommands.length} / {commands.length} 条命令
        </div>
      </div>

      {/* 命令列表 */}
      <div className="commands-container">
        {filteredCommands.map((cmd, idx) => {
          const isActive = isCommandActive(cmd);
          const originalIndex = commands.indexOf(cmd);

          return (
            <div
              key={originalIndex}
              className={`command-item ${isActive ? 'active' : ''}`}
              onClick={() => onCommandSelect?.(cmd)}
            >
              {/* 命令头部 */}
              <div className="command-header">
                <span className="command-index">#{originalIndex + 1}</span>
                <span className={`command-type ${cmd.type}`}>{getCommandTypeName(cmd.type)}</span>
                {cmd.clip && (
                  <span className="command-time">
                    {ADVDataParser.formatTime(cmd.clip.startTime)}
                  </span>
                )}
                {isActive && <span className="active-badge">播放中</span>}
                {onCommandEdit && (
                  <button
                    className="btn-edit-cmd"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCommandEdit(originalIndex, cmd);
                    }}
                  >
                    编辑
                  </button>
                )}
              </div>

              {/* 命令参数 */}
              <div className="command-params">
                {Object.entries(cmd.params).map(([key, value]) => (
                  <div key={key} className="param-row">
                    <span className="param-key">{key}:</span>
                    <span className="param-value">{renderParamValue(value)}</span>
                  </div>
                ))}
              </div>

              {/* Clip信息 */}
              {cmd.clip && (
                <div className="command-clip">
                  <span>⏱ {cmd.clip.duration.toFixed(3)}s</span>
                  {cmd.clip.easeInDuration > 0 && (
                    <span>↗ {cmd.clip.easeInDuration}s</span>
                  )}
                  {cmd.clip.easeOutDuration > 0 && (
                    <span>↘ {cmd.clip.easeOutDuration}s</span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredCommands.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <p>没有找到匹配的命令</p>
          </div>
        )}
      </div>
    </div>
  );
};
