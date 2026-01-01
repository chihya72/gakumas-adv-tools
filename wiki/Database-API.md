# Database API 参考

资源数据库 API 服务器完整接口文档，为 Web 编辑器提供资源选择和查询功能。

## 🚀 快速开始

### 1. 启动服务器

```bash
cd database

# 使用虚拟环境
python resource_api_server.py
```

服务器将运行在 `http://localhost:5000`

### 2. 测试服务器

在浏览器中访问：
- 健康检查：http://localhost:5000/api/health
- 查看演示：打开 `resource_selector_demo.html`

## 📡 API接口文档

### 资源选择API（用于编辑器下拉框）

#### 1. 获取模型列表
```http
GET /api/resources/models
```

**查询参数：**
- `character_id` (可选): 角色ID，如 `amao`, `fktn`
- `model_type` (可选): 模型类型，可选值：`body`, `face`, `hair`, `prop`

**示例请求：**
```bash
# 获取角色amao的所有body模型
curl "http://localhost:5000/api/resources/models?character_id=amao&model_type=body"

# 获取所有face模型
curl "http://localhost:5000/api/resources/models?model_type=face"
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "model_name": "mdl_chr_amao-casl-0000_body",
      "model_type": "body",
      "character_id": "amao"
    },
    {
      "id": 2,
      "model_name": "mdl_chr_amao-casl-0001_body",
      "model_type": "body",
      "character_id": "amao"
    }
  ],
  "count": 2
}
```

#### 2. 获取动作列表
```http
GET /api/resources/motions
```

**查询参数：**
- `character_id` (可选): 角色ID
- `motion_type` (可选): 动作类型，可选值：`character`, `common`, `environment`, `facial`
- `action_type` (可选): 行为类型，可选值：`idle`, `walk`, `dance`, `facial`, `emotion`

**示例请求：**
```bash
# 获取角色amao的所有角色动作
curl "http://localhost:5000/api/resources/motions?character_id=amao&motion_type=character"

# 获取所有面部表情动作
curl "http://localhost:5000/api/resources/motions?action_type=facial"

# 获取所有通用动作
curl "http://localhost:5000/api/resources/motions?motion_type=common"
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 106,
      "motion_name": "mot_all_chr_amao_facial-all-default_in",
      "motion_type": "character",
      "character_id": "amao",
      "action_type": "facial"
    }
  ],
  "count": 1
}
```

#### 3. 获取环境场景列表
```http
GET /api/resources/environments
```

**查询参数：**
- `env_type` (可选): 环境类型，可选值：`2d`, `3d`
- `location` (可选): 地点关键词，如 `dormitory`, `school`
- `time_of_day` (可选): 时间，可选值：`noon`, `night`, `evening`, `morning`

**示例请求：**
```bash
# 获取所有2D夜晚场景
curl "http://localhost:5000/api/resources/environments?env_type=2d&time_of_day=night"

# 获取宿舍相关场景
curl "http://localhost:5000/api/resources/environments?location=dormitory"
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "env_name": "env_2d_adv_dormitory-amaoroom-00-night",
      "env_type": "2d",
      "location": "dormitory",
      "time_of_day": "night"
    }
  ],
  "count": 1
}
```

#### 4. 获取音频列表
```http
GET /api/resources/audio
```

**查询参数：**
- `character_id` (可选): 角色ID
- `audio_type` (可选): 音频类型，可选值：`voice`, `bgm`, `se`

**示例请求：**
```bash
# 获取角色amao的所有语音
curl "http://localhost:5000/api/resources/audio?character_id=amao&audio_type=voice"

# 获取所有BGM
curl "http://localhost:5000/api/resources/audio?audio_type=bgm"
```

### 角色相关API

#### 5. 获取所有角色
```http
GET /api/characters
```

**响应示例：**
```json
{
  "success": true,
  "data": ["amao", "fktn", "hmsz", "..."],
  "count": 66
}
```

#### 6. 获取角色的所有资源
```http
GET /api/characters/{character_id}/resources
```

**示例请求：**
```bash
curl "http://localhost:5000/api/characters/amao/resources"
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "character_id": "amao",
    "models": {
      "body": ["mdl_chr_amao-casl-0000_body", "..."],
      "face": ["mdl_chr_amao-base-0000_face", "..."],
      "hair": ["mdl_chr_amao-base-0000_hair", "..."],
      "prop": []
    },
    "motions": {
      "character": ["mot_all_chr_amao_glad-001_in", "..."],
      "common": ["mot_all_chr_cmmn_talk-001_in", "..."],
      "facial": ["mot_all_chr_amao_facial-all-default_in", "..."]
    },
    "audio": {
      "voice": ["sud_vo_adv_cidol-amao-3-000_01_amao-001", "..."],
      "bgm": ["sud_bgm_adv_amao-001"],
      "se": []
    }
  }
}
```

### 搜索与验证API

#### 7. 搜索资源
```http
GET /api/search?q={keyword}
```

**查询参数：**
- `q` (必需): 搜索关键词
- `type` (可选): 资源类型，可选值：`model`, `motion`, `environment`, `audio`

**示例请求：**
```bash
# 搜索包含"glad"的资源
curl "http://localhost:5000/api/search?q=glad"

# 只搜索动作
curl "http://localhost:5000/api/search?q=glad&type=motion"
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "models": [],
    "motions": [
      {
        "id": 115,
        "motion_name": "mot_all_chr_amao_glad-001_in",
        "motion_type": "character",
        "character_id": "amao",
        "action_type": null
      }
    ],
    "environments": [],
    "audio": []
  },
  "keyword": "glad"
}
```

#### 8. 验证资源名称
```http
POST /api/validate/resource
Content-Type: application/json
```

**请求体：**
```json
{
  "resource_name": "mdl_chr_amao-casl-0000_body",
  "resource_type": "model"
}
```

**响应示例：**
```json
{
  "success": true,
  "exists": true,
  "details": {
    "id": 1,
    "model_name": "mdl_chr_amao-casl-0000_body",
    "model_type": "body",
    "character_id": "amao"
  }
}
```

### 统计API

#### 9. 获取数据库统计
```http
GET /api/stats
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "characters": 66,
    "environments": {
      "2d": 197,
      "3d": 156
    },
    "motions": {
      "character": 449,
      "common": 548,
      "environment": 14
    },
    "models": {
      "body": 443,
      "face": 65,
      "hair": 304
    },
    "audio": {
      "voice": 5,
      "bgm": 0,
      "se": 0
    }
  }
}
```

## 🔌 在Web编辑器中集成

### JavaScript示例

```javascript
// 1. 获取角色amao的body模型列表（用于下拉选单）
async function loadBodyModels(characterId) {
    const response = await fetch(
        `http://localhost:5000/api/resources/models?character_id=${characterId}&model_type=body`
    );
    const data = await response.json();
    
    if (data.success) {
        const select = document.getElementById('bodyModelSelect');
        data.data.forEach(model => {
            const option = document.createElement('option');
            option.value = model.model_name;
            option.textContent = model.model_name;
            select.appendChild(option);
        });
    }
}

// 2. 获取角色的动作列表
async function loadCharacterMotions(characterId) {
    const response = await fetch(
        `http://localhost:5000/api/resources/motions?character_id=${characterId}&motion_type=character`
    );
    const data = await response.json();
    
    if (data.success) {
        return data.data.map(m => m.motion_name);
    }
    return [];
}

// 3. 搜索资源
async function searchResources(keyword) {
    const response = await fetch(
        `http://localhost:5000/api/search?q=${encodeURIComponent(keyword)}`
    );
    const data = await response.json();
    
    if (data.success) {
        console.log('搜索结果:', data.data);
        return data.data;
    }
    return null;
}

// 4. 验证资源是否存在
async function validateResource(resourceName, resourceType) {
    const response = await fetch(
        'http://localhost:5000/api/validate/resource',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resource_name: resourceName,
                resource_type: resourceType
            })
        }
    );
    const data = await response.json();
    
    return data.exists;
}
```

### React示例

```jsx
import { useState, useEffect } from 'react';

function ModelSelector({ characterId }) {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');

    useEffect(() => {
        async function fetchModels() {
            const response = await fetch(
                `http://localhost:5000/api/resources/models?character_id=${characterId}&model_type=body`
            );
            const data = await response.json();
            if (data.success) {
                setModels(data.data);
            }
        }
        
        if (characterId) {
            fetchModels();
        }
    }, [characterId]);

    return (
        <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
        >
            <option value="">选择Body模型...</option>
            {models.map(model => (
                <option key={model.id} value={model.model_name}>
                    {model.model_name}
                </option>
            ))}
        </select>
    );
}
```

## 🎯 典型使用场景

### 场景1：编辑Actor配置

当用户在编辑器中修改actor配置时：

```
[actorgroup actors=[actor id=amao 
    body=mdl_chr_amao-casl-0000_body 
    face=mdl_chr_amao-base-0000_face 
    hair=mdl_chr_amao-base-0000_hair]]
```

编辑器可以：
1. 调用 `/api/resources/models?character_id=amao&model_type=body` 获取body选项
2. 调用 `/api/resources/models?character_id=amao&model_type=face` 获取face选项
3. 调用 `/api/resources/models?character_id=amao&model_type=hair` 获取hair选项

### 场景2：编辑ActorMotion

```
[actormotion id=amao motion=mot_all_chr_amao_glad-001_in]
```

编辑器可以：
1. 调用 `/api/resources/motions?character_id=amao` 获取该角色的所有动作
2. 提供下拉选单或自动补全

### 场景3：编辑Background

```
[background id=entrance src=env_2d_adv_school-entrance-00-noon]
```

编辑器可以：
1. 调用 `/api/resources/environments?env_type=2d` 获取2D场景
2. 支持按location和time_of_day过滤

### 场景4：搜索和自动补全

用户输入 "glad" 时：
1. 调用 `/api/search?q=glad`
2. 在下拉菜单中显示所有匹配的资源
3. 包括motions、models等

## 🐛 常见问题

**Q: 连接被拒绝？**  
A: 确保API服务器已启动：`python resource_api_server.py`

**Q: 返回数据为空？**  
A: 确保已导入数据：`python update_resource_database.py --update`

**Q: 跨域错误？**  
A: 服务器已启用CORS，检查请求URL是否正确

**Q: 如何修改端口？**  
A: 编辑 `resource_api_server.py` 中的 `app.run(port=5000)`

## 📚 相关文档

- [快速开始](快速开始) - 5分钟上手指南
- [Database使用指南](Database使用指南) - 数据库详细说明

---

**最后更新**: 2026年1月2日
