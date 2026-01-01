# Unity ADV 脚本解析器

用于解析 Unity ADV（文字冒险游戏）脚本的Python工具。

## 功能

- ✅ 解析 `[command param=value]` 格式的脚本
- ✅ 提取时间轴信息（clip数据）
- ✅ 支持嵌套JSON和数组参数
- ✅ 批量并行解析多个文件
- ✅ 导出为结构化JSON
- ✅ 生成统计报告

## 安装依赖

```bash
pip install tqdm
```

## 使用方法

### 1. 解析单个文件

```bash
python parser.py
```

这会解析当前指定的文件并输出摘要。

### 2. 批量解析所有脚本

```bash
python batch_parser.py
```

这会：
- 解析 `resource` 目录下的所有 `.txt` 文件
- 使用多线程并行处理（默认8线程）
- 输出JSON文件到 `parsed-scripts` 目录
- 生成详细的解析报告

## 输出格式

### JSON输出结构

```json
{
  "commands": [
    {
      "type": "message",
      "params": {
        "text": "对话内容",
        "name": "角色名"
      },
      "clip": {
        "startTime": 5.86,
        "duration": 3.29
      }
    }
  ],
  "summary": {
    "total_commands": 135,
    "duration": 140.7,
    "command_types": {
      "message": 25,
      "actormotion": 18
    }
  }
}
```

## 支持的命令类型

- `message` - 对话消息
- `actormotion` - 角色动作
- `actorfacialmotion` - 面部表情
- `camerasetting` - 相机设置
- `bgmplay` / `bgmstop` - 音乐控制
- `voice` - 语音
- `fade` - 淡入淡出
- 等等...

## 项目结构

```
script-parser/
├── parser.py          # 核心解析器
├── batch_parser.py    # 批量处理工具
└── README.md          # 说明文档
```

## API示例

```python
from parser import ADVScriptParser
from pathlib import Path

# 创建解析器
parser = ADVScriptParser()

# 解析文件
commands = parser.parse_file(Path("script.txt"))

# 获取对话消息
messages = parser.get_messages()

# 获取特定类型的命令
camera_commands = parser.get_commands_by_type('camerasetting')

# 导出JSON
parser.export_to_json(Path("output.json"))

# 获取时间轴摘要
summary = parser.get_timeline_summary()
print(f"总时长: {summary['duration']} 秒")
```

## 性能

- 单文件解析: ~10-50ms
- 2888个文件批量解析: ~1-2分钟（8线程）

## 下一步开发

- [ ] 脚本生成器（反向输出）
- [ ] 可视化时间轴编辑器
- [ ] 脚本验证工具
- [ ] 差异对比工具
