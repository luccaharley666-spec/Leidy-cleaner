module.exports = {
  noticeError: function () {},
  setTransactionName: function () {},
  addCustomAttribute: function () {},
  recordMetric: function () {},
  startSegment: function (name, record, fn) {
    if (typeof fn === 'function') return fn();
    return null;
  },
  getBrowserTimingHeader: function () { return ''; },
};
