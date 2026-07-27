#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix duplicate CSS definitions and syntax errors in style.css"""

with open('style.css', encoding='utf-8') as f:
    css = f.read()

# Step 1: Remove duplicate .phone-scroll blocks
# Keep the first one, remove the next two
import re

# Find all .phone-scroll blocks and remove extras
pattern = r'(\.phone-scroll \{[^}]+\})'
matches = list(re.finditer(pattern, css, re.DOTALL))
if len(matches) > 1:
    for m in reversed(matches[1:]):
        css = css[:m.start()] + css[m.end():]

# Step 2: Fix the broken .chat-date + .chat-area sequence
# Original broken pattern: .chat-date {\n.chat-area { ... }\n.chat-area { ... }\n\n.chat-date { ... }
# We need to keep one .chat-area and one .chat-date

# First remove the second .chat-date block and everything between first .chat-date and second .chat-date
# The first .chat-date is broken (no closing brace, followed by .chat-area)
# The second .chat-date is correct

# Find the broken sequence and replace with correct one
broken_pattern = r'\.chat-date \{\n\.chat-area \{[^}]+\}\n\.chat-area \{[^}]+\}\n\n\.chat-date \{[^}]+\}'
replacement = '''.chat-date {
  text-align: center;
  font-size: 11px;
  color: var(--text-lighter);
  margin-bottom: 4px;
}

.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  gap: 10px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}'''

css = re.sub(broken_pattern, replacement, css, flags=re.DOTALL)

# Step 3: Fix .ai-msg syntax error
broken_ai = """.ai-msg {
  align-self: flex-start;
  margin-right: auto;
}
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(10px);
  animation: none;
}"""

fixed_ai = """.ai-msg {
  align-self: flex-start;
  margin-right: auto;
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(10px);
  animation: none;
}"""

css = css.replace(broken_ai, fixed_ai)

# Step 4: Clean up extra blank lines
css = re.sub(r'\n{4,}', '\n\n\n', css)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('CSS fixed successfully')
