#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

with open('style.css', encoding='utf-8') as f:
    css = f.read()

# Step 1: Fix the broken .chat-date + .chat-area sequence
# The pattern is: .chat-date {\n.chat-area { ... }\n.chat-area { ... }\n\n.chat-date { ... }
# We want to keep just one .chat-date and remove the duplicate .chat-area blocks

# First, normalize line endings
css = css.replace('\r\n', '\n')

# Fix 1: Remove all duplicate .chat-area blocks, keep only the first one
lines = css.split('\n')
result_lines = []
i = 0
seen_chat_area = False
seen_phone_scroll = False

while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    
    # Skip duplicate .phone-scroll blocks
    if stripped == '.phone-scroll {':
        if seen_phone_scroll:
            # Skip this block until closing brace
            brace_count = 1
            i += 1
            while i < len(lines) and brace_count > 0:
                if '{' in lines[i]: brace_count += lines[i].count('{')
                if '}' in lines[i]: brace_count -= lines[i].count('}')
                i += 1
            continue
        else:
            seen_phone_scroll = True
    
    # Skip duplicate .chat-area blocks  
    if stripped == '.chat-area {':
        if seen_chat_area:
            # Skip this block until closing brace
            brace_count = 1
            i += 1
            while i < len(lines) and brace_count > 0:
                if '{' in lines[i]: brace_count += lines[i].count('{')
                if '}' in lines[i]: brace_count -= lines[i].count('}')
                i += 1
            continue
        else:
            seen_chat_area = True
    
    result_lines.append(line)
    i += 1

css = '\n'.join(result_lines)

# Fix 2: Fix the broken .ai-msg block
# Find: .ai-msg {\n  align-self: flex-start;\n  margin-right: auto;\n}\n  display: flex;\n  gap: 8px;\n...
# Replace with: .ai-msg {\n  align-self: flex-start;\n  margin-right: auto;\n  display: flex;\n  gap: 8px;\n...
css = re.sub(
    r'\.ai-msg \{\s*\n\s*align-self:\s*flex-start;\s*\n\s*margin-right:\s*auto;\s*\n\}\s*\n\s*display:\s*flex;\s*\n\s*gap:\s*8px;\s*\n\s*opacity:\s*0;\s*\n\s*transform:\s*translateY\(10px\);\s*\n\s*animation:\s*none;\s*\n\}',
    '.ai-msg {\n  align-self: flex-start;\n  margin-right: auto;\n  display: flex;\n  gap: 8px;\n  opacity: 0;\n  transform: translateY(10px);\n  animation: none;\n}',
    css
)

# Fix 3: Remove any standalone duplicate .chat-date blocks (keep first one)
pattern = r'(\.chat-date \{\s*\n\s*text-align:\s*center;\s*\n\s*font-size:\s*11px;\s*\n\s*color:\s*var\(--text-lighter\);\s*\n\s*margin-bottom:\s*4px;\s*\n\})'
matches = list(re.finditer(pattern, css))
if len(matches) > 1:
    # Remove all but the first
    for m in reversed(matches[1:]):
        css = css[:m.start()] + css[m.end():]

# Fix 4: Clean up any .chat-msg that got corrupted by earlier edits
# Ensure .chat-msg has proper content
css = re.sub(
    r'\.chat-msg \{\s*\n\s*text-align:\s*center;\s*\n\s*font-size:\s*11px;\s*\n\s*color:\s*var\(--text-lighter\);\s*\n\s*margin-bottom:\s*4px;\s*\n\}',
    '',
    css
)

# Fix 5: Ensure .chat-msg block exists properly after .chat-date
if '.chat-msg {' not in css:
    # Insert it after the first .chat-date block
    css = re.sub(
        r'(\.chat-date \{[^}]+\})',
        r'\1\n\n.chat-msg {\n  display: flex;\n  gap: 8px;\n  opacity: 0;\n  transform: translateY(10px);\n  animation: none;\n  width: max-content;\n  max-width: 100%;\n}',
        css,
        count=1
    )

# Fix 6: Remove extra blank lines (more than 2 consecutive)
css = re.sub(r'\n{4,}', '\n\n\n', css)

# Fix 7: Remove any trailing spaces
css = '\n'.join(line.rstrip() for line in css.split('\n'))

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('CSS fixed successfully')
