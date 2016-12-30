// phys.js
//
// Copyright Charles Dick 2015
//
// tracks a physical system of body and particle objects that can interact
//

// requires bsp.js, transform.js, camera.js

// TODO: support snapshots?
// TODO: new API
// global functions
//  -add body - callbacks for timestep, collide particle, collide body, clip (causing new ID or splitting)
//  -clip body
//  -add particles - callbacks for timestep, collide body
// body functions
//  -apply impulse at centre/torque impulse/impulse at point
//  -set displacement, velocity? -- no, not unless we really need them
// particle functions
//  -apply impulse
//  -kill particle
// note that all the above functions must be safe to call from callbacks
// NB: clip is unsafe, it invalidates any shape that is clipped, which might be passed to a callback
//  TODO: figure out rules for callbacks
// also, saving references to particles and bodies passed to callbacks is forbidden

// TODO: factor out drawing code to something else, this code should just provide polygons or whatever, and not care about materials etc.
// TODO: friction
// IDEA: on collision, give body another timestep (or n) so they don't lock up? Also, bodies that collide more get pushed to end of array somehow?
// TODO: acceleration structures for physics and clipping:
//  -bounding circle
//  -grid/octTree/rtree?

import {
  bspIntersect,
  bspTreeCollide,
  bspTreeDebugLines,
  bspTreePointSide,
  bspTreeTransformClone,
} from './bsp.js';

import {
  camPopTransform,
  camPushTransform,
} from './camera.js';

import {
  solidCentroidArea,
  solidClip,
  solidExtractRegion,
  solidFill,
  solidMarkConnectedRegions,
  solidMomentOfInertia,
  solidRadiusSquared,
  solidTransform,
  solidVertices,
} from './solid.js';

import {
  transformCompose,
  transformInvert,
  transformNormal,
  transformPoint,
  transformRotateCreate,
  transformStretchCreate,
  transformTranslate,
  transformTranslateCreate,
} from './transform.js'

function physCreate(dt) {
  return {
    bodies: [],
    particles: new Array(65536),  // TODO: this is stupid, do proper allocatino stuff
    numParticles: 0,
    dt: dt,
    nextPhysId: 1
  };
  // TODO: acceleration structures etc.
}

function physReset(phys) {
  phys.bodies = [];
  phys.numParticles = 0;
  phys.nextPhysId = 1;

}

// returns velocity of body at point p in v
function physBodyVelocity(body, p, v) {
  var dBody = body.d;
  var vBody = body.v;
  var ωBody = body.ω;

  v.x = vBody.x + (dBody.y - p.y) * ωBody;
  v.y = vBody.y + (p.x - dBody.x) * ωBody;
}

// velocity of body in direction of n at p
function physBodyRelativeVelocity(body, p, n) {
  var dBody = body.d;
  var vBody = body.v;
  var ωBody = body.ω;

  var vx = vBody.x + (dBody.y - p.y) * ωBody;
  var vy = vBody.y + (p.x - dBody.x) * ωBody;

  return n.x * vx + n.y * vy;
}

function physBodyApplyLinearImpulse(body, n, j) {
  body.v.x += n.x * j / body.m;
  body.v.y += n.y * j / body.m;
}

function physBodyApplyAngularImpulse(body, j) {
  body.ω += j / body.I;
}

function physBodyApplyImpulse(body, p, n, j) {
  // apply impulse to center of mass and update rotation based on cross product?
  // or dot product

  var dx = body.d.x - p.x;  // p -> body.d
  var dy = body.d.y - p.y;

  // update translational velocity
  physBodyApplyLinearImpulse(body, n, j);

  // update rotational velocity
  physBodyApplyAngularImpulse(body, (n.x * dy - n.y * dx) * j);
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

function physBodyPropertiesCreate(ρ, e, oncollideparticle, oncollidebody, ontimestep, onclip) {
  return {
    ρ: ρ, // density
    e: e, // coefficient of restitution for collisions
    oncollideparticle: oncollideparticle,
    oncollidebody: oncollidebody,
    ontimestep: ontimestep,
    onclip: onclip
  };
}

function physBodyCreate(phys, solid, d, θ, v, ω, properties) {
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

  var body = {
    id: phys.nextPhysId++,
    solid: solid,
    verts: solidVertices(solid),
    properties: properties,
    m: properties.ρ * ca.area,
    I: properties.ρ * ca.area * solidMomentOfInertia(solid),
    d: d,
    r2: r2,
    θ: θ,
    v: v,
    ω: ω,
    worldToLocal: transformInvert(l2w),
    localToWorld: l2w,
    prevWorldToLocal: transformInvert(l2w),
    prevLocalToWorld: l2w
  };

  phys.bodies.push(body);

  return body;
}

// TODO: make sure all external APIs are safe to call from any callback

function physParticlePropertiesCreate(m, e, oncollide, ontimestep) {
  return {
    m: m,                   // mass
    e: e,                   // coefficient of restitution
    oncollide: oncollide,   // oncollide(particle, body, collision normal, impulse)
    ontimestep: ontimestep  // ontimestep(particle, dt)
  };
}

function physParticleCreate(phys, d, v, t, properties) {
  if (phys.numParticles < phys.particles.length) {
    phys.particles[phys.numParticles] = {
      id: phys.nextPhysId++,
      d: d,
      v: v,
      t: t,
      properties: properties
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

    var bsp = bspTreeCollide(body.solid, a.x, a.y, b.x, b.y);

    if (bsp != null) {
      var t = bspIntersect(bsp, a.x, a.y, b.x, b.y);

      hitBody = body;

      //a.x = a.x * (1.0 - t) + b.x * t;
      //a.y = a.y * (1.0 - t) + b.y * t;
      // TODO: use position just outside body for particle, check to make sure it's not in some other body

      var nl = Math.sqrt(bsp.nx * bsp.nx + bsp.ny * bsp.ny);
      n.x = bsp.nx / nl;
      n.y = bsp.ny / nl;

      curr.x = a.x;
      curr.y = a.y;
      transformPoint(body.localToWorld, curr);
      transformNormal(body.localToWorld, n);
    }
  }

  return hitBody;
}

function physCollideParticle(phys, particle, prevPos) {
  var n = { x: 0.0, y: 0.0 };

  var body = physFirstCollision(phys, particle.d, prevPos, n);

  if (body == null) {
    return false;
  }

  // particle hit something
  var v = physBodyRelativeVelocity(body, particle.d, n);
  var j = 0.0;

  v -= particle.v.x * n.x + particle.v.y * n.y;

  if (v < 0.0) {  // actually converging at collision point
    // get delta v needed for correct separation velocity
    var e = (particle.properties.e + body.properties.e) * 0.5;  // use mean coefficient of restitution
    v = -v * (1.0 + e);

    // calculate change in velocity per unit of impulse
    var bodyDvDj = physBodyDvByDj(body, particle.d, n);
    var partDvDj = 1.0 / particle.properties.m;

    j = v / (bodyDvDj + partDvDj);

    physBodyApplyImpulse(body, particle.d, n, j);
    particle.v.x -= n.x * j / particle.properties.m;
    particle.v.y -= n.y * j / particle.properties.m;
  }

  if (particle.properties.oncollide) {
    particle.properties.oncollide(particle, body, n);
  }

  if (body.properties.oncollideparticle) {
    body.properties.oncollideparticle(body, particle, n, j);
  }

  // TODO: reflect new position over collision point? Or just transform previous position to new global coordinates?

  return true;
}

// if verticies from body hit otherBody in the previous frame
// returns true if there was a hit
// p, n set to position and normal of first hit
// TODO: find 'first' hit, not just any
function bodyCollideVerts(body, bodyMove, otherBody, p, n) {
  // TODO: transforms depend on if body or otherBody are the ones being moved
  var prevT;
  var currT;

  if (bodyMove) {
    prevT = transformCompose(body.prevLocalToWorld, otherBody.worldToLocal);
    currT = transformCompose(body.localToWorld, otherBody.worldToLocal);
  } else {
    prevT = transformCompose(body.localToWorld, otherBody.prevWorldToLocal);
    currT = transformCompose(body.localToWorld, otherBody.worldToLocal);
  }

  var verts = body.verts;
  var bspTree = otherBody.solid;

  for (var i = 0; i < verts.length; i++) {
    var v = verts[i];
    var prev = { x: v.x, y: v.y };
    var curr = { x: v.x, y: v.y };
    transformPoint(prevT, prev);
    transformPoint(currT, curr);

    var bsp = bspTreeCollide(bspTree, prev.x, prev.y, curr.x, curr.y);

    if (bsp != null) {
      var t = bspIntersect(bsp, curr.x, curr.y, prev.x, prev.y);

      p.x = curr.x * t + prev.x * (1.0 - t);
      p.y = curr.y * t + prev.y * (1.0 - t);
      transformPoint(otherBody.localToWorld, p);

      var nl = Math.sqrt(bsp.nx * bsp.nx + bsp.ny * bsp.ny);
      n.x = bsp.nx / nl;
      n.y = bsp.ny / nl;
      transformNormal(otherBody.localToWorld, n);

      return true;
    }
  }

  return false;
}

function bodyCollide(body, otherBody, p, n) {
  if (bodyCollideVerts(body, true, otherBody, p, n)) {
    return true;
  }
  if (bodyCollideVerts(otherBody, false, body, p, n)) {
    n.x = -n.x;
    n.y = -n.y;
    return true;
  }
  return false;
}

function physBodyFirstCollision(phys, body, p, n) {
  for (var i = 0; i < phys.bodies.length; i++) {
    var otherBody = phys.bodies[i];

    if (body.id != otherBody.id) {
      if (bodyCollide(body, otherBody, p, n)) {
        return otherBody;
      }
    }
  }
  return null;
}

function physCollideBody(phys, body) {
  var n = { x: 0.0, y: 0.0 };
  var p = { x: 0.0, y: 0.0 };
  var otherBody = physBodyFirstCollision(phys, body, p, n);

  if (otherBody == null) {
    return false;
  }

  // have a collision!
  // normal is inward on otherBody

  // resolve impulse
  // get relative velocity
  var v = physBodyRelativeVelocity(otherBody, p, n) - physBodyRelativeVelocity(body, p, n);
  var j = 0.0;

  if (v < 0.0) {
    // delta v for correct separation velocity
    var e = (body.properties.e + otherBody.properties.e) * 0.5; // use mean of the two coefficients of restitution
    v = -v * (1.0 + e);

    // get impulse needed per delta v
    var bodyDvDj = physBodyDvByDj(body, p, { x: -n.x, y: -n.y } );
    var otherBodyDvDj = physBodyDvByDj(otherBody, p, n);
    j = v / (bodyDvDj + otherBodyDvDj);

    // apply impulse
    physBodyApplyImpulse(body, p, n, -j);
    physBodyApplyImpulse(otherBody, p, n, j);
  }

  if (body.properties.oncollidebody) {
    body.properties.oncollidebody(body, otherBody, p, n, -j);
  }

  if (otherBody.properties.oncollidebody) {
    otherBody.properties.oncollidebody(otherBody, body, p, n, j);
  }

  return true;
}

function physTimeStep(phys) {
  var dt = phys.dt;

  for (var i = 0; i < phys.bodies.length; i++) {
    var body = phys.bodies[i];

    // Just use forward euler, since we don't care about gravity (which doesn't exist yet) being accurate
    // and all other accelerations are impulses which are not integrated here
    var dPrevx = body.d.x;
    var dPrevy = body.d.y;
    var θPrev = body.θ;

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

    body.prevWorldToLocal = body.worldToLocal;
    body.prevLocalToWorld = body.localToWorld;
    body.localToWorld = transformTranslate(transformRotateCreate(body.θ), body.d.x, body.d.y);
    body.worldToLocal = transformInvert(body.localToWorld);

    // body-body collision detection
    if (physCollideBody(phys, body)) {
      // back up both body and otherBody to previous timestep
      body.d.x = dPrevx;
      body.d.y = dPrevy;
      body.θ = θPrev;

      body.localToWorld = transformTranslate(transformRotateCreate(body.θ), body.d.x, body.d.y);
      body.worldToLocal = transformInvert(body.localToWorld);
    }

    if (body.properties.ontimestep) {
      body.properties.ontimestep(body, dt);
    }
  }

  var particles = phys.particles;
  for (var i = 0; i < phys.numParticles; i++) {
    var particle = particles[i];
    var prev = { x: particle.d.x, y: particle.d.y };
    var hitBody = null;

    if (physPointInsideBodies(phys, prev)) {
      particle.t = 0.0;
    } else {
      particle.t -= dt;
      particle.d.x += particle.v.x * dt;
      particle.d.y += particle.v.y * dt;

      physCollideParticle(phys, particle, prev);

      if (particle.properties.ontimestep) {
        particle.properties.ontimestep(particle, dt);
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

        var clippedBody = physBodyCreate(
          phys,
          extractedSolid,
          { x: body.d.x, y: body.d.y },
          body.θ,
          { x: body.v.x, y: body.v.y },
          body.ω,
          body.properties);

        if (clippedBody.properties.onclip) {
          clippedBody.properties.onclip(body, clippedBody, bsp);
        }
      }
    }
  }
}

function physDrawcollisionDebugGrid(phys, cam) {
  var ctx = cam.ctx;
  var grid = [];

  var p = cam.mouseModel;

  for (var a = 0.0; a < 2.0 * Math.PI; a += 2.0 * Math.PI / 32.0) {
    grid.push({
      a: { x: p.x, y: p.y },
      b: { x: p.x + Math.cos(a) * 64.0, y: p.y + Math.sin(a) * 64.0 },
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

      try {
        var bsp = bspTreeCollide(body.solid, a.x, a.y, b.x, b.y);

        if (bsp != null) {
          line.t = Math.min(line.t, bspIntersect(bsp, b.x, b.y, a.x, a.y));
        }
      }
      catch (ex)
      {

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
  ctx.strokeStyle = 'grey';
  ctx.lineWidth = 0.2;
  ctx.stroke();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1.0;
}

function physDraw(phys, cam) {
  var ctx = cam.ctx;

  for (var i = 0; i < phys.bodies.length; i++) {
    var body = phys.bodies[i];

    camPushTransform(cam, body.localToWorld);

    ctx.fillStyle = 'black';
    for (var j = 0; j < body.verts.length; j++) {
      var v = body.verts[j];
      ctx.fillRect(v.x - 1.5, v.y - 1.5, 3.0, 3.0);
    }

    camPopTransform(cam);
  }

  for (var i = 0; i < phys.bodies.length; i++) {
    var body = phys.bodies[i];

    camPushTransform(cam, body.localToWorld);

    solidFill(body.solid, cam.ctx);

    ctx.beginPath();
    ctx.arc(0.0, 0.0, 4, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'black';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0.0, 0.0);
    ctx.lineTo(16.0, 0.0);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.beginPath();
    var mouseside = bspTreePointSide(body.solid, cam.mouseModel.x, cam.mouseModel.y);
    if (mouseside == 1 || mouseside == 3) {
      var lines = bspTreeDebugLines(body.solid, cam.mouseModel.x, cam.mouseModel.y, 256.0);
      for (var j = 0; j < lines.length; j++) {
        var line = lines[j];
        ctx.moveTo(line.a.x, line.a.y);
        ctx.lineTo(line.b.x, line.b.y);
      }
    }
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 0.25;
    ctx.stroke();
    ctx.lineWidth = 1.0;

    camPushTransform(cam, transformStretchCreate(1.0, -1.0));
    ctx.font = '12px Courier';
    ctx.fillText(body.id.toString(), 4, -2);
    camPopTransform(cam);
    camPopTransform(cam);
  }

  for (var i = 0; i < phys.numParticles; i++) {
    var particle = phys.particles[i];

    ctx.fillRect(particle.d.x - 1.5, particle.d.y - 1.5, 3.0, 3.0);
  }

  //physDrawcollisionDebugGrid(phys, cam);
}

function physBodyLocalCoordinatesAtPosition(phys, p) {
  for (var i = 0; i < phys.bodies.length; i++) {
    var body = phys.bodies[i];
    var l = { x: p.x, y: p.y };

    transformPoint(body.worldToLocal, l);

    if (1 == (1 & bspTreePointSide(body.solid, l.x, l.y))) {
      p.x = l.x;
      p.y = l.y;
      return true;
    }
  }

  return false;
}

function physPointInsideBodies(phys, p) {
  for (var i = 0; i < phys.bodies.length; i++) {
    var body = phys.bodies[i];
    var l = { x: p.x, y: p.y };

    transformPoint(body.worldToLocal, l);

    if (1 == (1 & bspTreePointSide(body.solid, l.x, l.y))) {
      return true;
    }
  }

  return false;
}

export {
  physBodyApplyAngularImpulse,
  physBodyApplyLinearImpulse,
  physBodyCreate,
  physBodyLocalCoordinatesAtPosition,
  physBodyPropertiesCreate,
  physBodyVelocity,
  physClipBodies,
  physCreate,
  physDraw,
  physParticleCreate,
  physParticlePropertiesCreate,
  physPointInsideBodies,
  physReset,
  physTimeStep,
};
