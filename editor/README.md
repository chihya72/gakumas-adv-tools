# ADV Script 数据模型定义

学園アイドルマスター (Gakumas) Unity ADV 剧情脚本的完整TypeScript类型定义。

## 📁 项目结构

```
script-editor/
├── src/
│   ├── types/
│   │   └── adv-script.ts        # 核心类型定义
│   ├── utils/
│   │   ├── adv-parser.ts        # 数据解析工具
│   │   ├── adv-validator.ts     # 命令验证器
│   │   └── timeline-builder.ts  # 时间轴构建器
│   └── index.ts                 # 主导出文件
└── README.md
```

## 🎯 功能特性

### 1. 完整的类型定义

✅ **25+ 命令类型**
- 背景系统（backgroundgroup, background, backgroundsetting）
- 角色系统（actorgroup, actormotion, actorfacialmotion）
- 相机控制（camerasetting）
- 对话系统（message, voice）
- 音频控制（bgmplay, bgmstop）
- 视觉效果（fade, transition, shake）

✅ **时间轴Clip数据**
```typescript
interface ClipData {
  startTime: number;       // 开始时间（秒）
  duration: number;        // 持续时间（秒）
  easeInDuration: number;  // 淡入时长
  easeOutDuration: number; // 淡出时长
  // ... 更多属性
}
```

✅ **3D/2D变换数据**
```typescript
interface Transform3D {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}
```

### 2. 数据解析工具 (ADVDataParser)

```typescript
import { ADVDataParser } from './utils/adv-parser';

// 解析相机设置
const camera = ADVDataParser.parseCameraSetting(jsonStr);

// 解析Ruby标签文本
const segments = ADVDataParser.parseRubyText(
  '<r\\=日本語>中文</r>\\r\\n<r\\=テキスト>文本</r>'
);
// => [{ ruby: "日本語", text: "中文" }, { ruby: "テキスト", text: "文本" }]

// 格式化时间
const timeStr = ADVDataParser.formatTime(125.5);
// => "02:05.500"
```

### 3. 命令验证器 (ADVCommandValidator)

```typescript
import { ADVCommandValidator } from './utils/adv-validator';

// 验证单个命令
const isValid = ADVCommandValidator.validate(command);

// 批量验证
const result = ADVCommandValidator.validateAll(commands);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### 4. 时间轴构建器 (TimelineBuilder)

```typescript
import { TimelineBuilder } from './utils/timeline-builder';

// 从命令列表构建时间轴
const timeline = TimelineBuilder.buildTimeline(commands);

// 时间轴包含多个轨道
timeline.tracks.forEach(track => {
  console.log(`${track.name}: ${track.events.length} events`);
});

// 获取指定时间点的活动事件
const activeEvents = TimelineBuilder.getActiveEvents(timeline, 10.5);

// 获取统计信息
const stats = TimelineBuilder.getStatistics(timeline);
console.log(`Total: ${stats.totalEvents} events, ${stats.duration}s`);
```

## 📋 命令类型完整列表

### 背景相关
- `backgroundgroup` - 背景组定义
- `background` - 单个背景
- `backgroundsetting` - 背景设置（位置、缩放等）
- `backgroundlayoutgroup` - 背景布局组

### 角色相关
- `actorgroup` - 角色组定义
- `actor` - 单个角色
- `actorlayout` - 角色布局
- `actorlayoutgroup` - 角色布局组
- `actormotion` - 角色动作
- `actorfacialmotion` - 面部表情动作
- `actorfacialoverridemotion` - 面部覆盖动作
- `actoradditivemotion` - 附加动作
- `actorlooktargettween` - 视线目标

### 相机
- `camerasetting` - 相机设置（FOV、位置、景深等）

### 对话和音频
- `message` - 对话消息
- `voice` - 语音播放
- `bgmplay` - 背景音乐播放
- `bgmstop` - 背景音乐停止

### 效果
- `fade` - 淡入淡出
- `transition` - 过渡效果
- `shake` - 震动效果

### 其他
- `timeline` - 时间轴定义

## 🔧 使用示例

### 类型安全的命令处理

```typescript
import { Command, isMessageCommand, isVoiceCommand } from './types/adv-script';

function processCommand(cmd: Command) {
  if (isMessageCommand(cmd)) {
    // TypeScript 知道 cmd 是 MessageCommand
    console.log(`${cmd.params.name}: ${cmd.params.text}`);
  } else if (isVoiceCommand(cmd)) {
    // TypeScript 知道 cmd 是 VoiceCommand
    console.log(`Playing voice: ${cmd.params.voice}`);
  }
}
```

### 解析完整脚本

```typescript
import type { ADVScript } from './types/adv-script';
import { ADVDataParser, TimelineBuilder } from './index';

// 从Python解析器生成的JSON加载
const script: ADVScript = JSON.parse(scriptJson);

// 验证数据
const validation = ADVCommandValidator.validateAll(script.commands);
if (!validation.valid) {
  throw new Error('Invalid script data');
}

// 构建时间轴
const timeline = TimelineBuilder.fromScript(script);

// 处理对话
const dialogTrack = timeline.tracks.find(t => t.type === 'dialog');
dialogTrack?.events.forEach(event => {
  if (isMessageCommand(event.command)) {
    const segments = ADVDataParser.parseRubyText(event.command.params.text);
    // 显示双语字幕
  }
});
```

## 🎨 时间轴结构

时间轴包含5个主要轨道：

1. **对话轨道** - 所有message命令
2. **语音轨道** - 所有voice命令  
3. **相机轨道** - 所有camerasetting命令
4. **角色轨道** - 角色动作和表情
5. **效果轨道** - 转场、淡入淡出等

每个轨道包含按时间排序的事件列表，支持：
- 获取指定时间范围内的事件
- 查找最近的事件
- 获取当前活动的事件

## 📊 数据流程

```
原始脚本文件 (.txt)
    ↓
Python解析器 (parser.py)
    ↓
JSON文件
    ↓
TypeScript类型系统
    ↓
时间轴构建器
    ↓
编辑器UI
```

## 🔗 配合Python解析器使用

这个TypeScript类型系统设计为与Python解析器完美配合：

1. Python解析器生成JSON文件
2. TypeScript直接加载JSON，自动获得类型提示
3. 所有字段名称和结构完全一致

```typescript
// 直接加载Python解析器的输出
import scriptData from './parsed/adv_cidol-amao-3-000_01.json';

// 类型断言（如果需要）
const script = scriptData as ADVScript;

// 现在可以享受完整的类型安全和智能提示
script.commands.forEach(cmd => {
  // 自动补全和类型检查
});
```

## 📝 待办事项

- [ ] 添加命令生成器（JSON → ADV脚本）
- [ ] 实现撤销/重做功能
- [ ] 添加更多验证规则
- [ ] 支持脚本差异比较
- [ ] 添加单元测试

## 📄 许可证

本项目用于学習目的，仅供个人研究使用。
