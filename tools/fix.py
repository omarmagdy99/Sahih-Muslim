# Removes a duplicated closing "    ],\n  },\n" before the final "];" (left by more.py when stdin also closed the bab).
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read().rstrip()
bad = "    ],\n  },\n    ],\n  },\n];"
if s.endswith(bad):
    s = s[:-len(bad)] + "    ],\n  },\n];"
open(p, 'w', encoding='utf-8').write(s + '\n')
