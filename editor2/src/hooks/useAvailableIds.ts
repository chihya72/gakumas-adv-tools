/**
 * Available IDs Hooks - 统一的ID获取逻辑
 * 从全局 cards 中提取可用的 ID，替代 window 对象传递
 */

import { useMemo } from 'react';
import { useEditorCards } from '../context/EditorContext';
import { parseActorGroup, parseBackgroundGroup } from '../components/App/renderers/parserHelpers';

/**
 * 判断背景是否为2D
 */
export function isBackground2D(src: string | undefined): boolean {
  if (!src) return false;
  return (
    src.includes('Sprite2D') ||
    src.includes('/2d/') ||
    src.includes('Texture2D') ||
    src.includes('_2d_')
  );
}

/**
 * 获取所有可用的角色ID
 * 从 actorgroup 命令中提取
 */
export function useAvailableActorIds(): string[] {
  const cards = useEditorCards();
  
  return useMemo(() => {
    const actorIds: string[] = [];
    for (const card of cards) {
      if (card.type === 'actorgroup') {
        const actors = parseActorGroup(card.params);
        actors.forEach(actor => {
          if (actor.id && !actorIds.includes(actor.id)) {
            actorIds.push(actor.id);
          }
        });
      }
    }
    return actorIds;
  }, [cards]);
}

/**
 * 获取可用的背景ID（支持2D/3D筛选）
 * 从 backgroundgroup 命令中提取
 */
export function useAvailableBackgroundIds(type?: '2d' | '3d'): string[] {
  const cards = useEditorCards();
  
  return useMemo(() => {
    const bgIds: string[] = [];
    for (const card of cards) {
      if (card.type === 'backgroundgroup') {
        const backgrounds = parseBackgroundGroup(card.params);
        backgrounds.forEach(bg => {
          const is2D = isBackground2D(bg.src);
          
          // 根据type参数筛选
          if (type === '2d' && !is2D) return;
          if (type === '3d' && is2D) return;
          
          if (bg.id && !bgIds.includes(bg.id)) {
            bgIds.push(bg.id);
          }
        });
      }
    }
    return bgIds;
  }, [cards, type]);
}
