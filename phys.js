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
  var l2w = transformTranslate(transformRotateCreate(θ), d.x, d.y);

  var ca = solidCentroidArea(solid);
  var centerT = transformTranslateCreate(-ca.x, -ca.y);

  // recenter solid to have centroid be at (0, 0)
  solidTransform(solid, centerT);

  // get centroid in world coordinatea
  transformPoint(l2w, ca);

  // correct velocity due to movement caused by rotation of new center of mass
  v.x += (d.y - ca.y) * ω;
  v.y += (ca.x - d.x) * ω;

  // correct position to be world coordinated of center of mass
  d.x = ca.x;
  d.y = ca.y;

  l2w = transformTranslate(transformRotateCreate(θ), d.x, d.y);

  phys.bodies.push({
    solid: solid,
    d: d,
    θ: θ,
    v: v,
    ω: ω,
    worldToLocal: transformInvert(l2w),
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
  var bodies = phys.bodies;
  phys.bodies = [];

  for (var i = 0; i < bodies.length; i++) {
    var body = bodies[i];
    // TODO: bounding circles or something...

    // transform bsp into local coordinates
    var localBsp = bspTreeTransformClone(bsp, body.worldToLocal)
    var result = solidClip(body.solid, localBsp);

    if (!result.clipped) {
      phys.bodies.push(body);
    } else {
      var solid = result.solid;
      var regions = solidMarkConnectedRegions(result.solid);

      for (var j = 0; j < regions; j++) {
        var extractedSolid = solidExtractRegion(solid, j);
        physAddShape(
          phys,
          extractedSolid,
          { x: body.d.x, y: body.d.y },
          body.θ,
          { x: body.v.x, y: body.v.y },
          body.ω);
      }
    }
  }
/*
    var regions = solidMarkConnectedRegions(result.solid);

    if (regions != 1) {
      // TODO: stuff
    }
*/
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
