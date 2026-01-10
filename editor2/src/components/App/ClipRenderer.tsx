// 判断是否是默认的空曲线
function isDefaultCurve(curve: any): boolean {
  if (!curve) return true;
  if (curve.serializedVersion === "2" && 
      Array.isArray(curve.m_Curve) && curve.m_Curve.length === 0 &&
      curve.m_PreInfinity === 2 && curve.m_PostInfinity === 2 && curve.m_RotationOrder === 4) {
    return true;
  }
  return false;
}

// 渲染时间轴信息 - 统一处理所有包含 clip 的命令，作为一个卡片显示
export function renderClipInfo(clip: any, onEdit?: () => void) {
  if (!clip || clip.startTime === undefined) return null;

  // 判断哪些值不是默认值，只显示有意义的内容
  const hasNonDefaultEaseIn = clip.easeInDuration !== undefined && clip.easeInDuration > 0;
  const hasNonDefaultEaseOut = clip.easeOutDuration !== undefined && clip.easeOutDuration > 0;
  const hasNonDefaultBlendIn = clip.blendInDuration !== undefined && clip.blendInDuration !== -1;
  const hasNonDefaultBlendOut = clip.blendOutDuration !== undefined && clip.blendOutDuration !== -1;
  const hasNonDefaultMixInType = clip.mixInEaseType !== undefined && clip.mixInEaseType !== 1;
  const hasNonDefaultMixOutType = clip.mixOutEaseType !== undefined && clip.mixOutEaseType !== 1;
  const hasNonDefaultTimeScale = clip.timeScale !== undefined && clip.timeScale !== 1.0;
  const hasNonDefaultMixInCurve = clip.mixInCurve && !isDefaultCurve(clip.mixInCurve);
  const hasNonDefaultMixOutCurve = clip.mixOutCurve && !isDefaultCurve(clip.mixOutCurve);

  return (
    <div className="detail-section">
      <div className="detail-section-header">
        <h4>时间轴</h4>
        {onEdit && (
          <button className="detail-edit-btn" onClick={onEdit} title="编辑">
            ✏️
          </button>
        )}
      </div>
      <div className="detail-row">
        <span className="detail-label">开始时间:</span>
        <span className="detail-value">{clip.startTime.toFixed(3)}s</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">持续时间:</span>
        <span className="detail-value">{clip.duration.toFixed(3)}s</span>
      </div>
      {clip.clipIn !== undefined && clip.clipIn > 0 && (
        <div className="detail-row">
          <span className="detail-label">Clip In:</span>
          <span className="detail-value">{clip.clipIn.toFixed(3)}s</span>
        </div>
      )}
      {hasNonDefaultEaseIn && (
        <div className="detail-row">
          <span className="detail-label">淡入时间:</span>
          <span className="detail-value">{clip.easeInDuration.toFixed(3)}s</span>
        </div>
      )}
      {hasNonDefaultEaseOut && (
        <div className="detail-row">
          <span className="detail-label">淡出时间:</span>
          <span className="detail-value">{clip.easeOutDuration.toFixed(3)}s</span>
        </div>
      )}
      {hasNonDefaultBlendIn && (
        <div className="detail-row">
          <span className="detail-label">混合淡入:</span>
          <span className="detail-value">{clip.blendInDuration.toFixed(3)}s</span>
        </div>
      )}
      {hasNonDefaultBlendOut && (
        <div className="detail-row">
          <span className="detail-label">混合淡出:</span>
          <span className="detail-value">{clip.blendOutDuration.toFixed(3)}s</span>
        </div>
      )}
      {hasNonDefaultMixInType && (
        <div className="detail-row">
          <span className="detail-label">混入缓动类型:</span>
          <span className="detail-value">{clip.mixInEaseType}</span>
        </div>
      )}
      {hasNonDefaultMixOutType && (
        <div className="detail-row">
          <span className="detail-label">混出缓动类型:</span>
          <span className="detail-value">{clip.mixOutEaseType}</span>
        </div>
      )}
      {hasNonDefaultTimeScale && (
        <div className="detail-row">
          <span className="detail-label">时间缩放:</span>
          <span className="detail-value">{clip.timeScale}</span>
        </div>
      )}
      {hasNonDefaultMixInCurve && (
        <div className="detail-row">
          <span className="detail-label">混入曲线:</span>
          <span className="detail-value">{JSON.stringify(clip.mixInCurve)}</span>
        </div>
      )}
      {hasNonDefaultMixOutCurve && (
        <div className="detail-row">
          <span className="detail-label">混出曲线:</span>
          <span className="detail-value">{JSON.stringify(clip.mixOutCurve)}</span>
        </div>
      )}
    </div>
  );
}
