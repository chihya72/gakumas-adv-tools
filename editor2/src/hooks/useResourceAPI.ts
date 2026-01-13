/**
 * Resource API Hooks - 统一的资源加载逻辑
 * 消除重复的 API 调用代码，提供统一的错误处理和加载状态管理
 */

import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000';

interface UseResourceAPIOptions {
  autoLoad?: boolean;
  cacheTime?: number;
}

interface UseResourceAPIResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * 通用的Resource API调用Hook
 */
export function useResourceAPI<T>(
  endpoint: string,
  options: UseResourceAPIOptions = {}
): UseResourceAPIResult<T> {
  const { autoLoad = true } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || '加载失败');
      }
    } catch (err) {
      const message = err instanceof Error 
        ? err.message 
        : '加载失败，请确保 Database API 服务器已启动';
      setError(message);
      console.error('加载资源失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [endpoint, autoLoad]);

  return { data, loading, error, reload: load };
}

// ============================================================================
// 特定资源的 Hooks
// ============================================================================

/**
 * Motion资源类型
 */
export interface Motion {
  id: number;
  motion_name: string;
  motion_type: 'character' | 'facial';
  character_id: string | null;
  action_type: string | null;
}

/**
 * Model资源类型
 */
export interface Model {
  id: number;
  model_name: string;
  model_type: 'body' | 'face' | 'hair';
  character_id?: string;
}

/**
 * Environment资源类型
 */
export interface Environment {
  id: number;
  env_name: string;
  env_type: string;
  location?: string;
  time_of_day?: string;
}

/**
 * 获取动作或表情资源
 */
export function useMotions(motionType: 'character' | 'facial') {
  return useResourceAPI<Motion>(
    `/api/resources/motions?motion_type=${motionType}`
  );
}

/**
 * 获取环境（背景）资源
 */
export function useEnvironments() {
  return useResourceAPI<Environment>('/api/resources/environments');
}

/**
 * 获取角色模型资源
 */
export function useModels(characterId: string, modelType: 'body' | 'face' | 'hair') {
  return useResourceAPI<Model>(
    `/api/resources/models?character_id=${characterId}&model_type=${modelType}`,
    { autoLoad: !!characterId }  // 只有在有characterId时才加载
  );
}

/**
 * 获取角色列表
 */
export function useCharacters() {
  return useResourceAPI<string>('/api/characters');
}
