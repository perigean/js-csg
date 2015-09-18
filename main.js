// main.js
//
// Copywrite Charles Dick 2015

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

function render() {
  camClear(camera);
  physDraw(phys, camera);
}

function renderNextFrame() {
  // TODO: decouple frame rate and phys time step

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

  rec = recorderCreate(phys, document.getElementById('log'));
  recorderAddShape(rec,
    [{ x: -64, y: -64 },{ x: 64, y: -64 },{ x: 64, y: 64 },{ x: -64, y: 64 }],
    1.0,                                // density
    { x: 0.0, y: 0.0 }, 0.0,            // position
    { x: 0.0, y: 0.0 }, 0.0);  // velocity

  recorderAddShape(rec,
    [{ x: -32, y: -32 },{ x: 32, y: -32 },{ x: 32, y: 32 },{ x: -32, y: 32 }],
    1.0,                                // density
    { x: -256.0, y: 0.0 }, 0.0,            // position
    { x: 72.0, y: 0.0 }, 0.0);  // velocity

  recorderAddShape(rec,
    [{ x: -32, y: -32 },{ x: 32, y: -32 },{ x: 32, y: 32 },{ x: -32, y: 32 }],
    1.0,                                // density
    { x: 256.0, y: 0.0 }, 0.0,            // position
    { x: -70.0, y: 0.0 }, 0.0);  // velocity

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
      for (var i = 0; i < 20; i++) {
        var r = Math.random() * 8;
        var a = Math.random() * Math.PI * 2.0;
        var d = { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r };

        recorderAddParticle(rec, 10.0, d, { x: 256.0, y: 0.0 }, 5.0);
      }


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
