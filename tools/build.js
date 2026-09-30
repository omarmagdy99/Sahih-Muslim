const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Footer, Header,
  PageNumber, BorderStyle, ShadingType, TableOfContents, FootnoteReferenceRun,
} = require('docx');

const [, , dataPath, outPath] = process.argv;
const data = require(dataPath);

const FONT = { ascii: 'Dubai', hAnsi: 'Dubai', cs: 'Dubai', eastAsia: 'Dubai' };
const C = { maroon: '7B1E1E', gold: '9A6B1F', ink: '222222', gray: '6B6B6B', nawawi: '1F4E79', others: '4A5A2A', sheikhBg: 'FBF4E6' };
const toAr = (s) => String(s).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

const run = (text, o = {}) => new TextRun({
  text, font: FONT, rightToLeft: true,
  size: o.size || 26, sizeComplexScript: o.size || 26,
  bold: !!o.bold, boldComplexScript: !!o.bold, color: o.color || C.ink,
});
const para = (children, o = {}) => new Paragraph({
  bidirectional: true, alignment: o.align || AlignmentType.BOTH, children,
  spacing: { before: o.before ?? 60, after: o.after ?? 60, line: o.line || 320 },
  heading: o.heading, border: o.border, shading: o.shading, indent: o.indent,
  keepNext: o.keepNext, pageBreakBefore: o.pageBreakBefore,
});

// Word footnotes: items may carry f: [text, ...] — the sheikh's side remarks (glosses, history, etc.)
const footnotes = {};
let fnId = 0;
const footnoteRefs = (texts = []) => texts.map((t) => {
  fnId += 1;
  footnotes[fnId] = { children: [para([run(t, { size: 20 })], { before: 0, after: 40, line: 260 })] };
  return new FootnoteReferenceRun(fnId);
});

const labeled = (label, text, color, box, notes) => para(
  [run(label + ' ', { bold: true, color }), run(text), ...footnoteRefs(notes)],
  box ? {
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: C.sheikhBg },
    border: { right: { style: BorderStyle.SINGLE, size: 18, color: C.gold, space: 6 } },
    indent: { left: 120 }, before: 80, after: 160,
  } : {},
);

const body = [];
// Title block
body.push(para([run(data.title, { size: 44, bold: true, color: C.maroon })], { align: AlignmentType.CENTER, before: 1600, after: 200 }));
body.push(para([run(data.subtitle, { size: 30, bold: true, color: C.gold })], { align: AlignmentType.CENTER, after: 600 }));
const method = [
  'المصدر: هوامش (حواشي) تفريغ شرح صحيح مسلم بشرح النووي، وهي موضع تعليقات الشيخ ياسر وترجيحاته؛ أما «تعليق الإمام النووي» فمن المتن.',
  'كل مسألة مصوغة في أربعة عناصر: المسألة، تعليق الإمام النووي، الأقوال الأخرى، ترجيح الشيخ ياسر.',
  'ما كُتب بجواره «(فتوى)» مأخوذ من أسئلة وفتاوى أُجيب عنها في الهامش، ولا يقابلها كلام للنووي في المتن.',
  'الأرقام بين القوسين بجوار كل مسألة هي أرقام صفحات التفريغ للرجوع إليها والتحقق.',
  'تمت مراجعة الملخص الشخصي كفهرس مساعد فقط، وكل المسائل الواردة فيه ضمن هذه الدفعة موجودة هنا.',
];
if (data.sections.some((sec) => sec.items.some((it) => it.f && it.f.length))) {
  method.splice(3, 0, 'ما في الهوامش أسفل الصفحات هو بقية كلام الشيخ في المواضع نفسها (شرح ألفاظ، وتعليقات حديثية وتاريخية وعقدية، ومناقب)، نُقل حتى لا يسقط شيء من كلامه.');
}
body.push(para([run('منهجية الاستخراج', { size: 30, bold: true, color: C.maroon })], { align: AlignmentType.RIGHT, before: 200, after: 120 }));
method.forEach((m) => body.push(para([run('◆ ', { color: C.gold }), run(m, { size: 25 })], { indent: { right: 200 } })));

body.push(para([run('الفهرس', { size: 32, bold: true, color: C.maroon })], { align: AlignmentType.CENTER, pageBreakBefore: true, after: 200 }));
body.push(new TableOfContents('الفهرس', { hyperlink: true, headingStyleRange: '1-1' }));

let n = data.startAt ? data.startAt - 1 : 0;
data.sections.forEach((sec, si) => {
  body.push(para([run(sec.title, { size: 32, bold: true, color: C.maroon })], {
    heading: HeadingLevel.HEADING_1, align: AlignmentType.RIGHT, pageBreakBefore: true, before: 120, after: 200,
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.gold, space: 4 } }, keepNext: true,
  }));
  sec.items.forEach((it) => {
    n += 1;
    body.push(para([
      run(`المسألة ${toAr(n)}: `, { size: 28, bold: true, color: C.maroon }),
      run(it.q, { size: 28, bold: true }),
      run(`   (التفريغ ص ${toAr(it.p)})`, { size: 20, color: C.gray }),
    ], { heading: HeadingLevel.HEADING_2, align: AlignmentType.RIGHT, before: 280, after: 80, keepNext: true }));
    body.push(labeled('تعليق الإمام النووي:', it.n, C.nawawi));
    body.push(labeled('الأقوال الأخرى:', it.o, C.others));
    body.push(labeled('ترجيح الشيخ ياسر:', it.s, C.maroon, true, it.f));
  });
});

const doc = new Document({
  creator: 'Claude', title: data.title, description: data.subtitle, footnotes,
  styles: {
    default: { document: { run: { font: FONT, size: 26 }, paragraph: { spacing: { line: 320 } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 32, bold: true, color: C.maroon }, paragraph: { outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 28, bold: true }, paragraph: { outlineLevel: 1 } },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1300, bottom: 1200, left: 1250, right: 1250 } } },
    headers: { default: new Header({ children: [para([run(data.header || 'ترجيحات الشيخ ياسر — كتاب النكاح', { size: 18, color: C.gray })], { align: AlignmentType.CENTER })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20, color: C.gray })] })] }) },
    children: body,
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(outPath, buf); console.log('items:', n, '->', outPath); });
