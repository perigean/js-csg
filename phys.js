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
    localToWorld: l2w
  });
}

function physClipBodies(phys, bsp) {
  for (var i = 0; i < phys.bodies.length; i++) {
    var body = phys.bodies[i];
    // TODO: bounding circles or something...
    // transform bsp into local coordinates

    var localBsp = bspTreeTransformClone(bsp, body.worldToLocal)

    // TODO: be able to tell if clipping happened

    var newBspSolid = bspTreeSolidClip(localBsp, body.bspSolid);

    // recentre based on subtracted shape
    var ca = bspSolidCentroidArea(newBspSolid);
    var centerT = transformTranslateCreate(-ca.x, -ca.y);

    bspSolidTransform(newBspSolid, centerT);

    body.d.x += ca.x;
    body.d.y += ca.y;
    body.bspSolid = newBspSolid;
  }
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

    ctx.beginPath();
    ctx.arc(0.0, 0.0, 4, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'black';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0.0, 0.0);
    ctx.lineTo(16.0, 0.0);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    camPopTransform(cam);
  }
}
