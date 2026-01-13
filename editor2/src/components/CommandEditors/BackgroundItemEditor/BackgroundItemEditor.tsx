import React, { useState, useEffect } from 'react';
import { useEnvironments } from '../../../hooks/useResourceAPI';
import { LoadingState, ErrorState } from '../../common';
import '../../FormEditor/FormEditor.css';

interface BackgroundItemEditorProps {
  id: string;
  src: string;
  onChange: (id: string, src: string) => void;
}

const BackgroundItemEditor: React.FC<BackgroundItemEditorProps> = ({ id, src, onChange }) => {
  const [localId, setLocalId] = useState(id);
  const [localSrc, setLocalSrc] = useState(src);
  const { data: environments, loading, error, reload } = useEnvironments();

  // 通知父组件变更
  useEffect(() => {
    onChange(localId, localSrc);
  }, [localId, localSrc]);

  if (loading) return <LoadingState message="加载环境列表中..." />;
  if (error) return <ErrorState message={error} onRetry={reload} details="请确保 Database API 服务器已启动" />;

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
        <div className="form-help-text">从数据库中选择环境资源</div>
      </div>
    </div>
  );
};

export default BackgroundItemEditor;
