// TODO: unit tests, it will suck if there is a typo in here, so find it first!

function createTransform() {
  return {
    ix: 1.0, jx: 0.0, dx: 0.0,
    iy: 0.0, jy: 1.0, dy: 0.0};
}

function createTranslateTransform(x, y) {
  return {
    ix: 1.0, jx: 0.0, dx: x,
    iy: 0.0, jy: 1.0, dy: y};
}

function createScaleTransform(s) {
  return {
    ix: s, jx: 0.0, dx: 0.0,
    iy: 0.0, jy: s, dy: 0.0};
}

function createRotateTransform(angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);
  return {
    ix:  c, jx: s, dx: 0.0,
    iy: -s, jy: c, dy: 0.0};
}

// combine two transforms, so t1 is applied, then t2
function transformCompose(t1, t2) {
  return {
    ix: t2.ix * t1.ix + t2.jx * t1.iy, jx: t2.ix * t1.jx + t2.jx * t1.jy, dx: t2.ix * t1.dx + t2.jx * t1.dy + t2.dx,
    iy: t2.iy * t1.ix + t2.jy * t1.iy, jy: t2.iy * t1.jx + t2.jy * t1.jy, dy: t2.iy * t1.dx + t2.jy * t1.dy + t2.dy};
}

function transformTranslate(t, x, y) {
  return {
    ix: t.ix, jx: t.jx, dx: t.dx + x,
    iy: t.iy, jy: t.jy, dy: t.dy + y};
}

function transformScale(t, s) {
  return {
    ix: s * t.ix, jx: s * t.jx, dx: s * t.dx,
    iy: s * t.iy, jy: s * t.jy, dy: s * t.dy};

}

function transformRotate(t, angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);
  return {
    ix:  c * t.ix + s * t.iy, jx: c * t.jx + s * t.jy, dx:  c * t.dx + s * t.dy,
    iy: -s * t.ix + c * t.iy, jy: c * t.jx - s * t.jy, dy: -s * t.dx + c * t.dy};
}

function transformInvert(t) {
  var det = t.ix * t.jy - t.jx * t.iy;
  var dx = t.jx * t.dy - t.jy * t.dx;
  var dy = t.iy * t.dx - t.ix * t.dy;
  return {
    ix:  t.jy / det, jx: -t.jx / det, dx: dx / det,
    iy: -t.iy / det, jy:  t.ix / det, dy: dy / det};
}

function transformPoint(t, p) {
  return { x: p.x * t.ix + p.y * t.jx + t.dx, y: p.x * t.iy + p.y * t.jy + t.dy };
}

function transformNormal(t, n) {
  return { x: p.x * t.ix + p.y * t.jx, y: p.x * t.iy + p.y * t.jy };
}
