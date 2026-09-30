# Appends JS section objects (read from stdin) to the end of a data array file (e.g. data/b7/s1.js).
# Usage: python append.py data/b7/s1.js < section.js
import sys

path = sys.argv[1]
src = open(path, encoding='utf-8').read().rstrip()
assert src.endswith('];'), path
new = sys.stdin.read().rstrip() + '\n'
open(path, 'w', encoding='utf-8').write(src[:-2] + new + '];\n')
