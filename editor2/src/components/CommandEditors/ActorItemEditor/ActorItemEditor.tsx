import React, { useState, useEffect } from 'react';
import '../../FormEditor/FormEditor.css';

interface ActorItemEditorProps {
  id: string;
  body: string;
  face: string;
  hair: string;
  onChange: (data: { id: string; body: string; face: string; hair: string }) => void;
}

interface Model {
  id: number;
  model_name: string;
  model_type: string;
  character_id?: string;
}

// 角色ID到中文名的映射
const CHARACTER_NAMES: Record<string, string> = {
  'amao': '有村麻央',
  'atbm': '雨夜燕',
  'fktn': '藤田琴音',
  'hmsz': '秦谷美铃',
  'hrnm': '姬崎莉波',
  'hski': '花海咲季',
  'hume': '花海佑芽',
  'jsna': '十王星南',
  'kcna': '仓本千奈',
  'kllj': '葛城莉莉娅',
  'nasr': '根绪亚纱里',
  'shro': '筱泽广',
  'ssmk': '紫云清夏',
  'trda': '舞蹈训练员',
  'trvi': '视觉训练员',
  'trvo': '歌唱训练员',
  'ttmr': '月村手毬',
  'cmmn': '角色通用'
};

const ActorItemEditor: React.FC<ActorItemEditorProps> = ({ id, body, face, hair, onChange }) => {
  const [localData, setLocalData] = useState({ id, body, face, hair });
  const [bodyModels, setBodyModels] = useState<Model[]>([]);
  const [faceModels, setFaceModels] = useState<Model[]>([]);
  const [hairModels, setHairModels] = useState<Model[]>([]);
  const [allCharacters, setAllCharacters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 通知父组件变更
  useEffect(() => {
    onChange(localData);
  }, [localData]);

  // 加载角色列表
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/characters');
        const data = await response.json();
        
        if (data.success && data.data) {
          setAllCharacters(data.data);
          // 如果当前没有选中角色且有角色列表，选择第一个
          if (!localData.id && data.data.length > 0) {
            handleIdChange(data.data[0]);
          }
        }
      } catch (error) {
        console.error('加载角色列表失败:', error);
      }
    };

    loadCharacters();
  }, []);

  // 当角色ID变更时，重新加载模型列表
  useEffect(() => {
    if (localData.id) {
      loadModels(localData.id);
    }
  }, [localData.id]);

  const loadModels = async (characterId: string) => {
    setLoading(true);
    setError(null);
    try {
      // 加载 body 模型
      const bodyResponse = await fetch(
        `http://localhost:5000/api/resources/models?character_id=${characterId}&model_type=body`
      );
      if (!bodyResponse.ok) throw new Error(`HTTP ${bodyResponse.status}`);
      const bodyData = await bodyResponse.json();
      if (bodyData.success) setBodyModels(bodyData.data);

      // 加载 face 模型
      const faceResponse = await fetch(
        `http://localhost:5000/api/resources/models?character_id=${characterId}&model_type=face`
      );
      if (!faceResponse.ok) throw new Error(`HTTP ${faceResponse.status}`);
      const faceData = await faceResponse.json();
      if (faceData.success) setFaceModels(faceData.data);

      // 加载 hair 模型
      const hairResponse = await fetch(
        `http://localhost:5000/api/resources/models?character_id=${characterId}&model_type=hair`
      );
      if (!hairResponse.ok) throw new Error(`HTTP ${hairResponse.status}`);
      const hairData = await hairResponse.json();
      if (hairData.success) setHairModels(hairData.data);
    } catch (err) {
      console.error('加载模型列表失败:', err);
      setError(err instanceof Error ? err.message : '加载失败，请确保 Database API 服务器已启动');
    } finally {
      setLoading(false);
    }
  };

  const handleIdChange = (newId: string) => {
    setLocalData({ id: newId, body: '', face: '', hair: '' });
  };

  return (
    <div className="actor-item-editor">
      <div className="form-field">
        <label className="form-label">角色ID</label>
        <select
          className="form-select"
          value={localData.id}
          onChange={(e) => handleIdChange(e.target.value)}
        >
          {!localData.id && <option value="">请选择角色...</option>}
          {allCharacters.map((charId) => {
            const cnName = CHARACTER_NAMES[charId.toLowerCase()];
            const displayName = cnName ? `${charId.toUpperCase()} (${cnName})` : charId.toUpperCase();
            return (
              <option key={charId} value={charId}>
                {displayName}
              </option>
            );
          })}
        </select>
        <div className="form-help-text">选择角色后将自动加载可用的模型列表</div>
      </div>

      {localData.id && (
        <>
          {loading ? (
            <div className="form-loading">加载模型列表中...</div>
          ) : error ? (
            <div className="form-error">
              <p>{error}</p>
              <button className="form-retry-btn" onClick={() => loadModels(localData.id)}>
                重试
              </button>
            </div>
          ) : (
            <>
              <div className="form-field">
                <label className="form-label">Body 模型</label>
                <select
                  className="form-select"
                  value={localData.body}
                  onChange={(e) => setLocalData({ ...localData, body: e.target.value })}
                >
                  <option value="">请选择 Body 模型...</option>
                  {bodyModels.map((model) => (
                    <option key={model.id} value={model.model_name}>
                      {model.model_name}
                    </option>
                  ))}
                </select>
                <div className="form-help-text">角色的身体模型</div>
              </div>

              <div className="form-field">
                <label className="form-label">Face 模型</label>
                <select
                  className="form-select"
                  value={localData.face}
                  onChange={(e) => setLocalData({ ...localData, face: e.target.value })}
                >
                  <option value="">请选择 Face 模型...</option>
                  {faceModels.map((model) => (
                    <option key={model.id} value={model.model_name}>
                      {model.model_name}
                    </option>
                  ))}
                </select>
                <div className="form-help-text">角色的脸部模型</div>
              </div>

              <div className="form-field">
                <label className="form-label">Hair 模型</label>
                <select
                  className="form-select"
                  value={localData.hair}
                  onChange={(e) => setLocalData({ ...localData, hair: e.target.value })}
                >
                  <option value="">请选择 Hair 模型...</option>
                  {hairModels.map((model) => (
                    <option key={model.id} value={model.model_name}>
                      {model.model_name}
                    </option>
                  ))}
                </select>
                <div className="form-help-text">角色的头发模型</div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ActorItemEditor;
