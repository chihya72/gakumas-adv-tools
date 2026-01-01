"""
Unity ADV脚本解析器
解析类似 [command param=value] 格式的脚本文件
"""

import re
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict


@dataclass
class ClipData:
    """时间轴clip数据"""
    startTime: float
    duration: float
    clipIn: float
    easeInDuration: float
    easeOutDuration: float
    blendInDuration: float
    blendOutDuration: float
    mixInEaseType: int
    timeScale: float
    
    @classmethod
    def from_json_str(cls, json_str: str) -> 'ClipData':
        """从JSON字符串解析"""
        try:
            data = json.loads(json_str)
            return cls(
                startTime=data.get('_startTime', 0.0),
                duration=data.get('_duration', 0.0),
                clipIn=data.get('_clipIn', 0.0),
                easeInDuration=data.get('_easeInDuration', 0.0),
                easeOutDuration=data.get('_easeOutDuration', 0.0),
                blendInDuration=data.get('_blendInDuration', -1.0),
                blendOutDuration=data.get('_blendOutDuration', -1.0),
                mixInEaseType=data.get('_mixInEaseType', 1),
                timeScale=data.get('_timeScale', 1.0)
            )
        except (json.JSONDecodeError, KeyError):
            # 静默失败，返回默认值
            return cls(0, 0, 0, 0, 0, -1, -1, 1, 1.0)


@dataclass
class Command:
    """脚本命令"""
    command_type: str  # 命令类型，如 message, actormotion 等
    params: Dict[str, Any]  # 参数字典
    clip: Optional[ClipData]  # 时间轴数据
    raw_line: str  # 原始行
    
    def __repr__(self):
        return f"<Command {self.command_type} @ {self.clip.startTime if self.clip else 'N/A'}s>"


class ADVScriptParser:
    """ADV脚本解析器"""
    
    # 注意：不能用简单的正则匹配命令，因为参数值中可能包含未转义的]
    # 需要手动解析以正确处理嵌套括号
    # COMMAND_PATTERN = re.compile(r'\[([^\s\]]+)(.*?)\]', re.DOTALL)
    PARAM_PATTERN = re.compile(r'(\w+)=((?:[^=\s\[]|(?:\{[^}]*\})|(?:\[[^\]]*\]))+)')
    
    def __init__(self):
        self.commands: List[Command] = []
        
    def parse_file(self, file_path: Path) -> List[Command]:
        """解析单个脚本文件"""
        self.commands = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            # 尝试其他编码
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                content = f.read()
        
        # 手动查找所有命令（正确处理嵌套括号）
        i = 0
        while i < len(content):
            if content[i] == '[':
                # 找到命令开始
                start_pos = i
                i += 1
                
                # 提取命令类型（到第一个空格或]）
                command_start = i
                while i < len(content) and content[i] not in ' \t\n\r]':
                    i += 1
                command_type = content[command_start:i]
                
                # 跳过空白
                while i < len(content) and content[i] in ' \t\n\r':
                    i += 1
                
                # 提取参数直到找到匹配的]
                params_start = i
                depth = 1  # 已经遇到了开头的[
                escape_next = False
                
                while i < len(content) and depth > 0:
                    if escape_next:
                        escape_next = False
                        i += 1
                        continue
                    
                    char = content[i]
                    if char == '\\':
                        escape_next = True
                    elif char == '[':
                        depth += 1
                    elif char == ']':
                        depth -= 1
                        if depth == 0:
                            # 找到匹配的结束]
                            params_str = content[params_start:i].strip()
                            raw_line = content[start_pos:i+1]
                            
                            # 解析参数
                            params = self._parse_params(params_str)
                            
                            # 提取clip数据
                            clip_data = None
                            if 'clip' in params:
                                clip_str = params.pop('clip')
                                clip_data = ClipData.from_json_str(clip_str)
                            
                            command = Command(
                                command_type=command_type,
                                params=params,
                                clip=clip_data,
                                raw_line=raw_line
                            )
                            
                            self.commands.append(command)
                            break
                    i += 1
            else:
                i += 1
        
        return self.commands
    
    def _parse_params(self, params_str: str) -> Dict[str, Any]:
        """解析参数字符串"""
        params = {}
        
        # 找到所有参数名的位置（必须是空格或开头+参数名+等号的模式）
        param_positions = []
        # 第一个参数可能在字符串开头
        first_match = re.match(r'^(\w+)=', params_str)
        if first_match:
            param_positions.append((0, first_match.group(1)))
        
        # 后续参数必须在空格之后
        for match in re.finditer(r'\s+(\w+)=', params_str):
            # 确保不是在值的内部（比如 clip= 在 text 值里面）
            param_positions.append((match.start() + 1, match.group(1)))
        
        # 如果没有参数，返回空字典
        if not param_positions:
            return params
        
        # 解析每个参数
        for idx, (pos, key) in enumerate(param_positions):
            # 找到等号后的位置
            equal_pos = params_str.index('=', pos) + 1
            
            # 先检查是否是结构化值（JSON对象或数组）
            value_start = equal_pos
            while value_start < len(params_str) and params_str[value_start].isspace():
                value_start += 1
            
            # 如果是结构化值，使用 _extract_structured_value 来确定真实长度
            is_structured = False
            if value_start < len(params_str):
                # 先检查转义的括号（双字符）
                if params_str[value_start:value_start+2] in ('\\{', '\\['):
                    is_structured = True
                # 再检查普通括号（单字符）
                elif params_str[value_start] in ('{', '['):
                    is_structured = True
            
            if is_structured:
                value, consumed_length = self._extract_structured_value(params_str[value_start:], 0)
                params[key] = value
            else:
                # 普通值：确定值的结束位置
                if idx < len(param_positions) - 1:
                    # 下一个参数之前的位置（不包括前导空格）
                    next_param_start = param_positions[idx + 1][0]
                    # 回溯找到非空白字符的位置
                    end_pos = next_param_start
                    while end_pos > equal_pos and params_str[end_pos - 1].isspace():
                        end_pos -= 1
                    value_str = params_str[equal_pos:end_pos]
                else:
                    value_str = params_str[equal_pos:].strip()
                
                params[key] = value_str
        
        return params
    
    def _extract_structured_value(self, text: str, start: int) -> tuple[str, int]:
        """提取结构化值（JSON对象或数组）"""
        if start >= len(text):
            return "", 0
        
        # 处理转义的JSON（\{ 和 \}）
        if text[start:start+2] == '\\{' or text[start:start+2] == '\\[':
            # 这是转义的JSON，需要去除括号的反斜杠，但保留引号的转义
            open_char = text[start+1]
            close_char = '}' if open_char == '{' else ']'
            depth = 0
            i = start
            result = []
            
            while i < len(text):
                if i + 1 < len(text) and text[i] == '\\':
                    next_char = text[i+1]
                    if next_char in '{}[]':
                        # 转义的括号，去掉反斜杠
                        result.append(next_char)
                        if next_char == open_char:
                            depth += 1
                        elif next_char == close_char:
                            depth -= 1
                            if depth == 0:
                                return ''.join(result), i + 2 - start
                        i += 2
                    elif next_char == '"':
                        # 转义的引号，保留为正常引号（JSON需要）
                        result.append('"')
                        i += 2
                    elif next_char in 'rn':
                        # \r \n 保留转义
                        result.append('\\')
                        result.append(next_char)
                        i += 2
                    else:
                        # 其他转义，保留
                        result.append(text[i])
                        result.append(next_char)
                        i += 2
                else:
                    # 未转义的字符（包括未转义的括号）
                    char = text[i]
                    result.append(char)
                    # 未转义的括号也需要计入深度
                    if char == open_char:
                        depth += 1
                    elif char == close_char:
                        depth -= 1
                        if depth == 0:
                            return ''.join(result), i + 1 - start
                    i += 1
            
            return ''.join(result), len(text) - start
        
        # 普通的JSON（未转义）
        elif text[start] in '{[':
            open_char = text[start]
            close_char = '}' if open_char == '{' else ']'
            depth = 0
            i = start
            
            while i < len(text):
                if text[i] == '\\':
                    i += 2  # 跳过转义字符
                    continue
                elif text[i] == open_char:
                    depth += 1
                elif text[i] == close_char:
                    depth -= 1
                    if depth == 0:
                        return text[start:i+1], i + 1 - start
                i += 1
            
            return text[start:], len(text) - start
        
        return "", 0
    
    def get_commands_by_type(self, command_type: str) -> List[Command]:
        """获取特定类型的命令"""
        return [cmd for cmd in self.commands if cmd.command_type == command_type]
    
    def get_timeline_summary(self) -> Dict[str, Any]:
        """获取时间轴摘要"""
        if not self.commands:
            return {}
        
        commands_with_time = [cmd for cmd in self.commands if cmd.clip]
        
        if not commands_with_time:
            return {"total_commands": len(self.commands), "duration": 0}
        
        max_time = max(cmd.clip.startTime + cmd.clip.duration 
                      for cmd in commands_with_time)
        
        # 统计命令类型
        type_counts = {}
        for cmd in self.commands:
            type_counts[cmd.command_type] = type_counts.get(cmd.command_type, 0) + 1
        
        return {
            "total_commands": len(self.commands),
            "duration": max_time,
            "command_types": type_counts,
            "has_timeline": len(commands_with_time) > 0
        }
    
    def export_to_json(self, output_path: Path):
        """导出为JSON格式"""
        data = {
            "commands": [
                {
                    "type": cmd.command_type,
                    "params": self._clean_params(cmd.params),
                    "clip": asdict(cmd.clip) if cmd.clip else None
                }
                for cmd in self.commands
            ],
            "summary": self.get_timeline_summary()
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def _clean_params(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """清理参数：解析JSON字符串，移除重复字段"""
        cleaned = {}
        
        # 处理包含嵌套命令的参数（如 layouts, actors, backgrounds）
        nested_command_keys = ['layouts', 'actors', 'backgrounds']
        has_nested = any(k in params for k in nested_command_keys)
        
        for key, value in params.items():
            if isinstance(value, str):
                # 尝试解析JSON字符串
                if value.startswith('{'):
                    try:
                        parsed = json.loads(value)
                        cleaned[key] = parsed
                        continue
                    except json.JSONDecodeError:
                        pass
                elif value.startswith('[') and key not in nested_command_keys:
                    # 非嵌套命令的数组，尝试解析JSON
                    try:
                        parsed = json.loads(value)
                        cleaned[key] = parsed
                        continue
                    except json.JSONDecodeError:
                        pass
            
            # 保留原值
            cleaned[key] = value
        
        # 移除嵌套命令导致的重复参数
        # 例如：actorlayoutgroup的layouts="[actorlayout id=amao transform=\{...\}]"
        # 解析器错误地把 id 和 transform 也当成了 actorlayoutgroup 的参数
        if has_nested:
            # 只保留嵌套命令键
            nested_key = next((k for k in nested_command_keys if k in cleaned), None)
            if nested_key and isinstance(cleaned[nested_key], str):
                # 提取嵌套命令中的参数名
                nested_content = cleaned[nested_key]
                # 检测嵌套内容中的参数（如 id=, transform=）
                import re
                nested_params = set(re.findall(r'\s+(\w+)=', nested_content))
                
                # 移除与嵌套内容重复的参数
                for param_name in list(cleaned.keys()):
                    if param_name != nested_key and param_name in nested_params:
                        del cleaned[param_name]
        
        return cleaned
    
    def get_messages(self) -> List[Dict[str, Any]]:
        """提取所有对话消息"""
        messages = []
        for cmd in self.get_commands_by_type('message'):
            messages.append({
                'time': cmd.clip.startTime if cmd.clip else None,
                'text': cmd.params.get('text', ''),
                'name': cmd.params.get('name', ''),
                'se': cmd.params.get('se', ''),
            })
        return messages


def main():
    """测试解析器"""
    # 解析示例文件 - 使用 submodule 数据源
    current_file = Path(__file__).parent.parent / "gakumas-data" / "data" / "adv_cidol-amao-3-000_01.txt"
    
    parser = ADVScriptParser()
    commands = parser.parse_file(current_file)
    
    print(f"✓ 解析文件: {current_file.name}")
    print(f"✓ 命令总数: {len(commands)}")
    print(f"\n时间轴摘要:")
    summary = parser.get_timeline_summary()
    for key, value in summary.items():
        print(f"  {key}: {value}")
    
    print(f"\n对话消息 ({len(parser.get_messages())} 条):")
    for i, msg in enumerate(parser.get_messages()[:5], 1):
        print(f"  [{i}] {msg['time']:.2f}s - {msg['name']}: {msg['text'][:30]}...")
    
    # 导出JSON到项目根目录
    project_root = Path(__file__).parent.parent
    output_file = project_root / f"{current_file.stem}.json"
    parser.export_to_json(output_file)
    print(f"\n✓ 已导出JSON: {output_file}")


if __name__ == "__main__":
    main()
