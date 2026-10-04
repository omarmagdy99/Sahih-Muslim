# Collapses any duplicated "    ],\n  },\n" pairs left when stdin of more.py also closed the bab.
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
d = "    ],\n  },\n"
while d + d in s:
    s = s.replace(d + d, d)
open(p, 'w', encoding='utf-8').write(s)
