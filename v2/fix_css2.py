#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix duplicate CSS definitions in style.css"""

with open('style.css', encoding='utf-8') as f:
    lines = f.read().splitlines()

# Track which blocks we've seen
seen_blocks = set()
result = []
i = 0

while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    
    # Check if this is a block start we want to deduplicate
    is_dup_block = False
    for block_name in ['.phone-scroll {', '.chat-area {', '.chat-date {']:
        if stripped == block_name:
            if block_name in seen_blocks:
                is_dup_block = True
            else:
                seen_blocks.add(block_name)
            break
    
    if is_dup_block:
        # Skip until matching closing brace at start of line
        i += 1
        while i < len(lines):
            if lines[i].strip() == '}':
                i += 1
                break
            i += 1
        continue
    
    result.append(line)
    i += 1

css = '\n'.join(result)

# Fix 2: Fix the broken .ai-msg block
# Pattern: .ai-msg {\n  align-self: flex-start;\n  margin-right: auto;\n}\n  display: flex;\n...
css = css.replace(
    """.ai-msg {
  align-self: flex-start;
  margin-right: auto;
}
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(10px);
  animation: none;
}""",
    """.ai-msg {
  align-self: flex-start;
  margin-right: auto;
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(10px);
  animation: none;
}"""
)

# Fix 3: Remove extra blank lines
import re
css = re.sub(r'\n{4,}', '\n\n\n', css)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('CSS fixed')
