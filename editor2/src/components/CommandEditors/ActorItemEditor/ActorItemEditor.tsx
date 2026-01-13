import React, { useState, useEffect } from 'react';
import { useCharacters, useModels } from '../../../hooks/useResourceAPI';
import { LoadingState, ErrorState } from '../../common';
import '../../FormEditor/FormEditor.css';

interface ActorItemEditorProps {
  id: string;
  body: string;
  face: string;
  hair: string;
  onChange: (data: { id: string; body: string; face: string; hair: string }) => void;
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
  const { data: allCharacters, loading: loadingChars, error: errorChars } = useCharacters();
  const { 
    data: bodyModels, 
    loading: loadingBody, 
    error: errorBody, 
    reload: reloadBody 
  } = useModels(localData.id, 'body');
  const { 
    data: faceModels, 
    loading: loadingFace, 
    error: errorFace, 
    reload: reloadFace 
  } = useModels(localData.id, 'face');
  const { 
    data: hairModels, 
    loading: loadingHair, 
    error: errorHair, 
    reload: reloadHair 
  } = useModels(localData.id, 'hair');

  // 通知父组件变更
  useEffect(() => {
    onChange(localData);
  }, [localData]);

  // 当角色列表加载完成且没有选中角色时，自动选择第一个
  useEffect(() => {
    if (!localData.id && allCharacters.length > 0) {
      handleIdChange(allCharacters[0]);
    }
  }, [allCharacters]);

  const handleIdChange = (newId: string) => {
    setLocalData({ id: newId, body: '', face: '', hair: '' });
  };

  const loading = loadingBody || loadingFace || loadingHair;
  const error = errorBody || errorFace || errorHair;
  const reload = () => {
    reloadBody();
    reloadFace();
    reloadHair();
  };

  if (loadingChars) return <LoadingState message="加载角色列表中..." />;
  if (errorChars) return <ErrorState message={errorChars} details="请确保 Database API 服务器已启动" />;

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
            <LoadingState message="加载模型列表中..." />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} details="请确保 Database API 服务器已启动" />
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
