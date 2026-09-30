// Template for a book's data file. Copy to tools/data/data_<book>.js, fill it, then run:
//   node build.js ./data/data_<book>.js "<output .docx path>"
const NO_N = `لم يتعرض لها الإمام النووي في المتن (المسألة من تعليقات الشيخ وفتاواه في الهامش).`;
const NO_O = `لم تُذكر أقوال أخرى.`;

module.exports = {
  title: `ترجيحات الشيخ ياسر في شرح صحيح مسلم بشرح النووي`,
  subtitle: `كتاب ... — (ص...–... من التفريغ)`,
  header: `ترجيحات الشيخ ياسر — كتاب ...`,
  startAt: 1, // the number of the first مسألة (continues from the previous file)
  sections: [
    {
      title: `باب ... (ص...–...)`,
      items: [
        {
          q: `نص المسألة`,               // المسألة
          p: `123–124`,                 // صفحات التفريغ
          n: `تعليق الإمام النووي من المتن، أو NO_N`,
          o: `الأقوال الأخرى، أو NO_O`,
          s: `ترجيح الشيخ ياسر من الهامش`,
        },
        // فتوى: add «(فتوى)» at the end of q, and use n: NO_N
      ],
    },
  ],
};
