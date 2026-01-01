#!/usr/bin/env python3
"""
分析游戏ADV文件中的actorfacialoverridemotion index使用频率
"""
import re
import json
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Tuple

def parse_facial_motion_line(line: str) -> Tuple[List[Dict], float]:
    """从一行中提取所有facial motion数据"""
    results = []
    duration = 0.0
    
    # 简化的index提取 - 直接用正则匹配"index":数字
    index_pattern = r'"index":(\d+)'
    value_pattern = r'"index":\d+,"value":([-\d.]+)'
    
    # 查找所有index
    indices = re.findall(index_pattern, line)
    
    # 对每个index，尝试找到对应的value
    for idx_str in indices:
        idx = int(idx_str)
        
        # 在index附近找value
        # 格式: "index":22,"value":1.0
        value_match = re.search(rf'"index":{idx},"value":([-\d.]+)', line)
        value = float(value_match.group(1)) if value_match else 1.0
        
        results.append({
            'index': idx,
            'value': value
        })
    
    # 提取duration
    duration_pattern = r'"_duration":([\d.]+)'
    duration_match = re.search(duration_pattern, line)
    duration = float(duration_match.group(1)) if duration_match else 0.0
    
    return results, duration

def analyze_resource_files(resource_dir: str) -> Dict:
    """分析所有资源文件"""
    resource_path = Path(resource_dir)
    
    # 统计数据
    index_count = Counter()  # 每个index出现的次数
    index_durations = defaultdict(list)  # 每个index对应的持续时间列表
    index_values = defaultdict(list)  # 每个index对应的value列表
    index_contexts = defaultdict(list)  # 每个index的使用上下文(文件名+行号)
    index_combinations = Counter()  # index组合出现的频率
    
    # 遍历所有txt文件
    txt_files = list(resource_path.glob('*.txt'))
    print(f"找到 {len(txt_files)} 个ADV文件")
    
    for txt_file in txt_files:
        try:
            with open(txt_file, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    if 'actorfacialoverridemotion' in line:
                        indices_data, duration = parse_facial_motion_line(line)
                        
                        if not indices_data:
                            continue
                        
                        # 提取这一行用到的所有indices
                        line_indices = []
                        for data in indices_data:
                            idx = data['index']
                            val = data['value']
                            
                            index_count[idx] += 1
                            index_durations[idx].append(duration)
                            index_values[idx].append(val)
                            index_contexts[idx].append(f"{txt_file.name}:{line_num}")
                            line_indices.append(idx)
                        
                        # 记录index组合（排序后）
                        if len(line_indices) > 1:
                            combo = tuple(sorted(line_indices))
                            index_combinations[combo] += 1
        
        except Exception as e:
            print(f"处理 {txt_file.name} 时出错: {e}")
    
    return {
        'count': index_count,
        'durations': index_durations,
        'values': index_values,
        'contexts': index_contexts,
        'combinations': index_combinations
    }

def format_duration_stats(durations: List[float]) -> str:
    """格式化持续时间统计信息"""
    if not durations:
        return "无数据"
    
    avg = sum(durations) / len(durations)
    min_d = min(durations)
    max_d = max(durations)
    
    # 分类
    short = [d for d in durations if d < 1.0]
    medium = [d for d in durations if 1.0 <= d < 5.0]
    long = [d for d in durations if d >= 5.0]
    
    return f"平均{avg:.2f}s (最短{min_d:.2f}s, 最长{max_d:.2f}s) [<1s:{len(short)}, 1-5s:{len(medium)}, ≥5s:{len(long)}]"

def infer_index_meaning(idx: int, count: int, durations: List[float], values: List[float]) -> str:
    """基于统计数据推断index含义"""
    avg_duration = sum(durations) / len(durations) if durations else 0
    most_common_value = max(set(values), key=values.count) if values else 1.0
    
    # 已知的index
    known = {
        22: "闭眼 (已确认)",
        20: "眨眼 (推测)",
    }
    
    if idx in known:
        return known[idx]
    
    # 基于持续时间推测
    if avg_duration < 0.5:
        return "快速动作 (眨眼/抽动类)"
    elif avg_duration < 2.0:
        return "短暂表情"
    elif avg_duration < 5.0:
        return "中等表情"
    else:
        return "持续表情"

def main():
    # 分析D:\GIT\gakumas-adv-tools\resource目录
    resource_dir = r"D:\GIT\gakumas-adv-tools\resource"
    
    print("="*80)
    print("面部动画Index使用频率统计分析")
    print("="*80)
    
    stats = analyze_resource_files(resource_dir)
    
    # 按出现频率排序
    sorted_indices = sorted(stats['count'].items(), key=lambda x: x[1], reverse=True)
    
    print(f"\n总共发现 {len(sorted_indices)} 个不同的 index 值\n")
    
    print("="*80)
    print("详细统计 (按使用频率排序)")
    print("="*80)
    print(f"{'Index':<8} {'使用次数':<10} {'持续时间统计':<60} {'推测含义'}")
    print("-"*140)
    
    for idx, count in sorted_indices:
        durations = stats['durations'][idx]
        values = stats['values'][idx]
        duration_str = format_duration_stats(durations)
        meaning = infer_index_meaning(idx, count, durations, values)
        
        print(f"{idx:<8} {count:<10} {duration_str:<60} {meaning}")
    
    # 常用组合分析
    print("\n" + "="*80)
    print("常见Index组合 (Top 20)")
    print("="*80)
    
    sorted_combos = sorted(stats['combinations'].items(), key=lambda x: x[1], reverse=True)[:20]
    for combo, count in sorted_combos:
        indices_str = ", ".join(str(i) for i in combo)
        print(f"[{indices_str}] 出现 {count} 次")
    
    # 生成实验建议
    print("\n" + "="*80)
    print("游戏内实验建议")
    print("="*80)
    
    print("\n【高优先级测试 - 高频使用】")
    for idx, count in sorted_indices[:10]:
        durations = stats['durations'][idx]
        avg_duration = sum(durations) / len(durations)
        contexts = stats['contexts'][idx][:3]  # 显示前3个示例
        
        print(f"\nIndex {idx}: 出现{count}次, 平均持续{avg_duration:.2f}秒")
        print(f"  推荐测试值: value=1.0, duration={avg_duration:.1f}s")
        print(f"  参考示例:")
        for ctx in contexts:
            print(f"    - {ctx}")
    
    print("\n【中优先级测试 - 特殊表情】")
    special_indices = [idx for idx, count in sorted_indices if 10 <= count < 30]
    for idx in special_indices[:5]:
        count = stats['count'][idx]
        print(f"  Index {idx}: 出现{count}次 - 可能是特定情感表情")
    
    print("\n【低优先级测试 - 罕见表情】")
    rare_indices = [idx for idx, count in sorted_indices if count < 10]
    print(f"  共{len(rare_indices)}个罕见index: {', '.join(str(i) for i in rare_indices[:10])}")
    
    # 导出详细数据供进一步分析
    print("\n" + "="*80)
    print("导出详细数据...")
    print("="*80)
    
    output_file = Path(resource_dir).parent / "facial_index_analysis.txt"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("="*80 + "\n")
        f.write("面部动画Index详细分析报告\n")
        f.write("="*80 + "\n\n")
        
        for idx, count in sorted_indices:
            f.write(f"\n{'='*60}\n")
            f.write(f"Index {idx}\n")
            f.write(f"{'='*60}\n")
            f.write(f"使用次数: {count}\n")
            
            durations = stats['durations'][idx]
            values = stats['values'][idx]
            f.write(f"持续时间: {format_duration_stats(durations)}\n")
            f.write(f"常用value值: {Counter(values).most_common(3)}\n")
            
            f.write(f"\n出现位置 (前10个):\n")
            for ctx in stats['contexts'][idx][:10]:
                f.write(f"  - {ctx}\n")
    
    print(f"✓ 详细报告已保存到: {output_file}")

if __name__ == "__main__":
    main()
