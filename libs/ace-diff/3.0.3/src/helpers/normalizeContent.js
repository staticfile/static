module.exports = function normalizeContent(value = '') {
  const normalized = value.replace(/\r\n/g, '\n');
  return normalized;
};
