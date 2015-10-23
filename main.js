// main.js
//
// Copywrite Charles Dick 2015

// TODO: avoid all short-lived allocations by using allocation pools

var camera;
var log;

var bspTestSquare = { px: 0, py: 0, nx: 1, ny: 1,
    in: { px: 0, py: 16, nx: 0, ny: 1,
        in: null,
        out: { px: 16, py: 0, nx: 1, ny: 0, in: null, out:null }
        },
    out: { px: 0, py: -16, nx: 0, ny: -1,
        in: null,
        out: { px: -16, py: 0, nx: -1, ny: 0, in: null, out: null }
        }
    };

var bspTestRight = {px: 0, py: 0, nx: 1, ny: 0,
  in: null,
  out: null
  };

var bspTestCut = {px: 4, py: 0, nx: 1, ny: 0,
  in: null,
  out: {px: -4, py: 0, nx: -1, ny: 0,
    in: null,
    out: null
    }
  };


var bspTestTopRight = {px: 0, py: 0, nx: 1, ny: 0,
  in: { px: 0, py: 0, nx: 0, ny: 1,
    in: null,
    out: null },
  out: null };

var playing = 0;

var phys = physCreate(0.016666667);
var rec;

var regularParticle = physCreateParticleProperties(9.0, 1.0, null, null);

var explosiveParticle = physCreateParticleProperties(1000.0, 1.0,
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

          physAddParticle(
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

function render() {
  camClear(camera);
  physDraw(phys, camera);
}

function renderNextFrame() {
  // TODO: decouple frame rate and phys time step?

  recorderNextFrame(rec);
  render();
}

function renderLoop(timeStamp) {
  renderNextFrame();
  playing = requestAnimationFrame(renderLoop);
}

function playPause() {
  var pp = document.getElementById("playpause");
  var nf = document.getElementById("nextframe");

  if (playing != 0) {
    nf.disabled = false;
    pp.innerHTML = "▶";
    cancelAnimationFrame(playing);
    playing = 0;
  } else {
    nf.disabled = true;
    pp.innerHTML = "❚❚";
    playing = requestAnimationFrame(renderLoop);
  }
}

function nextFrame() {
  renderNextFrame();
}

function main() {
  var canvas = document.getElementById('canvas');
  var pp = document.getElementById("playpause");
  var nf = document.getElementById("nextframe");
  var rp = document.getElementById("replay");
  pp.onclick = playPause;
  nf.onclick = nextFrame;
  rp.onclick = function (evt) {
    recorderReplay(rec);
    camClear(camera);
    physDraw(phys, camera);
  }

  var shapeProps = physCreateBodyProperties(1.0, 1.0, null, null, null, null);

  rec = recorderCreate(phys, document.getElementById('log'));
  recorderAddShape(rec,
    [{ x: -64, y: -64 },{ x: 64, y: -64 },{ x: 64, y: 64 },{ x: -64, y: 64 }],
    { x: 0.0, y: 0.0 }, 0.0,    // position
    { x: 0.0, y: 0.0 }, 0.0,    // velocity
    shapeProps);

  recorderAddShape(rec,
    [{ x: -32, y: -32 },{ x: 32, y: -32 },{ x: 32, y: 32 },{ x: -32, y: 32 }],
    { x: -256.0, y: 0.0 }, 0.0, // position
    { x: 72.0, y: 0.0 }, 0.0,   // velocity
    shapeProps);

  recorderAddShape(rec,
    [{ x: -32, y: -32 },{ x: 32, y: -32 },{ x: 32, y: 32 },{ x: -32, y: 32 }],
    { x: 256.0, y: 0.0 }, 0.0,  // position
    { x: -70.0, y: 0.0 }, 0.0,  // velocity
    shapeProps);

  camera = camCreate(canvas, render);
  camClear(camera);
  physDraw(phys, camera);

  canvas.onmousemove = function (evt) {
    var p = { x: evt.offsetX, y: evt.offsetY };
    camCameraToModel(camera, p);

    document.getElementById('worldx').innerHTML = p.x.toFixed(3);
    document.getElementById('worldy').innerHTML = p.y.toFixed(3);

    if (physBodyLocalCoordinatesAtPosition(phys, p)) {
      document.getElementById('localx').innerHTML = p.x.toFixed(3);
      document.getElementById('localy').innerHTML = p.y.toFixed(3);
    } else {
      document.getElementById('localx').innerHTML = 'N/A';
      document.getElementById('localy').innerHTML = 'N/A';
    }
  };

  canvas.onclick = function (evt) {
    var p = { x: evt.offsetX, y: evt.offsetY };
    camCameraToModel(camera, p);

    if (evt.shiftKey) {
      physAddParticle(phys, p, { x: 75.0, y: 0.0 }, 5.0, explosiveParticle);

    } else {
      var t = transformTranslateCreate(p.x, p.y);
      var bsp = bspTreeTransformClone(bspTestSquare, t);

      recorderClipBodies(rec, bsp);
    }

    if (playing == 0) {
      camClear(camera);
      physDraw(phys, camera);
    }
  };
};
