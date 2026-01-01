import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Timeline, TimelineTrack, TimelineEvent } from '../types/adv-script';
import { ADVDataParser } from '../utils/adv-parser';
import './TimelineEditor.css';

interface TimelineEditorProps {
  timeline: Timeline;
  onTimeChange?: (time: number) => void;
  onEventSelect?: (event: TimelineEvent) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  timeline,
  onTimeChange,
  onEventSelect,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(50); // pixels per second
  const timelineRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  // 时间轴宽度计算
  const totalWidth = timeline.duration * zoom;
  const visibleTracks = timeline.tracks.filter(t => t.visible);

  // 时间变化通知
  useEffect(() => {
    onTimeChange?.(currentTime);
  }, [currentTime, onTimeChange]);

  // 时间轴内容滚动处理，同步左侧标签和顶部刻度尺
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingScroll.current) return;
    
    isSyncingScroll.current = true;
    const scrollTop = e.currentTarget.scrollTop;
    const scrollLeft = e.currentTarget.scrollLeft;
    
    if (labelsRef.current) {
      labelsRef.current.scrollTop = scrollTop;
    }
    
    if (rulerRef.current) {
      rulerRef.current.scrollLeft = scrollLeft;
    }
    
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  }, []);

  // 点击时间轴跳转
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / zoom;
    setCurrentTime(Math.max(0, Math.min(time, timeline.duration)));
  }, [zoom, timeline.duration]);

  // 选择事件
  const handleEventClick = useCallback((event: TimelineEvent) => {
    setCurrentTime(event.time);
    onEventSelect?.(event);
  }, [onEventSelect]);

  // 缩放控制
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 10));

  // 渲染时间刻度尺
  const renderTimeRuler = () => {
    const ticks: JSX.Element[] = [];
    const step = zoom < 30 ? 5 : zoom < 60 ? 2 : 1; // 根据缩放调整刻度间隔
    
    for (let i = 0; i <= Math.ceil(timeline.duration); i += step) {
      ticks.push(
        <div
          key={i}
          className="time-tick"
          style={{ left: `${i * zoom}px` }}
        >
          <div className="tick-mark" />
          <div className="tick-label">{ADVDataParser.formatTime(i)}</div>
        </div>
      );
    }
    return ticks;
  };

  // 渲染轨道事件
  const renderEvent = (event: TimelineEvent, trackHeight: number, laneCount: number) => {
    const left = event.time * zoom;
    const width = (event.duration || 0) * zoom;
    const lane = (event as any).lane || 0;
    
    // 计算泳道高度和位置
    const laneHeight = Math.floor((trackHeight - 8) / Math.max(laneCount, 1));
    const top = lane * laneHeight + 4;
    const minWidth = 24; // 最小宽度，确保可见
    const actualWidth = Math.max(width, minWidth);

    return (
      <div
        key={`${event.type}-${event.time}-${lane}`}
        className={`timeline-event ${event.type}`}
        style={{
          left: `${left}px`,
          width: `${actualWidth}px`,
          height: `${Math.max(laneHeight - 4, 20)}px`,
          top: `${top}px`,
        }}
        onClick={() => handleEventClick(event)}
        title={getEventTooltip(event)}
      >
        <div className="event-content">
          {getEventLabel(event)}
        </div>
      </div>
    );
  };

  // 获取事件标签
  const getEventLabel = (event: TimelineEvent): string => {
    const cmd = event.command;
    const id = cmd.params.id || '';
    
    // 对话事件 - 显示对话内容
    if (cmd.type === 'message' && 'text' in cmd.params) {
      const text = cmd.params.text as string;
      return text.substring(0, 30) + (text.length > 30 ? '...' : '');
    }
    
    // 语音事件 - 显示语音文件名
    if (cmd.type === 'voice' && 'voice' in cmd.params) {
      return `语音: ${cmd.params.voice}`;
    }
    
    // 音效事件
    if (cmd.type === 'se' && 'se' in cmd.params) {
      return `音效: ${cmd.params.se}`;
    }
    
    // 布局组命令
    if (cmd.type === 'actorlayoutgroup') {
      const layouts = cmd.params.layouts;
      if (Array.isArray(layouts) && layouts.length > 0) {
        const ids = layouts.map((layout: any) => {
          const match = layout.match(/id=(\w+)/);
          return match ? match[1] : '';
        }).filter(Boolean).join(', ');
        return `角色布局: ${ids}`;
      }
      return '角色布局';
    }
    
    if (cmd.type === 'backgroundlayoutgroup') {
      return '背景布局';
    }
    
    // 角色相关命令
    if (cmd.type === 'actormotion') {
      const motion = cmd.params.motion ? String(cmd.params.motion).substring(0, 15) : '';
      return id ? `肢体动作: ${id}${motion ? ' - ' + motion : ''}` : '肢体动作';
    }
    
    if (cmd.type === 'actorfacialmotion') {
      const motion = cmd.params.motion ? String(cmd.params.motion).substring(0, 15) : '';
      return id ? `面部表情: ${id}${motion ? ' - ' + motion : ''}` : '面部表情';
    }
    
    if (cmd.type === 'actorfacialoverridemotion') {
      return id ? `表情覆盖: ${id}` : '表情覆盖';
    }
    
    if (cmd.type === 'actoradditivemotion') {
      const motion = cmd.params.motion ? String(cmd.params.motion).substring(0, 15) : '';
      return id ? `叠加动作: ${id}${motion ? ' - ' + motion : ''}` : '叠加动作';
    }
    
    if (cmd.type === 'actoreyeblink') {
      return id ? `眨眼: ${id}` : '眨眼';
    }
    
    if (cmd.type === 'actorlooktarget') {
      return id ? `视线目标: ${id}` : '视线目标';
    }
    
    if (cmd.type === 'actorlooktargettween') {
      return id ? `视线过渡: ${id}` : '视线过渡';
    }
    
    if (cmd.type === 'actorlighting') {
      return '角色灯光';
    }
    
    // 相机和效果
    if (cmd.type === 'camerasetting') {
      return '相机设置';
    }
    
    if (cmd.type === 'dof') {
      return '景深效果';
    }
    
    if (cmd.type === 'coloreffect') {
      return '色彩效果';
    }
    
    if (cmd.type === 'shake') {
      return '镜头抖动';
    }
    
    if (cmd.type === 'fade') {
      return '淡入淡出';
    }
    
    if (cmd.type === 'transition') {
      return '转场效果';
    }
    
    // 音频
    if (cmd.type === 'bgmplay') {
      const bgm = cmd.params.bgm ? String(cmd.params.bgm) : '';
      return bgm ? `BGM: ${bgm}` : 'BGM播放';
    }
    
    if (cmd.type === 'bgmstop') {
      return 'BGM停止';
    }
    
    // 默认：显示类型
    return cmd.type;
  };

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
      'actorlayoutgroup': '角色布局',
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

  // 获取事件提示信息
  const getEventTooltip = (event: TimelineEvent): string => {
    const cmd = event.command;
    const time = ADVDataParser.formatTime(event.time);
    const duration = event.duration ? ` (${event.duration.toFixed(2)}s)` : '';
    const typeName = getCommandTypeName(cmd.type);
    
    if (cmd.type === 'message' && 'text' in cmd.params && 'name' in cmd.params) {
      return `${time}${duration}\n${cmd.params.name}: ${cmd.params.text}`;
    }
    return `${typeName} @ ${time}${duration}`;
  };

  return (
    <div className="timeline-editor">
      {/* 控制栏 */}
      <div className="timeline-controls">
        <div className="time-display">
          <span className="time-label">时长：</span>
          {ADVDataParser.formatTime(timeline.duration)}
        </div>
        <div className="track-stats">
          <span className="stats-label">轨道：</span>
          {visibleTracks.length} 个
          <span className="stats-separator">|</span>
          <span className="stats-label">事件：</span>
          {visibleTracks.reduce((sum, t) => sum + t.events.length, 0)} 个
        </div>
        <div className="zoom-controls">
          <button onClick={handleZoomOut} title="缩小">−</button>
          <span className="zoom-value">{Math.round(zoom)}px/s</span>
          <button onClick={handleZoomIn} title="放大">+</button>
        </div>
      </div>

      {/* 主内容区域 - 分割为上下两部分 */}
      <div className="timeline-main">
        {/* 时间轴区域 */}
        <div className="timeline-container">
          {/* 轨道标签 */}
          <div className="track-labels">
            <div className="ruler-header">时间轴</div>
            <div className="track-labels-content" ref={labelsRef}>
              {visibleTracks.map(track => {
                // 计算该轨道需要的泳道数量
                const laneCount = Math.max(1, ...track.events.map(e => ((e as any).lane || 0) + 1));
                // 根据泳道数量动态调整轨道高度：每个泳道36px，最小64px
                const trackHeight = Math.max(64, laneCount * 36);
                return (
                  <div key={track.id} className="track-label" style={{ height: `${trackHeight}px` }}>
                    <span className={`track-icon ${track.type}`}>●</span>
                    {track.name}
                    <span className="event-count">{track.events.length}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 时间轴右侧区域（刻度尺 + 轨道内容） */}
          <div className="timeline-right">
            {/* 时间刻度尺容器 - 固定在顶部，只水平滚动 */}
            <div className="time-ruler-container" ref={rulerRef}>
              <div className="time-ruler" style={{ width: `${totalWidth}px` }}>
                {renderTimeRuler()}
              </div>
            </div>

            {/* 时间轴内容 - 可垂直和水平滚动 */}
            <div className="timeline-content" ref={timelineRef} onClick={handleTimelineClick} onScroll={handleScroll}>
              {/* 轨道列表 */}
              <div className="tracks" style={{ width: `${totalWidth}px` }}>
                {visibleTracks.map(track => {
                  // 计算该轨道需要的泳道数量
                  const laneCount = Math.max(1, ...track.events.map(e => ((e as any).lane || 0) + 1));
                  // 根据泳道数量动态调整轨道高度：每个泳道36px，最小64px
                  const trackHeight = Math.max(64, laneCount * 36);
                  return (
                    <div key={track.id} className="track" style={{ height: `${trackHeight}px`, width: `${totalWidth}px` }}>
                      <div className="track-content" style={{ width: `${totalWidth}px` }}>
                        {track.events.map(event => renderEvent(event, trackHeight, laneCount))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
