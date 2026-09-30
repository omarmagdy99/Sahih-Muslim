// Batch 6: كتاب العتق ص456-507 (sections split across ./b6/*.js)
module.exports = {
  title: `ترجيحات الشيخ ياسر في شرح صحيح مسلم بشرح النووي`,
  subtitle: `كتاب العتق — كاملًا (ص456–507 من التفريغ)`,
  header: `ترجيحات الشيخ ياسر — كتاب العتق`,
  startAt: 434,
  sections: [
    ...require('./b6/s1'),
    ...require('./b6/s2'),
    ...require('./b6/s3'),
  ],
};
