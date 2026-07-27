#!/usr/bin/env python3
with open('style.css', encoding='utf-8') as f:
    css = f.read()

# Replace duplicate "/* 今日提醒 */" - keep first, remove second
label = '/* 今日提醒 */'
first_pos = css.find(label)
if first_pos != -1:
    second_pos = css.find(label, first_pos + len(label))
    if second_pos != -1:
        # Remove the second label and any blank lines before it
        before = css[:second_pos].rstrip()
        after = css[second_pos + len(label):]
        css = before + after

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)
print('Duplicate label removed')
