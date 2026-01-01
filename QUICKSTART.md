# 快速开始指南

## ✅ 已完成的步骤

### 1. ✓ 安装依赖
```bash
pip install flask flask-cors requests
```

### 2. ✓ 导入数据到SQLite数据库
```bash
python import_to_database.py
```

**结果**: 已成功创建 `character_resources.db`
- 66 个角色
- 52,257 个资源
- 10 种资源类型

### 3. ✓ 启动API服务器
API服务器正在运行于: **http://localhost:5000**

## 🎯 如何使用

### 方法1: 使用Web测试页面（推荐）

1. 在浏览器中打开文件: `test_api.html`
2. 你将看到一个漂亮的Web界面，包含：
   - 📊 统计信息
   - 👥 角色列表和详情查看
   - 🔍 资源搜索功能
   - ⚙️ 添加新资源功能

### 方法2: 使用命令行测试

**查看统计信息**:
```bash
# PowerShell
(Invoke-WebRequest http://localhost:5000/api/stats).Content | ConvertFrom-Json
```

**获取所有角色**:
```bash
(Invoke-WebRequest http://localhost:5000/api/characters).Content | ConvertFrom-Json
```

**查询特定角色**:
```bash
(Invoke-WebRequest http://localhost:5000/api/characters/amao).Content | ConvertFrom-Json
```

**搜索资源**:
```bash
(Invoke-WebRequest "http://localhost:5000/api/search?keyword=egao").Content | ConvertFrom-Json
```

### 方法3: 在你的Web编辑器中使用

在你的JavaScript代码中：

```javascript
// 获取角色列表
fetch('http://localhost:5000/api/characters')
    .then(res => res.json())
    .then(data => {
        console.log('角色列表:', data.data);
        // 填充到下拉框等UI组件
    });

// 获取amao的body选项
fetch('http://localhost:5000/api/resources?character_id=amao&resource_type=body')
    .then(res => res.json())
    .then(data => {
        console.log('amao的body列表:', data.data);
        // 显示可选项
    });

// 搜索表情动作
fetch('http://localhost:5000/api/search?keyword=egao')
    .then(res => res.json())
    .then(data => {
        console.log('搜索结果:', data.data);
    });
```

## 📋 常用API接口

### 1. 获取角色的某类型资源
```
GET /api/resources?character_id=amao&resource_type=body
```

返回amao的所有body模型列表

### 2. 搜索资源
```
GET /api/search?keyword=egao
```

搜索所有包含"egao"的资源

### 3. 获取统计信息
```
GET /api/stats
```

返回数据库的统计信息

### 4. 添加新资源
```
POST /api/resources
Content-Type: application/json

{
  "character_id": "amao",
  "resource_type": "motion",
  "resource_name": "mot_custom_001"
}
```

## 💡 在editor中集成

### 示例: 角色body选择器

```html
<select id="character-select" onchange="loadBodyOptions()">
    <option value="">选择角色...</option>
</select>

<select id="body-select">
    <option value="">选择body...</option>
</select>

<script>
// 加载角色列表
async function loadCharacters() {
    const response = await fetch('http://localhost:5000/api/characters');
    const data = await response.json();
    
    const select = document.getElementById('character-select');
    data.data.forEach(char => {
        const option = document.createElement('option');
        option.value = char.character_id;
        option.textContent = char.character_id;
        select.appendChild(option);
    });
}

// 加载body选项
async function loadBodyOptions() {
    const characterId = document.getElementById('character-select').value;
    if (!characterId) return;
    
    const response = await fetch(
        `http://localhost:5000/api/resources?character_id=${characterId}&resource_type=body`
    );
    const data = await response.json();
    
    const select = document.getElementById('body-select');
    select.innerHTML = '<option value="">选择body...</option>';
    
    data.data.forEach(resource => {
        const option = document.createElement('option');
        option.value = resource.resource_name;
        option.textContent = resource.resource_name;
        select.appendChild(option);
    });
}

// 页面加载时初始化
loadCharacters();
</script>
```

## 🔥 高级功能

### 批量添加资源
```javascript
async function batchAddResources(characterId, resourceType, names) {
    const response = await fetch('http://localhost:5000/api/resources/batch', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            character_id: characterId,
            resource_type: resourceType,
            resource_names: names
        })
    });
    return await response.json();
}

// 使用示例
batchAddResources('amao', 'motion', [
    'mot_custom_001',
    'mot_custom_002',
    'mot_custom_003'
]);
```

### 动态搜索（输入时实时搜索）
```javascript
let searchTimeout;
document.getElementById('search-input').addEventListener('input', function(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        const keyword = e.target.value;
        if (keyword.length < 2) return;
        
        const response = await fetch(
            `http://localhost:5000/api/search?keyword=${encodeURIComponent(keyword)}`
        );
        const data = await response.json();
        displaySearchResults(data.data);
    }, 300); // 延迟300ms执行
});
```

## 🎨 数据库内容

### 资源类型统计
- **voice**: 47,589 个（语音文件）
- **motion**: 2,933 个（身体动作）
- **facial_motion**: 1,285 个（表情动作）
- **body**: 114 个（身体模型）
- **bgm**: 103 个（背景音乐）
- **hair**: 77 个（发型）
- **additive_motion**: 51 个（附加动作）
- **others**: 47 个（道具）
- **face**: 44 个（面部）
- **create**: 14 个（创建标志）

### 角色示例
- **amao**: 1,959 个资源
- **fktn**: 1,937 个资源
- **hmsz**: 1,683 个资源
- **hrnm**: 1,689 个资源
- 等等...

## 📱 下一步

1. ✅ 打开 `test_api.html` 测试API功能
2. ✅ 将API集成到你的Web编辑器
3. ✅ 根据需要添加、修改、删除资源
4. ✅ 享受便捷的资源管理！

## ⚠️ 注意事项

- API服务器需要保持运行状态
- 如果关闭了服务器，重新运行: `python api_server.py`
- 数据库文件: `character_resources.db` （可以备份）
- 支持跨域访问（CORS已启用）

## 📞 API响应格式

所有API都返回统一格式：

```json
{
  "success": true,    // 或 false
  "data": {...},      // 返回的数据
  "message": "...",   // 成功或错误消息
  "count": 100        // 某些接口包含数量
}
```

错误响应示例：
```json
{
  "success": false,
  "error": "角色不存在"
}
```
