# 如何为其他命令类型添加 Group 项编辑和添加功能

本文档说明如何将通用的"编辑项"和"添加项"功能扩展到其他 Group 类型的命令。

## 架构概述

现在添加功能已经重构为通用机制，包括：

- **通用状态**: `editingItemIndex` 和 `editingItemData` 用于存储当前编辑的项
- **通用回调**: `onEditItem` 和 `onAddItem` 在 RendererProps 中定义
- **通用按钮组件**: `AddItemButton` 可在任何渲染器中使用
- **通用处理函数**: `handleEditGroupItem`、`handleAddGroupItem`、`handleSaveGroupItem`

## 为新命令类型添加支持

### 步骤 1: 更新渲染器

在你的渲染器中使用通用接口（例如 `ActorGroupRenderer.tsx`）:

```typescript
import { RendererProps } from './index';
import { AddItemButton } from './ParamRow';

const ActorGroupRenderer: React.FC<RendererProps> = ({ 
  params, 
  onEditItem,  // 编辑具体某个项
  onAddItem    // 添加新项
}) => {
  const actors = parseActorGroup(params);
  
  return (
    <>
      {actors.map((actor, index) => (
        <ParamCard 
          key={index} 
          title="角色设置"
          index={actors.length > 1 ? index + 1 : undefined}
          onEdit={onEditItem ? () => onEditItem(index) : undefined}
        >
          <ParamRow label="角色ID" value={actor.id} />
          <ParamRow label="Body" value={actor.body} />
          {/* 其他字段 */}
        </ParamCard>
      ))}
      {onAddItem && <AddItemButton label="添加角色" onClick={onAddItem} />}
    </>
  );
};
```

### 步骤 2: 创建项编辑器组件

创建专门的编辑器组件（例如 `ActorItemEditor.tsx`）:

```typescript
import React, { useState, useEffect } from 'react';

interface ActorItemEditorProps {
  id: string;
  body: string;
  face: string;
  hair: string;
  onChange: (data: { id: string; body: string; face: string; hair: string }) => void;
}

const ActorItemEditor: React.FC<ActorItemEditorProps> = ({ 
  id, body, face, hair, onChange 
}) => {
  const [localData, setLocalData] = useState({ id, body, face, hair });
  
  useEffect(() => {
    onChange(localData);
  }, [localData]);
  
  return (
    <div className="actor-item-editor">
      <div className="form-field">
        <label>角色ID</label>
        <input 
          value={localData.id} 
          onChange={(e) => setLocalData({...localData, id: e.target.value})} 
        />
      </div>
      {/* 其他字段，可以集成 Database API */}
    </div>
  );
};
```

### 步骤 3: 扩展 App.tsx 中的处理逻辑

#### 3.1 在 `handleEditGroupItem` 中添加新类型:

```typescript
const handleEditGroupItem = (card: CommandCard, itemIndex: number, itemType: string) => {
  const { parseBackgroundGroup, parseActorGroup } = require('./renderers/parserHelpers');
  
  if (itemType === 'background') {
    // 现有的 background 逻辑
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
  }
};
```

#### 3.2 在 `handleAddGroupItem` 中添加默认值:

```typescript
const handleAddGroupItem = (card: CommandCard, itemType: string) => {
  setEditingCard(card);
  setEditingItemIndex(-2);
  
  if (itemType === 'background') {
    setEditingItemData({ id: '', src: '' });
  } else if (itemType === 'actor') {
    setEditingItemData({ id: '', body: '', face: '', hair: '' });
  }
};
```

#### 3.3 在 `handleSaveGroupItem` 中添加保存逻辑:

```typescript
const handleSaveGroupItem = () => {
  if (!editingCard) return;
  
  if (editingCard.type === 'backgroundgroup') {
    saveBackgroundGroupItem();
  } else if (editingCard.type === 'actorgroup') {
    saveActorGroupItem();  // 创建类似 saveBackgroundGroupItem 的函数
  }
};

// 实现 saveActorGroupItem
const saveActorGroupItem = () => {
  const { parseActorGroup } = require('./renderers/parserHelpers');
  const actors = parseActorGroup(editingCard.params);
  
  // 添加或更新 actor
  if (editingItemIndex === -2) {
    actors.push(editingItemData);
  } else if (editingItemIndex >= 0) {
    actors[editingItemIndex] = editingItemData;
  }
  
  // 更新 params、标题、原始命令
  // ... 类似 saveBackgroundGroupItem 的逻辑
};
```

#### 3.4 在 `renderCommandDetails` 中添加回调:

```typescript
if (card.type === 'backgroundgroup') {
  props.onEditItem = (index: number) => handleEditGroupItem(card, index, 'background');
  props.onAddItem = () => handleAddGroupItem(card, 'background');
} else if (card.type === 'actorgroup') {
  props.onEditItem = (index: number) => handleEditGroupItem(card, index, 'actor');
  props.onAddItem = () => handleAddGroupItem(card, 'actor');
}
```

#### 3.5 在 `getItemTypeName` 中添加显示名称:

```typescript
const getItemTypeName = (commandType: string): string => {
  const typeNames: Record<string, string> = {
    'backgroundgroup': '背景设置',
    'actorgroup': '角色设置',  // 新增
    // ...
  };
  return typeNames[commandType] || '项';
};
```

#### 3.6 在 `renderGroupItemEditor` 中添加编辑器:

```typescript
const renderGroupItemEditor = (commandType: string) => {
  if (commandType === 'backgroundgroup') {
    return <BackgroundItemEditor ... />;
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
  }
  return null;
};
```

## 总结

通过这个通用架构，添加新的 Group 类型支持只需要:

1. ✅ 创建或修改渲染器使用 `onEditItem` 和 `onAddItem`
2. ✅ 创建专门的项编辑器组件
3. ✅ 在 App.tsx 的几个函数中添加对应的分支

所有的状态管理、对话框逻辑、通用UI组件都是共享的！
