// phys.js
//
// Copywrite Charles Dick 2015
//
// tracks a physical system of body and particle objects that can interact
//

// requires bsp.js, transform.js, camera.js

function physCreate(dt) {
  return {
    bodies: [],
    particles: new Array(65536),
    numParticles: 0,
    dt: dt
  };
  // TODO: acceleration structures etc.
}

function physReset(phys) {
  phys.bodies = [];
  phys.numParticles = 0;
  globalphysId = 0;
}

function physBodyRelativeVelocity(body, p, v) {
  var dBody = body.d;
  var vBody = body.v;
  var ωBody = body.ω;

  var vx = vBody.x + (dBody.y - p.y) * ωBody;
  var vy = vBody.y + (p.x - dBody.x) * ωBody;

  v.x -= vx;
  v.y -= vy;
}

function physBodyApplyImpulse(body, p, n, j) {
  // apply impulse to center of mass and update rotation based on cross product?
  // or dot product

  var dx = body.d.x - p.x;  // p -> body.d
  var dy = body.d.y - p.y;

  // update translational velocity
  body.v.x += n.x * j / body.m;
  body.v.y += n.y * j / body.m;

  // update rotational velocity
  body.ω += (n.x * dy - n.y * dx) * j / body.I;
}

// velocity change at p in direction of n per unit of impulse applied at
// p in direction of n
function physBodyDvByDj(body, p, n) {
  var nl2 = n.x * n.x + n.y * n.y;
  if (nl2 < 0.9999 || nl2 > 1.0001) {
    throw "normal must be a unit vector";
  }

  var dx = body.d.x - p.x;  // p -> body.d
  var dy = body.d.y - p.y;

  // delta's to velocity components
  var dvx = n.x / body.m;
  var dvy = n.y / body.m;
  var dω = (n.x * dy - n.y * dx) / body.I;

  // change in velocity at point p
  var vx = dvx + dy * dω;
  var vy = dvy - dx * dω;

  // project onto normal
  return n.x * vx + n.y * vy;
}

var globalphysId = 0;

function physAddShape(phys, solid, ρ, d, θ, v, ω) {
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
    id: globalphysId++,
    solid: solid,
    ρ: ρ,
    m: ρ * ca.area,
    I: ρ * ca.area * solidMomentOfInertia(solid),
    d: d,
    r2: r2,
    θ: θ,
    v: v,
    ω: ω,
    worldToLocal: transformInvert(l2w),
    localToWorld: l2w,
    prevWorldToLocal: transformInvert(l2w), // TODO: how to account for previous location of split shape
    prevLocalToWorld: l2w
  });
}

function physAddParticle(phys, m, d, v, t) {
  if (phys.numParticles < phys.particles.length) {
    phys.particles[phys.numParticles] = {
      id: globalphysId++,
      m: m,
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

function physFirstCollision(phys, curr, prev, n) {
  // TODO: use bounding circle - might need prevD on body
  var hitBody = null;
  for (var i = 0; i < phys.bodies.length; i++) {
    var body = phys.bodies[i];
    var a = { x: prev.x, y: prev.y };
    var b = { x: curr.x, y: curr.y };
    transformPoint(body.prevWorldToLocal, a);
    transformPoint(body.worldToLocal, b);

    var bsp = bspTreeIntersect(body.solid, a.x, a.y, b.x, b.y);
    if (bsp != null) {
      var t = Math.min(Math.max(bspIntersect(bsp, a.x, a.y, b.x, b.y), 0.0), 1.0);
      var nl = Math.sqrt(bsp.nx * bsp.nx + bsp.ny * bsp.ny);

      hitBody = body;
      curr.x = prev.x * t + curr.x * (1.0 - t);
      curr.y = prev.y * t + curr.y * (1.0 - t);
      n.x = bsp.nx / nl;
      n.y = bsp.ny / nl;
      transformNormal(body.localToWorld, n);
    }
  }

  return hitBody;
}

function physCollideParticle(phys, particle, prev) {
  var n = { x: 0.0, y: 0.0 };
  var body = physFirstCollision(phys, particle.d, prev, n);

  if (body != null) { // particle hit something
    var vRel = { x: particle.v.x, y: particle.v.y };
    physBodyRelativeVelocity(body, particle.d, vRel);
    var v = vRel.x * n.x + vRel.y * n.y;  // velocity in direction of (inward) normal at collision point

    if (v > 0.0) {  // actually converging at collision point
      var dv = -v * (1.0 + 0.9); // TODO: coefficient of restitution taken from somewhere

      // calculate change in velocity per unit of impulse
      var bodyDvDj = physBodyDvByDj(body, particle.d, n);
      var partDvDj = 1.0 / particle.m;

      var j = dv / (bodyDvDj + partDvDj);

      physBodyApplyImpulse(body, particle.d, n, -j);
      particle.v.x += n.x * j / particle.m;
      particle.v.y += n.y * j / particle.m;
    }
  }
}

function physTimeStep(phys) {
  var dt = phys.dt;

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

    // TODO: collision detection

    body.prevWorldToLocal = body.worldToLocal;
    body.prevLocalToWorld = body.localToWorld;
    body.localToWorld = transformTranslate(transformRotateCreate(body.θ), body.d.x, body.d.y);
    body.worldToLocal = transformInvert(body.localToWorld);
  }

  var particles = phys.particles;
  for (var i = 0; i < phys.numParticles; i++) {
    var particle = particles[i];
    var prev = { x: particle.d.x, y: particle.d.y };
    var hitBody = null;

    particle.t -= dt;
    particle.d.x += particle.v.x * dt;
    particle.d.y += particle.v.y * dt;

    physCollideParticle(phys, particle, prev);

    for (var j = 0; j < phys.bodies.length; ++j) {
      var body = phys.bodies[j];
      var local = { x: particle.d.x, y: particle.d.y };
      transformPoint(body.worldToLocal, local);

      if (bspTreeIn(body.solid, local.x, local.y)) {
        throw "point in body after time step!";
      }
    }
  }

  // remove any particles that have timed out
  for (var i = 0; i < phys.numParticles;) {
    if (particles[i].t <= 0.0) {
      physRemoveParticle(phys, i);
    } else {
      i++;
    }
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
          body.ρ,
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

      var bsp = bspTreeIntersect(body.solid, a.x, a.y, b.x, b.y);
      if (bsp != null) {
        var t = bspIntersect(bsp, b.x, b.y, a.x, a.y);
        line.t = Math.min(line.t, t);
      }
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

  for (var i = 0; i < phys.numParticles; i++) {
    var particle = phys.particles[i];

    if (particle.id == 20) {
      ctx.fillStyle = 'red';
    } else {
      ctx.fillStyle = 'darkblue';
    }

    ctx.fillRect(particle.d.x - 0.5, particle.d.y - 0.5, 1.0, 1.0);
  }

  //physDrawcollisionDebugGrid(phys, cam);
}
