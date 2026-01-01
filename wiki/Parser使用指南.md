# Parser 使用指南

Parser 是 Gakumas ADV Tools 的 Python 解析器模块，用于将 Unity ADV 原始脚本（`.txt`）转换为结构化的 JSON 数据。

## 📦 为什么需要 Parser？

虽然 Editor 可以直接读取 `.txt` 文件，但 Parser 作为高级工具仍然具有重要价值：

| 优势 | 说明 | 应用场景 |
|------|------|----------|
| 🛡️ **技术备份** | JSON 格式提供可靠的手动编辑方案 | Editor 时间轴功能失效时的应急方案 |
| 📦 **批量处理** | 一次性解析 2962 个文件 | 数据统计分析、全局查找替换 |
| 🐛 **调试工具** | JSON 结构化数据便于检查 | 验证命令解析是否正确 |
| ⚙️ **自动化集成** | 可集成到 CI/CD 流程 | 自动化测试、版本对比 |
| ✍️ **离线编辑** | 任何文本编辑器都能打开 JSON | 无需启动 Web 服务即可修改 |

> 🎯 **定位**: Parser 是面向**开发者和高级用户**的工具，提供 Editor 之外的灵活性和可靠性保障。

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd parser
pip install -r requirements.txt
```

### 2. 单文件解析

```bash
python parser.py
```

默认解析 `gakumas-data/data/adv_cidol-amao-3-000_01.txt`，输出到 `output/` 目录。

**自定义输入输出：**

```bash
python parser.py --input ../gakumas-data/data/adv_cidol-fktn-3-001_01.txt --output ../output/custom.json
```

### 3. 批量解析

```bash
python batch_parser.py
```

解析 `gakumas-data/data/` 目录下所有 `.txt` 文件（共 2962 个），输出到 `output/` 目录。

**输出示例：**
```
Processing: adv_cidol-amao-3-000_01.txt -> adv_cidol-amao-3-000_01.json
Processing: adv_cidol-fktn-3-001_02.txt -> adv_cidol-fktn-3-001_02.json
...
Total: 2962 files processed in 45.2s
```

---

## 📄 JSON 输出格式

### 完整结构示例

```json
{
  "version": "1.0",
  "original_file": "adv_cidol-amao-3-000_01.txt",
  "timeline": [
    {
      "timestamp": 0.0,
      "commands": [
        {
          "command": "setbg",
          "params": ["env_2d_sconstitution_day1", "1.0"]
        }
      ]
    },
    {
      "timestamp": 0.5,
      "commands": [
        {
          "command": "actorcharacter",
          "params": ["amao", "mdl_cidol_amao", "0.0"]
        }
      ]
    }
  ],
  "statistics": {
    "total_commands": 156,
    "unique_commands": 18,
    "duration": 120.5
  }
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | string | JSON 格式版本号 |
| `original_file` | string | 原始 `.txt` 文件名 |
| `timeline` | array | 时间轴事件列表 |
| `timeline[].timestamp` | number | 事件触发时间（秒） |
| `timeline[].commands` | array | 该时间点执行的命令 |
| `commands[].command` | string | 命令名称 |
| `commands[].params` | array | 命令参数列表 |
| `statistics` | object | 统计信息 |

---

## 🔧 高级用法

### 命令过滤

只解析特定类型的命令：

```python
# parser.py
ALLOWED_COMMANDS = ['setbg', 'actorcharacter', 'text']

def parse_line(line):
    cmd = line.split()[0]
    if cmd not in ALLOWED_COMMANDS:
        return None
    # ...
```

### 数据分析

统计所有文件中的表情使用频率：

```python
import json
from pathlib import Path
from collections import Counter

def analyze_facial_expressions():
    facial_counter = Counter()
    
    for json_file in Path('output').glob('*.json'):
        data = json.loads(json_file.read_text(encoding='utf-8'))
        
        for event in data['timeline']:
            for cmd in event['commands']:
                if cmd['command'] == 'actorfacialoverridemotion':
                    indices = cmd['params'][1]  # 表情索引列表
                    facial_counter.update(indices)
    
    print("Top 10 表情索引:")
    for idx, count in facial_counter.most_common(10):
        print(f"  Index {idx}: {count} 次")

if __name__ == '__main__':
    analyze_facial_expressions()
```

### 自动化对比

对比两个版本的脚本差异：

```bash
# 解析旧版本
python parser.py --input old_version.txt --output old.json

# 解析新版本
python parser.py --input new_version.txt --output new.json

# 使用 diff 工具对比
diff old.json new.json
```

---

## 📚 支持的命令类型

Parser 已支持 **25+ 种命令**，包括：

### 场景控制
- `setbg` - 设置背景
- `actorcharacter` - 加载角色
- `actoralpha` - 设置透明度
- `actorposition` - 设置位置

### 表情动作
- `actorfacialoverridemotion` - 覆盖表情
- `actormotion` - 播放动作
- `actorexpression` - 设置表情

### 对话系统
- `text` - 显示文本
- `choice` - 选择分支

### 相机特效
- `cameracontrol` - 相机控制
- `fade` - 淡入淡出

完整命令参考请查看 [actorfacialoverridemotion](./actorfacialoverridemotion) 和项目源码。

---

## 🐛 常见问题

### Q: Parser 输出的 JSON 为什么乱码？

**A**: 确保使用 UTF-8 编码读写文件：

```python
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()
```

### Q: 批量解析报错 "File not found"

**A**: 确保已初始化 Git Submodule：

```bash
git submodule update --init --recursive
```

### Q: 如何跳过损坏的文件继续解析？

**A**: 修改 `batch_parser.py` 添加异常处理：

```python
for txt_file in resource_dir.glob('*.txt'):
    try:
        parse_file(txt_file)
    except Exception as e:
        print(f"Error parsing {txt_file.name}: {e}")
        continue
```

### Q: Parser 和 Editor 应该用哪个？

**A**: 
- **日常编辑** → 使用 Editor（可视化时间轴、实时预览）
- **批量处理** → 使用 Parser（一次性处理 2962 个文件）
- **自动化/调试** → 使用 Parser（JSON 便于脚本处理）
- **应急备份** → 使用 Parser（手动编辑 JSON 无需 Web 服务）

---

## 🔗 相关文档

- [快速开始](./快速开始) - 项目整体上手指南
- [Editor 使用指南](./Editor使用指南) - Web 可视化编辑器
- [actorfacialoverridemotion](./actorfacialoverridemotion) - 表情命令详解
- [表情 Index 参考表](./表情-Index-参考表) - 已验证的表情索引

---

**最后更新**: 2026年1月2日  
**支持版本**: Gakumas ADV Tools v1.0+
