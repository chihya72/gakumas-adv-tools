# Gakumas ADV Tools

学園アイドルマスター (Gakumas) ADV脚本工具集 - 解析、编辑、可视化一体化解决方案

[![GitHub Wiki](https://img.shields.io/badge/docs-Wiki-blue)](https://github.com/chihya72/gakumas-adv-tools/wiki)
[![Data Source](https://img.shields.io/badge/data-Gakumas--Auto--Translate-green)](https://github.com/chihya72/Gakumas-Auto-Translate)

> 📚 **完整文档**: [访问 Wiki](https://github.com/chihya72/gakumas-adv-tools/wiki) 获取详细教程和命令参考

## ✨ 功能特性

- 🔍 **Parser** - 解析 Unity ADV 原始脚本 (2962个文件)
- ✏️ **Editor** - 可视化 Web 编辑器
- 🗄️ **Database** - 游戏资源数据库与 API
- 📊 **Analyzer** - 表情 Index 统计分析 (已验证7个表情)

## 📁 项目结构

```
gakumas-adv-tools/
├── parser/                         # Python脚本解析器
│   ├── parser.py                  # 单文件解析
│   ├── batch_parser.py            # 批量解析
│   └── requirements.txt
│
├── editor/                         # Web可视化编辑器
│   ├── src/
│   │   ├── types/                 # TypeScript类型定义
│   │   ├── utils/                 # 工具函数
│   │   └── components/            # React组件
│   ├── package.json
│   └── vite.config.ts
│
├── database/                       # 资源数据库系统 ⭐
│   ├── character_resources.db     # SQLite数据库
│   ├── update_resource_database.py # 初始化/导入工具
│   ├── resource_crud.py           # CRUD操作工具
│   ├── resource_api_server.py     # Flask API服务器
│   ├── resource_selector_demo.html # 前端演示
│   ├── 列表.txt                    # 游戏资源列表
│   └── README.md                  # 数据库文档
│
├── output/                         # 解析输出目录
│   └── *.json                     # 解析后的JSON文件 (2890+)
│
├── gakumas-data/                   # ADV脚本数据源 (Git Submodule)
│   └── data/                      # Gakumas-Auto-Translate 数据
│       └── *.txt                  # Unity ADV原始脚本 (2962个文件)
│
└── README.md                      # 本文件
```

## 🚀 快速开始

```bash
# 1. 克隆项目（包含数据 submodule）
git clone --recursive https://github.com/chihya72/gakumas-adv-tools.git
cd gakumas-adv-tools

# 2. 安装 Python 依赖
pip install -r requirements.txt

# 3. 启动资源数据库 API（为编辑器提供资源选择功能）
cd database
python resource_api_server.py
# 访问 http://localhost:5000

# 4. 启动 Web 编辑器（新终端）
cd editor
npm install
npm run dev
# 访问 http://localhost:5173
```

> 💡 **进阶功能**：
> - 分析表情索引：`python analyze_facial_indices.py`
> - 批量解析脚本：`cd parser && python batch_parser.py`
> 
> 📖 详细教程请查看 [快速开始指南](https://github.com/chihya72/gakumas-adv-tools/wiki/快速开始)
```

详细使用说明请参考 [DATABASE_USAGE.md](./DATABASE_USAGE.md) 和 [DATABASE_QUICKREF.md](./DATABASE_QUICKREF.md)

### 1. 启动Web编辑器

```bash
cd editor

# 首次运行：安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 打开编辑器。
Resource Database (资源数据库)

- 🗄️ **SQLite存储**: 2D/3D场景、动作、模型、音频分类管理
- 🔍 **智能解析**: 自动识别资源类型（env_2d/env_3d/mot_/mdl_等）
- 🔗 **文件映射**: 关联列表.txt与游戏解包文件路径
- ✨ **CRUD操作**: 完整的增删查改命令行工具
- 🎯 **角色关联**: 快速查询角色的所有资源
- 📊 **统计分析**: 资源数量、类型分布统计

**数据库表结构：**
- `environments`: 2D/3D环境场景（地点、时间）
- `motions`: 角色/通用动作（idle、walk、facial等）
- `models`: 角色模型（body、face、hair）
- `audio_files`: 语音、BGM、音效
- `file_mappings`: 资源名 → 实际文件路径映射

## 📖 文档

完整文档已迁移到 Wiki：

### 📚 入门指南
- [快速开始](https://github.com/chihya72/gakumas-adv-tools/wiki/快速开始) - 5分钟上手
- [项目架构](https://github.com/chihya72/gakumas-adv-tools/wiki/项目架构) - 理解代码结构

### 📖 命令参考
- [actorfacialoverridemotion](https://github.com/chihya72/gakumas-adv-tools/wiki/actorfacialoverridemotion) - 面部表情覆盖
- [表情 Index 参考表](https://github.com/chihya72/gakumas-adv-tools/wiki/表情-Index-参考表) - 已验证7个表情

### 🔧 工具使用
- [Parser 使用指南](https://github.com/chihya72/gakumas-adv-tools/wiki/Parser使用指南) - 脚本解析器
- [Editor 使用指南](https://github.com/chihya72/gakumas-adv-tools/wiki/Editor使用指南) - 可视化编辑器
- [Database API](https://github.com/chihya72/gakumas-adv-tools/wiki/Database-API) - 资源数据库接口

### 💡 实战教程
- [表情编辑实战](https://github.com/chihya72/gakumas-adv-tools/wiki/表情编辑实战) - 修改角色表情
- [时间轴编辑技巧](https://github.com/chihya72/gakumas-adv-tools/wiki/时间轴编辑技巧) - 时间轴系统
    B --> C[JSON数据<br>output/]
    C --> D[Editor加载]
    D --> E[时间轴可视化]
    D --> F[命令列表]
    D --> G[对话预览]
```

## 📝 命令类型支持

### 对话系统
- `message` - 对话文本
- `selection` - 选择分支
- `chaptertitle` - 章节标题

### 语音控制
- `voice` - 语音播放
- `voicestop` - 停止语音

### 镜头控制
- `camerasetting` - 镜头设置
- `camerashake` - 镜头震动
- `cameradelay` - 镜头延迟

### 角色系统
- `actorgroup` - 角色组
- `actormotion` - 角色动作
- `actorfacialmotion` - 面部表情
- `actorfacialoverridemotion` - 面部覆盖

### 场景效果
- `backgroundgroup` - 背景组
- `background` - 背景设置
- `fade` - 渐变效果
- `transition` - 场景过渡
- `shake` - 震动效果

### 音频控制
- `bgmplay` / `bgmstop` - BGM控制
- `seplay` - 音效播放
- `envseplay` / `envsestop` - 环境音效

### Database 数据库操作
```bash
cd database

# 初始化数据库
python update_resource_database.py --init

# 配置游戏目录
python update_resource_database.py --set-game-dir "D:\path\to\game\output"

# 导入资源
python update_resource_database.py --update

# 查询操作
python resource_crud.py --query-motion --character amao
python resource_crud.py --search "keyword"

# 添加资源
python resource_crud.py --add-motion "mot_name" "character" --character amao

# 更新资源
python resource_crud.py --update-motion 123 --set-field action_type "dance"

# 删除资源
python resource_crud.py --delete-motion 123
```

### 特殊控制
- `wait` - 等待
## 🛠️ 技术栈

- **Python 3.8+** - Parser 和数据库工具
- **TypeScript & React** - Web 编辑器
- **SQLite3** - 资源数据库
- **Vite** - 构建工具

## 📦 数据源

本项目使用 Git Submodule 链接到 [Gakumas-Auto-Translate](https://github.com/chihya72/Gakumas-Auto-Translate)，包含 **2962 个 ADV 脚本文件**。

```bash
# 更新数据源
cd gakumas-data
git pull origin master
```

## 🤝 贡献

欢迎贡献！特别是：
- 🔬 测试并验证新的表情 Index
- 📝 改进文档和教程
- 🐛 报告 Bug 和建议功能
- 🌐 添加更多命令的解析支持

## 📄 许可证

MIT License

## 🔗 相关链接

- [GitHub Wiki](https://github.com/chihya72/gakumas-adv-tools/wiki) - 完整文档
- [数据源项目](https://github.com/chihya72/Gakumas-Auto-Translate) - ADV 脚本数据
- [问题反馈](https://github.com/chihya72/gakumas-adv-tools/issues) - Bug 报告和功能建议

---

**最后更新**: 2026年1月2日  
**数据统计**: 2962个ADV文件 | 46个表情Index (7个已验证) | 25+种命令类型
