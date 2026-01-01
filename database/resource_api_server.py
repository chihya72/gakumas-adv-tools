"""
资源数据库API服务器 - 为Web编辑器提供资源选择接口
支持查询models, motions, environments, audio等资源
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from typing import List, Dict, Optional
import json
import re

app = Flask(__name__)
CORS(app)  # 允许跨域请求

DB_PATH = 'character_resources.db'

# 允许的角色ID白名单
ALLOWED_CHARACTERS = {
    'amao', 'atbm', 'fktn', 'hmsz', 'hrnm', 'hski', 'hume', 
    'jsna', 'kcna', 'kllj', 'nasr', 'shro', 'ssmk', 
    'trda', 'trvi', 'trvo', 'ttmr'
}


def get_db():
    """获取数据库连接"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # 返回字典格式
    return conn


# ==================== 资源选择API（用于编辑器下拉框） ====================

@app.route('/api/resources/models', methods=['GET'])
def get_models_for_editor():
    """获取模型列表（用于编辑器下拉选单，仅返回白名单角色）
    参数:
        - character_id: 角色ID (可选)
        - model_type: 模型类型 (body/face/hair/prop，可选)
    返回:
        - 模型列表，格式适合下拉选单
    """
    character_id = request.args.get('character_id')
    model_type = request.args.get('model_type')
    
    conn = get_db()
    cursor = conn.cursor()
    
    query = 'SELECT id, model_name, model_type, character_id FROM models WHERE 1=1'
    params = []
    
    # 添加角色白名单过滤
    placeholders = ','.join('?' * len(ALLOWED_CHARACTERS))
    query += f' AND (character_id IS NULL OR character_id IN ({placeholders}))'
    params.extend(ALLOWED_CHARACTERS)
    
    if character_id:
        query += ' AND character_id = ?'
        params.append(character_id)
    
    if model_type:
        query += ' AND model_type = ?'
        params.append(model_type)
    
    query += ' ORDER BY character_id, model_type, model_name'
    
    cursor.execute(query, params)
    models = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({
        'success': True,
        'data': models,
        'count': len(models)
    })


@app.route('/api/resources/motions', methods=['GET'])
def get_motions_for_editor():
    """获取动作列表（用于编辑器下拉选单）
    参数:
        - character_id: 角色ID (可选)
        - motion_type: 动作类型 (character/common/environment/facial，可选)
        - action_type: 行为类型 (idle/walk/dance/facial等，可选)
    返回:
        - 动作列表，格式适合下拉选单
    """
    character_id = request.args.get('character_id')
    motion_type = request.args.get('motion_type')
    action_type = request.args.get('action_type')
    
    conn = get_db()
    cursor = conn.cursor()
    
    query = 'SELECT id, motion_name, motion_type, character_id, action_type FROM motions WHERE 1=1'
    params = []
    
    if character_id:
        query += ' AND character_id = ?'
        params.append(character_id)
    
    if motion_type:
        query += ' AND motion_type = ?'
        params.append(motion_type)
    
    if action_type:
        query += ' AND action_type = ?'
        params.append(action_type)
    
    query += ' ORDER BY character_id, motion_type, motion_name'
    
    cursor.execute(query, params)
    motions = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({
        'success': True,
        'data': motions,
        'count': len(motions)
    })


@app.route('/api/resources/environments', methods=['GET'])
def get_environments_for_editor():
    """获取环境场景列表（用于编辑器下拉选单）
    参数:
        - env_type: 环境类型 (2d/3d，可选)
        - location: 地点 (可选)
        - time_of_day: 时间 (noon/night/evening等，可选)
    返回:
        - 场景列表，格式适合下拉选单
    """
    env_type = request.args.get('env_type')
    location = request.args.get('location')
    time_of_day = request.args.get('time_of_day')
    
    conn = get_db()
    cursor = conn.cursor()
    
    query = 'SELECT id, env_name, env_type, location, time_of_day FROM environments WHERE 1=1'
    params = []
    
    if env_type:
        query += ' AND env_type = ?'
        params.append(env_type)
    
    if location:
        query += ' AND location LIKE ?'
        params.append(f'%{location}%')
    
    if time_of_day:
        query += ' AND time_of_day = ?'
        params.append(time_of_day)
    
    query += ' ORDER BY env_type, location, time_of_day'
    
    cursor.execute(query, params)
    environments = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({
        'success': True,
        'data': environments,
        'count': len(environments)
    })


@app.route('/api/resources/audio', methods=['GET'])
def get_audio_for_editor():
    """获取音频列表（用于编辑器下拉选单）
    参数:
        - character_id: 角色ID (可选)
        - audio_type: 音频类型 (voice/bgm/se，可选)
    返回:
        - 音频列表，格式适合下拉选单
    """
    character_id = request.args.get('character_id')
    audio_type = request.args.get('audio_type')
    
    conn = get_db()
    cursor = conn.cursor()
    
    query = 'SELECT id, audio_name, audio_type, character_id FROM audio_files WHERE 1=1'
    params = []
    
    if character_id:
        query += ' AND (character_id = ? OR character_id IS NULL)'
        params.append(character_id)
    
    if audio_type:
        query += ' AND audio_type = ?'
        params.append(audio_type)
    
    query += ' ORDER BY character_id, audio_type, audio_name'
    
    cursor.execute(query, params)
    audio_files = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({
        'success': True,
        'data': audio_files,
        'count': len(audio_files)
    })


# ==================== 角色相关API ====================

@app.route('/api/characters', methods=['GET'])
def get_characters():
    """获取所有角色列表（从资源表中提取）"""
    conn = get_db()
    cursor = conn.cursor()
    
    # 从models表获取唯一的角色ID（只包含白名单角色）
    cursor.execute('''
        SELECT DISTINCT character_id 
        FROM models 
        WHERE character_id IS NOT NULL 
        ORDER BY character_id
    ''')
    characters = [row['character_id'] for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({
        'success': True,
        'data': characters,
        'count': len(characters)
    })


@app.route('/api/characters/<character_id>/resources', methods=['GET'])
def get_character_all_resources(character_id):
    """获取角色的所有资源（用于编辑器快速查看）"""
    conn = get_db()
    cursor = conn.cursor()
    
    resources = {
        'character_id': character_id,
        'models': {'body': [], 'face': [], 'hair': [], 'prop': []},
        'motions': {'character': [], 'common': [], 'facial': []},
        'audio': {'voice': [], 'bgm': [], 'se': []}
    }
    
    # 查询模型
    cursor.execute('''
        SELECT model_name, model_type 
        FROM models 
        WHERE character_id = ?
        ORDER BY model_type, model_name
    ''', (character_id,))
    for row in cursor.fetchall():
        mtype = row['model_type']
        if mtype in resources['models']:
            resources['models'][mtype].append(row['model_name'])
    
    # 查询动作
    cursor.execute('''
        SELECT motion_name, motion_type 
        FROM motions 
        WHERE character_id = ?
        ORDER BY motion_type, motion_name
    ''', (character_id,))
    for row in cursor.fetchall():
        mtype = row['motion_type']
        if mtype in resources['motions']:
            resources['motions'][mtype].append(row['motion_name'])
    
    # 查询音频
    cursor.execute('''
        SELECT audio_name, audio_type 
        FROM audio_files 
        WHERE character_id = ?
        ORDER BY audio_type, audio_name
    ''', (character_id,))
    for row in cursor.fetchall():
        atype = row['audio_type']
        if atype in resources['audio']:
            resources['audio'][atype].append(row['audio_name'])
    
    conn.close()
    
    return jsonify({
        'success': True,
        'data': resources
    })


# ==================== 搜索API ====================

@app.route('/api/search', methods=['GET'])
def search_resources():
    """搜索资源
    参数:
        - q: 搜索关键词
        - type: 资源类型 (model/motion/environment/audio，可选)
    """
    keyword = request.args.get('q', '')
    resource_type = request.args.get('type')
    
    if not keyword:
        return jsonify({'success': False, 'error': '缺少搜索关键词'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    results = {}
    
    # 搜索模型
    if not resource_type or resource_type == 'model':
        cursor.execute('''
            SELECT id, model_name, model_type, character_id 
            FROM models 
            WHERE model_name LIKE ?
            LIMIT 20
        ''', (f'%{keyword}%',))
        results['models'] = [dict(row) for row in cursor.fetchall()]
    
    # 搜索动作
    if not resource_type or resource_type == 'motion':
        cursor.execute('''
            SELECT id, motion_name, motion_type, character_id, action_type 
            FROM motions 
            WHERE motion_name LIKE ? OR action_type LIKE ?
            LIMIT 20
        ''', (f'%{keyword}%', f'%{keyword}%'))
        results['motions'] = [dict(row) for row in cursor.fetchall()]
    
    # 搜索环境
    if not resource_type or resource_type == 'environment':
        cursor.execute('''
            SELECT id, env_name, env_type, location, time_of_day 
            FROM environments 
            WHERE env_name LIKE ? OR location LIKE ?
            LIMIT 20
        ''', (f'%{keyword}%', f'%{keyword}%'))
        results['environments'] = [dict(row) for row in cursor.fetchall()]
    
    # 搜索音频
    if not resource_type or resource_type == 'audio':
        cursor.execute('''
            SELECT id, audio_name, audio_type, character_id 
            FROM audio_files 
            WHERE audio_name LIKE ?
            LIMIT 20
        ''', (f'%{keyword}%',))
        results['audio'] = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        'success': True,
        'data': results,
        'keyword': keyword
    })


# ==================== 统计API ====================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """获取数据库统计信息"""
    conn = get_db()
    cursor = conn.cursor()
    
    stats = {}
    
    # 角色数量（从models表统计唯一角色ID）
    cursor.execute('SELECT COUNT(DISTINCT character_id) FROM models WHERE character_id IS NOT NULL')
    stats['characters'] = cursor.fetchone()[0]
    
    # 环境数量（按类型）
    cursor.execute('SELECT env_type, COUNT(*) FROM environments GROUP BY env_type')
    stats['environments'] = {row[0]: row[1] for row in cursor.fetchall()}
    
    # 动作数量（按类型）
    cursor.execute('SELECT motion_type, COUNT(*) FROM motions GROUP BY motion_type')
    stats['motions'] = {row[0]: row[1] for row in cursor.fetchall()}
    
    # 模型数量（按类型）
    cursor.execute('SELECT model_type, COUNT(*) FROM models GROUP BY model_type')
    stats['models'] = {row[0]: row[1] for row in cursor.fetchall()}
    
    # 音频数量（按类型）
    cursor.execute('SELECT audio_type, COUNT(*) FROM audio_files GROUP BY audio_type')
    stats['audio'] = {row[0]: row[1] for row in cursor.fetchall()}
    
    conn.close()
    
    return jsonify({
        'success': True,
        'data': stats
    })


# ==================== 验证API ====================

@app.route('/api/validate/resource', methods=['POST'])
def validate_resource():
    """验证资源名称是否存在于数据库
    用于编辑器输入验证
    """
    data = request.get_json()
    resource_name = data.get('resource_name')
    resource_type = data.get('resource_type')  # model/motion/environment/audio
    
    if not resource_name or not resource_type:
        return jsonify({'success': False, 'error': '缺少参数'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    exists = False
    details = None
    
    if resource_type == 'model':
        cursor.execute('SELECT * FROM models WHERE model_name = ?', (resource_name,))
        row = cursor.fetchone()
        if row:
            exists = True
            details = dict(row)
    
    elif resource_type == 'motion':
        cursor.execute('SELECT * FROM motions WHERE motion_name = ?', (resource_name,))
        row = cursor.fetchone()
        if row:
            exists = True
            details = dict(row)
    
    elif resource_type == 'environment':
        cursor.execute('SELECT * FROM environments WHERE env_name = ?', (resource_name,))
        row = cursor.fetchone()
        if row:
            exists = True
            details = dict(row)
    
    elif resource_type == 'audio':
        cursor.execute('SELECT * FROM audio_files WHERE audio_name = ?', (resource_name,))
        row = cursor.fetchone()
        if row:
            exists = True
            details = dict(row)
    
    conn.close()
    
    return jsonify({
        'success': True,
        'exists': exists,
        'details': details
    })


# ==================== 健康检查 ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """API健康检查"""
    conn = get_db()
    cursor = conn.cursor()
    
    # 检查各表是否存在
    tables = ['characters', 'environments', 'motions', 'models', 'audio_files']
    table_status = {}
    
    for table in tables:
        try:
            cursor.execute(f'SELECT COUNT(*) FROM {table}')
            table_status[table] = {'exists': True, 'count': cursor.fetchone()[0]}
        except:
            table_status[table] = {'exists': False, 'count': 0}
    
    conn.close()
    
    return jsonify({
        'success': True,
        'status': 'healthy',
        'database': DB_PATH,
        'tables': table_status
    })


# ==================== 错误处理 ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': '接口不存在'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': '服务器内部错误'}), 500


# ==================== 启动服务器 ====================

if __name__ == '__main__':
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║   资源数据库API服务器 - Gakumas ADV Tools                ║
    ╚══════════════════════════════════════════════════════════╝
    
    📡 API服务器已启动
    🌐 访问地址: http://localhost:5000
    📚 API文档: http://localhost:5000/api/health
    
    可用接口:
    ┌──────────────────────────────────────────────────────────┐
    │ 资源选择（用于编辑器下拉框）                               │
    ├──────────────────────────────────────────────────────────┤
    │ GET  /api/resources/models         获取模型列表           │
    │ GET  /api/resources/motions        获取动作列表           │
    │ GET  /api/resources/environments   获取场景列表           │
    │ GET  /api/resources/audio          获取音频列表           │
    ├──────────────────────────────────────────────────────────┤
    │ 角色相关                                                  │
    ├──────────────────────────────────────────────────────────┤
    │ GET  /api/characters               获取所有角色           │
    │ GET  /api/characters/:id/resources 获取角色所有资源       │
    ├──────────────────────────────────────────────────────────┤
    │ 搜索与验证                                                │
    ├──────────────────────────────────────────────────────────┤
    │ GET  /api/search                   搜索资源               │
    │ POST /api/validate/resource        验证资源名称           │
    │ GET  /api/stats                    获取统计信息           │
    │ GET  /api/health                   健康检查               │
    └──────────────────────────────────────────────────────────┘
    
    按 Ctrl+C 停止服务器
    """)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
