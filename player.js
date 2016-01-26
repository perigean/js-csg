// player.js
//
// Copyright Charles Dick 2015
//
// Controls a player in the world simulated by phys.js
// TODO: binds controls
// TODO: tracks damage
//
// requires phys.js

function playerCreate(phys, d, θ, input, camera) {
  var state = {
    health: 100.0,
    cooldown: 0.0,
  };

  var regularParticle = physParticlePropertiesCreate(9.0, 0.9, null, null);

  var explosiveParticle = physParticlePropertiesCreate(100.0, 0.9,
    function explosiveParticleoncollide(particle, body, n) {
      var t = transformTranslateCreate(particle.d.x, particle.d.y);
      var bsp = bspTreeTransformClone(bspTestSquare, t);

      // kill the particle
      particle.t = 0;

      // add explosion debris
      for (var x = -15.0; x <= 15.0; x += 3.0) {
        for (var y = -15.0; y <= 15.0; y += 3.0) {
          var p = { x: particle.d.x + x, y: particle.d.y + y };

          if (physPointInsideBodies(phys, p)) {
            var v = { x: 0.0, y: 0.0 };
            physBodyVelocity(body, p, v);

            v.x += (x - n.x * 32) * 2.0;
            v.y += (y - n.y * 32) * 2.0;

            physParticleCreate(
              phys,
              p,
              v,
              1.0,
              regularParticle);
          }
        }
      }

      physClipBodies(phys, bsp);
    },
    null
  );

  var props = physBodyPropertiesCreate(
    1.0,  // density
    1.0,  // coefficient of restitution
    function playerOncollideparticle(body, particle, n, j) {
      // TODO: take damage
    },
    function playerOncollidebody(body, otherBody, p, n, j) {
      // TODO: take damage
    },
    function playerOntimestep(body, dt) {
      var speed = Math.sqrt(body.v.x * body.v.x + body.v.y * body.v.y);

      camPosition(
        camera,
        { x: body.d.x + body.v.x * 0.25, y: body.d.y + body.v.y * 0.25 },
        1.0 / (1.0 + speed / 256.0)
      );

      // orientation controls
      if (input.left == true) {
        if (body.ω < 6.24) {
          // TODO: PID controller?
          physBodyApplyAngularImpulse(body, 20000.0);
        }
      } else if (input.right == true) {
        if (body.ω > -6.24) {
          physBodyApplyAngularImpulse(body, -20000.0);
        }
      } else {
        if (body.ω > 0.0) {
          physBodyApplyAngularImpulse(body, -20000.0);
        } else if (body.ω < 0.0) {
          physBodyApplyAngularImpulse(body, 20000.0);
        }
      }

      // throttle controls
      if (input.throttle == true) {
        var n = {
          x: Math.cos(body.θ),
          y: Math.sin(body.θ),
        };

        physBodyApplyLinearImpulse(body, n, 5000.0);
      }

      // fire controls
      if (state.cooldown > 0.0) {
        state.cooldown -= dt;
      }

      if (input.fire == true && state.cooldown <= 0.0) {
        state.cooldown += 0.1;

        var n = {
          x: Math.cos(body.θ),
          y: Math.sin(body.θ),
        };

        var d = {
          x: body.d.x + n.x * 24.0,
          y: body.d.y + n.y * 24.0,
        };

        var v = {
          x: body.v.x + n.x * 200.0,
          y: body.v.y + n.y * 200.0,
        };

        physParticleCreate(phys, d, v, 3.0, explosiveParticle);
      }
    },
    function playerOnclip(body, clippedBody, bsp) {
      // TODO: die?
    }
  );

  var mesh = meshCreate([{ x: -16.0, y: -16.0 }, { x: 16.0, y: 0.0 }, { x: -16.0, y: 16.0 }])
  var solid = solidCreate(mesh);

  var body = physBodyCreate(
    phys,
    solid,
    d, θ,
    { x: 0.0, y: 0.0 }, 0.0,
    props);

  // NB: player doesn't include the body since it's not guarenteed to be the
  // same from frame to frame (phys can reuse them etc.)
  return {
    state: state,
    camera: camera,
  };
}
