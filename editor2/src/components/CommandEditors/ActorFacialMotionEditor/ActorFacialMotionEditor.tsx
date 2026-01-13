import React, { useState, useEffect } from 'react';
import { CommandCard } from '../../../types/command-card';
import { parseActorGroup } from '../../App/renderers/parserHelpers';
import '../../FormEditor/FormEditor.css';

interface ActorFacialMotionEditorProps {
  card: CommandCard;
  onChange: (updatedCard: CommandCard, isValid?: boolean) => void;
}

interface Motion {
  id: number;
  motion_name: string;
  motion_type: string;
  character_id: string | null;
  action_type: string | null;
}

/** 角色表情命令编辑器 */
export const ActorFacialMotionEditor: React.FC<ActorFacialMotionEditorProps> = ({ card, onChange }) => {
  const [formData, setFormData] = useState({
    id: card.params.id || '',
    motion: card.params.motion || '',
    transition: card.params.transition !== undefined ? card.params.transition : 0,
  });
  
  const [availableActorIds, setAvailableActorIds] = useState<string[]>([]);
  const [motions, setMotions] = useState<Motion[]>([]);
  const [loadingMotions, setLoadingMotions] = useState(false);
  const [motionError, setMotionError] = useState<string | null>(null);

  // 从全局获取可用的角色ID列表
  useEffect(() => {
    const getAllCards = (): CommandCard[] => {
      return (window as any).__editorCards || [];
    };
    
    const cards = getAllCards();
    const actorIds: string[] = [];
    
    for (const c of cards) {
      if (c.type === 'actorgroup') {
        const actors = parseActorGroup(c.params);
        actors.forEach((actor: any) => {
          if (actor.id && !actorIds.includes(actor.id)) {
            actorIds.push(actor.id);
          }
        });
      }
    }
    
    setAvailableActorIds(actorIds);
  }, []);

  // 加载表情动作列表（使用facial类型）
  useEffect(() => {
    loadMotions();
  }, []);

  const loadMotions = async () => {
    setLoadingMotions(true);
    setMotionError(null);
    try {
      // 获取表情动作
      const response = await fetch('http://localhost:5000/api/resources/motions?motion_type=facial');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setMotions(data.data);
      } else {
        throw new Error('加载表情列表失败');
      }
    } catch (err) {
      console.error('加载表情列表失败:', err);
      setMotionError(err instanceof Error ? err.message : '加载失败，请确保 Database API 服务器已启动');
    } finally {
      setLoadingMotions(false);
    }
  };

  useEffect(() => {
    const isValid = !!(formData.id && formData.id.trim() !== '' && 
                       formData.motion && formData.motion.trim() !== '');
    onChange({
      ...card,
      params: {
        ...card.params,
        id: formData.id,
        motion: formData.motion,
        transition: formData.transition,
      },
    }, isValid);
  }, [formData]);

  return (
    <div className="form-container">
      <div className="form-field">
        <label className="form-label">角色ID (id)</label>
        <select
          className="form-select"
          value={formData.id}
          onChange={(e) => setFormData({ ...formData, id: e.target.value })}
          disabled={availableActorIds.length === 0}
        >
          <option value="">
            {availableActorIds.length > 0 ? '请选择角色...' : '无可用角色，请先添加 actorgroup'}
          </option>
          {availableActorIds.map((actorId) => (
            <option key={actorId} value={actorId}>
              {actorId}
            </option>
          ))}
        </select>
        <div className="form-help-text">
          {availableActorIds.length > 0 
            ? '只能选择在 actorgroup 中已定义的角色'
            : '⚠️ 未找到已定义的角色，请先添加 actorgroup 命令'
          }
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">表情名称 (motion)</label>
        {loadingMotions ? (
          <div className="form-loading">加载表情列表中...</div>
        ) : motionError ? (
          <div className="form-error">
            <p>{motionError}</p>
            <button className="form-retry-btn" onClick={loadMotions}>
              重试
            </button>
          </div>
        ) : (
          <select
            className="form-select"
            value={formData.motion}
            onChange={(e) => setFormData({ ...formData, motion: e.target.value })}
            disabled={motions.length === 0}
          >
            <option value="">
              {motions.length > 0 ? '请选择表情...' : '无可用表情，请启动 Database API'}
            </option>
            {motions.map((motion) => (
              <option key={motion.id} value={motion.motion_name}>
                {motion.motion_name}
                {motion.character_id && ` (${motion.character_id})`}
                {motion.action_type && ` - ${motion.action_type}`}
              </option>
            ))}
          </select>
        )}
        <div className="form-help-text">
          {motions.length > 0 
            ? '从数据库中选择表情资源'
            : '⚠️ 需要启动 Database API 服务器 (python resource_api_server.py)'
          }
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">过渡时间 (transition)</label>
        <input
          type="number"
          className="form-input"
          value={formData.transition}
          onChange={(e) => setFormData({ ...formData, transition: parseFloat(e.target.value) || 0 })}
          step="0.1"
          min="0"
        />
        <div className="form-help-text">表情切换的过渡时间（秒）</div>
      </div>
    </div>
  );
};
