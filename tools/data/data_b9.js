// Batch 9: كتاب الصيام والاعتكاف (chunks in ./b9/cNN.js; sections with the same title are merged)
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'b9');
const files = fs.readdirSync(dir).filter((f) => /^c\d+\.js$/.test(f)).sort();
const merged = [];
for (const f of files) {
  for (const sec of require(path.join(dir, f))) {
    if (!sec.items.filter(Boolean).length) continue;
    const last = merged[merged.length - 1];
    if (last && last.base === sec.title) last.items.push(...sec.items.filter(Boolean));
    else merged.push({ base: sec.title, items: sec.items.filter(Boolean) });
  }
}
const sections = merged.map((m) => {
  const nums = m.items.flatMap((it) => String(it.p).match(/\d+/g).map(Number));
  const lo = Math.min(...nums), hi = Math.max(...nums);
  return { title: `${m.base} (ص${lo}${hi > lo ? '–' + hi : ''})`, items: m.items };
});

module.exports = {
  title: `ترجيحات الشيخ ياسر في شرح صحيح مسلم بشرح النووي`,
  subtitle: `كتاب الصيام والاعتكاف — كاملًا (ص3–236 من التفريغ)`,
  header: `ترجيحات الشيخ ياسر — كتاب الصيام والاعتكاف`,
  startAt: 1329,
  sections,
};
