// generates a Bezier curve in SVG format
module.exports = function getCurve(startX, startY, endX, endY) {
  const w = endX - startX;
  const halfWidth = startX + w / 2;

  // now create the curve
  // position it at the initial x,y coords
  // This is of the form "C M,N O,P Q,R" where C is a directive for SVG ("curveto"),
  // M,N are the first curve control point, O,P the second control point
  // and Q,R are the final coords

  return `M ${startX} ${startY} C ${halfWidth},${startY} ${halfWidth},${endY} ${endX},${endY}`;
};
