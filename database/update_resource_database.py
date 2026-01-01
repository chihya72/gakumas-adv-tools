"""
更新资源数据库 - 导入环境、动作、模型等资源
直接从游戏解包目录读取文件并分类导入
"""

import sqlite3
import os
from pathlib import Path
from typing import List, Dict, Set
import re


class ResourceDatabase:
    """资源数据库管理类"""
    
    # 允许的角色ID白名单
    ALLOWED_CHARACTERS = {
        'amao', 'atbm', 'fktn', 'hmsz', 'hrnm', 'hski', 'hume', 
        'jsna', 'kcna', 'kllj', 'nasr', 'shro', 'ssmk', 
        'trda', 'trvi', 'trvo', 'ttmr'
    }
    
    # 资源分类规则
    RESOURCE_CATEGORIES = {
        'env_2d': '2D场景',
        'env_3d': '3D场景',
        'mot_adv_chr': '角色动作',
        'mot_adv_cmmn': '通用动作',
        'mot_adv_env': '环境动作',
        'mot_all_chr': '角色全动作',
        'mdl_chr': '角色模型',
        'sud_vo': '语音',
        'sud_bgm': '背景音乐',
        'sud_se': '音效',
    }
    
    def __init__(self, db_path: str = 'character_resources.db'):
        self.db_path = db_path
        self.conn = None
        self.cursor = None
    
    def connect(self):
        """连接数据库"""
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
    
    def close(self):
        """关闭数据库连接"""
        if self.conn:
            self.conn.close()
    
    def __enter__(self):
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
    
    def create_extended_tables(self):
        """创建扩展表结构以支持更多资源类型"""
        
        # 创建配置表
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建资源分类表
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS resource_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_code TEXT UNIQUE NOT NULL,
                category_name TEXT NOT NULL,
                description TEXT
            )
        ''')
        
        # 创建环境场景表
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS environments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                env_name TEXT UNIQUE NOT NULL,
                env_type TEXT NOT NULL,  -- '2d' or '3d'
                location TEXT,           -- 例如: 'dormitory', 'school'
                time_of_day TEXT,        -- 例如: 'noon', 'night', 'evening'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建动作表
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS motions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                motion_name TEXT UNIQUE NOT NULL,
                motion_type TEXT NOT NULL,  -- 'character', 'common', 'environment', 'facial'
                character_id TEXT,          -- 角色ID (如果是角色特定动作)
                action_type TEXT,           -- 例如: 'idle', 'walk', 'dance'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建模型表
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS models (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_name TEXT UNIQUE NOT NULL,
                model_type TEXT NOT NULL,  -- 'body', 'face', 'hair', 'prop'
                character_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建音频表
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS audio_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                audio_name TEXT UNIQUE NOT NULL,
                audio_type TEXT NOT NULL,  -- 'voice', 'bgm', 'se', 'envse'
                character_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建文件关联表（关联列表.txt和实际文件）
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS file_mappings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                resource_name TEXT NOT NULL,
                file_path TEXT,
                file_exists BOOLEAN DEFAULT 0,
                file_size INTEGER,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建索引
        indexes = [
            'CREATE INDEX IF NOT EXISTS idx_environments_type ON environments(env_type)',
            'CREATE INDEX IF NOT EXISTS idx_motions_type ON motions(motion_type)',
            'CREATE INDEX IF NOT EXISTS idx_motions_character ON motions(character_id)',
            'CREATE INDEX IF NOT EXISTS idx_models_type ON models(model_type)',
            'CREATE INDEX IF NOT EXISTS idx_models_character ON models(character_id)',
            'CREATE INDEX IF NOT EXISTS idx_audio_type ON audio_files(audio_type)',
            'CREATE INDEX IF NOT EXISTS idx_audio_character ON audio_files(character_id)',
            'CREATE INDEX IF NOT EXISTS idx_file_mappings_name ON file_mappings(resource_name)',
        ]
        
        for idx_sql in indexes:
            self.cursor.execute(idx_sql)
        
        self.conn.commit()
        print("✓ 扩展表结构创建成功")
    
    def parse_resource_name(self, resource_name: str) -> Dict:
        """解析资源名称，提取分类信息"""
        info = {
            'name': resource_name,
            'category': 'unknown',
            'type': None,
            'character_id': None,
            'details': {}
        }
        
        # 2D环境
        if resource_name.startswith('env_2d_'):
            info['category'] = 'environment'
            info['type'] = '2d'
            parts = resource_name.replace('env_2d_adv_', '').split('-')
            if len(parts) >= 1:
                info['details']['location'] = parts[0]
            if len(parts) >= 2:
                info['details']['sublocation'] = parts[1]
            if 'night' in resource_name:
                info['details']['time_of_day'] = 'night'
            elif 'evening' in resource_name:
                info['details']['time_of_day'] = 'evening'
            elif 'morning' in resource_name:
                info['details']['time_of_day'] = 'morning'
            else:
                info['details']['time_of_day'] = 'noon'
        
        # 3D环境
        elif resource_name.startswith('env_3d_'):
            info['category'] = 'environment'
            info['type'] = '3d'
            parts = resource_name.replace('env_3d_', '').split('-')
            if len(parts) >= 2:
                info['details']['location'] = parts[1]
            if 'night' in resource_name:
                info['details']['time_of_day'] = 'night'
            elif 'evening' in resource_name:
                info['details']['time_of_day'] = 'evening'
            elif 'morning' in resource_name:
                info['details']['time_of_day'] = 'morning'
            else:
                info['details']['time_of_day'] = 'noon'
        
        # 角色动作
        elif resource_name.startswith('mot_adv_chr_') or resource_name.startswith('mot_all_chr_'):
            info['category'] = 'motion'
            
            # 检查是否是面部表情 (facial-)
            if 'facial-' in resource_name:
                info['type'] = 'facial'
                # 提取角色ID（包括 cmmn）
                match = re.search(r'chr_(\w+?)_', resource_name)
                if match:
                    char_id = match.group(1)
                    info['character_id'] = char_id  # cmmn 也作为角色ID
            else:
                # 提取角色ID (mot_adv_chr_amao_ 或 mot_all_chr_fktn_，包括 cmmn)
                match = re.search(r'chr_(\w+?)_', resource_name)
                if match:
                    char_id = match.group(1)
                    info['character_id'] = char_id  # cmmn 也作为角色ID
                    info['type'] = 'character'
                        
            # 提取动作类型
            if 'idle' in resource_name:
                info['details']['action_type'] = 'idle'
            elif 'walk' in resource_name or 'enter' in resource_name:
                info['details']['action_type'] = 'walk'
            elif 'dance' in resource_name:
                info['details']['action_type'] = 'dance'
            elif 'facial-' in resource_name:
                info['details']['action_type'] = 'facial'
            elif 'glad' in resource_name or 'happy' in resource_name:
                info['details']['action_type'] = 'emotion'
        
        # 通用动作（cmmn 也作为角色ID）
        elif resource_name.startswith('mot_adv_cmmn_') or resource_name.startswith('mot_all_cmmn_'):
            info['category'] = 'motion'
            info['type'] = 'character'
            info['character_id'] = 'cmmn'
        
        # 环境动作
        elif resource_name.startswith('mot_adv_env_'):
            info['category'] = 'motion'
            info['type'] = 'environment'
        
        # 角色模型
        elif resource_name.startswith('mdl_chr_'):
            info['category'] = 'model'
            # 提取角色ID (mdl_chr_amao-casl-0000_body)
            match = re.search(r'mdl_chr_(\w+?)-', resource_name)
            if match:
                info['character_id'] = match.group(1)
            
            # 提取模型类型
            if '_body' in resource_name:
                info['type'] = 'body'
            elif '_face' in resource_name:
                info['type'] = 'face'
            elif '_hair' in resource_name:
                info['type'] = 'hair'
            else:
                info['type'] = 'prop'
        
        # 语音
        elif resource_name.startswith('sud_vo_'):
            info['category'] = 'audio'
            info['type'] = 'voice'
            # 提取角色ID
            match = re.search(r'cidol-(\w+?)-', resource_name)
            if match:
                info['character_id'] = match.group(1)
        
        # BGM
        elif resource_name.startswith('sud_bgm_'):
            info['category'] = 'audio'
            info['type'] = 'bgm'
        
        # 音效
        elif resource_name.startswith('sud_se_') or resource_name.startswith('sud_envse_'):
            info['category'] = 'audio'
            info['type'] = 'se'
        
        return info
    
    def set_game_directory(self, game_dir: str):
        """设置游戏解包目录"""
        if not os.path.exists(game_dir):
            print(f"❌ 目录不存在: {game_dir}")
            return False
        
        abs_path = os.path.abspath(game_dir)
        self.cursor.execute('''
            INSERT OR REPLACE INTO settings (key, value, updated_at)
            VALUES ('game_directory', ?, CURRENT_TIMESTAMP)
        ''', (abs_path,))
        self.conn.commit()
        print(f"✓ 已设置游戏目录: {abs_path}")
        return True
    
    def get_game_directory(self) -> str:
        """获取游戏解包目录"""
        self.cursor.execute('SELECT value FROM settings WHERE key = "game_directory"')
        result = self.cursor.fetchone()
        return result[0] if result else None
    
    def import_from_game_directory(self, game_dir: str = None):
        """从游戏解包目录导入资源（完全清理并重新导入）"""
        if game_dir is None:
            game_dir = self.get_game_directory()
            if not game_dir:
                print("❌ 未设置游戏目录，请先使用 --set-game-dir 设置")
                return
        
        print(f"\n正在扫描游戏目录: {game_dir}...")
        
        if not os.path.exists(game_dir):
            print(f"❌ 目录不存在: {game_dir}")
            return
        
        # 清理现有资源数据（保留 settings 表）
        print("正在清理现有资源数据...")
        tables_to_clear = ['environments', 'motions', 'models', 'audio_files', 'file_mappings']
        for table in tables_to_clear:
            try:
                self.cursor.execute(f'DELETE FROM {table}')
            except Exception as e:
                print(f"警告: 清理表 {table} 时出错: {e}")
        self.conn.commit()
        print("✓ 数据清理完成")
        
        # 扫描所有文件
        resource_files = []
        for root, dirs, files in os.walk(game_dir):
            for file in files:
                # 获取不含扩展名的文件名作为资源名
                resource_name = os.path.splitext(file)[0]
                file_path = os.path.join(root, file)
                file_size = os.path.getsize(file_path)
                resource_files.append((resource_name, file_path, file_size))
        
        print(f"✓ 找到 {len(resource_files)} 个资源文件")
        
        stats = {
            'environments': 0,
            'motions': 0,
            'models': 0,
            'audio': 0,
            'unknown': 0,
            'file_mappings': 0
        }
        
        print("\n开始导入资源...")
        for resource_name, file_path, file_size in resource_files:
            info = self.parse_resource_name(resource_name)
            
            # 过滤：只对模型(mdl_chr)应用角色白名单
            if info['category'] == 'model' and info['character_id'] and info['character_id'] not in self.ALLOWED_CHARACTERS:
                stats['unknown'] += 1
                continue
            
            try:
                if info['category'] == 'environment':
                    self.cursor.execute('''
                        INSERT INTO environments 
                        (env_name, env_type, location, time_of_day)
                        VALUES (?, ?, ?, ?)
                    ''', (
                        info['name'],
                        info['type'],
                        info['details'].get('location'),
                        info['details'].get('time_of_day')
                    ))
                    stats['environments'] += self.cursor.rowcount
                
                elif info['category'] == 'motion':
                    self.cursor.execute('''
                        INSERT INTO motions 
                        (motion_name, motion_type, character_id, action_type)
                        VALUES (?, ?, ?, ?)
                    ''', (
                        info['name'],
                        info['type'],
                        info['character_id'],
                        info['details'].get('action_type')
                    ))
                    stats['motions'] += self.cursor.rowcount
                
                elif info['category'] == 'model':
                    self.cursor.execute('''
                        INSERT INTO models 
                        (model_name, model_type, character_id)
                        VALUES (?, ?, ?)
                    ''', (
                        info['name'],
                        info['type'],
                        info['character_id']
                    ))
                    stats['models'] += self.cursor.rowcount
                
                elif info['category'] == 'audio':
                    self.cursor.execute('''
                        INSERT INTO audio_files 
                        (audio_name, audio_type, character_id)
                        VALUES (?, ?, ?)
                    ''', (
                        info['name'],
                        info['type'],
                        info['character_id']
                    ))
                    stats['audio'] += self.cursor.rowcount
                
                else:
                    stats['unknown'] += 1
                
                # 添加文件映射
                self.cursor.execute('''
                    INSERT INTO file_mappings 
                    (resource_name, file_path, file_exists, file_size, updated_at)
                    VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)
                ''', (resource_name, file_path, file_size))
                stats['file_mappings'] += 1
            
            except Exception as e:
                print(f"导入 {resource_name} 时出错: {e}")
        
        self.conn.commit()
        
        print(f"\n✓ 导入完成！")
        print(f"  环境场景:   {stats['environments']:6}")
        print(f"  动作:       {stats['motions']:6}")
        print(f"  模型:       {stats['models']:6}")
        print(f"  音频:       {stats['audio']:6}")
        print(f"  文件映射:   {stats['file_mappings']:6}")
        print(f"  未分类:     {stats['unknown']:6}")
    
    def get_statistics(self):
        """获取数据库统计信息"""
        stats = {}
        
        tables = ['characters', 'resources', 'environments', 'motions', 'models', 'audio_files', 'file_mappings']
        
        for table in tables:
            try:
                self.cursor.execute(f'SELECT COUNT(*) FROM {table}')
                stats[table] = self.cursor.fetchone()[0]
            except:
                stats[table] = 0
        
        return stats


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='更新资源数据库')
    parser.add_argument('--init', action='store_true', help='初始化扩展表结构')
    parser.add_argument('--set-game-dir', type=str, metavar='DIR',
                       help='设置游戏解包目录 (例如: D:\\GIT\\Gakuen-idolmaster-ab-decrypt\\output)')
    parser.add_argument('--update', action='store_true', help='完全清理并从游戏目录重新导入资源（使用已配置的目录）')
    parser.add_argument('--import-from', type=str, metavar='DIR',
                       help='从指定目录完全清理并重新导入资源（一次性使用，不保存配置）')
    parser.add_argument('--stats', action='store_true', help='显示数据库统计')
    parser.add_argument('--show-config', action='store_true', help='显示当前配置')
    parser.add_argument('--db', default='character_resources.db', help='数据库文件路径')
    
    args = parser.parse_args()
    
    with ResourceDatabase(args.db) as db:
        if args.init:
            print("初始化扩展表结构...")
            db.create_extended_tables()
        
        if args.set_game_dir:
            db.set_game_directory(args.set_game_dir)
        
        if args.update:
            db.import_from_game_directory()
        
        if args.import_from:
            db.import_from_game_directory(args.import_from)
        
        if args.show_config:
            game_dir = db.get_game_directory()
            print("\n=== 当前配置 ===")
            if game_dir:
                print(f"游戏目录: {game_dir}")
                print(f"目录存在: {'是' if os.path.exists(game_dir) else '否'}")
            else:
                print("游戏目录: 未配置")
        
        if args.stats or not any([args.init, args.set_game_dir, args.update, args.import_from, args.show_config]):
            stats = db.get_statistics()
            game_dir = db.get_game_directory()
            
            print("\n=== 数据库统计 ===")
            print(f"角色:       {stats.get('characters', 0):6}")
            print(f"角色资源:   {stats.get('resources', 0):6}")
            print(f"环境场景:   {stats.get('environments', 0):6}")
            print(f"动作:       {stats.get('motions', 0):6}")
            print(f"模型:       {stats.get('models', 0):6}")
            print(f"音频:       {stats.get('audio_files', 0):6}")
            print(f"文件映射:   {stats.get('file_mappings', 0):6}")
            
            if game_dir:
                print(f"\n游戏目录:   {game_dir}")


if __name__ == '__main__':
    main()
