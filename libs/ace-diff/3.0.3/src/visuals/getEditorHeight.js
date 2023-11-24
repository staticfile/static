module.exports = function getEditorHeight(acediff) {
  // editorHeight: document.getElementById(acediff.options.left.id).clientHeight
  return document.getElementById(acediff.options.left.id).offsetHeight;
};
