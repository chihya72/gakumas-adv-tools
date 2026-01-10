import React, { useState, useEffect } from 'react';
import '../../FormEditor/FormEditor.css';

interface BackgroundItemEditorProps {
  id: string;
  src: string;
  onChange: (id: string, src: string) => void;
}

interface Environment {
  id: number;
  env_name: string;
  env_type: string;
  location?: string;
  time_of_day?: string;
}

const BackgroundItemEditor: React.FC<BackgroundItemEditorProps> = ({ id, src, onChange }) => {
  const [localId, setLocalId] = useState(id);
  const [localSrc, setLocalSrc] = useState(src);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载环境资源列表
  useEffect(() => {
    loadEnvironments();
  }, []);

  // 通知父组件变更
  useEffect(() => {
    onChange(localId, localSrc);
  }, [localId, localSrc]);

  const loadEnvironments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/resources/environments');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setEnvironments(data.data);
      } else {
        throw new Error('加载环境列表失败');
      }
    } catch (err) {
      console.error('加载环境列表失败:', err);
      setError(err instanceof Error ? err.message : '加载失败，请确保 Database API 服务器已启动');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="background-item-editor">
      <div className="form-field">
        <label className="form-label">背景ID</label>
        <input
          type="text"
          className="form-input"
          value={localId}
          onChange={(e) => setLocalId(e.target.value)}
          placeholder="例如: entrance"
        />
        <div className="form-help-text">背景的标识符，用于在命令中引用</div>
      </div>

      <div className="form-field">
        <label className="form-label">资源路径 (src)</label>
        {loading ? (
          <div className="form-loading">加载环境列表中...</div>
        ) : error ? (
          <div className="form-error">
            <p>{error}</p>
            <button className="form-retry-btn" onClick={loadEnvironments}>
              重试
            </button>
          </div>
        ) : (
          <select
            className="form-select"
            value={localSrc}
            onChange={(e) => setLocalSrc(e.target.value)}
          >
            <option value="">请选择环境资源...</option>
            {environments.map((env) => (
              <option key={env.id} value={env.env_name}>
                {env.env_name}
                {env.location && ` (${env.location})`}
                {env.time_of_day && ` - ${env.time_of_day}`}
              </option>
            ))}
          </select>
        )}
        <div className="form-help-text">从数据库中选择环境资源</div>
      </div>
    </div>
  );
};

export default BackgroundItemEditor;
