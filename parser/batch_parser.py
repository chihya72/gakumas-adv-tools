"""
批量解析所有脚本文件
"""

import sys
from pathlib import Path
from parser import ADVScriptParser
import json
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed
import traceback


class BatchParser:
    """批量解析器"""
    
    def __init__(self, resource_dir: Path, output_dir: Path):
        self.resource_dir = Path(resource_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.stats = {
            'total': 0,
            'success': 0,
            'failed': 0,
            'errors': []
        }
    
    def parse_single_file(self, file_path: Path) -> dict:
        """解析单个文件"""
        try:
            parser = ADVScriptParser()
            commands = parser.parse_file(file_path)
            summary = parser.get_timeline_summary()
            messages = parser.get_messages()
            
            # 保存JSON
            output_file = self.output_dir / f"{file_path.stem}.json"
            parser.export_to_json(output_file)
            
            return {
                'success': True,
                'file': file_path.name,
                'commands': len(commands),
                'duration': summary.get('duration', 0),
                'messages': len(messages)
            }
        except Exception as e:
            return {
                'success': False,
                'file': file_path.name,
                'error': str(e),
                'traceback': traceback.format_exc()
            }
    
    def parse_all(self, max_workers: int = 8):
        """并行解析所有文件"""
        # 获取所有txt文件
        txt_files = list(self.resource_dir.glob('*.txt'))
        self.stats['total'] = len(txt_files)
        
        print(f"📁 找到 {len(txt_files)} 个脚本文件")
        print(f"📂 输出目录: {self.output_dir}")
        print(f"🔧 使用 {max_workers} 个线程并行处理\n")
        
        results = []
        
        # 使用线程池并行处理
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # 提交所有任务
            futures = {executor.submit(self.parse_single_file, f): f for f in txt_files}
            
            # 使用tqdm显示进度
            with tqdm(total=len(txt_files), desc="解析进度", unit="文件") as pbar:
                for future in as_completed(futures):
                    result = future.result()
                    results.append(result)
                    
                    if result['success']:
                        self.stats['success'] += 1
                    else:
                        self.stats['failed'] += 1
                        self.stats['errors'].append({
                            'file': result['file'],
                            'error': result['error']
                        })
                    
                    pbar.update(1)
        
        return results
    
    def generate_report(self, results: list):
        """生成分析报告"""
        report = {
            'statistics': self.stats,
            'files': results
        }
        
        # 保存报告
        report_file = self.output_dir / '_batch_report.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        # 生成可读报告
        readable_report = self.output_dir / '_batch_report.txt'
        with open(readable_report, 'w', encoding='utf-8') as f:
            f.write("=" * 60 + "\n")
            f.write("Unity ADV 脚本批量解析报告\n")
            f.write("=" * 60 + "\n\n")
            
            f.write(f"总文件数: {self.stats['total']}\n")
            f.write(f"成功: {self.stats['success']}\n")
            f.write(f"失败: {self.stats['failed']}\n")
            f.write(f"成功率: {self.stats['success']/self.stats['total']*100:.2f}%\n\n")
            
            if self.stats['errors']:
                f.write("=" * 60 + "\n")
                f.write("错误列表:\n")
                f.write("=" * 60 + "\n")
                for error in self.stats['errors'][:10]:  # 只显示前10个错误
                    f.write(f"\n文件: {error['file']}\n")
                    f.write(f"错误: {error['error']}\n")
            
            # 统计信息
            f.write("\n" + "=" * 60 + "\n")
            f.write("统计信息:\n")
            f.write("=" * 60 + "\n")
            
            total_commands = sum(r.get('commands', 0) for r in results if r['success'])
            total_duration = sum(r.get('duration', 0) for r in results if r['success'])
            total_messages = sum(r.get('messages', 0) for r in results if r['success'])
            
            f.write(f"总命令数: {total_commands:,}\n")
            f.write(f"总时长: {total_duration:,.2f} 秒 ({total_duration/60:.2f} 分钟)\n")
            f.write(f"总对话数: {total_messages:,}\n")
            
            if self.stats['success'] > 0:
                f.write(f"平均每个脚本命令数: {total_commands/self.stats['success']:.1f}\n")
                f.write(f"平均每个脚本时长: {total_duration/self.stats['success']:.1f} 秒\n")
        
        print(f"\n✓ 报告已生成:")
        print(f"  - JSON: {report_file}")
        print(f"  - TXT: {readable_report}")
        
        return report
    
    def print_summary(self):
        """打印摘要"""
        print("\n" + "=" * 60)
        print("解析完成!")
        print("=" * 60)
        print(f"总文件数: {self.stats['total']}")
        print(f"成功: {self.stats['success']} ✓")
        print(f"失败: {self.stats['failed']} ✗")
        print(f"成功率: {self.stats['success']/self.stats['total']*100:.2f}%")


def main():
    # 配置路径 - 使用 submodule 数据源
    resource_dir = Path(__file__).parent.parent / "gakumas-data" / "data"
    output_dir = Path(__file__).parent.parent / "output"
    
    # 创建批量解析器
    batch_parser = BatchParser(resource_dir, output_dir)
    
    # 解析所有文件
    results = batch_parser.parse_all(max_workers=8)
    
    # 生成报告
    batch_parser.generate_report(results)
    
    # 打印摘要
    batch_parser.print_summary()


if __name__ == "__main__":
    main()
