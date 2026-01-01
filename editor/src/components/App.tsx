import React, { useState, useCallback } from 'react';
import type { ADVScript, Command, TimelineEvent } from '../types/adv-script';
import { TimelineBuilder } from '../utils/timeline-builder';
import { parseTXTContent } from '../utils/txt-parser';
import { TxtExporter } from '../utils/txt-exporter';
import { TimelineEditor } from './TimelineEditor';
import { CommandList } from './CommandList';
import { CommandEditor } from './CommandEditor';
import { SceneSetup } from './SceneSetup';
import './App.css';

export const App: React.FC = () => {
  const [script, setScript] = useState<ADVScript | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'commands'>('timeline');
  const [editingCommand, setEditingCommand] = useState<{ command: Command; index: number } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 加载脚本文件 (仅支持.txt)
  const handleFileLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      setError('仅支持 .txt 格式的脚本文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const advScript = parseTXTContent(content, file.name);
        
        setScript(advScript);
        setError(null);
        setCurrentTime(0);
        setSelectedEvent(null);
        console.log('✓ 成功解析TXT文件:', file.name);
      } catch (err) {
        setError(`加载失败: ${err instanceof Error ? err.message : '未知错误'}`);
        console.error('文件加载错误:', err);
      }
    };
    reader.readAsText(file);
  }, []);

  // 从示例加载
  const handleLoadExample = useCallback(async () => {
    try {
      // 直接加载resource目录下的txt文件
      const response = await fetch('/resource/adv_cidol-amao-3-000_01.txt');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const content = await response.text();
      const advScript = parseTXTContent(content, 'adv_cidol-amao-3-000_01.txt');
      
      setScript(advScript);
      setError(null);
      setCurrentTime(0);
      setSelectedEvent(null);
      setHasUnsavedChanges(false);
      console.log('✓ 成功加载示例文件:', 'adv_cidol-amao-3-000_01.txt');
    } catch (err) {
      setError(`加载示例失败: ${err instanceof Error ? err.message : '未知错误'}`);
      console.error('示例加载错误:', err);
    }
  }, []);

  // 保存命令编辑
  const handleSaveCommand = useCallback((updatedCommand: Command) => {
    if (!script || editingCommand === null) return;

    const newCommands = [...script.commands];
    newCommands[editingCommand.index] = updatedCommand;
    
    setScript({
      ...script,
      commands: newCommands
    });
    setEditingCommand(null);
    setHasUnsavedChanges(true);
  }, [script, editingCommand]);

  // 删除命令
  const handleDeleteCommand = useCallback(() => {
    if (!script || editingCommand === null) return;
    
    if (!window.confirm('确定要删除这个命令吗？')) return;

    const newCommands = script.commands.filter((_, idx) => idx !== editingCommand.index);
    
    setScript({
      ...script,
      commands: newCommands
    });
    setEditingCommand(null);
    setHasUnsavedChanges(true);
  }, [script, editingCommand]);

  // 创建默认命令参数
  const createDefaultCommand = (commandType: string): Command => {
    const defaultClip = {
      startTime: currentTime,
      duration: 2.0,
      clipIn: 0.0,
      easeInDuration: 0.0,
      easeOutDuration: 0.0,
      blendInDuration: -1.0,
      blendOutDuration: -1.0,
      mixInEaseType: 1,
      timeScale: 1.0
    };

    // 根据命令类型返回不同的默认参数
    switch (commandType) {
      case 'message':
        return { type: 'message', params: { text: '新对话', name: '{user}' }, clip: defaultClip };
      case 'voice':
        return { type: 'voice', params: { voice: '', actorId: '', channel: '0' }, clip: defaultClip };
      case 'se':
        return { type: 'se', params: { se: '' }, clip: defaultClip };
      case 'actormotion':
        return { type: 'actormotion', params: { id: '', motion: '' }, clip: defaultClip };
      case 'actorfacialmotion':
        return { type: 'actorfacialmotion', params: { id: '', motion: '' }, clip: defaultClip };
      case 'actoradditivemotion':
        return { type: 'actoradditivemotion', params: { id: '', motion: '' }, clip: defaultClip };
      case 'actoreyeblink':
        return { type: 'actoreyeblink', params: { id: '' }, clip: defaultClip };
      case 'actorlooktarget':
        return { type: 'actorlooktarget', params: { id: '', target: '' }, clip: defaultClip };
      case 'actorlooktargettween':
        return { type: 'actorlooktargettween', params: { id: '', from: '', to: '' }, clip: defaultClip };
      case 'actorlighting':
        return { type: 'actorlighting', params: { setting: '' }, clip: defaultClip };
      case 'camerasetting':
        return { type: 'camerasetting', params: { setting: '' }, clip: defaultClip };
      case 'dof':
        return { type: 'dof', params: { setting: '' }, clip: defaultClip };
      case 'coloreffect':
        return { type: 'coloreffect', params: { setting: '' }, clip: defaultClip };
      case 'shake':
        return { type: 'shake', params: { setting: '' }, clip: defaultClip };
      case 'fade':
        return { type: 'fade', params: { from: '0', to: '1' }, clip: defaultClip };
      case 'bgmplay':
        return { type: 'bgmplay', params: { bgm: '' }, clip: defaultClip };
      case 'bgmstop':
        return { type: 'bgmstop', params: {}, clip: defaultClip };
      default:
        return { type: commandType, params: {}, clip: defaultClip };
    }
  };

  // 添加新命令
  const handleAddCommand = useCallback(() => {
    if (!script) return;

    // 显示命令类型选择对话框
    const commandTypes = [
      { value: 'message', label: '对话 (message)' },
      { value: 'voice', label: '语音 (voice)' },
      { value: 'se', label: '音效 (se)' },
      { value: 'actormotion', label: '角色动作 (actormotion)' },
      { value: 'actorfacialmotion', label: '面部表情 (actorfacialmotion)' },
      { value: 'actoradditivemotion', label: '叠加动作 (actoradditivemotion)' },
      { value: 'actoreyeblink', label: '眨眼 (actoreyeblink)' },
      { value: 'actorlooktarget', label: '视线目标 (actorlooktarget)' },
      { value: 'actorlooktargettween', label: '视线过渡 (actorlooktargettween)' },
      { value: 'actorlighting', label: '角色灯光 (actorlighting)' },
      { value: 'camerasetting', label: '相机设置 (camerasetting)' },
      { value: 'dof', label: '景深 (dof)' },
      { value: 'coloreffect', label: '色彩效果 (coloreffect)' },
      { value: 'shake', label: '抖动 (shake)' },
      { value: 'fade', label: '淡入淡出 (fade)' },
      { value: 'bgmplay', label: '播放BGM (bgmplay)' },
      { value: 'bgmstop', label: '停止BGM (bgmstop)' },
    ];

    const selection = window.prompt(
      '选择要添加的命令类型（输入序号）：\n' +
      commandTypes.map((t, i) => `${i + 1}. ${t.label}`).join('\n')
    );

    if (selection) {
      const index = parseInt(selection) - 1;
      if (commandTypes[index]) {
        const newCommand = createDefaultCommand(commandTypes[index].value);
        setScript({
          ...script,
          commands: [...script.commands, newCommand]
        });
        setHasUnsavedChanges(true);
      } else {
        alert('无效的选择');
      }
    }
  }, [script, currentTime]);

  // 导出为TXT
  const handleExport = useCallback(() => {
    if (!script) return;

    const baseFilename = script.metadata?.filename?.replace(/\.txt$/, '') || 'script';
    TxtExporter.downloadAsTxt(script.commands, `${baseFilename}_edited.txt`);
    setHasUnsavedChanges(false);
  }, [script]);

  // 获取时间轴
  const timeline = script ? TimelineBuilder.buildTimeline(script.commands) : null;

  // 获取当前活动的事件
  const activeEvents = timeline ? TimelineBuilder.getActiveEvents(timeline, currentTime) : [];

  return (
    <div className="app">
      {/* 顶部栏 */}
      <header className="app-header">
        <h1>Gakumas ADV 脚本编辑器</h1>
        <div className="header-actions">
          {hasUnsavedChanges && (
            <span className="unsaved-indicator" title="有未保存的更改">
              未保存
            </span>
          )}
          <label className="btn-load">
            加载脚本
            <input
              type="file"
              accept=".txt"
              onChange={handleFileLoad}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={handleLoadExample} className="btn-example">
            加载示例
          </button>
          {script && (
            <>
              <button onClick={handleAddCommand} className="btn-add">
                添加命令
              </button>
              <button onClick={handleExport} className="btn-export">
                导出TXT
              </button>
            </>
          )}
        </div>
      </header>

      {/* 错误提示 */}
      {error && (
        <div className="error-banner">
          ⚠ {error}
        </div>
      )}

      {/* 主内容区 */}
      {script && timeline ? (
        <div className="app-content">
          {/* 最左侧场景设置面板 */}
          <aside className="scene-setup-sidebar">
            <SceneSetup
              commands={script.commands}
              onCommandEdit={(index, cmd) => {
                setEditingCommand({ command: cmd, index });
              }}
            />
          </aside>

          {/* 左侧项目面板 */}
          <aside className="sidebar">
            <div className="stats-panel">
              <h2>📊 脚本信息</h2>
              <div className="stat-item">
                <span>文件名:</span>
                <span>{script.metadata?.filename || '未知'}</span>
              </div>
              <div className="stat-item">
                <span>总时长:</span>
                <span>{timeline.duration.toFixed(2)}s</span>
              </div>
              <div className="stat-item">
                <span>命令总数:</span>
                <span>{script.commands.length}</span>
              </div>
              <div className="stat-item">
                <span>对话数:</span>
                <span>{script.metadata?.messageCount || 0}</span>
              </div>
            </div>

            <div className="tracks-panel">
              <h2>🎵 轨道列表</h2>
              {timeline.tracks.map(track => (
                <div key={track.id} className="track-info">
                  <span className={`track-color ${track.type}`}></span>
                  <span className="track-name">{track.name}</span>
                  <span className="track-count">{track.events.length}</span>
                </div>
              ))}
            </div>

            {/* 当前活动事件 */}
            {activeEvents.length > 0 && (
              <div className="active-events-panel">
                <h2>⚡ 当前活动</h2>
                {activeEvents.map((event, idx) => (
                  <div key={idx} className="active-event">
                    <span className={`event-type ${event.type}`}>
                      {event.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* 右侧主工作区 */}
          <div className="workspace">
            {/* 上方事件详情区 */}
            <div className="upper-panel">
              <div className="event-details-panel-full">
                <div className="panel-header">
                  <h3>事件详情</h3>
                  {selectedEvent && (
                    <button 
                      className="close-btn"
                      onClick={() => setSelectedEvent(null)}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="panel-content">
                  {selectedEvent ? (
                    <>
                      {/* 2x2网格布局显示基本信息 */}
                      <div className="detail-grid">
                        <div className="detail-grid-item">
                          <span className="detail-label">类型:</span>
                          <span className="detail-value">{selectedEvent.type}</span>
                        </div>
                        <div className="detail-grid-item">
                          <span className="detail-label">命令:</span>
                          <span className="detail-value">{selectedEvent.command.type}</span>
                        </div>
                        <div className="detail-grid-item">
                          <span className="detail-label">开始时间:</span>
                          <span className="detail-value">{selectedEvent.time.toFixed(3)}s</span>
                        </div>
                        <div className="detail-grid-item">
                          <span className="detail-label">持续时间:</span>
                          <span className="detail-value">
                            {selectedEvent.duration !== undefined 
                              ? `${selectedEvent.duration.toFixed(3)}s` 
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      {/* 显示命令参数 */}
                      <div className="detail-section">
                        <h4>参数:</h4>
                        <div className="params-list">
                          {Object.entries(selectedEvent.command.params).map(([key, value]) => (
                            <div key={key} className="param-item">
                              <span className="param-key">{key}:</span>
                              <span className="param-value">
                                {typeof value === 'object' 
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        {/* 编辑按钮 */}
                        <button
                          className="btn-edit-command"
                          onClick={() => {
                            // 找到对应的命令索引
                            const index = script?.commands.findIndex(
                              cmd => cmd === selectedEvent.command
                            );
                            if (index !== undefined && index !== -1) {
                              setEditingCommand({ 
                                command: selectedEvent.command, 
                                index 
                              });
                            }
                          }}
                        >
                          ✏️ 编辑此命令
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="no-selection">
                      <p>点击时间轴上的事件查看详情</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 下方时间轴区 */}
            <div className="lower-panel">
              {/* 标签切换 */}
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  时间轴
                </button>
                <button
                  className={`tab ${activeTab === 'commands' ? 'active' : ''}`}
                  onClick={() => setActiveTab('commands')}
                >
                  命令列表
                </button>
              </div>

              {/* 时间轴/命令列表 */}
              <div className="timeline-container">
                {activeTab === 'timeline' ? (
                  <TimelineEditor
                    timeline={timeline}
                    onTimeChange={setCurrentTime}
                    onEventSelect={setSelectedEvent}
                  />
                ) : (
                  <CommandList
                    commands={script.commands}
                    currentTime={currentTime}
                    onCommandSelect={(cmd) => {
                      if (cmd.clip) {
                        setCurrentTime(cmd.clip.startTime);
                      }
                    }}
                    onCommandEdit={(cmd, index) => {
                      setEditingCommand({ command: cmd, index });
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="welcome-screen">
          <div className="welcome-content">
            <h2>欢迎使用 ADV 脚本编辑器</h2>
            <p>请加载一个脚本文件开始编辑</p>
            <div className="welcome-actions">
              <label className="btn-primary">
                选择文件
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileLoad}
                  style={{ display: 'none' }}
                />
              </label>
              <button onClick={handleLoadExample} className="btn-secondary">
                加载示例脚本
              </button>
            </div>
            <div className="features">
              <div className="feature">
                <div className="feature-icon"></div>
                <h3>可视化时间轴</h3>
                <p>直观的多轨道时间轴编辑器</p>
              </div>
              <div className="feature">
                <div className="feature-icon"></div>
                <h3>实时预览</h3>
                <p>查看对话和事件实时效果</p>
              </div>
              <div className="feature">
                <div className="feature-icon"></div>
                <h3>命令编辑</h3>
                <p>详细的命令参数编辑</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 命令编辑器弹窗 */}
      {editingCommand && (
        <CommandEditor
          command={editingCommand.command}
          onSave={handleSaveCommand}
          onCancel={() => setEditingCommand(null)}
          onDelete={handleDeleteCommand}
        />
      )}
    </div>
  );
};

export default App;
