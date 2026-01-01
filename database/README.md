# 资源数据库系统

游戏资源数据库管理系统，为Web编辑器提供资源选择API。

## 📁 目录结构

```
database/
├── character_resources.db          # SQLite数据库文件
├── update_resource_database.py    # 数据库初始化和资源导入工具 ⭐
├── resource_crud.py               # 命令行CRUD操作工具
├── resource_api_server.py         # Flask API服务器
├── example_database_usage.py      # 使用示例
├── resource_selector_demo.html    # 前端演示页面
├── API_REFERENCE.md               # API接口文档 📖
└── README.md                      # 本文件
```

## 🚀 快速开始

### 1. 初始化数据库

```bash
cd database

# 创建数据库表结构
python update_resource_database.py --init
```

### 2. 配置游戏解包目录

```bash
# 设置游戏资源文件所在目录（只需设置一次）
python update_resource_database.py --set-game-dir "D:\GIT\Gakuen-idolmaster-ab-decrypt\output"

# 查看当前配置
python update_resource_database.py --show-config
```

### 3. 导入游戏资源

```bash
# 完全清理并从已配置的游戏目录重新导入所有资源
python update_resource_database.py --update

# 或者从指定目录一次性导入（不保存配置）
python update_resource_database.py --import-from "D:\path\to\game\output"

# 查看导入统计
python update_resource_database.py --stats
```

### 4. 启动API服务器

```bash
python resource_api_server.py
```

访问 http://localhost:5000 查看API服务器

### 5. 测试演示

在浏览器中打开 `resource_selector_demo.html` 查看资源选择器演示。

## 📊 数据库内容

- **环境场景**: 353个（2D/3D场景，按时间和地点分类）
- **动作**: 1011个（角色动作、通用动作、面部表情）
- **模型**: 812个（body、face、hair、prop）
- **音频**: 5个（voice、bgm、se）
- **角色**: 66个

## 🔌 API接口

### 资源选择（用于编辑器下拉框）
- `GET /api/resources/models` - 获取模型列表
- `GET /api/resources/motions` - 获取动作列表
- `GET /api/resources/environments` - 获取场景列表
- `GET /api/resources/audio` - 获取音频列表

### 查询和搜索
- `GET /api/characters` - 获取所有角色
- `GET /api/characters/:id/resources` - 获取角色所有资源
- `GET /api/search?q=关键词` - 搜索资源
- `GET /api/stats` - 获取统计信息

详细API文档请查看 [API_REFERENCE.md](./API_REFERENCE.md)

## 💡 使用示例

### 命令行查询

```bash
# 查询角色amao的所有动作
python resource_crud.py --query-motion --character amao

# 搜索包含"night"的场景
python resource_crud.py --search night

# 查询所有body模型
python resource_crud.py --query-model --type body
```

### JavaScript API调用

```javascript
// 获取角色amao的body模型
fetch('http://localhost:5000/api/resources/models?character_id=amao&model_type=body')
  .then(res => res.json())
  .then(data => console.log(data));

// 搜索资源
fetch('http://localhost:5000/api/search?q=glad')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Python代码

```python
from resource_crud import ResourceCRUD

with ResourceCRUD() as crud:
    # 查询模型
    models = crud.query_models(character_id='amao', model_type='body')
    
    # 搜索
    results = crud.search_by_keyword('glad')
    
    # 添加资源
    motion_id = crud.add_motion('mot_name', 'character', character_id='amao')
```

## 📚 更多文档

- **[API_REFERENCE.md](./API_REFERENCE.md)** - 完整的RESTful API接口文档，包含所有端点的详细说明和示例

## 🛠️ 命令行工具

### update_resource_database.py - 资源导入工具
```bash
python update_resource_database.py --init                    # 初始化表结构
python update_resource_database.py --set-game-dir <DIR>    # 设置游戏目录
python update_resource_database.py --update                 # 完全清理并重新导入资源
python update_resource_database.py --show-config            # 显示配置
python update_resource_database.py --stats                  # 查看统计
```

### resource_crud.py - CRUD操作工具
```bash
# 查询
python resource_crud.py --query-motion --character amao
python resource_crud.py --query-model --type body
python resource_crud.py --search "keyword"

# 添加
python resource_crud.py --add-motion "name" "type" --character amao

# 更新
python resource_crud.py --update-motion <id> --set-field action_type "dance"

# 删除
python resource_crud.py --delete-motion <id>
```

### resource_api_server.py - API服务器
```bash
python resource_api_server.py  # 启动服务器 (http://localhost:5000)
```

## 💾 数据库结构

### 角色模型白名单
**仅针对模型（mdl_chr）**应用以下角色白名单，其他资源类型（动作、音频等）不受限制：
```
amao, atbm, fktn, hmsz, hrnm, hski, hume, 
jsna, kcna, kllj, nasr, shro, ssmk, 
trda, trvi, trvo, ttmr
```

非白名单角色的模型会在导入时自动过滤，但其动作（包括通用动作 mot_all_chr_cmmn）和音频仍会正常导入。

### 核心表
- **characters** - 角色基础信息
- **environments** - 环境场景（2D/3D，按地点和时间分类）
- **motions** - 动作数据（角色/通用/环境/面部）
- **models** - 角色模型（body/face/hair/prop）
- **audio_files** - 音频资源（voice/bgm/se）
- **file_mappings** - 文件路径映射
- **settings** - 系统配置（游戏目录等）

## 🔧 开发说明

所有工具都支持 `--help` 查看详细参数：
```bash
python update_resource_database.py --help
python resource_crud.py --help
```

---

**返回主项目**: [../README.md](../README.md)
