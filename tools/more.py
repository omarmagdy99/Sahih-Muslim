# Inserts extra items (read from stdin) at the end of the LAST bab in a data array file.
# Usage: python more.py data/b9/s1.js < items.js
import sys
path = sys.argv[1]
src = open(path, encoding='utf-8').read().rstrip()
tail = '    ],\n  },\n];'
assert src.endswith(tail), path
new = sys.stdin.read().rstrip() + '\n'
open(path, 'w', encoding='utf-8').write(src[:-len(tail)] + new + tail + '\n')
