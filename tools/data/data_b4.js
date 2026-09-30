// Batch 4: كتاب الطلاق ص296-425 (sections split across ./b4/*.js)
const sections = [
  require('./b4/s1'),
  ...require('./b4/s2'),
  ...require('./b4/s3'),
  ...require('./b4/s4'),
];

// Attach the sheikh's side remarks as footnotes (f) to the item whose q matches the key.
const footnotes = require('./b4/footnotes');
const items = new Map(sections.flatMap((s) => s.items).map((it) => [it.q, it]));
for (const [q, notes] of Object.entries(footnotes)) {
  const it = items.get(q);
  if (!it) throw new Error(`footnote target not found: ${q}`);
  it.f = [...(it.f || []), ...notes];
}

module.exports = {
  title: `ترجيحات الشيخ ياسر في شرح صحيح مسلم بشرح النووي`,
  subtitle: `كتاب الطلاق — كاملًا (ص296–425 من التفريغ)`,
  header: `ترجيحات الشيخ ياسر — كتاب الطلاق`,
  startAt: 273,
  sections,
};
