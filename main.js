// main.js
//
// Copywrite Charles Dick 2015

var camera;
var log;
var phys;

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

var mesh = meshCreate([{ x: -64, y: -64 },{ x: 64, y: -64 },{ x: 64, y: 64 },{ x: -64, y: 64 }]);

var playing = 0;
var frame = 0;
var time = 0.0;

function renderNextFrame() {
  frame++;
  time += 0.016666667;

  // TODO: decouple frame rate and phys time step

  physTimeStep(phys);

  camClear(camera);
  physDraw(phys, camera);
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

  camera = camCreate(canvas);
  log = document.getElementById('log');

  phys = physCreate(0.016666667);
  physAddShape(phys, solidCreate(mesh), 1.0, { x: 0.0, y: 0.0 }, 0.0, {x: 0.0, y: 0.0 }, Math.PI * 0.5);

  camClear(camera);
  physDraw(phys, camera);

  canvas.onclick = function (evt) {
    var p = { x: evt.offsetX, y: evt.offsetY };
    camScreenToWorld(camera, p);

    if (evt.shiftKey) {
      log.innerHTML += "frame " + frame + ": shotgun (" + p.x + ", " + p.y + ") <br />";

      for (var i = 0; i < 20; i++) {
        var r = Math.random() * 16;
        var a = Math.random() * Math.PI * 2.0;
        var d = { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r };

        physAddParticle(phys, 10.0, d, { x: 256.0, y: 0.0 }, 2.0);
      }


    } else {
      log.innerHTML += "frame " + frame + ": subtract (" + p.x + ", " + p.y + ") <br />";

      var t = transformTranslateCreate(p.x, p.y);
      var bsp = bspTreeTransformClone(bspTestCut, t);

      physClipBodies(phys, bsp);
    }

    if (playing == 0) {
      camClear(camera);
      physDraw(phys, camera);
    }
  };

  pp.onclick = playPause;
  nf.onclick = nextFrame;
};
