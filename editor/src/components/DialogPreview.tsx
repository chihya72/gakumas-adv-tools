import React, { useMemo } from 'react';
import type { Command } from '../types/adv-script';
import { isMessageCommand, isVoiceCommand } from '../types/adv-script';
import { ADVDataParser } from '../utils/adv-parser';
import './DialogPreview.css';

interface DialogPreviewProps {
  commands: Command[];
  currentTime: number;
}

export const DialogPreview: React.FC<DialogPreviewProps> = ({ commands, currentTime }) => {
  // 查找当前显示的对话
  const currentDialog = useMemo(() => {
    const messageCommands = commands.filter(isMessageCommand);
    
    for (const cmd of messageCommands) {
      if (cmd.clip && 
          cmd.clip.startTime <= currentTime && 
          currentTime < cmd.clip.startTime + cmd.clip.duration) {
        return cmd;
      }
    }
    return null;
  }, [commands, currentTime]);

  // 查找当前播放的语音
  const currentVoice = useMemo(() => {
    const voiceCommands = commands.filter(isVoiceCommand);
    
    for (const cmd of voiceCommands) {
      if (cmd.clip && 
          cmd.clip.startTime <= currentTime && 
          currentTime < cmd.clip.startTime + cmd.clip.duration) {
        return cmd;
      }
    }
    return null;
  }, [commands, currentTime]);

  // 解析Ruby标签
  const parseDialogText = (text: string) => {
    const segments = ADVDataParser.parseRubyText(text);
    return segments.map((seg, idx) => {
      if (seg.ruby) {
        return (
          <ruby key={idx}>
            {seg.text}
            <rt>{seg.ruby}</rt>
          </ruby>
        );
      }
      return <span key={idx}>{seg.text}</span>;
    });
  };

  // 处理换行符
  const renderText = (text: string) => {
    // 解析JSON转义：\r\n -> \r\n (可见字符), \" -> "
    const unescapedText = text
      .replace(/\\\\/g, '\\')    // \\\\ -> \\ (双反斜杠转单反斜杠)
      .replace(/\\"/g, '"');      // \\" -> " (转义引号转引号)
    
    // 按\r\n或\n分割成多行（这些是可见字符）
    const lines = unescapedText.split(/\\r\\n|\\n/);
    return lines.map((line, idx) => (
      <div key={idx} className="dialog-line">
        {parseDialogText(line)}
      </div>
    ));
  };

  return (
    <div className="dialog-preview">
      <h2>对话预览</h2>
      
      {currentDialog ? (
        <div className="dialog-container">
          {/* 说话者名字 */}
          <div className="speaker-name">
            {currentDialog.params.name}
          </div>

          {/* 对话文本框 */}
          <div className="dialog-box">
            <div className="dialog-text">
              {renderText(currentDialog.params.text)}
            </div>

            {/* 语音指示器 */}
            {currentVoice && (
              <div className="voice-indicator">
                <span className="voice-icon">♪</span>
                <span className="voice-file">{currentVoice.params.voice}</span>
              </div>
            )}
          </div>

          {/* 时间信息 */}
          {currentDialog.clip && (
            <div className="dialog-timing">
              <span>开始: {ADVDataParser.formatTime(currentDialog.clip.startTime)}</span>
              <span>时长: {currentDialog.clip.duration.toFixed(2)}s</span>
            </div>
          )}
        </div>
      ) : (
        <div className="no-dialog">
          <div className="no-dialog-icon">💭</div>
          <p>当前时间没有对话</p>
        </div>
      )}

      {/* 对话历史 */}
      <div className="dialog-history">
        <h3>对话历史</h3>
        <div className="history-list">
          {commands
            .filter(isMessageCommand)
            .filter(cmd => cmd.clip && cmd.clip.startTime < currentTime)
            .reverse()
            .slice(0, 5)
            .map((cmd, idx) => (
              <div key={idx} className="history-item">
                <div className="history-time">
                  {cmd.clip && ADVDataParser.formatTime(cmd.clip.startTime)}
                </div>
                <div className="history-speaker">{cmd.params.name}</div>
                <div className="history-text">
                  {cmd.params.text.substring(0, 50)}
                  {cmd.params.text.length > 50 ? '...' : ''}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
