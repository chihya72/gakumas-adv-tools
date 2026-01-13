/**
 * Parser Helpers - 专门用于解析特定命令的参数
 * 将解析逻辑从 Renderer 中分离出来，实现关注点分离
 */

// ============================================================================
// ActorGroup 解析
// ============================================================================

export interface ActorInfo {
  id?: string;
  body?: string;
  hair?: string;
  face?: string;
}

/**
 * 解析 actorgroup 的 actors 参数
 * @param params 参数对象
 * @returns 角色信息数组
 */
export function parseActorGroup(params: Record<string, any>): ActorInfo[] {
  if (!params.actors) return [];
  
  try {
    const actorsStr = params.actors as string;
    const actorSegments = actorsStr.split('|||');
    
    return actorSegments.map(segment => {
      const idMatch = segment.match(/id=(\w+)/);
      const bodyMatch = segment.match(/body=([^\s]+)/);
      const hairMatch = segment.match(/hair=([^\s]+)/);
      const faceMatch = segment.match(/face=([^\s]+)/);
      
      return {
        id: idMatch ? idMatch[1] : undefined,
        body: bodyMatch ? bodyMatch[1] : undefined,
        hair: hairMatch ? hairMatch[1] : undefined,
        face: faceMatch ? faceMatch[1] : undefined,
      };
    });
  } catch (e) {
    console.error('解析角色定义失败:', e);
    return [];
  }
}

// ============================================================================
// BackgroundGroup 解析
// ============================================================================

export interface BackgroundInfo {
  id?: string;
  src?: string;
}

/**
 * 解析 backgroundgroup 的 backgrounds 参数
 * @param params 参数对象
 * @returns 背景信息数组
 */
export function parseBackgroundGroup(params: Record<string, any>): BackgroundInfo[] {
  if (!params.backgrounds) return [];
  
  try {
    const backgroundsStr = params.backgrounds as string;
    const backgroundSegments = backgroundsStr.split('|||');
    
    return backgroundSegments.map(segment => {
      const idMatch = segment.match(/id=(\S+)/);
      const srcMatch = segment.match(/src=(\S+)/);
      
      return {
        id: idMatch ? idMatch[1] : undefined,
        src: srcMatch ? srcMatch[1] : undefined,
      };
    });
  } catch (e) {
    console.error('解析背景设置失败:', e);
    return [];
  }
}

// ============================================================================
// ActorLayoutGroup 解析
// ============================================================================

export interface ActorLayout {
  id: string;
  transform: any;
}

/**
 * 解析 actorlayoutgroup 的 layouts 参数
 * @param params 参数对象
 * @returns 角色布局信息数组
 */
export function parseActorLayoutGroup(params: Record<string, any>): ActorLayout[] {
  if (!params.layouts) return [];
  
  try {
    const layoutsStr = params.layouts as string;
    const layoutSegments = layoutsStr.split('|||');
    
    return layoutSegments
      .map(segment => {
        const idMatch = segment.match(/id=(\w+)/);
        const transformMatch = segment.match(/transform=(\\?\{.+?\})(?:\s|\]|$)/);
        
        if (!idMatch || !transformMatch) return null;
        
        const actorId = idMatch[1];
        // 移除所有转义的反斜杠，将 \{ \} \" 等转换为正常的 JSON
        const transformJson = transformMatch[1].replace(/\\/g, '');
        const transform = JSON.parse(transformJson);
        
        return {
          id: actorId,
          transform
        };
      })
      .filter((layout): layout is ActorLayout => layout !== null);
  } catch (e) {
    console.error('解析角色布局失败:', e);
    return [];
  }
}

// ============================================================================
// CameraSetting 解析
// ============================================================================

export interface CameraSettingInfo {
  focalLength?: number;
  nearClipPlane?: number;
  farClipPlane?: number;
  transform?: any;
  dofSetting?: any;
}

/**
 * 解析 camerasetting 的 setting 参数
 * @param params 参数对象
 * @returns 相机设置对象，解析失败返回 null
 */
export function parseCameraSetting(params: Record<string, any>): CameraSettingInfo | null {
  if (!params.setting) return null;
  
  try {
    // 移除转义符（如果有的话）：\{ -> {, \} -> }
    const cleanedSetting = params.setting.replace(/\\/g, '');
    return JSON.parse(cleanedSetting);
  } catch (e) {
    console.error('解析相机设置失败:', e);
    return null;
  }
}

// ============================================================================
// BackgroundSetting 解析
// ============================================================================

export interface BackgroundSettingInfo {
  position?: { x: number; y: number };
  scale?: { x: number; y: number };
  angle?: number;
}

/**
 * 解析 backgroundsetting 的 setting 参数（2D背景）
 * @param params 参数对象
 * @returns 背景设置对象，解析失败返回 null
 */
export function parseBackgroundSetting(params: Record<string, any>): BackgroundSettingInfo | null {
  if (!params.setting) return null;
  
  try {
    return JSON.parse(params.setting);
  } catch (e) {
    console.error('解析背景设置失败:', e);
    return null;
  }
}

// ============================================================================
// BackgroundLayoutGroup 解析
// ============================================================================

export interface BackgroundLayout {
  id: string;
}

/**
 * 解析 backgroundlayoutgroup 的 layouts 参数（3D背景）
 * backgroundlayout 只有 id，没有 transform
 * @param params 参数对象
 * @returns 背景布局信息数组
 */
export function parseBackgroundLayoutGroup(params: Record<string, any>): BackgroundLayout[] {
  if (!params.layouts) return [];
  
  try {
    const layoutsStr = params.layouts as string;
    const layoutSegments = layoutsStr.split('|||');
    
    return layoutSegments
      .map(segment => {
        // 匹配 id= 后面的值（包括空值）
        const idMatch = segment.match(/id=([\w]*)/);
        if (!idMatch) return null;
        
        // 即使 id 为空也返回，避免卡片消失
        return { id: idMatch[1] || '(未设置)' };
      })
      .filter((layout): layout is BackgroundLayout => layout !== null);
  } catch (e) {
    console.error('解析背景布局失败:', e);
    return [];
  }
}

// ============================================================================
// ActorFacialOverrideMotion 解析
// ============================================================================

export interface FaceModel {
  path: string;
  index: number;
  value: number;
}

export interface FacialOverrideSetting {
  faceModels: FaceModel[];
  decals: any[];
}

/**
 * 解析 actorfacialoverridemotion 的 setting 参数
 * @param params 参数对象
 * @returns 表情覆盖设置
 */
export function parseFacialOverrideSetting(params: Record<string, any>): FacialOverrideSetting {
  const defaultResult: FacialOverrideSetting = {
    faceModels: [],
    decals: [],
  };

  if (!params.setting) return defaultResult;

  try {
    let setting: any;
    if (typeof params.setting === 'string') {
      setting = JSON.parse(params.setting);
    } else {
      setting = params.setting;
    }

    return {
      faceModels: setting.faceModels || [],
      decals: setting.decals || [],
    };
  } catch (e) {
    console.error('解析表情覆盖设置失败:', e);
    return defaultResult;
  }
}

// ============================================================================
// ActorLookTarget 解析
// ============================================================================

export interface LookTargetSetting {
  type: number;
  actorId?: string;
  bones: number;
  transform?: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  };
  azimuth: number;
  elevation: number;
  weight: number;
  eyesWeight: number;
  headWeight: number;
  bodyWeight: number;
}

/**
 * 解析 actorlooktarget 的 target 参数
 * @param params 参数对象
 * @returns 视线目标设置
 */
export function parseLookTargetSetting(params: Record<string, any>): LookTargetSetting | null {
  if (!params.target) return null;

  try {
    let target: any;
    if (typeof params.target === 'string') {
      target = JSON.parse(params.target);
    } else {
      target = params.target;
    }

    return {
      type: target.type ?? 0,
      actorId: target.actorId,
      bones: target.bones ?? 0,
      transform: target.transform,
      azimuth: target.azimuth ?? 0,
      elevation: target.elevation ?? 0,
      weight: target.weight ?? 1.0,
      eyesWeight: target.eyesWeight ?? 1.0,
      headWeight: target.headWeight ?? 1.0,
      bodyWeight: target.bodyWeight ?? 1.0,
    };
  } catch (e) {
    console.error('解析视线目标设置失败:', e);
    return null;
  }
}
