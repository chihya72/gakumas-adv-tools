"""
资源数据库 CRUD 操作工具
增删查改功能的命令行界面
"""

import sqlite3
from typing import List, Dict, Optional
import json


class ResourceCRUD:
    """资源数据库CRUD操作类"""
    
    # 允许的角色ID白名单
    ALLOWED_CHARACTERS = {
        'amao', 'atbm', 'fktn', 'hmsz', 'hrnm', 'hski', 'hume', 
        'jsna', 'kcna', 'kllj', 'nasr', 'shro', 'ssmk', 
        'trda', 'trvi', 'trvo', 'ttmr'
    }
    
    def __init__(self, db_path: str = 'character_resources.db'):
        self.db_path = db_path
        self.conn = None
        self.cursor = None
    
    def connect(self):
        """连接数据库"""
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        # 启用外键约束
        self.cursor.execute('PRAGMA foreign_keys = ON')
    
    def close(self):
        """关闭数据库连接"""
        if self.conn:
            self.conn.close()
    
    def __enter__(self):
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
    
    # ==================== 查询操作 ====================
    
    def query_environments(self, env_type: Optional[str] = None, 
                          location: Optional[str] = None,
                          time_of_day: Optional[str] = None) -> List[Dict]:
        """查询环境场景"""
        query = 'SELECT * FROM environments WHERE 1=1'
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
        
        self.cursor.execute(query, params)
        columns = [desc[0] for desc in self.cursor.description]
        return [dict(zip(columns, row)) for row in self.cursor.fetchall()]
    
    def query_motions(self, motion_type: Optional[str] = None,
                     character_id: Optional[str] = None,
                     action_type: Optional[str] = None) -> List[Dict]:
        """查询动作"""
        query = 'SELECT * FROM motions WHERE 1=1'
        params = []
        
        if motion_type:
            query += ' AND motion_type = ?'
            params.append(motion_type)
        if character_id:
            query += ' AND character_id = ?'
            params.append(character_id)
        if action_type:
            query += ' AND action_type = ?'
            params.append(action_type)
        
        self.cursor.execute(query, params)
        columns = [desc[0] for desc in self.cursor.description]
        return [dict(zip(columns, row)) for row in self.cursor.fetchall()]
    
    def query_models(self, model_type: Optional[str] = None,
                    character_id: Optional[str] = None) -> List[Dict]:
        """查询模型（仅返回白名单角色）"""
        query = 'SELECT * FROM models WHERE 1=1'
        params = []
        
        # 添加角色白名单过滤
        placeholders = ','.join('?' * len(self.ALLOWED_CHARACTERS))
        query += f' AND (character_id IS NULL OR character_id IN ({placeholders}))'
        params.extend(self.ALLOWED_CHARACTERS)
        
        if model_type:
            query += ' AND model_type = ?'
            params.append(model_type)
        if character_id:
            query += ' AND character_id = ?'
            params.append(character_id)
        
        self.cursor.execute(query, params)
        columns = [desc[0] for desc in self.cursor.description]
        return [dict(zip(columns, row)) for row in self.cursor.fetchall()]
    
    def query_audio(self, audio_type: Optional[str] = None,
                   character_id: Optional[str] = None) -> List[Dict]:
        """查询音频"""
        query = 'SELECT * FROM audio_files WHERE 1=1'
        params = []
        
        if audio_type:
            query += ' AND audio_type = ?'
            params.append(audio_type)
        if character_id:
            query += ' AND character_id = ?'
            params.append(character_id)
        
        self.cursor.execute(query, params)
        columns = [desc[0] for desc in self.cursor.description]
        return [dict(zip(columns, row)) for row in self.cursor.fetchall()]
    
    def search_by_keyword(self, keyword: str, table: Optional[str] = None) -> Dict[str, List[Dict]]:
        """关键词搜索"""
        results = {}
        
        tables_to_search = []
        if table:
            tables_to_search = [table]
        else:
            tables_to_search = ['environments', 'motions', 'models', 'audio_files']
        
        for tbl in tables_to_search:
            query = f'SELECT * FROM {tbl} WHERE '
            
            if tbl == 'environments':
                query += f"env_name LIKE ? OR location LIKE ?"
                params = [f'%{keyword}%', f'%{keyword}%']
            elif tbl == 'motions':
                query += f"motion_name LIKE ? OR action_type LIKE ?"
                params = [f'%{keyword}%', f'%{keyword}%']
            elif tbl == 'models':
                query += f"model_name LIKE ?"
                params = [f'%{keyword}%']
            elif tbl == 'audio_files':
                query += f"audio_name LIKE ?"
                params = [f'%{keyword}%']
            
            self.cursor.execute(query, params)
            columns = [desc[0] for desc in self.cursor.description]
            results[tbl] = [dict(zip(columns, row)) for row in self.cursor.fetchall()]
        
        return results
    
    def get_character_resources(self, character_id: str) -> Dict:
        """获取角色的所有资源"""
        resources = {
            'character_id': character_id,
            'motions': [],
            'models': [],
            'audio': [],
            'legacy_resources': []
        }
        
        # 查询动作
        resources['motions'] = self.query_motions(character_id=character_id)
        
        # 查询模型
        resources['models'] = self.query_models(character_id=character_id)
        
        # 查询音频
        resources['audio'] = self.query_audio(character_id=character_id)
        
        # 查询旧的resources表
        self.cursor.execute('''
            SELECT resource_type, resource_name 
            FROM resources 
            WHERE character_id = ?
        ''', (character_id,))
        columns = [desc[0] for desc in self.cursor.description]
        resources['legacy_resources'] = [dict(zip(columns, row)) for row in self.cursor.fetchall()]
        
        return resources
    
    # ==================== 添加操作 ====================
    
    def add_environment(self, env_name: str, env_type: str, 
                       location: Optional[str] = None,
                       time_of_day: Optional[str] = None) -> int:
        """添加环境场景"""
        self.cursor.execute('''
            INSERT INTO environments (env_name, env_type, location, time_of_day)
            VALUES (?, ?, ?, ?)
        ''', (env_name, env_type, location, time_of_day))
        self.conn.commit()
        return self.cursor.lastrowid
    
    def add_motion(self, motion_name: str, motion_type: str,
                  character_id: Optional[str] = None,
                  action_type: Optional[str] = None) -> int:
        """添加动作"""
        self.cursor.execute('''
            INSERT INTO motions (motion_name, motion_type, character_id, action_type)
            VALUES (?, ?, ?, ?)
        ''', (motion_name, motion_type, character_id, action_type))
        self.conn.commit()
        return self.cursor.lastrowid
    
    def add_model(self, model_name: str, model_type: str,
                 character_id: Optional[str] = None) -> int:
        """添加模型"""
        self.cursor.execute('''
            INSERT INTO models (model_name, model_type, character_id)
            VALUES (?, ?, ?)
        ''', (model_name, model_type, character_id))
        self.conn.commit()
        return self.cursor.lastrowid
    
    def add_audio(self, audio_name: str, audio_type: str,
                 character_id: Optional[str] = None) -> int:
        """添加音频"""
        self.cursor.execute('''
            INSERT INTO audio_files (audio_name, audio_type, character_id)
            VALUES (?, ?, ?)
        ''', (audio_name, audio_type, character_id))
        self.conn.commit()
        return self.cursor.lastrowid
    
    # ==================== 更新操作 ====================
    
    def update_environment(self, env_id: int, **kwargs):
        """更新环境场景"""
        allowed_fields = ['env_name', 'env_type', 'location', 'time_of_day']
        updates = []
        params = []
        
        for field, value in kwargs.items():
            if field in allowed_fields and value is not None:
                updates.append(f'{field} = ?')
                params.append(value)
        
        if updates:
            params.append(env_id)
            query = f"UPDATE environments SET {', '.join(updates)} WHERE id = ?"
            self.cursor.execute(query, params)
            self.conn.commit()
            return self.cursor.rowcount
        return 0
    
    def update_motion(self, motion_id: int, **kwargs):
        """更新动作"""
        allowed_fields = ['motion_name', 'motion_type', 'character_id', 'action_type']
        updates = []
        params = []
        
        for field, value in kwargs.items():
            if field in allowed_fields and value is not None:
                updates.append(f'{field} = ?')
                params.append(value)
        
        if updates:
            params.append(motion_id)
            query = f"UPDATE motions SET {', '.join(updates)} WHERE id = ?"
            self.cursor.execute(query, params)
            self.conn.commit()
            return self.cursor.rowcount
        return 0
    
    def update_model(self, model_id: int, **kwargs):
        """更新模型"""
        allowed_fields = ['model_name', 'model_type', 'character_id']
        updates = []
        params = []
        
        for field, value in kwargs.items():
            if field in allowed_fields and value is not None:
                updates.append(f'{field} = ?')
                params.append(value)
        
        if updates:
            params.append(model_id)
            query = f"UPDATE models SET {', '.join(updates)} WHERE id = ?"
            self.cursor.execute(query, params)
            self.conn.commit()
            return self.cursor.rowcount
        return 0
    
    def update_audio(self, audio_id: int, **kwargs):
        """更新音频"""
        allowed_fields = ['audio_name', 'audio_type', 'character_id']
        updates = []
        params = []
        
        for field, value in kwargs.items():
            if field in allowed_fields and value is not None:
                updates.append(f'{field} = ?')
                params.append(value)
        
        if updates:
            params.append(audio_id)
            query = f"UPDATE audio_files SET {', '.join(updates)} WHERE id = ?"
            self.cursor.execute(query, params)
            self.conn.commit()
            return self.cursor.rowcount
        return 0
    
    # ==================== 删除操作 ====================
    
    def delete_environment(self, env_id: int) -> int:
        """删除环境场景"""
        self.cursor.execute('DELETE FROM environments WHERE id = ?', (env_id,))
        self.conn.commit()
        return self.cursor.rowcount
    
    def delete_motion(self, motion_id: int) -> int:
        """删除动作"""
        self.cursor.execute('DELETE FROM motions WHERE id = ?', (motion_id,))
        self.conn.commit()
        return self.cursor.rowcount
    
    def delete_model(self, model_id: int) -> int:
        """删除模型"""
        self.cursor.execute('DELETE FROM models WHERE id = ?', (model_id,))
        self.conn.commit()
        return self.cursor.rowcount
    
    def delete_audio(self, audio_id: int) -> int:
        """删除音频"""
        self.cursor.execute('DELETE FROM audio_files WHERE id = ?', (audio_id,))
        self.conn.commit()
        return self.cursor.rowcount


def print_results(results, title: str = "查询结果"):
    """打印查询结果"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    
    if isinstance(results, list):
        if not results:
            print("  (无结果)")
            return
        
        for i, item in enumerate(results, 1):
            print(f"\n[{i}]")
            for key, value in item.items():
                if key not in ['created_at', 'updated_at']:
                    print(f"  {key:15} {value}")
    
    elif isinstance(results, dict):
        for category, items in results.items():
            if items:
                print(f"\n--- {category} ({len(items)} 条) ---")
                for i, item in enumerate(items[:5], 1):  # 只显示前5条
                    print(f"  [{i}] {list(item.values())[1]}")  # 显示名称字段
                if len(items) > 5:
                    print(f"  ... 还有 {len(items) - 5} 条")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='资源数据库 CRUD 操作')
    parser.add_argument('--db', default='character_resources.db', help='数据库文件路径')
    
    # 查询操作
    query_group = parser.add_argument_group('查询操作')
    query_group.add_argument('--query-env', action='store_true', help='查询环境场景')
    query_group.add_argument('--query-motion', action='store_true', help='查询动作')
    query_group.add_argument('--query-model', action='store_true', help='查询模型')
    query_group.add_argument('--query-audio', action='store_true', help='查询音频')
    query_group.add_argument('--character', type=str, help='角色ID')
    query_group.add_argument('--type', type=str, help='资源类型')
    query_group.add_argument('--search', type=str, help='关键词搜索')
    query_group.add_argument('--character-all', type=str, help='查询角色的所有资源')
    
    # 添加操作
    add_group = parser.add_argument_group('添加操作')
    add_group.add_argument('--add-env', nargs=2, metavar=('NAME', 'TYPE'), help='添加环境 (名称 类型)')
    add_group.add_argument('--add-motion', nargs=2, metavar=('NAME', 'TYPE'), help='添加动作 (名称 类型)')
    add_group.add_argument('--add-model', nargs=2, metavar=('NAME', 'TYPE'), help='添加模型 (名称 类型)')
    add_group.add_argument('--add-audio', nargs=2, metavar=('NAME', 'TYPE'), help='添加音频 (名称 类型)')
    
    # 更新操作
    update_group = parser.add_argument_group('更新操作')
    update_group.add_argument('--update-env', type=int, metavar='ID', help='更新环境ID')
    update_group.add_argument('--update-motion', type=int, metavar='ID', help='更新动作ID')
    update_group.add_argument('--update-model', type=int, metavar='ID', help='更新模型ID')
    update_group.add_argument('--update-audio', type=int, metavar='ID', help='更新音频ID')
    update_group.add_argument('--set-field', nargs=2, action='append', metavar=('FIELD', 'VALUE'), 
                            help='设置字段值 (可多次使用)')
    
    # 删除操作
    delete_group = parser.add_argument_group('删除操作')
    delete_group.add_argument('--delete-env', type=int, metavar='ID', help='删除环境ID')
    delete_group.add_argument('--delete-motion', type=int, metavar='ID', help='删除动作ID')
    delete_group.add_argument('--delete-model', type=int, metavar='ID', help='删除模型ID')
    delete_group.add_argument('--delete-audio', type=int, metavar='ID', help='删除音频ID')
    
    args = parser.parse_args()
    
    with ResourceCRUD(args.db) as crud:
        # 查询操作
        if args.query_env:
            results = crud.query_environments(env_type=args.type)
            print_results(results, "环境场景查询")
        
        elif args.query_motion:
            results = crud.query_motions(
                motion_type=args.type,
                character_id=args.character
            )
            print_results(results, "动作查询")
        
        elif args.query_model:
            results = crud.query_models(
                model_type=args.type,
                character_id=args.character
            )
            print_results(results, "模型查询")
        
        elif args.query_audio:
            results = crud.query_audio(
                audio_type=args.type,
                character_id=args.character
            )
            print_results(results, "音频查询")
        
        elif args.search:
            results = crud.search_by_keyword(args.search)
            print_results(results, f"关键词搜索: {args.search}")
        
        elif args.character_all:
            results = crud.get_character_resources(args.character_all)
            print(f"\n角色 '{args.character_all}' 的所有资源:")
            print(json.dumps(results, indent=2, ensure_ascii=False))
        
        # 添加操作
        elif args.add_env:
            env_id = crud.add_environment(args.add_env[0], args.add_env[1])
            print(f"✓ 已添加环境，ID: {env_id}")
        
        elif args.add_motion:
            motion_id = crud.add_motion(args.add_motion[0], args.add_motion[1], 
                                       character_id=args.character)
            print(f"✓ 已添加动作，ID: {motion_id}")
        
        elif args.add_model:
            model_id = crud.add_model(args.add_model[0], args.add_model[1],
                                     character_id=args.character)
            print(f"✓ 已添加模型，ID: {model_id}")
        
        elif args.add_audio:
            audio_id = crud.add_audio(args.add_audio[0], args.add_audio[1],
                                     character_id=args.character)
            print(f"✓ 已添加音频，ID: {audio_id}")
        
        # 更新操作
        elif args.update_env and args.set_field:
            fields = {field: value for field, value in args.set_field}
            count = crud.update_environment(args.update_env, **fields)
            print(f"✓ 已更新 {count} 条记录")
        
        elif args.update_motion and args.set_field:
            fields = {field: value for field, value in args.set_field}
            count = crud.update_motion(args.update_motion, **fields)
            print(f"✓ 已更新 {count} 条记录")
        
        elif args.update_model and args.set_field:
            fields = {field: value for field, value in args.set_field}
            count = crud.update_model(args.update_model, **fields)
            print(f"✓ 已更新 {count} 条记录")
        
        elif args.update_audio and args.set_field:
            fields = {field: value for field, value in args.set_field}
            count = crud.update_audio(args.update_audio, **fields)
            print(f"✓ 已更新 {count} 条记录")
        
        # 删除操作
        elif args.delete_env:
            count = crud.delete_environment(args.delete_env)
            print(f"✓ 已删除 {count} 条记录")
        
        elif args.delete_motion:
            count = crud.delete_motion(args.delete_motion)
            print(f"✓ 已删除 {count} 条记录")
        
        elif args.delete_model:
            count = crud.delete_model(args.delete_model)
            print(f"✓ 已删除 {count} 条记录")
        
        elif args.delete_audio:
            count = crud.delete_audio(args.delete_audio)
            print(f"✓ 已删除 {count} 条记录")
        
        else:
            parser.print_help()


if __name__ == '__main__':
    main()
