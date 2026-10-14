#!/bin/bash
# Copy of the Codex queue driver used for Hajj b15 chunks c01-c06. Edit RANGES/YELLOW/book (b15) and the scratchpad dir S before reuse.
# usage: driver.sh <first-chunk> <last-chunk>   (runs Hajj b15 chunks sequentially through Codex)
S="${CODEX_RUN_DIR:-$TEMP/codex_runs}"; mkdir -p "$S"
REPO="D:/Projects/شرح صحيح مسلم ترجيحات الشيخ ياسر"
RELAY="C:/Users/pc/.claude/skills/codex-delegate/scripts/relay.mjs"
RANGES=(x "1 18" "19 45" "46 67" "68 84" "85 101" "102 124" "125 146" "147 168" "169 190" "191 212" "213 233" "234 255" "256 277" "278 299" "300 326" "327 352" "353 371" "372 392")
YELLOW=" 117 291 312 366 "
cd "$REPO" || exit 1
for n in $(seq "$1" "$2"); do
  set -- "$1" "$2"; read A B <<< "${RANGES[$n]}"; C=$(printf 'c%02d' "$n"); NEXT=$(printf '%03d' $((B+1)))
  Y=""; for p in $(seq "$A" "$B"); do case "$YELLOW" in *" $p "*) Y="$Y $p";; esac; done
  [ -z "$Y" ] && YT="مسح التظليل الأصفر البرمجي: مفيش أصفر في النطاق ده (لو شفت أصفر في صورة سجّله برضه)." || YT="مسح التظليل الأصفر البرمجي لقى أصفر في ص:$Y — طبّق قاعدة التظليل الأصفر وسجّل النص المظلل في progress."
  if [ "$n" = 1 ]; then OPEN="النطاق بيبدأ من أول الكتاب. أنشئ ملفات raw و ledger و progress (سطر عنوان واحد ثم المحتوى)."; else OPEN="اقرا آخر 6 سطور بس من tools/notes/b15_progress.md عشان تعرف اسم آخر باب مفتوح وهل فيه هامش مقطوع من الدفعة اللي فاتت، واستخدم نفس اسم الباب بالحرف لو النطاق بدأ في نصه. ضيف (append) على ملفات raw و ledger و progress ومتمسحش منها حاجة."; fi
  OUT="$S/run_b15_$C"; rm -rf "$OUT"; mkdir -p "$OUT"
  cat > "$S/brief_b15_$C.txt" <<BRIEF
<task>
اتبع AGENTS.md في جذر المشروع بالحرف.
الكتاب: كتاب الحج (bN = b15). الصور: tools/pages/b15/p$(printf '%03d' "$A").png … p$(printf '%03d' "$B").png (+ p$NEXT لتكملة هامش مقطوع فقط).
اقرا الصفحات $A–$B كصور، صفحة صفحة، فرّغ هوامش كل صفحة في tools/notes/b15_raw.md أولًا، وبعدها اكتب tools/data/b15/$C.js (أول سطر: \`// كتاب الحج ص$A–$B\`).
مثال للشكل والأسلوب (اقرا أول 12 سطر منه بس): tools/data/b12/c20.js.
$OPEN
$YT
</task>

<completeness_contract>
كل هامش مرقم للشيخ في كل صفحة من $A لـ$B لازم يتنقل بنصه كامل كلمة كلمة في raw وفي حقل s. ممنوع التلخيص أو القفز على صفحة أو تكملة آية/حديث من الحفظ. لو الميزانية هتخلص قبل آخر النطاق: وقّف عند صفحة كاملة، واكتب في التقرير وفي progress آخر صفحة خلصتها بالظبط، ومتكتبش صفحات ما قريتهاش.
</completeness_contract>

<verification_loop>
شغّل أمر التحقق اللي في AGENTS.md على $C.js وراجع الـ ledger صفحة صفحة مقابل raw.
</verification_loop>

<action_safety>
متعدلش غير: tools/data/b15/$C.js و tools/notes/b15_raw.md و tools/notes/b15_ledger.md و tools/notes/b15_progress.md. ممنوع git add/commit.
</action_safety>

<structured_output_contract>
التقرير النهائي بالشكل اللي في AGENTS.md (5 بنود، مختصر).
</structured_output_contract>
BRIEF
  echo "[$(date +%T)] start $C ($A-$B)" >> "$S/queue.log"
  node "$RELAY" --brief "$S/brief_b15_$C.txt" --cd . --model gpt-6.1-sol --out-dir "$OUT" > "$OUT/stdout.txt" 2>&1
  RC=$?
  MISS=""; for p in $(seq "$A" "$B"); do grep -q "^ص$(printf '%03d' "$p") " tools/notes/b15_ledger.md 2>/dev/null || MISS="$MISS $p"; done
  ITEMS=$(cd tools && node -e "const c=require('./data/b15/$C.js');let n=0;for(const s of c)for(const i of s.items){n++;for(const k of ['q','p','n','o','s'])if(!i[k]||!String(i[k]).trim())throw new Error('empty')}console.log(n)" 2>&1 | tail -1)
  echo "[$(date +%T)] end $C rc=$RC items=$ITEMS missing_ledger_pages=[$MISS ]" >> "$S/queue.log"
  if [ "$RC" != 0 ] || [ -n "$MISS" ] || ! [[ "$ITEMS" =~ ^[0-9]+$ ]]; then echo "[$(date +%T)] STOP at $C" >> "$S/queue.log"; exit 1; fi
done
echo "[$(date +%T)] QUEUE DONE $1-$2" >> "$S/queue.log"
