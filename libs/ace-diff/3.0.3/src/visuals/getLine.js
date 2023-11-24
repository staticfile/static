module.exports = function getLine(editor, line) {
  return editor.ace.getSession().doc.getLine(line);
};
