// phys.js
//
// Copywrite Charles Dick 2015
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

function physAddShape(phys, solid, d, θ, v, ω) {

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
    v: v,
    ω: ω,
    worldToLocal: w2l,
    localToWorld: l2w
  });
}

function physBodyVelocity(body, p) {
  var nx = body.d.y - p.y;
  var ny = p.x - body.d.x;

  return {
    x: body.v.x + nx * body.ω,
    y: body.v.y + ny * body.ω
  };
}

function physTimeStep(phys, dt) {
  for (var i = 0; i < phys.bodies.length; i++) {
    var body = phys.bodies[i];

    // Just use forward euler, since we don't care about gravity being accurate
    // and all other accelerations are impulses which are not integrated here

    body.d.x += body.v.x * dt;
    body.d.y += body.v.y * dt;
    body.θ += body.ω * dt;

    if (body.θ < 0) {
      var rotations = Math.ceil(-body.θ / (2.0 * Math.PI));
      body.θ += rotations * 2.0 * Math.PI;
    } else if (body.θ >= 2.0 * Math.PI) {
      var rotations = Math.ceil(-body.θ / (2.0 * Math.PI));
      body.θ += rotations * 2.0 * Math.PI;
    }

    body.localToWorld = transformTranslate(transformRotateCreate(body.θ), body.d.x, body.d.y);
    body.worldToLocal = transformInvert(body.localToWorld);
  }
}

function physClipBodies(phys, bsp) {
  for (var i = 0; i < phys.bodies.length; i++) {
    var body = phys.bodies[i];
    // TODO: bounding circles or something...
    // transform bsp into local coordinates

    var localBsp = bspTreeTransformClone(bsp, body.worldToLocal)
    var result = solidClip(body.solid, localBsp);

    if (result.clipped) {
      body.solid = result.solid;

      // recentre based on subtracted shape
      var ca = solidCentroidArea(body.solid);
      var centerT = transformTranslateCreate(-ca.x, -ca.y);

      solidTransform(body.solid, centerT);

      // convert new center to world coordinates to update our position
      transformPoint(body.localToWorld, ca);

      // new center of mass is moving due to old rotation, update velocity
      // due to this change

      var dv = physBodyVelocity(body, ca);

      body.d.x = ca.x;
      body.d.y = ca.y;
      body.v.x += dv.x;
      body.v.y += dv.y;

      // recompute transforms with new position
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
