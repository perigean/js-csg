// test.transform.js
// Test methods for transform.js

function transformEqual(t1, t2) {
  return t1.ix == t2.ix && t1.iy == t2.iy
      && t1.jx == t2.jx && t1.jy == t2.jy
      && t1.dx == t2.dx && t1.dy == t2.dy;
}

var t1 = createTransform();
var t2 = transformInvert(t1);

testVerify(transformEqual(t1, t2), "Inverse identity is identity");
