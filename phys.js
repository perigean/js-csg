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

function physAddShape(phys, solid, d, θ) {

  // TODO: recentre bsp solid around its centre of mass

  var ca = solidCentroidArea(solid);
  var centerT = transformTranslateCreate(-ca.x, -ca.y);

  solidTransform(solid, centerT);
  d.x += ca.x;
  d.y += ca.y;

  var l2w = transformTranslate(transformRotateCreate(θ), d.x, d.y);
  var w2l = transformInvert(l2w);

  phys.bodies.push({
    solid: solid,
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

    var result = solidClip(body.solid, localBsp);

    if (result.clipped) {
      body.solid = result.solid;

      // recentre based on subtracted shape
      var ca = solidCentroidArea(body.solid);
      var centerT = transformTranslateCreate(-ca.x, -ca.y);

      solidTransform(body.solid, centerT);

      body.d.x += ca.x;
      body.d.y += ca.y;

      body.localToWorld = transformTranslate(transformRotateCreate(body.θ), body.d.x, body.d.y);
      body.worldToLocal = transformInvert(body.localToWorld);
    }
  }
}

function physDraw(phys, cam) {
  var ctx = camera.ctx;

  for (var i = 0; i < phys.bodies.length; i++) {
    var body = phys.bodies[i];

    camPushTransform(cam, body.localToWorld);

    solidFill(body.solid, camera.ctx);
    solidStroke(body.solid, camera.ctx);

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
