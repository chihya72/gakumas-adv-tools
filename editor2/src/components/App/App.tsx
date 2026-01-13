import React, { useState, useEffect } from 'react';
import { CommandCard, createCardFromCommand, generateCardTitle } from '../../types/command-card';
import { CardList } from '../CardList';
import { getRenderer } from './renderers';
import { parseAdvScript } from './parser';
import { renderClipInfo } from './ClipRenderer';
import { EditDialog } from '../EditDialog';
import { getCommandEditor } from '../CommandEditors';
import { ClipEditor } from '../CommandEditors/ClipEditor/ClipEditor';
import { RawCommandEditor } from '../CommandEditors/RawCommandEditor/RawCommandEditor';
import { parseBackgroundGroup, parseActorGroup, parseActorLayoutGroup, parseBackgroundLayoutGroup } from './renderers/parserHelpers';
import BackgroundItemEditor from '../CommandEditors/BackgroundItemEditor/BackgroundItemEditor';
import ActorItemEditor from '../CommandEditors/ActorItemEditor/ActorItemEditor';
import ActorLayoutItemEditor from '../CommandEditors/ActorLayoutItemEditor/ActorLayoutItemEditor';
import { BackgroundLayoutGroupItemEditor } from '../GroupEditors/BackgroundLayoutGroupItemEditor';
import '../App.css';

export const App: React.FC = () => {
  const [cards, setCards] = useState<CommandCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<CommandCard | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isClosing, setIsClosing] = useState<boolean>(false);
  
  // 编辑对话框状态
  const [editingCard, setEditingCard] = useState<CommandCard | null>(null);
  const [editedCard, setEditedCard] = useState<CommandCard | null>(null);
  const [editMode, setEditMode] = useState<'command' | 'clip' | 'raw'>('command'); // 编辑模式：命令、时间轴或原始命令
  
  // 背景项编辑状态
  const [editingItemIndex, setEditingItemIndex] = useState<number>(-1);
  const [editingItemData, setEditingItemData] = useState<Record<string, any>>({});
  const [canSaveGroupItem, setCanSaveGroupItem] = useState<boolean>(true); // Group项验证状态
  const [canSaveEdit, setCanSaveEdit] = useState<boolean>(true); // 通用编辑验证状态

  // 将cards暴露给编辑器使用（通过window对象）
  useEffect(() => {
    (window as any).__editorCards = cards;
    return () => {
      delete (window as any).__editorCards;
    };
  }, [cards]);

  // 控制 body 滚动（竖屏模式）
  useEffect(() => {
    const isPortrait = window.matchMedia('(max-aspect-ratio: 1/1), (max-width: 768px)').matches;
    
    if (selectedCard && isPortrait) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }

    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [selectedCard]);

  // 加载文件
  const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      console.log('文件内容长度:', content.length);
      console.log('文件前200字符:', content.substring(0, 200));
      
      const commands = parseAdvScript(content);
      console.log('解析出的命令数量:', commands.length);
      console.log('前3个命令:', commands.slice(0, 3));
      
      const newCards = commands.map((cmd: any, index: number) => createCardFromCommand(cmd, index));
      console.log('生成的卡片数量:', newCards.length);
      console.log('前3个卡片:', newCards.slice(0, 3));
      
      setCards(newCards);
      setFileName(file.name);
      
      if (commands.length === 0) {
        alert('未能解析出任何命令，请检查文件格式');
      }
    } catch (error) {
      console.error('解析文件失败:', error);
      alert('解析文件失败: ' + (error as Error).message);
    }
  };

  // 加载示例文件
  const handleLoadExample = async () => {
    try {
      const response = await fetch('/sample.txt');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const content = await response.text();
      console.log('示例文件内容长度:', content.length);
      
      const commands = parseAdvScript(content);
      console.log('解析出的命令数量:', commands.length);
      
      const newCards = commands.map((cmd: any, index: number) => createCardFromCommand(cmd, index));
      
      setCards(newCards);
      setFileName('sample.txt');
      
      if (commands.length === 0) {
        alert('未能解析出任何命令，请检查文件格式');
      }
    } catch (error) {
      console.error('加载示例文件失败:', error);
      alert('加载示例文件失败: ' + (error as Error).message);
    }
  };

  // 卡片点击
  const handleCardClick = (card: CommandCard) => {
    console.log('选中的卡片:', card);
    console.log('卡片的clip:', card.clip);
    setSelectedCard(card);
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        selected: c.id === card.id,
      }))
    );
  };

  // 卡片编辑
  const handleCardEdit = (card: CommandCard, mode: 'command' | 'clip' | 'raw' = 'command') => {
    console.log('编辑卡片:', card, '模式:', mode);
    setEditingCard(card);
    setEditedCard({ ...card }); // 创建副本用于编辑
    setEditMode(mode);
    setCanSaveEdit(true); // 重置验证状态
  };
  
  // 通用：编辑 Group 中的单个项
  const handleEditGroupItem = (card: CommandCard, itemIndex: number, itemType: string) => {
    if (itemType === 'background') {
      const backgrounds = parseBackgroundGroup(card.params);
      if (itemIndex >= 0 && itemIndex < backgrounds.length) {
        const bg = backgrounds[itemIndex];
        setEditingCard(card);
        setEditingItemIndex(itemIndex);
        setEditingItemData({ id: bg.id || '', src: bg.src || '' });
      }
    } else if (itemType === 'actor') {
      const actors = parseActorGroup(card.params);
      if (itemIndex >= 0 && itemIndex < actors.length) {
        const actor = actors[itemIndex];
        setEditingCard(card);
        setEditingItemIndex(itemIndex);
        setEditingItemData({ 
          id: actor.id || '', 
          body: actor.body || '',
          face: actor.face || '',
          hair: actor.hair || ''
        });
      }
    } else if (itemType === 'actorlayout') {
      const layouts = parseActorLayoutGroup(card.params);
      if (itemIndex >= 0 && itemIndex < layouts.length) {
        const layout = layouts[itemIndex];
        setEditingCard(card);
        setEditingItemIndex(itemIndex);
        setEditingItemData({ 
          id: layout.id || '', 
          transform: layout.transform || {}
        });
      }
    } else if (itemType === 'backgroundlayout') {
      const layouts = parseBackgroundLayoutGroup(card.params);
      if (itemIndex >= 0 && itemIndex < layouts.length) {
        const layout = layouts[itemIndex];
        setEditingCard(card);
        setEditingItemIndex(itemIndex);
        setEditingItemData({ 
          id: layout.id || ''
        });
      }
    }
    // 未来可以扩展其他类型
  };
  
  // 通用：添加 Group 中的新项
  const handleAddGroupItem = (card: CommandCard, itemType: string) => {
    setEditingCard(card);
    setEditingItemIndex(-2); // 使用 -2 表示添加模式
    
    // 根据类型设置默认值
    if (itemType === 'background') {
      setEditingItemData({ id: '', src: '' });
    } else if (itemType === 'actor') {
      setEditingItemData({ id: '', body: '', face: '', hair: '' });
    } else if (itemType === 'actorlayout') {
      setEditingItemData({ 
        id: '', 
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        }
      });
    }
    // backgroundlayout 不支持添加，只能编辑已有项
    // 未来可以扩展其他类型
  };
  
  // 通用：保存 Group 项编辑
  const handleSaveGroupItem = () => {
    if (!editingCard) return;
    
    // 根据命令类型调用不同的处理逻辑
    if (editingCard.type === 'backgroundgroup') {
      saveBackgroundGroupItem();
    } else if (editingCard.type === 'actorgroup') {
      saveActorGroupItem();
    } else if (editingCard.type === 'actorlayoutgroup') {
      saveActorLayoutGroupItem();
    } else if (editingCard.type === 'backgroundlayoutgroup') {
      saveBackgroundLayoutGroupItem();
    }
    // 未来可以添加其他类型的处理
  };
  
  // 背景组项保存逻辑
  const saveBackgroundGroupItem = () => {
    if (!editingCard) return;
    
    const backgrounds = parseBackgroundGroup(editingCard.params);
    
    // 添加模式（index = -2）
    if (editingItemIndex === -2) {
      backgrounds.push({
        id: editingItemData.id || '',
        src: editingItemData.src || '',
      });
    }
    // 编辑模式
    else if (editingItemIndex >= 0 && editingItemIndex < backgrounds.length) {
      backgrounds[editingItemIndex] = {
        id: editingItemData.id || '',
        src: editingItemData.src || '',
      };
    } else {
      return;
    }
    
    // 重新生成 backgrounds 参数字符串 - 每个背景使用 [background ...] 格式
    const backgroundStrs = backgrounds.map((bg: any) => {
      const parts = [];
      if (bg.id) parts.push(`id=${bg.id}`);
      if (bg.src) parts.push(`src=${bg.src}`);
      return `[background ${parts.join(' ')}]`;
    });
    
    // 更新 params.backgrounds 字符串
    const newBackgroundsParam = backgrounds
      .map((bg: any) => {
        const parts = [];
        if (bg.id) parts.push(`id=${bg.id}`);
        if (bg.src) parts.push(`src=${bg.src}`);
        return parts.join(' ');
      })
      .join(' ||| ');
    
    // 重新生成卡片标题
    const backgroundIds = backgrounds
      .map((bg: any) => bg.id)
      .filter((id: string) => id);
    const newTitle = backgroundIds.length > 0 
      ? `背景: ${backgroundIds.join(', ')}` 
      : '背景: 未知';
    
    // 更新卡片
    const updatedCard: CommandCard = {
      ...editingCard,
      title: newTitle,
      params: {
        ...editingCard.params,
        backgrounds: newBackgroundsParam,
      },
      isModified: true,
      raw_line: updateBackgroundGroupText(editingCard, backgroundStrs),
    };
    
    setCards(prev => 
      prev.map(c => c.id === updatedCard.id ? updatedCard : c)
    );
    
    if (selectedCard?.id === updatedCard.id) {
      setSelectedCard(updatedCard);
    }
    
    // 清理状态
    setEditingCard(null);
    setEditingItemIndex(-1);
    setEditingItemData({});
  };
  
  // 通用：取消 Group 项编辑
  const handleCancelGroupItem = () => {
    setEditingCard(null);
    setEditingItemIndex(-1);
    setEditingItemData({});
  };
  
  // 更新 backgroundgroup 命令文本
  const updateBackgroundGroupText = (card: CommandCard, backgroundStrs: string[]): string => {
    let rawLine = card.raw_line || '';
    if (!rawLine || backgroundStrs.length === 0) return rawLine;
    
    // backgroundgroup 命令的格式是：[backgroundgroup backgrounds=[background ...] backgrounds=[background ...]]
    // 我们需要替换所有的 backgrounds 参数
    
    // 先找到 backgroundgroup 命令的开始和结束
    const startIdx = rawLine.indexOf('[backgroundgroup');
    if (startIdx === -1) return rawLine;
    
    // 找到对应的结束括号
    let bracketCount = 0;
    let endIdx = startIdx;
    for (let i = startIdx; i < rawLine.length; i++) {
      if (rawLine[i] === '[') bracketCount++;
      if (rawLine[i] === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          endIdx = i;
          break;
        }
      }
    }
    
    // 重新构建命令
    const newBackgroundParams = backgroundStrs.map(bg => `backgrounds=${bg}`).join(' ');
    const newCommand = `[backgroundgroup ${newBackgroundParams}]`;
    
    // 替换原命令
    rawLine = rawLine.substring(0, startIdx) + newCommand + rawLine.substring(endIdx + 1);
    
    return rawLine;
  };
  
  // 角色组项保存逻辑
  const saveActorGroupItem = () => {
    if (!editingCard) return;
    
    const actors = parseActorGroup(editingCard.params);
    
    // 添加模式（index = -2）
    if (editingItemIndex === -2) {
      actors.push({
        id: editingItemData.id || '',
        body: editingItemData.body || '',
        face: editingItemData.face || '',
        hair: editingItemData.hair || '',
      });
    }
    // 编辑模式
    else if (editingItemIndex >= 0 && editingItemIndex < actors.length) {
      actors[editingItemIndex] = {
        id: editingItemData.id || '',
        body: editingItemData.body || '',
        face: editingItemData.face || '',
        hair: editingItemData.hair || '',
      };
    } else {
      return;
    }
    
    // 重新生成 actors 参数字符串 - 每个角色使用 [actor ...] 格式
    const actorStrs = actors.map((actor: any) => {
      const parts = [];
      if (actor.id) parts.push(`id=${actor.id}`);
      if (actor.body) parts.push(`body=${actor.body}`);
      if (actor.face) parts.push(`face=${actor.face}`);
      if (actor.hair) parts.push(`hair=${actor.hair}`);
      return `[actor ${parts.join(' ')}]`;
    });
    
    // 更新 params.actors 字符串
    const newActorsParam = actors
      .map((actor: any) => {
        const parts = [];
        if (actor.id) parts.push(`id=${actor.id}`);
        if (actor.body) parts.push(`body=${actor.body}`);
        if (actor.face) parts.push(`face=${actor.face}`);
        if (actor.hair) parts.push(`hair=${actor.hair}`);
        return parts.join(' ');
      })
      .join(' ||| ');
    
    // 重新生成卡片标题
    const actorIds = actors
      .map((actor: any) => actor.id)
      .filter((id: string) => id);
    const newTitle = actorIds.length > 0 
      ? `角色: ${actorIds.join(', ')}` 
      : '角色: 未知';
    
    // 更新卡片
    const updatedCard: CommandCard = {
      ...editingCard,
      title: newTitle,
      params: {
        ...editingCard.params,
        actors: newActorsParam,
      },
      isModified: true,
      raw_line: updateActorGroupText(editingCard, actorStrs),
    };
    
    setCards(prev => 
      prev.map(c => c.id === updatedCard.id ? updatedCard : c)
    );
    
    if (selectedCard?.id === updatedCard.id) {
      setSelectedCard(updatedCard);
    }
    
    // 清理状态
    setEditingCard(null);
    setEditingItemIndex(-1);
    setEditingItemData({});
  };
  
  // 角色布局组项保存逻辑
  const saveActorLayoutGroupItem = () => {
    if (!editingCard) return;
    
    const layouts = parseActorLayoutGroup(editingCard.params);
    
    // 添加模式（index = -2）
    if (editingItemIndex === -2) {
      layouts.push({
        id: editingItemData.id || '',
        transform: editingItemData.transform || {},
      });
    }
    // 编辑模式
    else if (editingItemIndex >= 0 && editingItemIndex < layouts.length) {
      layouts[editingItemIndex] = {
        id: editingItemData.id || '',
        transform: editingItemData.transform || {},
      };
    } else {
      return;
    }
    
    // 重新生成 layouts 参数字符串 - 每个布局使用 [actorlayout ...] 格式
    const layoutStrs = layouts.map((layout: any) => {
      const parts = [];
      if (layout.id) parts.push(`id=${layout.id}`);
      if (layout.transform) {
        // 生成转义的 JSON 字符串，格式为 \{...\}（只转义最外层大括号）
        const transformStr = JSON.stringify(layout.transform)
          .replace(/^\{/, '\\{')
          .replace(/\}$/, '\\}');
        parts.push(`transform=${transformStr}`);
      }
      return `[actorlayout ${parts.join(' ')}]`;
    });
    
    // 重新生成卡片标题
    const layoutIds = layouts
      .map((layout: any) => layout.id)
      .filter((id: string) => id);
    const newTitle = layoutIds.length > 0 
      ? `角色布局: ${layoutIds.join(', ')}` 
      : '角色布局: 未知';
    
    // 更新 params.layouts 字符串
    const newLayoutsParam = layouts
      .map((layout: any) => {
        const parts = [];
        if (layout.id) parts.push(`id=${layout.id}`);
        if (layout.transform) {
          // 生成转义的 JSON 字符串（保留引号但加上反斜杠）
          const transformStr = JSON.stringify(layout.transform).replace(/"/g, '\\"');
          parts.push(`transform=${transformStr}`);
        }
        return parts.join(' ');
      })
      .join(' ||| ');
    
    // 更新卡片
    const updatedCard: CommandCard = {
      ...editingCard,
      title: newTitle,
      params: {
        ...editingCard.params,
        layouts: newLayoutsParam,
      },
      isModified: true,
      raw_line: updateActorLayoutGroupText(editingCard, layoutStrs),
    };
    
    setCards(prev => 
      prev.map(c => c.id === updatedCard.id ? updatedCard : c)
    );
    
    if (selectedCard?.id === updatedCard.id) {
      setSelectedCard(updatedCard);
    }
    
    // 清理状态
    setEditingCard(null);
    setEditingItemIndex(-1);
    setEditingItemData({});
  };
  
  // 更新 actorlayoutgroup 命令文本
  const updateActorLayoutGroupText = (card: CommandCard, layoutStrs: string[]): string => {
    let rawLine = card.raw_line || '';
    if (!rawLine || layoutStrs.length === 0) return rawLine;
    
    // actorlayoutgroup 命令的格式是：[actorlayoutgroup layouts=[actorlayout ...] layouts=[actorlayout ...] clip={...}]
    // 我们需要替换所有的 layouts 参数，但保留 clip 参数
    
    // 先找到 actorlayoutgroup 命令的开始和结束
    const startIdx = rawLine.indexOf('[actorlayoutgroup');
    if (startIdx === -1) return rawLine;
    
    // 找到对应的结束括号
    let bracketCount = 0;
    let endIdx = startIdx;
    for (let i = startIdx; i < rawLine.length; i++) {
      if (rawLine[i] === '[') bracketCount++;
      if (rawLine[i] === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          endIdx = i;
          break;
        }
      }
    }
    
    // 提取原始命令内容
    const originalCommand = rawLine.substring(startIdx, endIdx + 1);
    
    // 提取 clip 参数（如果存在）
    const clipMatch = originalCommand.match(/clip=\\?\{[^}]+\\?\}/);
    const clipParam = clipMatch ? ` ${clipMatch[0]}` : '';
    
    // 重新构建命令
    const newLayoutParams = layoutStrs.map(layout => `layouts=${layout}`).join(' ');
    const newCommand = `[actorlayoutgroup ${newLayoutParams}${clipParam}]`;
    
    // 替换原命令
    rawLine = rawLine.substring(0, startIdx) + newCommand + rawLine.substring(endIdx + 1);
    
    return rawLine;
  };
  
  // 更新 actorgroup 命令文本
  const updateActorGroupText = (card: CommandCard, actorStrs: string[]): string => {
    let rawLine = card.raw_line || '';
    if (!rawLine || actorStrs.length === 0) return rawLine;
    
    // actorgroup 命令的格式是：[actorgroup actors=[actor ...] actors=[actor ...]]
    // 我们需要替换所有的 actors 参数
    
    // 先找到 actorgroup 命令的开始和结束
    const startIdx = rawLine.indexOf('[actorgroup');
    if (startIdx === -1) return rawLine;
    
    // 找到对应的结束括号
    let bracketCount = 0;
    let endIdx = startIdx;
    for (let i = startIdx; i < rawLine.length; i++) {
      if (rawLine[i] === '[') bracketCount++;
      if (rawLine[i] === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          endIdx = i;
          break;
        }
      }
    }
    
    // 重新构建命令
    const newActorParams = actorStrs.map(actor => `actors=${actor}`).join(' ');
    const newCommand = `[actorgroup ${newActorParams}]`;
    
    // 替换原命令
    rawLine = rawLine.substring(0, startIdx) + newCommand + rawLine.substring(endIdx + 1);
    
    return rawLine;
  };

  // 背景布局组项保存逻辑
  const saveBackgroundLayoutGroupItem = () => {
    if (!editingCard) return;
    
    // 验证：id 不能为空
    if (!editingItemData.id || editingItemData.id.trim() === '') {
      alert('背景ID不能为空！');
      return;
    }
    
    const layouts = parseBackgroundLayoutGroup(editingCard.params);
    
    // 添加模式（index = -2）
    if (editingItemIndex === -2) {
      layouts.push({
        id: editingItemData.id.trim(),
      });
    }
    // 编辑模式
    else if (editingItemIndex >= 0 && editingItemIndex < layouts.length) {
      layouts[editingItemIndex] = {
        id: editingItemData.id.trim(),
      };
    } else {
      return;
    }
    
    // 重新生成 layouts 参数字符串 - 每个布局使用 [backgroundlayout ...] 格式
    const layoutStrs = layouts.map((layout: any) => {
      return `[backgroundlayout id=${layout.id}]`;
    });
    
    // 重新生成卡片标题
    const layoutIds = layouts
      .map((layout: any) => layout.id)
      .filter((id: string) => id);
    const newTitle = layoutIds.length > 0 
      ? `3D背景布局: ${layoutIds.join(', ')}` 
      : '3D背景布局: 未知';
    
    // 更新 params.layouts 字符串
    const newLayoutsParam = layouts
      .map((layout: any) => `id=${layout.id}`)
      .join(' ||| ');
    
    // 更新卡片
    const updatedCard: CommandCard = {
      ...editingCard,
      title: newTitle,
      params: {
        ...editingCard.params,
        layouts: newLayoutsParam,
      },
      isModified: true,
      raw_line: updateBackgroundLayoutGroupText(editingCard, layoutStrs),
    };
    
    setCards(prev => 
      prev.map(c => c.id === updatedCard.id ? updatedCard : c)
    );
    
    if (selectedCard?.id === updatedCard.id) {
      setSelectedCard(updatedCard);
    }
    
    // 清理状态
    setEditingCard(null);
    setEditingItemIndex(-1);
    setEditingItemData({});
  };

  // 更新 backgroundlayoutgroup 命令文本
  const updateBackgroundLayoutGroupText = (card: CommandCard, layoutStrs: string[]): string => {
    let rawLine = card.raw_line || '';
    if (!rawLine || layoutStrs.length === 0) return rawLine;
    
    // backgroundlayoutgroup 命令的格式是：[backgroundlayoutgroup layouts=[backgroundlayout id=...] layouts=[backgroundlayout id=...] clip={...}]
    // 我们需要替换所有的 layouts 参数，但保留 clip 参数
    
    // 先找到 backgroundlayoutgroup 命令的开始和结束
    const startIdx = rawLine.indexOf('[backgroundlayoutgroup');
    if (startIdx === -1) return rawLine;
    
    // 找到对应的结束括号
    let bracketCount = 0;
    let endIdx = startIdx;
    for (let i = startIdx; i < rawLine.length; i++) {
      if (rawLine[i] === '[') bracketCount++;
      if (rawLine[i] === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          endIdx = i;
          break;
        }
      }
    }
    
    // 提取原始命令内容
    const originalCommand = rawLine.substring(startIdx, endIdx + 1);
    
    // 提取 clip 参数（如果存在）
    const clipMatch = originalCommand.match(/clip=\\?\{[^}]+\\?\}/);
    const clipParam = clipMatch ? ` ${clipMatch[0]}` : '';
    
    // 重新构建命令
    const newLayoutParams = layoutStrs.map(layout => `layouts=${layout}`).join(' ');
    const newCommand = `[backgroundlayoutgroup ${newLayoutParams}${clipParam}]`;
    
    // 替换原命令
    rawLine = rawLine.substring(0, startIdx) + newCommand + rawLine.substring(endIdx + 1);
    
    return rawLine;
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (editedCard && editingCard) {
      // 验证已通过 canSaveCommand 状态控制，不再需要这里的验证
      let updatedCard: CommandCard;
      
      if (editMode === 'raw') {
        // 原始命令编辑模式：重新解析命令
        try {
          const parsedCommands = parseAdvScript(editedCard.raw_line || '');
          if (parsedCommands.length > 0) {
            // 使用解析后的命令创建新卡片，但保留原ID
            const newCard = createCardFromCommand(parsedCommands[0], editingCard.filePosition || 0);
            updatedCard = {
              ...newCard,
              id: editingCard.id,
              raw_line: editedCard.raw_line,
              isModified: true,
            };
          } else {
            alert('解析失败：无法从文本中解析出有效命令');
            return;
          }
        } catch (error) {
          alert('解析失败：' + (error as Error).message);
          return;
        }
      } else {
        // 标记为已修改并智能更新原始命令
        const newRawLine = updateCommandText(editingCard, editedCard);
        
        // 如果类型变化，需要重新解析生成完整的卡片信息（包括标题）
        if (editedCard.type !== editingCard.type) {
          try {
            const parsedCommands = parseAdvScript(newRawLine);
            if (parsedCommands.length > 0) {
              const newCard = createCardFromCommand(parsedCommands[0], editingCard.filePosition || 0);
              updatedCard = {
                ...newCard,
                id: editingCard.id,
                raw_line: newRawLine,
                isModified: true,
              };
            } else {
              // 解析失败，手动更新
              updatedCard = {
                ...editedCard,
                isModified: true,
                raw_line: newRawLine,
              };
            }
          } catch (error) {
            console.error('重新解析失败:', error);
            // 解析失败，手动更新
            updatedCard = {
              ...editedCard,
              isModified: true,
              raw_line: newRawLine,
            };
          }
        } else {
          // 类型未变化，直接使用编辑后的数据
          updatedCard = {
            ...editedCard,
            isModified: true,
            raw_line: newRawLine,
          };
        }
      }
      
      setCards(prev => 
        prev.map(c => c.id === updatedCard.id ? updatedCard : c)
      );
      // 如果当前选中的卡片被编辑了，也更新选中状态
      if (selectedCard?.id === updatedCard.id) {
        setSelectedCard(updatedCard);
      }
    }
    setEditingCard(null);
    setEditedCard(null);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditedCard(null);
  };

  // 编辑器内容变更
  const handleEditorChange = (updatedCard: CommandCard, isValid?: boolean) => {
    // 重新生成卡片标题
    const updatedCardWithTitle = {
      ...updatedCard,
      title: generateCardTitle(updatedCard)  // 传递完整的card对象
    };
    setEditedCard(updatedCardWithTitle);
    // 如果编辑器提供了验证状态，就使用它
    if (isValid !== undefined) {
      setCanSaveEdit(isValid);
    }
  };

  // 智能更新命令文本 - 只替换修改过的部分
  const updateCommandText = (originalCard: CommandCard, editedCard: CommandCard): string => {
    let updatedText = originalCard.raw_line || '';
    // 类型变更时，强制重建命令文本，保证命令头与 type 一致
    if (editedCard.type !== originalCard.type) {
      console.log('🔄 类型变更，重建命令:', originalCard.type, '→', editedCard.type);
      const newText = generateFullCommandText(editedCard);
      console.log('📝 新命令文本:', newText);
      return newText;
    }
    // 如果没有原始文本，生成新的
    if (!updatedText) {
      console.log('📝 无原始文本，生成新命令');
      return generateFullCommandText(editedCard);
    }
    
    // 检查参数数量是否变化（有参数被删除或添加）
    const originalParamKeys = Object.keys(originalCard.params);
    const editedParamKeys = Object.keys(editedCard.params);
    if (originalParamKeys.length !== editedParamKeys.length) {
      console.log('📝 参数数量变化，重建命令');
      return generateFullCommandText(editedCard);
    }
    
    // 对于包含复杂 JSON 参数的命令（如 camerasetting 的 setting），直接重建整个命令
    // 因为长 JSON 字符串的正则替换容易失败
    if (editedCard.params.setting !== undefined && editedCard.params.setting !== originalCard.params.setting) {
      console.log('📝 setting 参数变更，重建整个命令');
      return generateFullCommandText(editedCard);
    }
    
    // ...existing code...
    // 更新clip参数
    if (editedCard.clip && originalCard.clip) {
      const clipFields = [
        { key: '_startTime', value: editedCard.clip.startTime, original: originalCard.clip.startTime },
        { key: '_duration', value: editedCard.clip.duration, original: originalCard.clip.duration },
        { key: '_clipIn', value: editedCard.clip.clipIn, original: originalCard.clip.clipIn },
        { key: '_easeInDuration', value: editedCard.clip.easeInDuration, original: originalCard.clip.easeInDuration },
        { key: '_easeOutDuration', value: editedCard.clip.easeOutDuration, original: originalCard.clip.easeOutDuration },
        { key: '_blendInDuration', value: editedCard.clip.blendInDuration, original: originalCard.clip.blendInDuration },
        { key: '_blendOutDuration', value: editedCard.clip.blendOutDuration, original: originalCard.clip.blendOutDuration },
        { key: '_mixInEaseType', value: editedCard.clip.mixInEaseType, original: originalCard.clip.mixInEaseType },
        { key: '_mixOutEaseType', value: editedCard.clip.mixOutEaseType, original: originalCard.clip.mixOutEaseType },
        { key: '_timeScale', value: editedCard.clip.timeScale, original: originalCard.clip.timeScale },
      ];
      for (const field of clipFields) {
        if (field.value !== undefined && field.value !== field.original) {
          const newValue = field.value?.toFixed ? field.value.toFixed(3) : field.value;
          const escapedKey = field.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regexJson = new RegExp(`("${escapedKey}"\\s*:\\s*)[-+]?\\d+(?:\\.\\d+)?`, 'g');
          const regexParam = new RegExp(`(${escapedKey}\\s*=\\s*)[-+]?\\d+(?:\\.\\d+)?`, 'g');
          updatedText = updatedText.replace(regexJson, `$1${newValue}`);
          updatedText = updatedText.replace(regexParam, `$1${newValue}`);
        }
      }
    }
    // 更新params参数
    for (const [key, value] of Object.entries(editedCard.params)) {
      if (value !== originalCard.params[key]) {
        const oldValue = originalCard.params[key];
        if (oldValue !== undefined && oldValue !== null) {
          // 转义特殊字符用于正则表达式
          const escapedOldValue = String(oldValue).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`${key}=${escapedOldValue}`, 'g');
          updatedText = updatedText.replace(regex, `${key}=${value}`);
        } else {
          // 如果原值不存在，尝试添加参数（在命令末尾 ] 之前）
          updatedText = updatedText.replace(/\]$/, ` ${key}=${value}]`);
        }
      }
    }
    return updatedText;
  };

  // 生成完整的命令文本（备用方案）
  const generateFullCommandText = (card: CommandCard): string => {
    const parts: string[] = [];
    parts.push(`[${card.type}`);
    
    for (const [key, value] of Object.entries(card.params)) {
      if (value !== null && value !== undefined && value !== '') {
        parts.push(`${key}=${value}`);
      }
    }
    
    if (card.clip) {
      // 统一用 JSON 格式输出 clip 字段（和 actorlayoutgroup 一致）
      const clipObj = {
        _startTime: card.clip.startTime,
        _duration: card.clip.duration,
        _clipIn: card.clip.clipIn,
        _easeInDuration: card.clip.easeInDuration,
        _easeOutDuration: card.clip.easeOutDuration,
        _blendInDuration: card.clip.blendInDuration,
        _blendOutDuration: card.clip.blendOutDuration,
        _mixInEaseType: card.clip.mixInEaseType,
        _mixOutEaseType: card.clip.mixOutEaseType,
        _timeScale: card.clip.timeScale,
      };
      let clipJson = JSON.stringify(clipObj);
      // 保持与 actorlayoutgroup 一致，外层加反斜杠
      clipJson = clipJson.replace(/^\{/, '\\{').replace(/\}$/, '\\}');
      parts.push(`clip=${clipJson}`);
    }
    
    parts.push(']');
    return parts.join(' ');
  };

  // 卡片删除
  const handleCardDelete = (card: CommandCard) => {
    if (confirm('确定要删除这个命令吗?')) {
      setCards((prev) => prev.filter((c) => c.id !== card.id));
      if (selectedCard?.id === card.id) {
        setSelectedCard(null);
      }
    }
  };

  // 导出文件
  const handleExport = () => {
    alert('导出功能待实现');
  };
  
  // 辅助函数：获取项类型的显示名称
  const getItemTypeName = (commandType: string): string => {
    const typeNames: Record<string, string> = {
      'backgroundgroup': '背景设置',
      'actorgroup': '角色设置',
      'actorlayoutgroup': '角色布局',
      'backgroundlayoutgroup': '背景布局',
    };
    return typeNames[commandType] || '项';
  };
  
  // 辅助函数：根据命令类型渲染对应的编辑器
  const renderGroupItemEditor = (commandType: string) => {
    if (commandType === 'backgroundgroup') {
      return (
        <BackgroundItemEditor
          id={editingItemData.id || ''}
          src={editingItemData.src || ''}
          onChange={(id: string, src: string) => {
            setEditingItemData({ id, src });
          }}
        />
      );
    } else if (commandType === 'actorgroup') {
      return (
        <ActorItemEditor
          id={editingItemData.id || ''}
          body={editingItemData.body || ''}
          face={editingItemData.face || ''}
          hair={editingItemData.hair || ''}
          onChange={(data) => setEditingItemData(data)}
        />
      );
    } else if (commandType === 'actorlayoutgroup') {
      // 从当前脚本中查找 actorgroup 命令，提取可用的角色ID
      const availableActorIds: string[] = [];
      for (const card of cards) {
        if (card.type === 'actorgroup') {
          const actors = parseActorGroup(card.params);
          actors.forEach((actor: any) => {
            if (actor.id && !availableActorIds.includes(actor.id)) {
              availableActorIds.push(actor.id);
            }
          });
        }
      }
      
      return (
        <ActorLayoutItemEditor
          id={editingItemData.id || ''}
          transform={editingItemData.transform || {}}
          availableActorIds={availableActorIds}
          onChange={(data) => setEditingItemData(data)}
        />
      );
    } else if (commandType === 'backgroundlayoutgroup') {
      return (
        <BackgroundLayoutGroupItemEditor
          id={editingItemData.id || ''}
          onChange={(id: string) => {
            setEditingItemData({ id });
          }}
          onValidate={(isValid: boolean) => {
            setCanSaveGroupItem(isValid);
          }}
        />
      );
    }
    // 未来可以添加其他类型的编辑器
    
    return null;
  };

  // 关闭命令详情（带动画）
  const handleCloseSidebar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedCard(null);
      setIsClosing(false);
    }, 300);
  };

  // 阻止遮罩层上的触摸事件传播
  const handleOverlayTouch = (e: React.TouchEvent) => {
    e.stopPropagation();
    handleCloseSidebar();
  };

  // 阻止遮罩层上的鼠标事件传播
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCloseSidebar();
  };

  // 阻止触摸滑动
  const handleOverlayTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  // 根据命令类型渲染特定内容
  const renderCommandDetails = (card: CommandCard) => {
    const Renderer = getRenderer(card.type);
    const props: any = {
      params: card.params,
      onEdit: () => handleCardEdit(card),
    };
    
    // 为 group 类型命令添加通用的项编辑和添加回调
    if (card.type === 'backgroundgroup') {
      props.onEditItem = (index: number) => handleEditGroupItem(card, index, 'background');
      props.onAddItem = () => handleAddGroupItem(card, 'background');
    } else if (card.type === 'actorgroup') {
      props.onEditItem = (index: number) => handleEditGroupItem(card, index, 'actor');
      props.onAddItem = () => handleAddGroupItem(card, 'actor');
    } else if (card.type === 'actorlayoutgroup') {
      props.onEditItem = (index: number) => handleEditGroupItem(card, index, 'actorlayout');
      props.onAddItem = () => handleAddGroupItem(card, 'actorlayout');
    } else if (card.type === 'backgroundlayoutgroup') {
      props.onEditItem = (index: number) => handleEditGroupItem(card, index, 'backgroundlayout');
      // backgroundlayoutgroup 不提供添加功能，添加背景应该在 backgroundgroup 中进行
    }
    // 未来可以为其他 group 类型添加支持
    
    return <Renderer {...props} />;
  };

  return (
    <div className={`app ${selectedCard ? 'sidebar-open' : ''}`}>
      <header className="app-header">
        <h1>Gakumas ADV Editor V2</h1>
        <p className="app-subtitle">卡片流式布局编辑器</p>
      </header>

      <div className="app-toolbar">
        <div className="toolbar-left">
          <label className="file-input-label">
            加载文件
            <input
              type="file"
              accept=".txt,.adv"
              onChange={handleFileLoad}
              style={{ display: 'none' }}
            />
          </label>
          <button className="toolbar-action-btn" onClick={handleLoadExample}>
            加载示例
          </button>
          {fileName && <span className="current-file">当前: {fileName}</span>}
        </div>
        <div className="toolbar-right">
          <button className="toolbar-action-btn" onClick={handleExport}>
            导出
          </button>
        </div>
      </div>

      <div className="app-content">
        <div className="app-main">
          {cards.length === 0 ? (
            <div className="app-empty">
              <h2>欢迎使用 ADV 编辑器 V2</h2>
              <p>请加载一个 ADV 脚本文件开始编辑</p>
              <label className="file-input-label-large">
                选择文件
                <input
                  type="file"
                  accept=".txt,.adv"
                  onChange={handleFileLoad}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ) : (
            <CardList
              cards={cards}
              onCardClick={handleCardClick}
            />
          )}
        </div>

        {selectedCard && (
          <>
            <div 
              className="sidebar-overlay" 
              onClick={handleOverlayClick}
              onTouchStart={handleOverlayTouch}
              onTouchMove={handleOverlayTouchMove}
            />
            <aside className={`app-sidebar ${isClosing ? 'closing' : ''}`}>
              <div className="sidebar-header">
                <h3>命令详情</h3>
                <button className="sidebar-close-btn" onClick={handleCloseSidebar} title="关闭">
                  ×
                </button>
              </div>
            
            {/* 类型 */}
            <div className="detail-section detail-section-primary">
              <h4>基本信息</h4>
              <div className="detail-row">
                <span className="detail-label">类型:</span>
                <span className="detail-value">{selectedCard.type}</span>
              </div>
            </div>

            {/* 根据类型渲染特定内容 */}
            {renderCommandDetails(selectedCard)}

            {/* 统一的时间轴信息 */}
            {renderClipInfo(selectedCard.clip, () => handleCardEdit(selectedCard, 'clip'))}

            {/* 原始命令 */}
            {selectedCard.raw_line && (
              <div className="detail-section">
                <div className="detail-section-header">
                  <h4>
                    原始命令
                    {selectedCard.isModified && (
                      <span className="modified-badge">已修改</span>
                    )}
                  </h4>
                  <button className="detail-edit-btn" onClick={() => handleCardEdit(selectedCard, 'raw')} title="编辑">
                    ✏️
                  </button>
                </div>
                <pre className="detail-raw">{selectedCard.raw_line}</pre>
              </div>
            )}
            </aside>
          </>
        )}

        {/* 编辑对话框 - 命令/时间轴/原始 */}
        {editingCard && editedCard && editingItemIndex < 0 && (
          <EditDialog
            title={
              editMode === 'clip' 
                ? `编辑时间轴 - ${editingCard.type}` 
                : editMode === 'raw'
                ? `编辑原始命令 - ${editingCard.type}`
                : `编辑命令 - ${editingCard.type}`
            }
            isOpen={!!editingCard}
            onClose={handleCancelEdit}
            onSave={handleSaveEdit}
            canSave={canSaveEdit}
          >
            {editMode === 'clip' ? (
              <ClipEditor card={editedCard} onChange={handleEditorChange} />
            ) : editMode === 'raw' ? (
              <RawCommandEditor card={editedCard} onChange={handleEditorChange} />
            ) : (
              (() => {
                const EditorComponent = getCommandEditor(editingCard.type);
                return <EditorComponent card={editedCard} onChange={handleEditorChange} />;
              })()
            )}
          </EditDialog>
        )}
        
        {/* 编辑对话框 - Group 项（背景/角色/布局等） */}
        {editingCard && (editingItemIndex >= 0 || editingItemIndex === -2) && (
          <EditDialog
            title={
              editingItemIndex === -2 
                ? `添加${getItemTypeName(editingCard.type)}` 
                : `编辑${getItemTypeName(editingCard.type)} #${editingItemIndex + 1}`
            }
            isOpen={true}
            onClose={handleCancelGroupItem}
            onSave={handleSaveGroupItem}
            canSave={canSaveGroupItem}
          >
            {renderGroupItemEditor(editingCard.type)}
          </EditDialog>
        )}
      </div>
    </div>
  );
};

export default App;
