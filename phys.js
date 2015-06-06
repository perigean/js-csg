//
// tracks a physical system of body and particle objects that can interact
//

// requires bsp.js, transform.js, camera.js

function physCreate() {
  return {
    bodies: []
  };
  // TODO: particles, acceleration structures etc.
}

function physAddShape(phys, bspSolid, d, θ) {

  // TODO: recentre bsp solid around its centre of mass

  var ca = bspSolidCentroidArea(bspSolid);
  var centerT = transformTranslateCreate(-ca.x, -ca.y);

  bspSolidTransform(bspSolid, centerT);
  d.x += ca.x;
  d.y += ca.y;

  var l2w = transformTranslate(transformRotateCreate(θ), d.x, d.y);
  var w2l = transformInvert(l2w);

  phys.bodies.push({
    bspSolid: bspSolid,
    d: d,
    θ: θ,
    worldToLocal: w2l,
    localToWorld: l2w,
    prevWorldToLocal: w2l,
    prevLocalToWorld: l2w
  });
}

function physDraw(phys, cam) {
  var ctx = camera.ctx;

  for (var i = 0; i < phys.bodies.length; i++) {
    var body = phys.bodies[i];

    camPushTransform(cam, body.localToWorld);

    ctx.fillStyle = 'lightblue';
    bspSolidFill(body.bspSolid, ctx);
    ctx.strokeStyle = 'black';
    bspSolidStroke(body.bspSolid, ctx);

    camPopTransform(cam);
  }
}
