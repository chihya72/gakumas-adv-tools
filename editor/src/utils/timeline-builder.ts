/**
 * 时间轴构建器
 * 将命令列表转换为时间轴轨道结构
 */

import type {
  Command,
  Timeline,
  TimelineTrack,
  TimelineEvent,
  ADVScript,
} from '../types/adv-script';
import { isMessageCommand, isVoiceCommand, isCameraCommand } from '../types/adv-script';

export class TimelineBuilder {
  /**
   * 从命令列表构建时间轴
   */
  static buildTimeline(commands: Command[]): Timeline {
    const tracks: TimelineTrack[] = [
      this.buildDialogTrack(commands),
      this.buildVoiceTrack(commands),
      this.buildSoundEffectTrack(commands), // 新增：音效轨道
      this.buildCameraTrack(commands),
      this.buildActorTrack(commands),
      this.buildLayoutTrack(commands), // 新增：布局轨道
      this.buildEffectTrack(commands),
    ];

    const duration = this.calculateDuration(commands);

    return {
      tracks,
      duration,
      currentTime: 0,
    };
  }

  /**
   * 构建对话轨道
   */
  private static buildDialogTrack(commands: Command[]): TimelineTrack {
    const events: TimelineEvent[] = commands
      .filter(isMessageCommand)
      .filter(cmd => cmd.clip !== null)
      .map(cmd => ({
        time: cmd.clip!.startTime,
        type: 'message',
        command: cmd,
        duration: cmd.clip!.duration,
      }));

    return {
      id: 'dialog',
      name: '对话',
      type: 'dialog',
      events: events.sort((a, b) => a.time - b.time),
      visible: true,
      locked: false,
    };
  }

  /**
   * 构建语音轨道
   */
  private static buildVoiceTrack(commands: Command[]): TimelineTrack {
    const events: TimelineEvent[] = commands
      .filter(isVoiceCommand)
      .filter(cmd => cmd.clip !== null)
      .map(cmd => ({
        time: cmd.clip!.startTime,
        type: 'voice',
        command: cmd,
        duration: cmd.clip!.duration,
      }));

    return {
      id: 'voice',
      name: '语音',
      type: 'audio',
      events: events.sort((a, b) => a.time - b.time),
      visible: true,
      locked: false,
    };
  }

  /**
   * 构建相机轨道
   */
  private static buildCameraTrack(commands: Command[]): TimelineTrack {
    const events: TimelineEvent[] = commands
      .filter(isCameraCommand)
      .filter(cmd => cmd.clip !== null)
      .map(cmd => ({
        time: cmd.clip!.startTime,
        type: 'camera',
        command: cmd,
        duration: cmd.clip!.duration,
      }));

    return {
      id: 'camera',
      name: '相机',
      type: 'camera',
      events: events.sort((a, b) => a.time - b.time),
      visible: true,
      locked: false,
    };
  }

  /**
   * 构建角色动作轨道
   */
  private static buildActorTrack(commands: Command[]): TimelineTrack {
    const events: TimelineEvent[] = commands
      .filter(cmd => 
        cmd.type.startsWith('actor') && 
        !cmd.type.includes('group') &&
        cmd.clip !== null
      )
      .map(cmd => ({
        time: cmd.clip!.startTime,
        type: cmd.type,
        command: cmd,
        duration: cmd.clip!.duration,
      }));

    // 按时间排序
    const sortedEvents = events.sort((a, b) => a.time - b.time);
    
    // 分配泳道以避免重叠
    this.assignLanes(sortedEvents);

    return {
      id: 'actor',
      name: '角色',
      type: 'actor',
      events: sortedEvents,
      visible: true,
      locked: false,
    };
  }

  /**
   * 为事件分配泳道以避免重叠
   * 使用贪心算法：每个事件尝试分配到第一个不冲突的泳道
   */
  private static assignLanes(events: TimelineEvent[]): void {
    // 记录每个泳道的最后结束时间
    const laneEndTimes: number[] = [];

    for (const event of events) {
      const eventStart = event.time;
      const eventEnd = event.time + (event.duration || 0);

      // 找到第一个可用的泳道（结束时间 <= 当前事件开始时间）
      let assignedLane = -1;
      for (let i = 0; i < laneEndTimes.length; i++) {
        const laneEndTime = laneEndTimes[i];
        if (laneEndTime !== undefined && laneEndTime <= eventStart) {
          assignedLane = i;
          break;
        }
      }

      // 如果没有可用泳道，创建新泳道
      if (assignedLane === -1) {
        assignedLane = laneEndTimes.length;
        laneEndTimes.push(0);
      }

      // 分配泳道并更新结束时间
      (event as any).lane = assignedLane;
      laneEndTimes[assignedLane] = eventEnd;
    }
  }

  /**
   * 构建布局轨道（actorlayoutgroup、backgroundlayoutgroup）
   * 包括初始化布局（startTime=0）和所有后续的布局调整
   */
  private static buildLayoutTrack(commands: Command[]): TimelineTrack {
    const events: TimelineEvent[] = commands
      .filter(cmd => 
        cmd.type.includes('layoutgroup') && 
        cmd.clip !== null
        // 显示所有布局命令，包括startTime=0的初始化布局
      )
      .map(cmd => ({
        time: cmd.clip!.startTime,
        type: cmd.type,
        command: cmd,
        duration: cmd.clip!.duration,
      }));

    // 按时间排序
    const sortedEvents = events.sort((a, b) => a.time - b.time);
    
    // 分配泳道以避免重叠
    this.assignLanes(sortedEvents);

    return {
      id: 'layout',
      name: '布局',
      type: 'layout',
      events: sortedEvents,
      visible: true,
      locked: false,
    };
  }

  /**
   * 构建效果轨道（包括转场、淡入淡出等）
   */
  private static buildEffectTrack(commands: Command[]): TimelineTrack {
    const effectTypes = ['fade', 'transition', 'shake', 'dof', 'coloreffect'];
    const events: TimelineEvent[] = commands
      .filter(cmd => effectTypes.includes(cmd.type) && cmd.clip !== null)
      .map(cmd => ({
        time: cmd.clip!.startTime,
        type: cmd.type,
        command: cmd,
        duration: cmd.clip!.duration,
      }));

    return {
      id: 'effect',
      name: '效果',
      type: 'effect',
      events: events.sort((a, b) => a.time - b.time),
      visible: true,
      locked: false,
    };
  }

  /**
   * 构建音效轨道
   */
  private static buildSoundEffectTrack(commands: Command[]): TimelineTrack {
    const events: TimelineEvent[] = commands
      .filter(cmd => cmd.type === 'se' && cmd.clip !== null)
      .map(cmd => ({
        time: cmd.clip!.startTime,
        type: 'se',
        command: cmd,
        duration: cmd.clip!.duration,
      }));

    return {
      id: 'se',
      name: '音效',
      type: 'audio',
      events: events.sort((a, b) => a.time - b.time),
      visible: true,
      locked: false,
    };
  }

  /**
   * 计算总时长
   */
  private static calculateDuration(commands: Command[]): number {
    let maxTime = 0;

    for (const cmd of commands) {
      if (cmd.clip) {
        const endTime = cmd.clip.startTime + cmd.clip.duration;
        if (endTime > maxTime) {
          maxTime = endTime;
        }
      }
    }

    return maxTime;
  }

  /**
   * 获取指定时间点的所有活动事件
   */
  static getActiveEvents(timeline: Timeline, time: number): TimelineEvent[] {
    const activeEvents: TimelineEvent[] = [];

    for (const track of timeline.tracks) {
      for (const event of track.events) {
        const endTime = event.time + (event.duration || 0);
        if (event.time <= time && time < endTime) {
          activeEvents.push(event);
        }
      }
    }

    return activeEvents;
  }

  /**
   * 获取轨道在指定时间范围内的事件
   */
  static getEventsInRange(
    track: TimelineTrack,
    startTime: number,
    endTime: number
  ): TimelineEvent[] {
    return track.events.filter(event => {
      const eventEnd = event.time + (event.duration || 0);
      return (
        (event.time >= startTime && event.time < endTime) ||
        (eventEnd > startTime && eventEnd <= endTime) ||
        (event.time < startTime && eventEnd > endTime)
      );
    });
  }

  /**
   * 查找指定位置最近的事件
   */
  static findNearestEvent(
    track: TimelineTrack,
    time: number,
    maxDistance: number = Infinity
  ): TimelineEvent | null {
    let nearest: TimelineEvent | null = null;
    let minDistance = maxDistance;

    for (const event of track.events) {
      const distance = Math.abs(event.time - time);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = event;
      }
    }

    return nearest;
  }

  /**
   * 获取时间轴统计信息
   */
  static getStatistics(timeline: Timeline): {
    totalEvents: number;
    trackStats: Array<{ trackName: string; eventCount: number }>;
    duration: number;
  } {
    const trackStats = timeline.tracks.map(track => ({
      trackName: track.name,
      eventCount: track.events.length,
    }));

    const totalEvents = trackStats.reduce((sum, stat) => sum + stat.eventCount, 0);

    return {
      totalEvents,
      trackStats,
      duration: timeline.duration,
    };
  }

  /**
   * 从脚本构建时间轴（快捷方法）
   */
  static fromScript(script: ADVScript): Timeline {
    return this.buildTimeline(script.commands);
  }
}
