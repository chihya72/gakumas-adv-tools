"""
快速示例：资源数据库常用操作
演示查询、添加、更新、删除等功能
"""

from resource_crud import ResourceCRUD
import json


def example_queries():
    """查询示例"""
    print("\n" + "="*60)
    print("查询示例")
    print("="*60)
    
    with ResourceCRUD() as crud:
        # 1. 查询2D环境场景
        print("\n1. 查询所有2D夜晚场景:")
        envs = crud.query_environments(env_type='2d', time_of_day='night')
        for env in envs[:3]:
            print(f"  - {env['env_name']}")
        print(f"  ... 共 {len(envs)} 个")
        
        # 2. 查询角色amao的动作
        print("\n2. 查询角色amao的表情动作:")
        motions = crud.query_motions(character_id='amao', action_type='facial')
        for motion in motions[:3]:
            print(f"  - {motion['motion_name']}")
        print(f"  ... 共 {len(motions)} 个")
        
        # 3. 查询body模型
        print("\n3. 查询所有body模型:")
        models = crud.query_models(model_type='body')
        for model in models[:3]:
            print(f"  - {model['model_name']} ({model['character_id']})")
        print(f"  ... 共 {len(models)} 个")
        
        # 4. 关键词搜索
        print("\n4. 搜索包含'glad'的资源:")
        results = crud.search_by_keyword('glad')
        for category, items in results.items():
            if items:
                print(f"  {category}: {len(items)} 个")


def example_character_resources():
    """查询角色所有资源"""
    print("\n" + "="*60)
    print("查询角色所有资源")
    print("="*60)
    
    with ResourceCRUD() as crud:
        char_id = 'fktn'
        print(f"\n查询角色 '{char_id}' 的所有资源:")
        
        resources = crud.get_character_resources(char_id)
        
        print(f"  动作: {len(resources['motions'])} 个")
        print(f"  模型: {len(resources['models'])} 个")
        print(f"  音频: {len(resources['audio'])} 个")
        print(f"  旧版资源: {len(resources['legacy_resources'])} 个")
        
        # 显示部分动作
        if resources['motions']:
            print(f"\n  示例动作:")
            for motion in resources['motions'][:3]:
                print(f"    - {motion['motion_name']}")


def example_add():
    """添加示例"""
    print("\n" + "="*60)
    print("添加示例")
    print("="*60)
    
    with ResourceCRUD() as crud:
        # 添加测试环境
        print("\n1. 添加测试环境...")
        try:
            env_id = crud.add_environment(
                'env_2d_test_custom-00-noon',
                '2d',
                location='test',
                time_of_day='noon'
            )
            print(f"  ✓ 添加成功，ID: {env_id}")
        except Exception as e:
            print(f"  (已存在或错误: {e})")
        
        # 添加测试动作
        print("\n2. 添加测试动作...")
        try:
            motion_id = crud.add_motion(
                'mot_test_custom_action-001_in',
                'character',
                character_id='amao',
                action_type='test'
            )
            print(f"  ✓ 添加成功，ID: {motion_id}")
        except Exception as e:
            print(f"  (已存在或错误: {e})")


def example_update():
    """更新示例"""
    print("\n" + "="*60)
    print("更新示例")
    print("="*60)
    
    with ResourceCRUD() as crud:
        # 查找测试环境
        envs = crud.query_environments(env_type='2d')
        if envs:
            test_env = next((e for e in envs if 'test' in e['env_name']), None)
            
            if test_env:
                print(f"\n更新环境 ID {test_env['id']}...")
                print(f"  原: {test_env['location']} / {test_env['time_of_day']}")
                
                count = crud.update_environment(
                    test_env['id'],
                    location='updated_test',
                    time_of_day='evening'
                )
                
                if count > 0:
                    print(f"  ✓ 更新成功")
                    
                    # 重新查询验证
                    updated = crud.query_environments(env_type='2d')
                    updated_env = next((e for e in updated if e['id'] == test_env['id']), None)
                    if updated_env:
                        print(f"  新: {updated_env['location']} / {updated_env['time_of_day']}")
            else:
                print("  (找不到测试环境)")


def example_delete():
    """删除示例"""
    print("\n" + "="*60)
    print("删除示例")
    print("="*60)
    
    with ResourceCRUD() as crud:
        # 查找测试资源
        envs = crud.query_environments(env_type='2d')
        test_envs = [e for e in envs if 'test' in e['env_name']]
        
        if test_envs:
            print(f"\n找到 {len(test_envs)} 个测试环境")
            for env in test_envs:
                print(f"  - ID {env['id']}: {env['env_name']}")
                count = crud.delete_environment(env['id'])
                print(f"    ✓ 已删除")
        else:
            print("\n(没有找到测试环境)")
        
        # 删除测试动作
        motions = crud.query_motions(motion_type='character')
        test_motions = [m for m in motions if 'test' in m['motion_name']]
        
        if test_motions:
            print(f"\n找到 {len(test_motions)} 个测试动作")
            for motion in test_motions:
                print(f"  - ID {motion['id']}: {motion['motion_name']}")
                count = crud.delete_motion(motion['id'])
                print(f"    ✓ 已删除")
        else:
            print("\n(没有找到测试动作)")


def example_statistics():
    """统计示例"""
    print("\n" + "="*60)
    print("统计示例")
    print("="*60)
    
    with ResourceCRUD() as crud:
        # 统计各类型资源数量
        print("\n资源类型统计:")
        
        crud.cursor.execute('SELECT env_type, COUNT(*) FROM environments GROUP BY env_type')
        print("\n环境场景:")
        for row in crud.cursor.fetchall():
            print(f"  {row[0]}: {row[1]} 个")
        
        crud.cursor.execute('SELECT motion_type, COUNT(*) FROM motions GROUP BY motion_type')
        print("\n动作类型:")
        for row in crud.cursor.fetchall():
            print(f"  {row[0]}: {row[1]} 个")
        
        crud.cursor.execute('SELECT model_type, COUNT(*) FROM models GROUP BY model_type')
        print("\n模型类型:")
        for row in crud.cursor.fetchall():
            print(f"  {row[0]}: {row[1]} 个")
        
        # 统计每个角色的资源数量
        print("\n角色资源统计 (前5名):")
        crud.cursor.execute('''
            SELECT character_id, COUNT(*) as count
            FROM (
                SELECT character_id FROM motions WHERE character_id IS NOT NULL
                UNION ALL
                SELECT character_id FROM models WHERE character_id IS NOT NULL
                UNION ALL
                SELECT character_id FROM audio_files WHERE character_id IS NOT NULL
            )
            GROUP BY character_id
            ORDER BY count DESC
            LIMIT 5
        ''')
        for row in crud.cursor.fetchall():
            print(f"  {row[0]}: {row[1]} 个资源")


def main():
    """运行所有示例"""
    print("\n" + "="*60)
    print("资源数据库操作示例")
    print("="*60)
    
    # 1. 查询示例
    example_queries()
    
    # 2. 角色资源查询
    example_character_resources()
    
    # 3. 统计示例
    example_statistics()
    
    # 4. 添加示例
    example_add()
    
    # 5. 更新示例
    example_update()
    
    # 6. 删除示例
    example_delete()
    
    print("\n" + "="*60)
    print("示例完成！")
    print("="*60)
    print("\n更多用法请参考:")
    print("  - DATABASE_USAGE.md")
    print("  - python resource_crud.py --help")
    print("  - python update_resource_database.py --help")


if __name__ == '__main__':
    main()
