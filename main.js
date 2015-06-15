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


var bspTestTopRight = {px: 0, py: 0, nx: 1, ny: 0,
  in: { px: 0, py: 0, nx: 0, ny: 1,
    in: null,
    out: null },
  out: null };

var mesh = meshCreate([{ x: -64, y: -64 },{ x: 64, y: -64 },{ x: 64, y: 64 },{ x: -64, y: 64 }]);

var frame = 0;
function renderLoop(timeStamp) {
  frame++;

  // TODO: decouple frame rate and phys time step

  physTimeStep(phys, 0.016666667);
  camClear(camera);
  physDraw(phys, camera);

  requestAnimationFrame(renderLoop);
}

function main() {
  var canvas = document.getElementById('canvas');
  camera = camCreate(canvas);
  log = document.getElementById('log');

  phys = physCreate();
  physAddShape(phys, solidCreate(mesh), { x: 0.0, y: 0.0 }, 0.0, {x: 0.0, y: 0.0 }, -Math.PI * 0.5);

  camClear(camera);
  physDraw(phys, camera);

  requestAnimationFrame(renderLoop);

  canvas.onclick = function (evt) {
    var p = { x: evt.offsetX, y: evt.offsetY };
    camScreenToWorld(camera, p);

    log.innerHTML += "frame " + frame + ": (" + p.x + ", " + p.y + ") <br />";

    var t = transformTranslateCreate(p.x, p.y);
    var bsp = bspTreeTransformClone(bspTestSquare, t);

    physClipBodies(phys, bsp);
  };

};
