

function camCreate(canvas) {
  var ctx = canvas.getContext('2d');

  var t = transformStretchCreate(1.0, -1.0);  // flip y axis
  t = transformTranslate(t, canvas.width * 0.5, canvas.height * 0.5);

  ctx.setTransform(t.ix, t.iy, t.jx, t.jy, t.dx, t.dy);

  return {
    canvas: canvas,
    ctx: ctx,
    worldToScreen: t,
    screenToWorld: transformInvert(t),
    transformStack: []
  };
}

function camPushTransform(cam, transform) {
  cam.transformStack.push(cam.worldToScreen);
  cam.worldToScreen = transformCompose(transform, cam.worldToScreen);
  var t = cam.worldToScreen;
  cam.screenToWorld = transformInvert(t);
  cam.ctx.setTransform(t.ix, t.iy, t.jx, t.jy, t.dx, t.dy);
}

function camPopTransform(cam) {
  if (cam.transformStack.length == 0) {
    throw "Can't pop empty transform stack";
  }

  cam.worldToScreen = cam.transformStack[cam.transformStack.length - 1];
  cam.transformStack.pop();

  var t = cam.worldToScreen;
  cam.screenToWorld = transformInvert(t);
  cam.ctx.setTransform(t.ix, t.iy, t.jx, t.jy, t.dx, t.dy);
}

function camScreenToWorld(cam, p) {
  transformPoint(cam.screenToWorld, p);
}

function camClear(cam) {
  cam.ctx.setTransform(1, 0, 0, 1, 0, 0);
  cam.ctx.clearRect(0, 0, camera.canvas.width, camera.canvas.height);

  var t = cam.worldToScreen;
  cam.ctx.setTransform(t.ix, t.iy, t.jx, t.jy, t.dx, t.dy);
}
