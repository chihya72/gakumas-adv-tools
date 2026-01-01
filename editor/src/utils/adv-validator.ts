/**
 * ADV命令验证器
 * 验证命令数据的完整性和正确性
 */

import type {
  Command,
  BaseCommand,
  MessageCommand,
  VoiceCommand,
  ActorMotionCommand,
  CameraSettingCommand,
  ClipData,
} from '../types/adv-script';

export class ADVCommandValidator {
  /**
   * 验证Clip数据
   */
  static validateClip(clip: ClipData | null): boolean {
    if (clip === null) return true;

    if (typeof clip.startTime !== 'number' || isNaN(clip.startTime)) {
      console.error('Invalid startTime in clip:', clip);
      return false;
    }

    if (typeof clip.duration !== 'number' || isNaN(clip.duration)) {
      console.error('Invalid duration in clip:', clip);
      return false;
    }

    return true;
  }

  /**
   * 验证基础命令结构
   */
  static validateBaseCommand(cmd: BaseCommand): boolean {
    if (!cmd.type || typeof cmd.type !== 'string') {
      console.error('Invalid command type:', cmd);
      return false;
    }

    if (!cmd.params || typeof cmd.params !== 'object') {
      console.error('Invalid command params:', cmd);
      return false;
    }

    if (!this.validateClip(cmd.clip)) {
      return false;
    }

    return true;
  }

  /**
   * 验证对话命令
   */
  static validateMessageCommand(cmd: MessageCommand): boolean {
    if (!this.validateBaseCommand(cmd)) return false;

    if (!cmd.params.text || typeof cmd.params.text !== 'string') {
      console.error('Invalid message text:', cmd);
      return false;
    }

    if (!cmd.params.name || typeof cmd.params.name !== 'string') {
      console.error('Invalid message name:', cmd);
      return false;
    }

    return true;
  }

  /**
   * 验证语音命令
   */
  static validateVoiceCommand(cmd: VoiceCommand): boolean {
    if (!this.validateBaseCommand(cmd)) return false;

    if (!cmd.params.voice || typeof cmd.params.voice !== 'string') {
      console.error('Invalid voice:', cmd);
      return false;
    }

    if (!cmd.params.actorId || typeof cmd.params.actorId !== 'string') {
      console.error('Invalid actorId:', cmd);
      return false;
    }

    return true;
  }

  /**
   * 验证角色动作命令
   */
  static validateActorMotionCommand(cmd: ActorMotionCommand): boolean {
    if (!this.validateBaseCommand(cmd)) return false;

    if (!cmd.params.id || typeof cmd.params.id !== 'string') {
      console.error('Invalid actor id:', cmd);
      return false;
    }

    if (!cmd.params.motion || typeof cmd.params.motion !== 'string') {
      console.error('Invalid motion:', cmd);
      return false;
    }

    return true;
  }

  /**
   * 验证相机命令
   */
  static validateCameraCommand(cmd: CameraSettingCommand): boolean {
    if (!this.validateBaseCommand(cmd)) return false;

    if (!cmd.params.setting || typeof cmd.params.setting !== 'string') {
      console.error('Invalid camera setting:', cmd);
      return false;
    }

    // 尝试解析JSON
    try {
      JSON.parse(cmd.params.setting);
    } catch (error) {
      console.error('Invalid camera setting JSON:', cmd.params.setting);
      return false;
    }

    return true;
  }

  /**
   * 验证任意命令
   */
  static validate(cmd: Command): boolean {
    const typeValidators: Record<string, (cmd: any) => boolean> = {
      message: this.validateMessageCommand,
      voice: this.validateVoiceCommand,
      actormotion: this.validateActorMotionCommand,
      camerasetting: this.validateCameraCommand,
    };

    const validator = typeValidators[cmd.type];
    if (validator) {
      return validator.call(this, cmd);
    }

    // 对于其他类型，只验证基础结构
    return this.validateBaseCommand(cmd);
  }

  /**
   * 批量验证命令列表
   */
  static validateAll(commands: Command[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      if (!this.validate(cmd)) {
        errors.push(`Command at index ${i} (type: ${cmd.type}) is invalid`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
