import React from 'react';
import type { Command } from '../types/adv-script';
import './SceneSetup.css';

interface SceneSetupProps {
  commands: Command[];
  onCommandEdit?: (commandIndex: number, command: Command) => void;
}

/**
 * 场景设置组件
 * 显示和编辑 backgroundgroup、actorgroup 等初始化命令
 * 注意：layoutgroup 命令（actorlayoutgroup等）属于时间轴命令，不在此处显示
 */
export const SceneSetup: React.FC<SceneSetupProps> = ({
  commands,
  onCommandEdit,
}) => {
  // 筛选出初始化命令
  // 只包含：backgroundgroup、actorgroup
  // 排除：actorlayoutgroup、backgroundlayoutgroup（这些是时间轴命令）
  const setupCommands = commands.filter(cmd => {
    // 只允许 backgroundgroup 和 actorgroup
    if (cmd.type !== 'backgroundgroup' && cmd.type !== 'actorgroup') {
      return false;
    }
    // 必须是初始化命令（没有 clip 或 clip.startTime === 0）
    const isInitialCommand = !cmd.clip || cmd.clip.startTime === 0;
    return isInitialCommand;
  });

  // 按类型分类
  const backgroundGroups = setupCommands.filter(cmd => cmd.type === 'backgroundgroup');
  const actorGroups = setupCommands.filter(cmd => cmd.type === 'actorgroup');

  // 渲染参数值
  const renderParamValue = (value: any): string => {
    if (typeof value === 'string') {
      // 简化显示长字符串
      if (value.length > 50) {
        return value.substring(0, 50) + '...';
      }
      return value;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value).substring(0, 50) + '...';
    }
    return String(value);
  };

  // 渲染命令卡片
  const renderCommandCard = (cmd: Command, originalIndex: number) => (
    <div key={originalIndex} className="setup-command-card">
      <div className="setup-command-header">
        <span className={`setup-command-type ${cmd.type}`}>
          {cmd.type}
        </span>
        {onCommandEdit && (
          <button
            className="btn-edit-setup"
            onClick={() => onCommandEdit(originalIndex, cmd)}
            title="编辑命令"
          >
            ✏️
          </button>
        )}
      </div>
      <div className="setup-command-params">
        {Object.entries(cmd.params).map(([key, value]) => (
          <div key={key} className="setup-param-row">
            <span className="setup-param-key">{key}:</span>
            <span className="setup-param-value">{renderParamValue(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="scene-setup">
      <div className="scene-setup-header">
        <h3>场景设置</h3>
        <div className="setup-count">{setupCommands.length} 项</div>
      </div>

      <div className="scene-setup-content">
        {/* 背景组 */}
        {backgroundGroups.length > 0 && (
          <div className="setup-section">
            <div className="setup-section-title">
              <span className="section-icon"></span>
              背景 ({backgroundGroups.length})
            </div>
            <div className="setup-section-content">
              {backgroundGroups.map((cmd) => {
                const originalIndex = commands.indexOf(cmd);
                return renderCommandCard(cmd, originalIndex);
              })}
            </div>
          </div>
        )}

        {/* 角色组 */}
        {actorGroups.length > 0 && (
          <div className="setup-section">
            <div className="setup-section-title">
              <span className="section-icon"></span>
              角色 ({actorGroups.length})
            </div>
            <div className="setup-section-content">
              {actorGroups.map((cmd) => {
                const originalIndex = commands.indexOf(cmd);
                return renderCommandCard(cmd, originalIndex);
              })}
            </div>
          </div>
        )}

        {/* 无初始化命令时显示提示 */}
        {setupCommands.length === 0 && (
          <div className="setup-empty">
            <p>暂无场景设置命令</p>
            <p className="setup-empty-hint">
              backgroundgroup、actorgroup 等命令会显示在这里
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
