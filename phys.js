// phys.js
//
// Copywrite Charles Dick 2015
//
// tracks a physical system of body and particle objects that can interact
//

// requires bsp.js, transform.js, camera.js

function physCreate() {
  return {
    bodies: [],
    particles: new Array(65536),
    numParticles: 0
  };
  // TODO: acceleration structures etc.
}

function physAddShape(phys, solid, d, θ, v, ω) {
  var l2w = transformTranslate(transformRotateCreate(θ), d.x, d.y);

  var ca = solidCentroidArea(solid);
  var centerT = transformTranslateCreate(-ca.x, -ca.y);

  // recenter solid to have centroid be at (0, 0)
  solidTransform(solid, centerT);

  // get the radius so we can do collisions faster
  var r2 = solidRadiusSquared(solid);

  // get centroid in world coordinatea
  transformPoint(l2w, ca);

  // correct velocity due to movement caused by rotation of new center of mass in the old frame of reference
  v.x += (d.y - ca.y) * ω;
  v.y += (ca.x - d.x) * ω;

  // correct position to be world coordinated of the new center of mass
  d.x = ca.x;
  d.y = ca.y;

  l2w = transformTranslate(transformRotateCreate(θ), d.x, d.y);

  phys.bodies.push({
    solid: solid,
    d: d,
    r2: r2,
    θ: θ,
    v: v,
    ω: ω,
    worldToLocal: transformInvert(l2w),
    localToWorld: l2w
  });
}

function physAddParticle(phys, d, v, t) {
  if (phys.numParticles < phys.particles.length) {
    phys.particles[phys.numParticles] = {
      d: d,
      v: v,
      t: t
    };

    phys.numParticles++;
  }
}

function physRemoveParticle(phys, i) {
  if (i < 0 || i >= phys.numParticles) {
    throw "index out of bounds!";
  }

  if (i != phys.numParticles - 1) {
    phys.particles[i] = phys.particles[phys.numParticles - 1];
  }

  phys.numParticles--;
  phys.particles[phys.numParticles] = null;
}

function physTimeStep(phys, dt) {
  var particles = phys.particles;
  for (var i = 0; i < phys.numParticles; i++) {
    var particle = particles[i];
    particle.t -= dt;
    particle.d.x += particle.v.x * dt;
    particle.d.y += particle.v.y * dt;
  }

  for (var i = 0; i < phys.numParticles;) {
    if (particles[i].t <= 0.0) {
      physRemoveParticle(phys, i);
    } else {
      i++;
    }
  }

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

  // check for collisions? Do particles first?
  // how to do everything at once? Update next transform first, do collisions, then update?
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
}

function physDrawcollisionDebugGrid(phys, cam) {
  var ctx = cam.ctx;
  var grid = [];
  for (var x = -128; x <= 128; x += 16) {
    grid.push({
      a: { x: x, y: -128 },
      b: { x: x, y:  128 },
      t: 1.0
    });

    grid.push({
      a: { x: x, y:  128 },
      b: { x: x, y: -128 },
      t: 1.0
    });

    grid.push({
      a: { x: -128, y: x },
      b: { x:  128, y: x },
      t: 1.0
    });

    grid.push({
      a: { x:  128, y: x },
      b: { x: -128, y: x },
      t: 1.0
    });
  }

  for (var i = 0; i < phys.bodies.length; i++) {
    var body = phys.bodies[i];

    for (var j = 0; j < grid.length; j++) {
      var line = grid[j];
      var a = { x: line.a.x, y: line.a.y };
      var b = { x: line.b.x, y: line.b.y };

      transformPoint(body.worldToLocal, a);
      transformPoint(body.worldToLocal, b);

      var t = bspTreeIntersect(body.solid, a.x, a.y, b.x, b.y);
      line.t = Math.min(line.t, t);
    }
  }

  ctx.beginPath();
  for (var i = 0; i < grid.length; i++) {
    var line = grid[i];
    var t = line.t;
    ctx.moveTo(line.a.x, line.a.y);
    ctx.lineTo(line.a.x * (1.0 - t) + line.b.x * t, line.a.y * (1.0 - t) + line.b.y * t);
  }
  ctx.stroke();
}

function physDraw(phys, cam) {
  var ctx = cam.ctx;

  for (var i = 0; i < phys.numParticles; i++) {
    var particle = phys.particles[i];

    ctx.fillRect(particle.d.x, particle.d.y, 1, 1);
  }

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

  physDrawcollisionDebugGrid(phys, cam);
}
