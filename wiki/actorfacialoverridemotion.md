# actorfacialoverridemotion - 面部表情覆盖命令

`actorfacialoverridemotion` 是 ADV 脚本中最重要的命令之一，用于**实时覆盖和控制角色面部表情**。

## 📖 命令格式

```
[actorfacialoverridemotion 
  id=角色ID 
  setting=\{JSON配置\} 
  clip=\{时间轴配置\}
]
```

## 🎯 核心参数

### id - 角色标识符
指定要控制的角色，常见角色ID：
- `amao` - 月村手毬（天央）
- `fktn` - 藤田琴音
- `hmsz` - 姫崎莉波
- 等等...

### setting - 表情设置

JSON 格式的表情配置，主要包含 `faceModels` 数组。

#### 结构说明
```json
{
  "faceModels": [
    {
      "path": "Root_Face",    // 固定值，面部根节点
      "index": 数字,           // 表情索引 (0-73+)
      "value": 浮点数          // 表情强度 (-1.0 到 1.0)
    }
  ],
  "decals": []               // 贴花效果（如腮红），通常为空
}
```

### clip - 时间轴配置

控制表情动画的时间和缓动效果。

#### 关键参数
- `_startTime`: 开始时间（秒）
- `_duration`: 持续时间（秒）
- `_easeInDuration`: 淡入时间（秒）
- `_easeOutDuration`: 淡出时间（秒）

## 💡 使用示例

### 示例 1: 单个表情 - 闭眼

```
[actorfacialoverridemotion 
  id=amao 
  setting=\{"faceModels":[\{"path":"Root_Face","index":22,"value":1.0\}],"decals":[]\} 
  clip=\{"_startTime":5.0,"_duration":3.5,"_easeInDuration":0.25,"_easeOutDuration":0.0,...\}
]
```

**效果**: 角色在 5 秒时开始闭眼，持续 3.5 秒，0.25 秒淡入。

### 示例 2: 组合表情 - 无畏笑容

```
[actorfacialoverridemotion 
  id=ttmr 
  setting=\{"faceModels":[\{"path":"Root_Face","index":2,"value":1.0\},\{"path":"Root_Face","index":42,"value":1.0\}],"decals":[]\} 
  clip=\{"_startTime":196.7,"_duration":2.9,...\}
]
```

**效果**: 皱眉愤怒 (index 2) + 闭嘴大笑 (index 42) = 挑衅/得意的坏笑

### 示例 3: 负值用法 - 反向效果

```
[actorfacialoverridemotion 
  id=trda 
  setting=\{"faceModels":[\{"path":"Root_Face","index":2,"value":1.0\},\{"path":"Root_Face","index":20,"value":-1.0\},\{"path":"Root_Face","index":42,"value":1.0\}],"decals":[]\} 
  clip=\{"_startTime":6.9,"_duration":1.6,...\}
]
```

**效果**: index 20 使用 -1.0 可能表示"禁止眨眼"或反向效果。

## 📊 faceModels 详解

### 单个面部表情

**格式**：
```json
"faceModels":[{"path":"Root_Face","index":22,"value":1.0}]
```

**已验证的单个表情** ✅：
| Index | 表情含义 | 推荐 value | 推荐 duration |
|-------|---------|-----------|--------------|
| 20 | 眨眼 | 1.0 | 2.0s |
| 22 | 闭眼 | 1.0 | 3.5s |
| 71 | 闭嘴微笑 | 1.0 | 4.4s |
| 73 | 抿嘴 | 1.0 | 3.8s |
| 42 | 闭嘴大笑 | 1.0 | 3.5s |
| 3 | 皱眉担忧 | 1.0 | 4.0s |
| 2 | 皱眉愤怒 | 1.0 | 3.6s |

### 组合面部表情

**格式**：
```json
"faceModels":[
  {"path":"Root_Face","index":2,"value":1.0},
  {"path":"Root_Face","index":42,"value":1.0}
]
```

**已验证的组合** ✅：
| 组合 | 效果 | 适用场景 |
|------|------|---------|
| `[2, 42]` | 无畏/挑衅笑容 | 狠话、挑战宣言、得意坏笑 |
| `[22, 42]` | 笑到闭眼 | 开心到极致、欢笑场景 |
| `[3, 73]` | 担忧克制 | 担心但保持冷静 |

### 组合规则

1. **数组可包含 2-4 个 index**
2. **常见组合模式**：眼部表情 + 嘴部表情 + 眉毛表情
3. **value 可以是正值或负值**：
   - `1.0` = 完全应用该表情
   - `0.5` = 半强度
   - `-1.0` = 反向效果（可能表示禁用或相反动作）
4. **多个 index 同时生效**，叠加产生复杂表情

## 🎨 实战技巧

### 1. 修改现有表情

在 `gakumas-data/data/` 中找到任意 ADV 文件：

```txt
原始:
[actorfacialoverridemotion id=amao setting=\{"faceModels":[\{"path":"Root_Face","index":20,"value":1.0\}]

修改为 (测试 index 22 闭眼):
[actorfacialoverridemotion id=amao setting=\{"faceModels":[\{"path":"Root_Face","index":22,"value":1.0\}]
```

### 2. 创建组合表情

```txt
原始（单个表情）:
"faceModels":[\{"path":"Root_Face","index":71,"value":1.0\}]

修改为组合（微笑+眨眼）:
"faceModels":[\{"path":"Root_Face","index":71,"value":1.0\},\{"path":"Root_Face","index":20,"value":1.0\}]
```

### 3. 调整表情强度

```json
// 全强度
{"path":"Root_Face","index":42,"value":1.0}

// 半强度（更自然）
{"path":"Root_Face","index":42,"value":0.5}

// 反向/禁用
{"path":"Root_Face","index":20,"value":-1.0}
```

### 4. 控制表情时间

```json
{
  "_startTime": 10.5,      // 10.5秒时开始
  "_duration": 2.8,        // 持续2.8秒
  "_easeInDuration": 0.25, // 0.25秒淡入（过渡更自然）
  "_easeOutDuration": 0.22 // 0.22秒淡出
}
```

## ⚠️ 注意事项

1. **JSON 转义**：在 ADV 脚本中，JSON 的 `{` 需要转义为 `\{`，`}` 转义为 `\}`
2. **路径固定**：`path` 必须是 `"Root_Face"`
3. **index 范围**：已知 index 范围 0-73+，共 46 个有效值
4. **时间连续性**：表情动画的 `_startTime` 应与时间轴其他元素协调
5. **角色差异**：不同角色的同一 index 可能略有差异（面部模型不同）

## 📚 相关资源

- [表情 Index 参考表](表情-Index-参考表) - 完整的表情索引列表
- [表情编辑实战](表情编辑实战) - 实战教程
- [时间轴编辑技巧](时间轴编辑技巧) - 时间轴系统详解

## 🔬 实验探索

目前已验证 **7 个 index**（TOP 10 的 70%），还有 **39 个 index** 等待探索！

推荐优先测试：
- **Index 0** (1491次使用) - 可能是基准/重置
- **Index 46** (854次) - 常与其他表情组合
- **Index 8** (817次) - 推测为惊讶/疑问

参与实验？查看 [表情 Index 参考表](表情-Index-参考表) 中的实验指南！
