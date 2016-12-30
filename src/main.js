// main.js
//
// Copyright Charles Dick 2015

// TODO: use webpack, convert to modules
// TODO: use react
// TODO: add list of flagged items
// TODO: use flow
// TODO: avoid all short-lived allocations by using allocation pools?

var camera;
var log;

import {
  bspTreeTransformClone
} from './bsp.js';

import {
  camCameraToModel,
  camCreate,
  camClear,
} from './camera.js';

import {
  meshCreate,
} from './mesh.js';

import {
  physBodyCreate,
  physBodyLocalCoordinatesAtPosition,
  physBodyPropertiesCreate,
  physClipBodies,
  physCreate,
  physDraw,
  physParticleCreate,
  physReset,
} from './phys.js';

import {
  bspTestSquare,  // TODO: move this
  playerCreate,
} from './player.js';

import {
  recorderCreate,
  recorderReplay,
  recorderTimeStep,
} from './recorder.js';

import {
  solidCreate,
} from './solid.js';

import {
  transformTranslateCreate,
} from './transform.js'

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
var input = inputBind();
var recorder;

function render() {
  camClear(camera);
  physDraw(phys, camera);
}

function renderNextFrame() {
  // TODO: decouple frame rate and phys time step?

  recorderTimeStep(recorder);
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

// TODO: move this somewhere, and maybe hang it off of something other than the window
function inputBind() {
  var log = document.getElementById('log');

  var input = {
    left: false,
    right: false,
    throttle: false,
    fire: false,
  };

  function toggleInput(isDown, e) {
    switch (e.which) {
      case 65:  // a - left
      input.left = isDown;
      break;

      case 68:  // d - right
      input.right = isDown;
      break;

      case 87: // w - throttle
      input.throttle = isDown;
      break;

      case 32: // space - fire
      input.fire = isDown;
      e.preventDefault();
      break;
    }
  };

  window.addEventListener('keydown', function inputKeyDown(e) {
    toggleInput(true, e);
  });

  window.addEventListener('keyup', function inputKeyDown(e) {
    toggleInput(false, e);
  });

  return input;
};

function initializeField() {
  var shapeProps = physBodyPropertiesCreate(1.0, 0.9, null, null, null, null);

  physReset(phys);

  physBodyCreate(phys,
    solidCreate(meshCreate([{ x: -64, y: -64 },{ x: 64, y: -64 },{ x: 64, y: 64 },{ x: -64, y: 64 }])),
    { x: 0.0, y: 0.0 }, 0.0,    // position
    { x: 0.0, y: 0.0 }, 0.0,    // velocity
    shapeProps);

  physBodyCreate(phys,
    solidCreate(meshCreate([{ x: -32, y: -32 },{ x: 32, y: -32 },{ x: 32, y: 32 },{ x: -32, y: 32 }])),
    { x: -256.0, y: 0.0 }, 0.0, // position
    { x: 72.0, y: 0.0 }, 0.0,   // velocity
    shapeProps);

  physBodyCreate(phys,
    solidCreate(meshCreate([{ x: -32, y: -32 },{ x: 32, y: -32 },{ x: 32, y: 32 },{ x: -32, y: 32 }])),
    { x: 256.0, y: 0.0 }, 0.0,  // position
    { x: -70.0, y: 0.0 }, 0.0,  // velocity
    shapeProps);

  playerCreate(phys, { x: 0.0, y: 128.0 }, 0.0, input, camera);
}

function main() {
  var canvas = document.getElementById('canvas');
  var pp = document.getElementById("playpause");
  var nf = document.getElementById("nextframe");
  var rp = document.getElementById("replay");
  pp.onclick = playPause;
  nf.onclick = nextFrame;
  rp.onclick = function (evt) {
    initializeField();
    recorderReplay(recorder, render);
  };

  recorder = recorderCreate(
    phys,
    input,
    document.getElementById('log'),
    document.getElementById('frame'));

  camera = camCreate(canvas, render);

  initializeField();

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
      physParticleCreate(phys, p, { x: 75.0, y: 0.0 }, 5.0, explosiveParticle);

    } else {
      var t = transformTranslateCreate(p.x, p.y);
      var bsp = bspTreeTransformClone(bspTestSquare, t);

      physClipBodies(phys, bsp);
    }

    if (playing == 0) {
      camClear(camera);
      physDraw(phys, camera);
    }
  };
};

main();
