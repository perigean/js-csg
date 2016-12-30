/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _bsp = __webpack_require__(1);
	
	var _camera = __webpack_require__(2);
	
	var _mesh = __webpack_require__(4);
	
	var _phys = __webpack_require__(5);
	
	var _player = __webpack_require__(7);
	
	var _recorder = __webpack_require__(8);
	
	var _solid = __webpack_require__(6);
	
	var _transform = __webpack_require__(3);
	
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
	
	var bspTestRight = { px: 0, py: 0, nx: 1, ny: 0,
	  in: null,
	  out: null
	};
	
	var bspTestCut = { px: 4, py: 0, nx: 1, ny: 0,
	  in: null,
	  out: { px: -4, py: 0, nx: -1, ny: 0,
	    in: null,
	    out: null
	  }
	};
	
	var bspTestTopRight = { px: 0, py: 0, nx: 1, ny: 0,
	  in: { px: 0, py: 0, nx: 0, ny: 1,
	    in: null,
	    out: null },
	  out: null };
	
	var playing = 0;
	
	var phys = (0, _phys.physCreate)(0.016666667);
	var input = inputBind();
	var recorder;
	
	function render() {
	  (0, _camera.camClear)(camera);
	  (0, _phys.physDraw)(phys, camera);
	}
	
	function renderNextFrame() {
	  // TODO: decouple frame rate and phys time step?
	
	  (0, _recorder.recorderTimeStep)(recorder);
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
	    fire: false
	  };
	
	  function toggleInput(isDown, e) {
	    switch (e.which) {
	      case 65:
	        // a - left
	        input.left = isDown;
	        break;
	
	      case 68:
	        // d - right
	        input.right = isDown;
	        break;
	
	      case 87:
	        // w - throttle
	        input.throttle = isDown;
	        break;
	
	      case 32:
	        // space - fire
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
	  var shapeProps = (0, _phys.physBodyPropertiesCreate)(1.0, 0.9, null, null, null, null);
	
	  (0, _phys.physReset)(phys);
	
	  (0, _phys.physBodyCreate)(phys, (0, _solid.solidCreate)((0, _mesh.meshCreate)([{ x: -64, y: -64 }, { x: 64, y: -64 }, { x: 64, y: 64 }, { x: -64, y: 64 }])), { x: 0.0, y: 0.0 }, 0.0, // position
	  { x: 0.0, y: 0.0 }, 0.0, // velocity
	  shapeProps);
	
	  (0, _phys.physBodyCreate)(phys, (0, _solid.solidCreate)((0, _mesh.meshCreate)([{ x: -32, y: -32 }, { x: 32, y: -32 }, { x: 32, y: 32 }, { x: -32, y: 32 }])), { x: -256.0, y: 0.0 }, 0.0, // position
	  { x: 72.0, y: 0.0 }, 0.0, // velocity
	  shapeProps);
	
	  (0, _phys.physBodyCreate)(phys, (0, _solid.solidCreate)((0, _mesh.meshCreate)([{ x: -32, y: -32 }, { x: 32, y: -32 }, { x: 32, y: 32 }, { x: -32, y: 32 }])), { x: 256.0, y: 0.0 }, 0.0, // position
	  { x: -70.0, y: 0.0 }, 0.0, // velocity
	  shapeProps);
	
	  (0, _player.playerCreate)(phys, { x: 0.0, y: 128.0 }, 0.0, input, camera);
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
	    (0, _recorder.recorderReplay)(recorder, render);
	  };
	
	  recorder = (0, _recorder.recorderCreate)(phys, input, document.getElementById('log'), document.getElementById('frame'));
	
	  camera = (0, _camera.camCreate)(canvas, render);
	
	  initializeField();
	
	  (0, _camera.camClear)(camera);
	  (0, _phys.physDraw)(phys, camera);
	
	  canvas.onmousemove = function (evt) {
	    var p = { x: evt.offsetX, y: evt.offsetY };
	    (0, _camera.camCameraToModel)(camera, p);
	
	    document.getElementById('worldx').innerHTML = p.x.toFixed(3);
	    document.getElementById('worldy').innerHTML = p.y.toFixed(3);
	
	    if ((0, _phys.physBodyLocalCoordinatesAtPosition)(phys, p)) {
	      document.getElementById('localx').innerHTML = p.x.toFixed(3);
	      document.getElementById('localy').innerHTML = p.y.toFixed(3);
	    } else {
	      document.getElementById('localx').innerHTML = 'N/A';
	      document.getElementById('localy').innerHTML = 'N/A';
	    }
	  };
	
	  canvas.onclick = function (evt) {
	    var p = { x: evt.offsetX, y: evt.offsetY };
	    (0, _camera.camCameraToModel)(camera, p);
	
	    if (evt.shiftKey) {
	      (0, _phys.physParticleCreate)(phys, p, { x: 75.0, y: 0.0 }, 5.0, explosiveParticle);
	    } else {
	      var t = (0, _transform.transformTranslateCreate)(p.x, p.y);
	      var bsp = (0, _bsp.bspTreeTransformClone)(_player.bspTestSquare, t);
	
	      (0, _phys.physClipBodies)(phys, bsp);
	    }
	
	    if (playing == 0) {
	      (0, _camera.camClear)(camera);
	      (0, _phys.physDraw)(phys, camera);
	    }
	  };
	};
	
	main();

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// bsp.js
	//
	// Copyright Charles Dick 2015
	//
	// This file contains functions to create and manipulate BSP trees and related structures
	//
	// Structures used:
	//
	// bsp - Binary Space Partition, splits a plane in half.
	// bspTree - Tree of Binary Space Partitions, can describe arbitrary regions by nesting splits.
	// bspTreeSolid - bspTree with added polygon information, so we know how to draw the region described.
	//  The polygons cover all paths in the tree, no polygon can be on a branch under a branch with a polygon.
	
	function bspTreeCreate(px, py, nx, ny, inBspTree, outBspTree) {
	  return {
	    px: px,
	    py: py,
	    nx: nx,
	    ny: ny,
	    in: inBspTree,
	    out: outBspTree
	  };
	}
	
	function bspSide(bsp, x, y) {
	  return (x - bsp.px) * bsp.nx + (y - bsp.py) * bsp.ny;
	}
	
	function bspSideStable(bsp, x, y) {
	  // s = (p - bsp.p) dot bsp.n
	  var s = (x - bsp.px) * bsp.nx + (y - bsp.py) * bsp.ny;
	
	  if (s * s / (bsp.nx * bsp.nx + bsp.ny * bsp.ny) < 0.01) {
	    return 0.0;
	  }
	
	  return s;
	}
	
	// returns t s.t. intersection point = a * t + b * (1 - t)
	function bspIntersect(bsp, ax, ay, bx, by) {
	  var cx = bsp.px; // point on split
	  var cy = bsp.py;
	
	  var dx = bsp.ny; // direction vector on split (rotate normal)
	  var dy = -bsp.nx;
	
	  var t = (dx * by - dx * cy - dy * bx + dy * cx) / (dy * ax - dy * bx - dx * ay + dx * by);
	
	  return t;
	}
	
	// bspTreePointSide
	//  determines if point (x, y) is in, out, or on the edge of region described by bspTree
	// returns
	//  1 iff point is strictly in
	//  2 iff point is stricly out
	//  3 iff point is on boundary
	function bspTreePointSide(bspTree, x, y) {
	  var side = bspSideStable(bspTree, x, y);
	
	  if (side > 0.0) {
	    return bspTree.in == null ? 1 : bspTreePointSide(bspTree.in, x, y);
	  } else if (side < 0.0) {
	    return bspTree.out == null ? 2 : bspTreePointSide(bspTree.out, x, y);
	  } else {
	    // side == 0.0
	    var inRes = bspTree.in == null ? 1 : bspTreePointSide(bspTree.in, x, y);
	    var outRes = bspTree.out == null ? 2 : bspTreePointSide(bspTree.out, x, y);
	    return inRes | outRes;
	  }
	}
	
	function bspTreePointSplit(bspTree, x, y) {
	  var side = bspSideStable(bspTree, x, y);
	
	  if (side > 0.0) {
	    return bspTree.in && bspTreePointSplit(bspTree.in, x, y);
	  } else if (side < 0.0) {
	    return bspTree.out && bspTreePointSplit(bspTree.out, x, y);
	  } else {
	    // side == 0.0
	    return bspTree;
	  }
	}
	
	// look for intersections strictly between a and b
	function bspTreeCollideInterior(bspTree, ax, ay, bx, by) {
	  if (bspTree == null) {
	    throw 'invalid argument, bspTree can not be null';
	  }
	
	  var aSide = bspSideStable(bspTree, ax, ay);
	  var bSide = bspSideStable(bspTree, bx, by);
	
	  if (aSide >= 0.0 && bSide >= 0.0) {
	    // all in
	    return bspTree.in && bspTreeCollideInterior(bspTree.in, ax, ay, bx, by);
	  } else if (aSide <= 0.0 && bSide <= 0.0) {
	    // all out
	    return bspTree.out && bspTreeCollideInterior(bspTree.out, ax, ay, bx, by);
	  } else {
	    // crossing
	    var t = bspIntersect(bspTree, ax, ay, bx, by);
	
	    if (t <= 0.0 || t >= 1.0) {
	      throw 'crossing segment not crossing';
	    }
	
	    var cx = t * ax + (1.0 - t) * bx;
	    var cy = t * ay + (1.0 - t) * by;
	
	    if (aSide > 0.0 && bSide < 0.0) {
	      // check in side first
	      var i = bspTree.in && bspTreeCollideInterior(bspTree.in, ax, ay, cx, cy);
	      var x = 3 == bspTreePointSide(bspTree, cx, cy) ? bspTree : null;
	      var o = bspTree.out && bspTreeCollideInterior(bspTree.out, cx, cy, bx, by);
	
	      return i || x || o;
	    } else if (aSide < 0.0 && bSide > 0.0) {
	      // check out side first
	      var o = bspTree.out && bspTreeCollideInterior(bspTree.out, ax, ay, cx, cy);
	      var x = bspTreePointSide(bspTree, cx, cy);
	      var i = bspTree.in && bspTreeCollideInterior(bspTree.in, cx, cy, bx, by);
	
	      return o || (x == 3 ? bspTree : null) || i;
	    } else {
	      throw 'crossing segment not crossing';
	    }
	  }
	}
	
	function bspTreeCollide(bspTree, ax, ay, bx, by) {
	  // make sure we're starting on the outside of a region
	  if (2 != bspTreePointSide(bspTree, ax, ay)) {
	    throw 'start of segment not outside bspTree';
	  }
	
	  // check for any collision points between a and b
	  var bspSplit = bspTreeCollideInterior(bspTree, ax, ay, bx, by);
	
	  if (bspSplit != null) {
	    return bspSplit;
	  }
	
	  var bTreeSide = bspTreePointSide(bspTree, bx, by);
	
	  switch (bTreeSide) {
	    case 1:
	      throw 'segment started outside, ended inside, but didnt cross!?';
	
	    case 2:
	      return null; // line segment is outside
	
	    case 3:
	      return bspTreePointSplit(bspTree, bx, by); // b is on a split, find it
	
	    default:
	      throw 'unexpected return value from bspTreePointSide';
	  }
	}
	
	function bspTransform(bsp, t) {
	  var px = bsp.px * t.ix + bsp.py * t.jx + t.dx;
	  var py = bsp.px * t.iy + bsp.py * t.jy + t.dy;
	  var nx = bsp.nx * t.ix + bsp.ny * t.jx;
	  var ny = bsp.nx * t.iy + bsp.ny * t.jy;
	
	  bsp.px = px;
	  bsp.py = py;
	  bsp.nx = nx;
	  bsp.ny = ny;
	}
	
	function bspTreeTransform(bspTree, t) {
	  if (bspTree == null) {
	    return;
	  }
	
	  bspTreeTransform(bspTree.in, t);
	  bspTreeTransform(bspTree.out, t);
	  bspTransform(bspTree);
	}
	
	function bspTreeTransformClone(bspTree, t) {
	  if (bspTree == null) {
	    return;
	  }
	
	  var clone = bspTreeCreate(bspTree.px, bspTree.py, bspTree.nx, bspTree.ny, null, null);
	
	  bspTransform(clone, t);
	  clone.in = bspTreeTransformClone(bspTree.in, t);
	  clone.out = bspTreeTransformClone(bspTree.out, t);
	
	  return clone;
	}
	
	function bspDebugLinesClipIn(bsp, lines) {
	  var clipped = [];
	  for (var i = 0; i < lines.length; i++) {
	    var line = lines[i];
	    var aside = bspSideStable(bsp, line.a.x, line.a.y);
	    var bside = bspSideStable(bsp, line.b.x, line.b.y);
	    if (aside >= 0.0 && bside >= 0.0) {
	      clipped.push(line);
	    } else if (aside <= 0.0 && bside <= 0.0) {
	      // clipped out
	    } else {
	      var t = bspIntersect(bsp, line.a.x, line.a.y, line.b.x, line.b.y);
	      var cx = t * line.a.x + (1.0 - t) * line.b.x;
	      var cy = t * line.a.y + (1.0 - t) * line.b.y;
	      if (aside > 0.0 && bside < 0.0) {
	        clipped.push({ a: line.a, b: { x: cx, y: cy } });
	      } else if (bside > 0.0 && aside < 0.0) {
	        clipped.push({ a: { x: cx, y: cy }, b: line.b });
	      } else {
	        throw "line to be clipped is crossing and not crossing!";
	      }
	    }
	  }
	  return clipped;
	}
	
	function bspDebugLinesClipOut(bsp, lines) {
	  var clipped = [];
	  for (var i = 0; i < lines.length; i++) {
	    var line = lines[i];
	    var aside = bspSideStable(bsp, line.a.x, line.a.y);
	    var bside = bspSideStable(bsp, line.b.x, line.b.y);
	    if (aside <= 0.0 && bside <= 0.0) {
	      clipped.push(line);
	    } else if (aside >= 0.0 && bside >= 0.0) {
	      // clipped in
	    } else {
	      var t = bspIntersect(bsp, line.a.x, line.a.y, line.b.x, line.b.y);
	      var cx = t * line.a.x + (1.0 - t) * line.b.x;
	      var cy = t * line.a.y + (1.0 - t) * line.b.y;
	      if (aside < 0.0 && bside > 0.0) {
	        clipped.push({ a: line.a, b: { x: cx, y: cy } });
	      } else if (bside < 0.0 && aside > 0.0) {
	        clipped.push({ a: { x: cx, y: cy }, b: line.b });
	      } else {
	        throw "line to be clipped is crossing and not crossing!";
	      }
	    }
	  }
	  return clipped;
	}
	
	function bspTreeDebugLines(bspTree, x, y, l) {
	  if (bspTree == null) {
	    return [];
	  }
	
	  var nScale = l / Math.sqrt(bspTree.nx * bspTree.nx + bspTree.ny * bspTree.ny);
	  var side = bspSideStable(bspTree, x, y);
	  var line = {
	    a: {
	      x: bspTree.px - bspTree.ny * nScale,
	      y: bspTree.py + bspTree.nx * nScale },
	    b: {
	      x: bspTree.px + bspTree.ny * nScale,
	      y: bspTree.py - bspTree.nx * nScale },
	    side: side };
	
	  var lines;
	  if (side > 0.0) {
	    lines = bspDebugLinesClipIn(bspTree, bspTreeDebugLines(bspTree.in, x, y, l));
	  } else if (side < 0.0) {
	    lines = bspDebugLinesClipOut(bspTree, bspTreeDebugLines(bspTree.out, x, y, l));
	  } else {
	    lines = bspDebugLinesClipIn(bspTree, bspTreeDebugLines(bspTree.in, x, y, l));
	    lines = lines.concat(bspDebugLinesClipOut(bspTree, bspTreeDebugLines(bspTree.out, x, y, l)));
	  }
	  lines.push(line);
	  return lines;
	}
	
	exports.bspIntersect = bspIntersect;
	exports.bspSideStable = bspSideStable;
	exports.bspTransform = bspTransform;
	exports.bspTreeCollide = bspTreeCollide;
	exports.bspTreeDebugLines = bspTreeDebugLines;
	exports.bspTreePointSide = bspTreePointSide;
	exports.bspTreeTransformClone = bspTreeTransformClone;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.camPushTransform = exports.camPosition = exports.camPopTransform = exports.camClear = exports.camCameraToModel = exports.camCreate = undefined;
	
	var _transform = __webpack_require__(3);
	
	function camCreate(canvas, drawCallback) {
	  var ctx = canvas.getContext('2d');
	
	  var t = (0, _transform.transformStretchCreate)(1.0, -1.0); // flip y axis
	  t = (0, _transform.transformTranslate)(t, canvas.width * 0.5, canvas.height * 0.5);
	
	  ctx.setTransform(t.ix, t.iy, t.jx, t.jy, t.dx, t.dy);
	
	  var cam = {
	    canvas: canvas,
	    ctx: ctx,
	    worldToCamera: t,
	    modelToWorld: [(0, _transform.transformCreate)()],
	    cameraToModel: (0, _transform.transformInvert)(t),
	    mouseModel: { x: 0.0, y: 0.0 },
	    mouseCamera: { x: 0.0, y: 0.0 }
	  };
	
	  canvas.addEventListener('mousewheel', function cameraOnMouseWheel(evt) {
	    if (evt.shiftKey) {
	      var scale = Math.log(-evt.deltaY / 500.0 + Math.E);
	      var worldToCamera = cam.worldToCamera;
	
	      // centre camera on mouse position
	      worldToCamera = (0, _transform.transformTranslate)(worldToCamera, -evt.offsetX, -evt.offsetY);
	      worldToCamera = (0, _transform.transformScale)(worldToCamera, scale);
	      worldToCamera = (0, _transform.transformTranslate)(worldToCamera, evt.offsetX, evt.offsetY);
	
	      cam.worldToCamera = worldToCamera;
	    } else {
	      var delta = { x: -evt.deltaX, y: -evt.deltaY };
	      cam.worldToCamera = (0, _transform.transformTranslate)(cam.worldToCamera, delta.x, delta.y);
	    }
	
	    camRecompose(cam);
	    drawCallback();
	
	    evt.preventDefault();
	  });
	
	  canvas.addEventListener('mousemove', function cameraOnMouseMove(evt) {
	    cam.mouseCamera.x = evt.offsetX;
	    cam.mouseCamera.y = evt.offsetY;
	    cam.mouseModel.x = evt.offsetX;
	    cam.mouseModel.y = evt.offsetY;
	    (0, _transform.transformPoint)(cam.cameraToModel, cam.mouseModel);
	
	    drawCallback();
	  });
	
	  return cam;
	} // camera.js
	//
	// Copyright Charles Dick 2015
	
	function camRecompose(cam) {
	  var modelToWorld = cam.modelToWorld[cam.modelToWorld.length - 1];
	  var worldToCamera = cam.worldToCamera;
	  var modelToCamera = (0, _transform.transformCompose)(modelToWorld, worldToCamera);
	  cam.cameraToModel = (0, _transform.transformInvert)(modelToCamera);
	  cam.ctx.setTransform(modelToCamera.ix, modelToCamera.iy, modelToCamera.jx, modelToCamera.jy, modelToCamera.dx, modelToCamera.dy);
	
	  cam.mouseModel.x = cam.mouseCamera.x;
	  cam.mouseModel.y = cam.mouseCamera.y;
	  (0, _transform.transformPoint)(cam.cameraToModel, cam.mouseModel);
	}
	
	function camPosition(cam, d, scale) {
	  var canvas = cam.canvas;
	  var t = (0, _transform.transformCreate)();
	  t = (0, _transform.transformStretch)(t, 1.0, -1.0); // flip y axis
	  t = (0, _transform.transformTranslate)(t, canvas.width * 0.5, canvas.height * 0.5);
	  t = (0, _transform.transformTranslate)(t, -d.x, d.y);
	  cam.worldToCamera = t;
	  camRecompose(cam);
	}
	
	function camPushTransform(cam, transform) {
	  var oldModelToWorld = cam.modelToWorld[cam.modelToWorld.length - 1];
	  var newModelToWorld = (0, _transform.transformCompose)(transform, oldModelToWorld);
	
	  cam.modelToWorld[cam.modelToWorld.length] = newModelToWorld;
	  camRecompose(cam);
	}
	
	function camPopTransform(cam) {
	  if (cam.modelToWorld.length == 1) {
	    throw "Can't pop empty transform stack";
	  }
	
	  cam.modelToWorld.pop();
	  camRecompose(cam);
	}
	
	function camCameraToModel(cam, p) {
	  (0, _transform.transformPoint)(cam.cameraToModel, p);
	}
	
	function camClear(cam) {
	  cam.ctx.setTransform(1, 0, 0, 1, 0, 0);
	  cam.ctx.clearRect(0, 0, cam.canvas.width, cam.canvas.height);
	
	  var t = (0, _transform.transformCompose)(cam.modelToWorld[cam.modelToWorld.length - 1], cam.worldToCamera);
	  cam.ctx.setTransform(t.ix, t.iy, t.jx, t.jy, t.dx, t.dy);
	}
	
	exports.camCreate = camCreate;
	exports.camCameraToModel = camCameraToModel;
	exports.camClear = camClear;
	exports.camPopTransform = camPopTransform;
	exports.camPosition = camPosition;
	exports.camPushTransform = camPushTransform;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// transform.js
	//
	// Copyright Charles Dick 2015
	
	// TODO: unit tests, it will suck if there is a typo in here, so find it first!
	
	// TODO: put vertex functions somewhere else or rename this module
	
	function transformCreate() {
	  return {
	    ix: 1.0, jx: 0.0, dx: 0.0,
	    iy: 0.0, jy: 1.0, dy: 0.0 };
	}
	
	function transformTranslateCreate(x, y) {
	  return {
	    ix: 1.0, jx: 0.0, dx: x,
	    iy: 0.0, jy: 1.0, dy: y };
	}
	
	function transformScaleCreate(s) {
	  return {
	    ix: s, jx: 0.0, dx: 0.0,
	    iy: 0.0, jy: s, dy: 0.0 };
	}
	
	function transformStretchCreate(sx, sy) {
	  return {
	    ix: sx, jx: 0.0, dx: 0.0,
	    iy: 0.0, jy: sy, dy: 0.0 };
	}
	
	function transformRotateCreate(angle) {
	  var c = Math.cos(angle);
	  var s = Math.sin(angle);
	  return {
	    ix: c, jx: -s, dx: 0.0,
	    iy: s, jy: c, dy: 0.0 };
	}
	
	// combine two transforms, so t1 is applied, then t2
	function transformCompose(t1, t2) {
	  return {
	    ix: t2.ix * t1.ix + t2.jx * t1.iy, jx: t2.ix * t1.jx + t2.jx * t1.jy, dx: t2.ix * t1.dx + t2.jx * t1.dy + t2.dx,
	    iy: t2.iy * t1.ix + t2.jy * t1.iy, jy: t2.iy * t1.jx + t2.jy * t1.jy, dy: t2.iy * t1.dx + t2.jy * t1.dy + t2.dy };
	}
	
	function transformTranslate(t, x, y) {
	  return {
	    ix: t.ix, jx: t.jx, dx: t.dx + x,
	    iy: t.iy, jy: t.jy, dy: t.dy + y };
	}
	
	function transformScale(t, s) {
	  return {
	    ix: s * t.ix, jx: s * t.jx, dx: s * t.dx,
	    iy: s * t.iy, jy: s * t.jy, dy: s * t.dy };
	}
	
	function transformRotate(t, angle) {
	  var c = Math.cos(angle);
	  var s = Math.sin(angle);
	  return {
	    ix: c * t.ix - s * t.iy, jx: c * t.jx - s * t.jy, dx: c * t.dx - s * t.dy,
	    iy: s * t.ix + c * t.iy, jy: c * t.jx + s * t.jy, dy: s * t.dx + c * t.dy };
	}
	
	function transformStretch(t, sx, sy) {
	  return {
	    ix: sx * t.ix, jx: sx * t.jx, dx: sx * t.dx,
	    iy: sy * t.iy, jy: sy * t.jy, dy: sy * t.dy };
	}
	
	function transformInvert(t) {
	  var det = t.ix * t.jy - t.jx * t.iy;
	  var dx = t.jx * t.dy - t.jy * t.dx;
	  var dy = t.iy * t.dx - t.ix * t.dy;
	  return {
	    ix: t.jy / det, jx: -t.jx / det, dx: dx / det,
	    iy: -t.iy / det, jy: t.ix / det, dy: dy / det };
	}
	
	function transformPoint(t, p) {
	  var x = p.x * t.ix + p.y * t.jx + t.dx;
	  var y = p.x * t.iy + p.y * t.jy + t.dy;
	
	  p.x = x;
	  p.y = y;
	}
	
	function transformNormal(t, n) {
	  var x = n.x * t.ix + n.y * t.jx;
	  var y = n.x * t.iy + n.y * t.jy;
	
	  n.x = x;
	  n.y = y;
	}
	
	exports.transformCompose = transformCompose;
	exports.transformCreate = transformCreate;
	exports.transformInvert = transformInvert;
	exports.transformNormal = transformNormal;
	exports.transformPoint = transformPoint;
	exports.transformScale = transformScale;
	exports.transformScaleCreate = transformScaleCreate;
	exports.transformStretch = transformStretch;
	exports.transformStretchCreate = transformStretchCreate;
	exports.transformTranslate = transformTranslate;
	exports.transformTranslateCreate = transformTranslateCreate;
	exports.transformRotate = transformRotate;
	exports.transformRotateCreate = transformRotateCreate;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.meshSetFlag = exports.meshPolyVertices = exports.meshPolyStroke = exports.meshPolySplit = exports.meshPolySetFlag = exports.meshPolyRemove = exports.meshPolyRadiusSquared = exports.meshPolyMomentOfInertia = exports.meshPolyMerge = exports.meshPolyFill = exports.meshPolyCentroidArea = exports.meshEdgeTransform = exports.meshEdgeSplit = exports.meshEdgeMerge = exports.meshCreate = undefined;
	
	var _bsp = __webpack_require__(1);
	
	function meshEdgeVerify(edge) {
	  var prev = edge.prev;
	  var next = edge.next;
	
	  if (prev.next != edge || next.prev != edge) {
	    throw "next or prev refs broken";
	  }
	
	  if (edge.link != null) {
	    if (edge.link.link != edge) {
	      throw "link ref broken";
	    }
	  }
	
	  var px = edge.x - prev.x;
	  var py = edge.y - prev.y;
	  var nx = next.x - edge.x;
	  var ny = next.y - edge.y;
	
	  if (px * ny - py * nx < -0.01) {
	    throw "vertex is not convex";
	  }
	} // mesh.js
	//
	// Copyright Charles Dick 2015
	
	// TODO: rules of mesh node lifetimes, so we know when it's safe to keep a reference
	
	// depends on transform.js
	// depends on bsp.js
	
	function meshPolySetFlag(poly, flag) {
	  var i = poly;
	
	  do {
	    i.flag = flag;
	    i = i.next;
	  } while (i != poly);
	}
	
	function meshSetFlag(mesh, flag) {
	  var i = mesh;
	
	  while (i.flag != flag) {
	    i.flag = flag;
	
	    if (i.link != null) {
	      meshSetFlag(i.link, flag);
	    }
	
	    i = i.next;
	  }
	}
	
	function meshPolyVerify(poly) {
	  var i = poly;
	
	  do {
	    meshEdgeVerify(i);
	    i = i.next;
	  } while (i != poly);
	}
	
	function meshEdgeInPolyVerify(poly, edge) {
	  var i = edge;
	
	  do {
	    if (i == poly) {
	      return;
	    }
	    i = i.next;
	  } while (i != edge);
	  throw "edge not in poly";
	}
	
	function meshCreate(verts) {
	  if (verts.length == 0) {
	    return null;
	  }
	
	  var head = {
	    x: verts[0].x,
	    y: verts[0].y,
	    flag: 0,
	    prev: null,
	    next: null,
	    link: null
	  };
	
	  var tail = head;
	
	  for (var i = 1; i < verts.length; i++) {
	    tail.next = {
	      x: verts[i].x,
	      y: verts[i].y,
	      flag: 0,
	      prev: tail,
	      next: null,
	      link: null
	    };
	    tail = tail.next;
	  }
	
	  tail.next = head;
	  head.prev = tail;
	
	  meshPolyVerify(head);
	
	  return head;
	}
	
	function meshEdgeSplit(edge, bsp) {
	  var next = edge.next;
	
	  if ((0, _bsp.bspSideStable)(bsp, edge.x, edge.y) * (0, _bsp.bspSideStable)(bsp, next.x, next.y) >= 0.0) {
	    throw "edge not crossing bsp";
	  }
	
	  var t = (0, _bsp.bspIntersect)(bsp, edge.x, edge.y, next.x, next.y);
	
	  var link = edge.link;
	  var newEdge = {
	    x: t * edge.x + (1.0 - t) * next.x,
	    y: t * edge.y + (1.0 - t) * next.y,
	    flag: edge.flag,
	    prev: edge,
	    next: edge.next,
	    link: link
	  };
	
	  newEdge.next.prev = newEdge;
	  edge.next = newEdge;
	
	  if (link != null) {
	    var newLink = {
	      x: newEdge.x,
	      y: newEdge.y,
	      flag: edge.flag,
	      prev: link,
	      next: link.next,
	      link: edge
	    };
	
	    newLink.next.prev = newLink;
	    link.next = newLink;
	
	    edge.link = newLink;
	    link.link = newEdge;
	  }
	
	  meshPolyVerify(edge);
	
	  return newEdge;
	}
	
	function meshEdgeCanMerge(edge) {
	  var link = edge.link;
	
	  if (link == null) {
	    return true;
	  }
	
	  var next = edge.next;
	
	  if (link.x != next.x || link.y != next.y) {
	    return false;
	  }
	
	  var linkNext = link.next;
	
	  if (edge.x != linkNext.x || edge.y != linkNext.y) {
	    return false;
	  }
	
	  var prev = edge.prev;
	  var linkNextNext = linkNext.next;
	
	  if (prev.x != linkNextNext.x || prev.y != linkNextNext.y || prev.link != linkNext || linkNext.link != prev) {
	    return false;
	  }
	
	  return true;
	}
	
	function meshEdgeMerge(edge) {
	  var link = edge.link;
	
	  if (!meshEdgeCanMerge(edge)) {
	    throw "Can't merge edge";
	  }
	
	  if (link != null) {
	    var remLink = link.next;
	
	    remLink.next.prev = remLink.prev;
	    remLink.prev.next = remLink.next;
	
	    edge.prev.link = link;
	    link.link = edge.prev;
	
	    remLink.next = null;
	    remLink.prev = null;
	    remLink.link = null;
	  }
	
	  edge.next.prev = edge.prev;
	  edge.prev.next = edge.next;
	
	  edge.next = null;
	  edge.prev = null;
	  edge.link = null;
	}
	
	function meshPolySplit(a, b) {
	  meshEdgeInPolyVerify(a, b);
	
	  var newA = {
	    x: a.x,
	    y: a.y,
	    flag: a.flag,
	    prev: b,
	    next: a.next,
	    link: a.link
	  };
	
	  var newB = {
	    x: b.x,
	    y: b.y,
	    flag: b.flag,
	    prev: a,
	    next: b.next,
	    link: b.link
	  };
	
	  newA.next.prev = newA;
	  if (newA.link != null) {
	    newA.link.link = newA;
	  }
	
	  newB.next.prev = newB;
	  if (newB.link != null) {
	    newB.link.link = newB;
	  }
	
	  a.next = newB;
	  b.next = newA;
	  a.link = b;
	  b.link = a;
	
	  meshPolyVerify(a);
	  meshPolyVerify(b);
	}
	
	function meshPolyMerge(a, b) {
	  var aNext = a.next;
	  var bNext = b.next;
	
	  if (a.link != b || b.link != a || a.x != bNext.x || a.y != bNext.y || b.x != aNext.x || b.y != aNext.y) {
	    throw "Cannot merge mesh";
	  }
	
	  a.next = bNext.next;
	  a.next.prev = a;
	  a.link = bNext.link;
	  if (a.link != null) {
	    a.link.link = a;
	  }
	
	  b.next = aNext.next;
	  b.next.prev = b;
	  b.link = aNext.link;
	  if (b.link != null) {
	    b.link.link = b;
	  }
	
	  aNext.next = null;
	  aNext.prev = null;
	  aNext.link = null;
	  bNext.next = null;
	  bNext.prev = null;
	  bNext.link = null;
	
	  meshEdgeInPolyVerify(a, b);
	  meshPolyVerify(a);
	}
	
	function meshPolyRemove(poly) {
	  var i = poly;
	
	  do {
	    if (i.link != null) {
	      i.link.link = null;
	      i.link = null;
	    }
	
	    i = i.next;
	  } while (i != poly);
	}
	
	function meshPolyCentroidArea(poly) {
	  var a = 0.0;
	  var cx = 0.0;
	  var cy = 0.0;
	
	  var i = poly;
	
	  var prevX = i.prev.x;
	  var prevY = i.prev.y;
	
	  do {
	    // accumulate area
	    a += prevX * i.y - i.x * prevY;
	
	    // accumulate centroid
	    cx += (prevX + i.x) * (prevX * i.y - i.x * prevY);
	    cy += (prevY + i.y) * (prevX * i.y - i.x * prevY);
	
	    prevX = i.x;
	    prevY = i.y;
	    i = i.next;
	  } while (i != poly);
	
	  return { x: cx / (3.0 * a), y: cy / (3.0 * a), area: a * 0.5 };
	}
	
	// see https://en.wikipedia.org/wiki/List_of_moments_of_inertia
	function meshPolyMomentOfInertia(poly) {
	  var i = poly;
	
	  var prevX = i.prev.x;
	  var prevY = i.prev.y;
	
	  var num = 0.0;
	  var den = 0.0;
	
	  do {
	    var cross = i.x * prevY - i.y * prevX;
	
	    den += cross;
	    num += cross * (i.x * i.x + i.y * i.y + i.x * prevX + i.y * prevY + prevX * prevX + prevY * prevY);
	
	    prevX = i.x;
	    prevY = i.y;
	    i = i.next;
	  } while (i != poly);
	
	  return num / (6.0 * den);
	}
	
	function meshEdgePrevExterior(edge) {
	  if (edge.link != null) {
	    throw "edge not exterior";
	  }
	
	  while (edge.prev.link != null) {
	    edge = edge.prev.link;
	  }
	  return edge.prev;
	}
	
	function meshEdgeIsExteriorConvex(edge) {
	  if (edge.link != null) {
	    return false;
	  }
	
	  var prev = meshEdgePrevExterior(edge);
	
	  var ax = edge.x - prev.x;
	  var ay = edge.y - prev.y;
	  var bx = edge.next.x - prev.x;
	  var by = edge.next.y - prev.y;
	
	  return ax * by - ay * bx > 0.0;
	}
	
	function meshPolyVertices(poly, vertexArray) {
	  var i = poly;
	  do {
	    if (meshEdgeIsExteriorConvex(i)) {
	      vertexArray[vertexArray.length] = { x: i.x, y: i.y };
	    }
	    i = i.next;
	  } while (i != poly);
	}
	
	function meshPolyRadiusSquared(poly) {
	  var i = poly;
	  var r = 0.0;
	  do {
	    r = Math.max(r, i.x * i.x + i.y * i.y);
	  } while (i != poly);
	
	  return r;
	}
	
	function meshEdgeTransform(edge, t) {
	  var x = edge.x * t.ix + edge.y * t.jx + t.dx;
	  var y = edge.x * t.iy + edge.y * t.jy + t.dy;
	
	  edge.x = x;
	  edge.y = y;
	}
	
	function meshPolyStroke(edge, ctx) {
	  var i = edge;
	
	  ctx.beginPath();
	  ctx.moveTo(i.x, i.y);
	
	  do {
	    i = i.next;
	    ctx.lineTo(i.x, i.y);
	  } while (i != edge);
	
	  ctx.stroke();
	
	  do {
	    ctx.beginPath();
	    ctx.arc(i.x, i.y, 2, 0, 2 * Math.PI, false);
	    ctx.fillStyle = 'black';
	    ctx.fill();
	    i = i.next;
	  } while (i != edge);
	}
	
	function meshPolyFill(edge, ctx) {
	  var i = edge;
	
	  ctx.beginPath();
	  ctx.moveTo(i.x, i.y);
	  do {
	    i = i.next;
	    ctx.lineTo(i.x, i.y);
	  } while (i != edge);
	
	  ctx.fillStyle = 'lightblue';
	  ctx.fill();
	}
	
	exports.meshCreate = meshCreate;
	exports.meshEdgeMerge = meshEdgeMerge;
	exports.meshEdgeSplit = meshEdgeSplit;
	exports.meshEdgeTransform = meshEdgeTransform;
	exports.meshPolyCentroidArea = meshPolyCentroidArea;
	exports.meshPolyFill = meshPolyFill;
	exports.meshPolyMerge = meshPolyMerge;
	exports.meshPolyMomentOfInertia = meshPolyMomentOfInertia;
	exports.meshPolyRadiusSquared = meshPolyRadiusSquared;
	exports.meshPolyRemove = meshPolyRemove;
	exports.meshPolySetFlag = meshPolySetFlag;
	exports.meshPolySplit = meshPolySplit;
	exports.meshPolyStroke = meshPolyStroke;
	exports.meshPolyVertices = meshPolyVertices;
	exports.meshSetFlag = meshSetFlag;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.physTimeStep = exports.physReset = exports.physPointInsideBodies = exports.physParticlePropertiesCreate = exports.physParticleCreate = exports.physDraw = exports.physCreate = exports.physClipBodies = exports.physBodyVelocity = exports.physBodyPropertiesCreate = exports.physBodyLocalCoordinatesAtPosition = exports.physBodyCreate = exports.physBodyApplyLinearImpulse = exports.physBodyApplyAngularImpulse = undefined;
	
	var _bsp = __webpack_require__(1);
	
	var _camera = __webpack_require__(2);
	
	var _solid = __webpack_require__(6);
	
	var _transform = __webpack_require__(3);
	
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
	
	function physCreate(dt) {
	  return {
	    bodies: [],
	    particles: new Array(65536), // TODO: this is stupid, do proper allocatino stuff
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
	
	  var dx = body.d.x - p.x; // p -> body.d
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
	
	  var dx = body.d.x - p.x; // p -> body.d
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
	  var l2w = (0, _transform.transformTranslate)((0, _transform.transformRotateCreate)(θ), d.x, d.y);
	
	  var ca = (0, _solid.solidCentroidArea)(solid);
	  var centerT = (0, _transform.transformTranslateCreate)(-ca.x, -ca.y);
	
	  // recenter solid to have centroid be at (0, 0)
	  (0, _solid.solidTransform)(solid, centerT);
	
	  // get the radius so we can do collisions faster
	  var r2 = (0, _solid.solidRadiusSquared)(solid);
	
	  // get centroid in world coordinatea
	  (0, _transform.transformPoint)(l2w, ca);
	
	  // correct velocity due to movement caused by rotation of new center of mass in the old frame of reference
	  v.x += (d.y - ca.y) * ω;
	  v.y += (ca.x - d.x) * ω;
	
	  // correct position to be world coordinated of the new center of mass
	  d.x = ca.x;
	  d.y = ca.y;
	
	  l2w = (0, _transform.transformTranslate)((0, _transform.transformRotateCreate)(θ), d.x, d.y);
	
	  var body = {
	    id: phys.nextPhysId++,
	    solid: solid,
	    verts: (0, _solid.solidVertices)(solid),
	    properties: properties,
	    m: properties.ρ * ca.area,
	    I: properties.ρ * ca.area * (0, _solid.solidMomentOfInertia)(solid),
	    d: d,
	    r2: r2,
	    θ: θ,
	    v: v,
	    ω: ω,
	    worldToLocal: (0, _transform.transformInvert)(l2w),
	    localToWorld: l2w,
	    prevWorldToLocal: (0, _transform.transformInvert)(l2w),
	    prevLocalToWorld: l2w
	  };
	
	  phys.bodies.push(body);
	
	  return body;
	}
	
	// TODO: make sure all external APIs are safe to call from any callback
	
	function physParticlePropertiesCreate(m, e, oncollide, ontimestep) {
	  return {
	    m: m, // mass
	    e: e, // coefficient of restitution
	    oncollide: oncollide, // oncollide(particle, body, collision normal, impulse)
	    ontimestep: ontimestep // ontimestep(particle, dt)
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
	    (0, _transform.transformPoint)(body.prevWorldToLocal, a);
	    (0, _transform.transformPoint)(body.worldToLocal, b);
	
	    var bsp = (0, _bsp.bspTreeCollide)(body.solid, a.x, a.y, b.x, b.y);
	
	    if (bsp != null) {
	      var t = (0, _bsp.bspIntersect)(bsp, a.x, a.y, b.x, b.y);
	
	      hitBody = body;
	
	      //a.x = a.x * (1.0 - t) + b.x * t;
	      //a.y = a.y * (1.0 - t) + b.y * t;
	      // TODO: use position just outside body for particle, check to make sure it's not in some other body
	
	      var nl = Math.sqrt(bsp.nx * bsp.nx + bsp.ny * bsp.ny);
	      n.x = bsp.nx / nl;
	      n.y = bsp.ny / nl;
	
	      curr.x = a.x;
	      curr.y = a.y;
	      (0, _transform.transformPoint)(body.localToWorld, curr);
	      (0, _transform.transformNormal)(body.localToWorld, n);
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
	
	  if (v < 0.0) {
	    // actually converging at collision point
	    // get delta v needed for correct separation velocity
	    var e = (particle.properties.e + body.properties.e) * 0.5; // use mean coefficient of restitution
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
	    prevT = (0, _transform.transformCompose)(body.prevLocalToWorld, otherBody.worldToLocal);
	    currT = (0, _transform.transformCompose)(body.localToWorld, otherBody.worldToLocal);
	  } else {
	    prevT = (0, _transform.transformCompose)(body.localToWorld, otherBody.prevWorldToLocal);
	    currT = (0, _transform.transformCompose)(body.localToWorld, otherBody.worldToLocal);
	  }
	
	  var verts = body.verts;
	  var bspTree = otherBody.solid;
	
	  for (var i = 0; i < verts.length; i++) {
	    var v = verts[i];
	    var prev = { x: v.x, y: v.y };
	    var curr = { x: v.x, y: v.y };
	    (0, _transform.transformPoint)(prevT, prev);
	    (0, _transform.transformPoint)(currT, curr);
	
	    var bsp = (0, _bsp.bspTreeCollide)(bspTree, prev.x, prev.y, curr.x, curr.y);
	
	    if (bsp != null) {
	      var t = (0, _bsp.bspIntersect)(bsp, curr.x, curr.y, prev.x, prev.y);
	
	      p.x = curr.x * t + prev.x * (1.0 - t);
	      p.y = curr.y * t + prev.y * (1.0 - t);
	      (0, _transform.transformPoint)(otherBody.localToWorld, p);
	
	      var nl = Math.sqrt(bsp.nx * bsp.nx + bsp.ny * bsp.ny);
	      n.x = bsp.nx / nl;
	      n.y = bsp.ny / nl;
	      (0, _transform.transformNormal)(otherBody.localToWorld, n);
	
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
	    var bodyDvDj = physBodyDvByDj(body, p, { x: -n.x, y: -n.y });
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
	    body.localToWorld = (0, _transform.transformTranslate)((0, _transform.transformRotateCreate)(body.θ), body.d.x, body.d.y);
	    body.worldToLocal = (0, _transform.transformInvert)(body.localToWorld);
	
	    // body-body collision detection
	    if (physCollideBody(phys, body)) {
	      // back up both body and otherBody to previous timestep
	      body.d.x = dPrevx;
	      body.d.y = dPrevy;
	      body.θ = θPrev;
	
	      body.localToWorld = (0, _transform.transformTranslate)((0, _transform.transformRotateCreate)(body.θ), body.d.x, body.d.y);
	      body.worldToLocal = (0, _transform.transformInvert)(body.localToWorld);
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
	    var localBsp = (0, _bsp.bspTreeTransformClone)(bsp, body.worldToLocal);
	    var result = (0, _solid.solidClip)(body.solid, localBsp);
	
	    if (!result.clipped) {
	      phys.bodies.push(body);
	    } else {
	      var solid = result.solid;
	      var regions = (0, _solid.solidMarkConnectedRegions)(result.solid);
	
	      for (var j = 0; j < regions; j++) {
	        var extractedSolid = (0, _solid.solidExtractRegion)(solid, j);
	
	        var clippedBody = physBodyCreate(phys, extractedSolid, { x: body.d.x, y: body.d.y }, body.θ, { x: body.v.x, y: body.v.y }, body.ω, body.properties);
	
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
	
	      (0, _transform.transformPoint)(body.worldToLocal, a);
	      (0, _transform.transformPoint)(body.worldToLocal, b);
	
	      try {
	        var bsp = (0, _bsp.bspTreeCollide)(body.solid, a.x, a.y, b.x, b.y);
	
	        if (bsp != null) {
	          line.t = Math.min(line.t, (0, _bsp.bspIntersect)(bsp, b.x, b.y, a.x, a.y));
	        }
	      } catch (ex) {}
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
	
	    (0, _camera.camPushTransform)(cam, body.localToWorld);
	
	    ctx.fillStyle = 'black';
	    for (var j = 0; j < body.verts.length; j++) {
	      var v = body.verts[j];
	      ctx.fillRect(v.x - 1.5, v.y - 1.5, 3.0, 3.0);
	    }
	
	    (0, _camera.camPopTransform)(cam);
	  }
	
	  for (var i = 0; i < phys.bodies.length; i++) {
	    var body = phys.bodies[i];
	
	    (0, _camera.camPushTransform)(cam, body.localToWorld);
	
	    (0, _solid.solidFill)(body.solid, cam.ctx);
	
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
	    var mouseside = (0, _bsp.bspTreePointSide)(body.solid, cam.mouseModel.x, cam.mouseModel.y);
	    if (mouseside == 1 || mouseside == 3) {
	      var lines = (0, _bsp.bspTreeDebugLines)(body.solid, cam.mouseModel.x, cam.mouseModel.y, 256.0);
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
	
	    (0, _camera.camPushTransform)(cam, (0, _transform.transformStretchCreate)(1.0, -1.0));
	    ctx.font = '12px Courier';
	    ctx.fillText(body.id.toString(), 4, -2);
	    (0, _camera.camPopTransform)(cam);
	    (0, _camera.camPopTransform)(cam);
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
	
	    (0, _transform.transformPoint)(body.worldToLocal, l);
	
	    if (1 == (1 & (0, _bsp.bspTreePointSide)(body.solid, l.x, l.y))) {
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
	
	    (0, _transform.transformPoint)(body.worldToLocal, l);
	
	    if (1 == (1 & (0, _bsp.bspTreePointSide)(body.solid, l.x, l.y))) {
	      return true;
	    }
	  }
	
	  return false;
	}
	
	exports.physBodyApplyAngularImpulse = physBodyApplyAngularImpulse;
	exports.physBodyApplyLinearImpulse = physBodyApplyLinearImpulse;
	exports.physBodyCreate = physBodyCreate;
	exports.physBodyLocalCoordinatesAtPosition = physBodyLocalCoordinatesAtPosition;
	exports.physBodyPropertiesCreate = physBodyPropertiesCreate;
	exports.physBodyVelocity = physBodyVelocity;
	exports.physClipBodies = physClipBodies;
	exports.physCreate = physCreate;
	exports.physDraw = physDraw;
	exports.physParticleCreate = physParticleCreate;
	exports.physParticlePropertiesCreate = physParticlePropertiesCreate;
	exports.physPointInsideBodies = physPointInsideBodies;
	exports.physReset = physReset;
	exports.physTimeStep = physTimeStep;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.solidVertices = exports.solidTransform = exports.solidRadiusSquared = exports.solidMomentOfInertia = exports.solidMarkConnectedRegions = exports.solidFill = exports.solidExtractRegion = exports.solidClip = exports.solidCentroidArea = exports.solidCreate = undefined;
	
	var _bsp = __webpack_require__(1);
	
	var _mesh = __webpack_require__(4);
	
	// solid.js
	//
	// Copyright Charles Dick 2015
	
	// TODO: maintain property that all branches before poly have both in and out
	// sub trees
	
	function solidCreate(poly) {
	  var solid = null;
	
	  // make an in heavy BSP tree (no out nodes)
	  // TODO: do something more complicated that isn't so unbalanced
	
	  var i = poly;
	  do {
	    var next = i.next;
	
	    if (i.link == null) {
	      solid = {
	        px: i.x,
	        py: i.y,
	        nx: i.y - next.y,
	        ny: next.x - i.x,
	        in: solid,
	        out: null,
	        poly: null
	      };
	    }
	
	    i = next;
	  } while (i != poly);
	
	  if (solid == null) {
	    // if all edges in the poly are shared edges, we just need a dummy split
	    // to hang the poly off of, pick the first edge
	
	    return {
	      px: i.x,
	      py: i.y,
	      nx: i.y - i.next.y,
	      ny: i.next.x - i.x,
	      in: null,
	      out: null,
	      poly: poly
	    };
	  }
	
	  solid.poly = poly;
	  return solid;
	}
	
	function solidSetFlag(solid, flag) {
	  if (solid == null) {
	    return;
	  }
	
	  if (solid.poly != null) {
	    (0, _mesh.meshPolySetFlag)(solid.poly, flag);
	  } else {
	    solidSetFlag(solid.in, flag);
	    solidSetFlag(solid.out, flag);
	  }
	}
	
	function solidMarkConnectedRegionsHelper(solid, nextFlag) {
	  if (solid == null) {
	    return nextFlag;
	  }
	
	  if (solid.poly != null) {
	    if (solid.poly.flag == -1) {
	      (0, _mesh.meshSetFlag)(solid.poly, nextFlag);
	      return nextFlag + 1;
	    } else {
	      return nextFlag;
	    }
	  } else {
	    nextFlag = solidMarkConnectedRegionsHelper(solid.in, nextFlag);
	    nextFlag = solidMarkConnectedRegionsHelper(solid.out, nextFlag);
	    return nextFlag;
	  }
	}
	
	function solidMarkConnectedRegions(solid) {
	  solidSetFlag(solid, -1);
	  return solidMarkConnectedRegionsHelper(solid, 0);
	}
	
	function solidExtractRegion(solid, flag) {
	  if (solid == null) {
	    return null;
	  }
	
	  if (solid.poly != null) {
	    if (solid.poly.flag == flag) {
	      // need to recreate, since we don't know if we will keep higher splits that
	      // cover our unlinked edges that never got a split of their own
	      return solidCreate(solid.poly);
	    } else {
	      return null;
	    }
	  } else {
	    var inSolid = solidExtractRegion(solid.in, flag);
	    var outSolid = solidExtractRegion(solid.out, flag);
	
	    if (inSolid != null && outSolid != null) {
	      // we need this branch, copy it
	      return {
	        px: solid.px,
	        py: solid.py,
	        nx: solid.nx,
	        ny: solid.ny,
	        in: inSolid,
	        out: outSolid,
	        poly: null
	      };
	    } else if (inSolid != null) {
	      return inSolid;
	    } else {
	      return outSolid; // could be null
	    }
	  }
	}
	
	function solidTransform(solid, t) {
	  if (solid == null) {
	    return;
	  }
	
	  solidTransform(solid.in, t);
	  solidTransform(solid.out, t);
	
	  (0, _bsp.bspTransform)(solid, t);
	
	  if (solid.poly != null) {
	    var poly = solid.poly;
	    var i = poly;
	
	    do {
	      (0, _mesh.meshEdgeTransform)(i, t);
	      i = i.next;
	    } while (i != poly);
	  }
	}
	
	// return { clipped: <bool>, solid: <solid> }
	
	function solidPolyClip(solid, bspTree) {
	  if (bspTree == null) {
	    return { clipped: false, solid: solid };
	  }
	
	  if (solid == null || solid.poly == null) {
	    throw "invalid args!";
	  }
	
	  var poly = solid.poly;
	  var i = poly;
	  var currSide = (0, _bsp.bspSideStable)(bspTree, i.x, i.y);
	  var leaveIn = null;
	  var leaveInOnSplit = false;
	  var leaveOut = null;
	  var leaveOutOnSplit = false;
	  var allIn = true;
	  var allOut = true;
	
	  do {
	    var nextSide = (0, _bsp.bspSideStable)(bspTree, i.next.x, i.next.y);
	
	    if (currSide <= 0.0 && nextSide > 0.0) {
	      leaveOut = i;
	
	      if (currSide == 0.0) {
	        leaveOutOnSplit = true;
	      }
	    }
	
	    if (currSide >= 0.0 && nextSide < 0.0) {
	      leaveIn = i;
	
	      if (currSide == 0.0) {
	        leaveInOnSplit = true;
	      }
	    }
	
	    if (currSide > 0.0) {
	      allOut = false;
	    } else if (currSide < 0.0) {
	      allIn = false;
	    }
	
	    currSide = nextSide;
	    i = i.next;
	  } while (i != poly);
	
	  if (allIn) {
	    if (bspTree.in != null) {
	      return solidPolyClip(solid, bspTree.in);
	    } else {
	      // poly is in, so we didn't do any clipping
	      return { clipped: false, solid: solid };
	    }
	  } else if (allOut) {
	    if (bspTree.out != null) {
	      return solidPolyClip(solid, bspTree.out);
	    } else {
	      // clipped out, prune the solid
	      (0, _mesh.meshPolyRemove)(poly);
	      return { clipped: true, solid: null };
	    }
	  } else if (leaveIn != null && leaveOut != null) {
	    // crossing
	    // add the crossing points
	    if (!leaveOutOnSplit) {
	      leaveOut = (0, _mesh.meshEdgeSplit)(leaveOut, bspTree);
	    }
	
	    if (!leaveInOnSplit) {
	      leaveIn = (0, _mesh.meshEdgeSplit)(leaveIn, bspTree);
	    }
	
	    (0, _mesh.meshPolySplit)(leaveIn, leaveOut);
	
	    var inResult = null;
	    var outResult = null;
	
	    // TODO: can we avoid the solidCreate in teh recursive step? does it matter?
	
	    if (bspTree.in != null) {
	      inResult = solidPolyClip(solidCreate(leaveIn), bspTree.in);
	    } else {
	      inResult = { clipped: false, solid: solidCreate(leaveIn) };
	    }
	
	    if (bspTree.out != null) {
	      outResult = solidPolyClip(solidCreate(leaveOut), bspTree.out);
	    } else {
	      (0, _mesh.meshPolyRemove)(leaveOut);
	      outResult = { clipped: true, solid: null };
	    }
	
	    if (inResult.clipped || outResult.clipped) {
	      // TODO: don't create a split if it doesn't have both children
	      return {
	        clipped: true,
	        solid: {
	          px: bspTree.px,
	          py: bspTree.py,
	          nx: bspTree.nx,
	          ny: bspTree.ny,
	          in: inResult.solid,
	          out: outResult.solid,
	          poly: null
	        } };
	    } else {
	      // no clipping, put the poly back together
	      (0, _mesh.meshPolyMerge)(leaveIn, leaveOut);
	
	      if (!leaveOutOnSplit) {
	        leaveOut = (0, _mesh.meshEdgeMerge)(leaveOut);
	      }
	
	      if (!leaveInOnSplit) {
	        leaveIn = (0, _mesh.meshEdgeMerge)(leaveIn);
	      }
	
	      return { clipped: false, solid: solid };
	    }
	  } else {
	    throw "poly both crossing and not crossing!?";
	  }
	}
	
	function solidClip(solid, bspTree) {
	  if (solid == null || bspTree == null) {
	    return { clipped: false, solid: solid };
	  }
	
	  // descend solid looking for polygons
	  // TODO: add bounding circles to solid, so we can descend bsp at the same time
	
	  if (solid.poly != null) {
	    // found a polygon, split that poly which builds a new bspTreeSolid
	    // there can be no other polygons under this
	    return solidPolyClip(solid, bspTree);
	  } else {
	    var inResult = solidClip(solid.in, bspTree);
	    var outResult = solidClip(solid.out, bspTree);
	
	    if (inResult.solid == null && outResult.solid == null) {
	      return { clipped: true, solid: null };
	    }
	
	    solid.in = inResult.solid;
	    solid.out = outResult.solid;
	    return { clipped: inResult.clipped || outResult.clipped, solid: solid };
	  }
	}
	
	// See http://en.wikipedia.org/wiki/Polygon#Area_and_centroid
	
	function solidCentroidArea(solid) {
	  if (solid == null) {
	    return null;
	  } else if (solid.poly != null) {
	    // Leaf step, found a polygon
	    return (0, _mesh.meshPolyCentroidArea)(solid.poly);
	  } else {
	    // Recursive step, possibly merge two centroids
	    var inC = solidCentroidArea(solid.in);
	    var outC = solidCentroidArea(solid.out);
	
	    if (inC != null && outC != null) {
	      // average centroids
	      var area = inC.area + outC.area;
	
	      return {
	        x: (inC.x * inC.area + outC.x * outC.area) / area,
	        y: (inC.y * inC.area + outC.y * outC.area) / area,
	        area: area
	      };
	    } else if (inC != null) {
	      return inC;
	    } else if (outC != null) {
	      return outC;
	    } else {
	      return null;
	    }
	  }
	}
	
	function solidMomentOfInertia(solid) {
	  if (solid == null) {
	    return 0.0;
	  } else if (solid.poly != null) {
	    // Leaf step, found a polygon
	    return (0, _mesh.meshPolyMomentOfInertia)(solid.poly);
	  } else {
	    // We can just add together because everything is using the same axis of
	    // rotation (the origin)
	    return solidMomentOfInertia(solid.in) + solidMomentOfInertia(solid.out);
	  }
	}
	
	function solidRadiusSquared(solid) {
	  if (solid == null) {
	    return 0.0;
	  }
	
	  if (solid.poly != null) {
	    return (0, _mesh.meshPolyRadiusSquared)(solid.poly);
	  }
	
	  return Math.max(solidRadiusSquared(solid.in), solidRadiusSquared(solid.out));
	}
	
	function solidVerticesHelper(solid, vertexArray) {
	  if (solid == null) {
	    return;
	  }
	
	  if (solid.poly != null) {
	    (0, _mesh.meshPolyVertices)(solid.poly, vertexArray);
	  } else {
	    solidVerticesHelper(solid.in, vertexArray);
	    solidVerticesHelper(solid.out, vertexArray);
	  }
	}
	
	function solidVertices(solid) {
	  var vertexArray = [];
	  solidVerticesHelper(solid, vertexArray);
	  return vertexArray;
	}
	
	function solidFill(solid, ctx) {
	  if (solid == null) {
	    return;
	  } else if (solid.poly) {
	    (0, _mesh.meshPolyFill)(solid.poly, ctx);
	  } else {
	    solidFill(solid.in, ctx);
	    solidFill(solid.out, ctx);
	  }
	}
	
	function solidStroke(solid, ctx) {
	  if (solid == null) {
	    return;
	  } else if (solid.poly) {
	    (0, _mesh.meshPolyStroke)(solid.poly, ctx);
	  } else {
	    solidStroke(solid.in, ctx);
	    solidStroke(solid.out, ctx);
	  }
	}
	
	exports.solidCreate = solidCreate;
	exports.solidCentroidArea = solidCentroidArea;
	exports.solidClip = solidClip;
	exports.solidExtractRegion = solidExtractRegion;
	exports.solidFill = solidFill;
	exports.solidMarkConnectedRegions = solidMarkConnectedRegions;
	exports.solidMomentOfInertia = solidMomentOfInertia;
	exports.solidRadiusSquared = solidRadiusSquared;
	exports.solidTransform = solidTransform;
	exports.solidVertices = solidVertices;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.bspTestSquare = exports.playerCreate = undefined;
	
	var _bsp = __webpack_require__(1);
	
	var _camera = __webpack_require__(2);
	
	var _mesh = __webpack_require__(4);
	
	var _phys = __webpack_require__(5);
	
	var _solid = __webpack_require__(6);
	
	var _transform = __webpack_require__(3);
	
	// player.js
	//
	// Copyright Charles Dick 2015
	//
	// Controls a player in the world simulated by phys.js
	// TODO: binds controls
	// TODO: tracks damage
	
	var bspTestSquare = { px: 0, py: 0, nx: 1, ny: 1,
	  in: { px: 0, py: 16, nx: 0, ny: 1,
	    in: null,
	    out: { px: 16, py: 0, nx: 1, ny: 0, in: null, out: null }
	  },
	  out: { px: 0, py: -16, nx: 0, ny: -1,
	    in: null,
	    out: { px: -16, py: 0, nx: -1, ny: 0, in: null, out: null }
	  }
	};
	
	function playerCreate(phys, d, θ, input, camera) {
	  var state = {
	    health: 100.0,
	    cooldown: 0.0
	  };
	
	  var regularParticle = (0, _phys.physParticlePropertiesCreate)(9.0, 0.9, null, null);
	
	  var explosiveParticle = (0, _phys.physParticlePropertiesCreate)(100.0, 0.9, function explosiveParticleoncollide(particle, body, n) {
	    var t = (0, _transform.transformTranslateCreate)(particle.d.x, particle.d.y);
	    var bsp = (0, _bsp.bspTreeTransformClone)(bspTestSquare, t);
	
	    // kill the particle
	    particle.t = 0;
	
	    // add explosion debris
	    for (var x = -15.0; x <= 15.0; x += 3.0) {
	      for (var y = -15.0; y <= 15.0; y += 3.0) {
	        var p = { x: particle.d.x + x, y: particle.d.y + y };
	
	        if ((0, _phys.physPointInsideBodies)(phys, p)) {
	          var v = { x: 0.0, y: 0.0 };
	          (0, _phys.physBodyVelocity)(body, p, v);
	
	          v.x += (x - n.x * 32) * 2.0;
	          v.y += (y - n.y * 32) * 2.0;
	
	          (0, _phys.physParticleCreate)(phys, p, v, 1.0, regularParticle);
	        }
	      }
	    }
	
	    (0, _phys.physClipBodies)(phys, bsp);
	  }, null);
	
	  var props = (0, _phys.physBodyPropertiesCreate)(1.0, // density
	  1.0, // coefficient of restitution
	  function playerOncollideparticle(body, particle, n, j) {
	    // TODO: take damage
	  }, function playerOncollidebody(body, otherBody, p, n, j) {
	    // TODO: take damage
	  }, function playerOntimestep(body, dt) {
	    var speed = Math.sqrt(body.v.x * body.v.x + body.v.y * body.v.y);
	
	    (0, _camera.camPosition)(camera, { x: body.d.x + body.v.x * 0.25, y: body.d.y + body.v.y * 0.25 }, 1.0 / (1.0 + speed / 256.0));
	
	    // orientation controls
	    if (input.left == true) {
	      if (body.ω < 6.24) {
	        // TODO: PID controller?
	        (0, _phys.physBodyApplyAngularImpulse)(body, 20000.0);
	      }
	    } else if (input.right == true) {
	      if (body.ω > -6.24) {
	        (0, _phys.physBodyApplyAngularImpulse)(body, -20000.0);
	      }
	    } else {
	      if (body.ω > 0.0) {
	        (0, _phys.physBodyApplyAngularImpulse)(body, -20000.0);
	      } else if (body.ω < 0.0) {
	        (0, _phys.physBodyApplyAngularImpulse)(body, 20000.0);
	      }
	    }
	
	    // throttle controls
	    if (input.throttle == true) {
	      var n = {
	        x: Math.cos(body.θ),
	        y: Math.sin(body.θ)
	      };
	
	      (0, _phys.physBodyApplyLinearImpulse)(body, n, 5000.0);
	    }
	
	    // fire controls
	    if (state.cooldown > 0.0) {
	      state.cooldown -= dt;
	    }
	
	    if (input.fire == true && state.cooldown <= 0.0) {
	      state.cooldown += 0.1;
	
	      var n = {
	        x: Math.cos(body.θ),
	        y: Math.sin(body.θ)
	      };
	
	      var d = {
	        x: body.d.x + n.x * 24.0,
	        y: body.d.y + n.y * 24.0
	      };
	
	      var v = {
	        x: body.v.x + n.x * 200.0,
	        y: body.v.y + n.y * 200.0
	      };
	
	      (0, _phys.physParticleCreate)(phys, d, v, 3.0, explosiveParticle);
	    }
	  }, function playerOnclip(body, clippedBody, bsp) {
	    // TODO: die?
	  });
	
	  var mesh = (0, _mesh.meshCreate)([{ x: -16.0, y: -16.0 }, { x: 16.0, y: 0.0 }, { x: -16.0, y: 16.0 }]);
	  var solid = (0, _solid.solidCreate)(mesh);
	
	  var body = (0, _phys.physBodyCreate)(phys, solid, d, θ, { x: 0.0, y: 0.0 }, 0.0, props);
	
	  // NB: player doesn't include the body since it's not guarenteed to be the
	  // same from frame to frame (phys can reuse them etc.)
	  return {
	    state: state,
	    camera: camera
	  };
	}
	
	exports.playerCreate = playerCreate;
	exports.bspTestSquare = bspTestSquare;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.recorderTimeStep = exports.recorderReplay = exports.recorderCreate = undefined;
	
	var _phys = __webpack_require__(5);
	
	function recorderCreate(phys, input, logText, frameText) {
	  return {
	    phys: phys,
	    frame: 0,
	    input: input,
	    lastFrameInput: JSON.stringify(input),
	    logText: logText,
	    frameText: frameText
	  };
	} // Deterministic recorder log
	// captures external state changes, allows them to be replayed
	// wraps all inputs into phys so that it can be replayed
	
	// clicks is all we care about. Record in world coordinates to make it view independent
	
	// TODO: figure out how to do input with less action at a distance
	//  we can't handle keypresses during replay now...
	
	function recorderTimeStep(recorder) {
	  // record input
	  var thisFrameInput = JSON.stringify(recorder.input);
	
	  if (thisFrameInput !== recorder.lastFrameInput) {
	    recorder.logText.value += ',\n' + JSON.stringify({
	      frame: recorder.frame,
	      input: recorder.input
	    });
	  }
	
	  (0, _phys.physTimeStep)(recorder.phys);
	  recorder.lastFrameInput = thisFrameInput;
	  recorder.frame++;
	  recorder.frameText.value = recorder.frame.toString();
	}
	
	function recorderReplay(recorder, render) {
	  var inputLog = JSON.parse('[' + recorder.logText.value + ']');
	  var replayToFrame = Number(recorder.frameText.value);
	
	  recorder.logText.innerHTML = '{"frame":0,"input":{"left":false,"right":false,"throttle":false,"fire":false}}';
	  recorder.frame = 0;
	  recorder.frameText.value = '0';
	
	  function recorderReplayer() {
	    while (inputLog.length > 0 && inputLog[0].frame == recorder.frame) {
	      var newInput = inputLog[0].input;
	      recorder.input.left = newInput.left;
	      recorder.input.right = newInput.right;
	      recorder.input.throttle = newInput.throttle;
	      recorder.input.fire = newInput.fire;
	      inputLog.shift();
	    }
	
	    recorderTimeStep(recorder);
	    render();
	
	    if (recorder.frame < replayToFrame) {
	      requestAnimationFrame(recorderReplayer);
	    }
	  }
	
	  if (replayToFrame > 0) {
	    requestAnimationFrame(recorderReplayer);
	  }
	}
	
	exports.recorderCreate = recorderCreate;
	exports.recorderReplay = recorderReplay;
	exports.recorderTimeStep = recorderTimeStep;

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNDhjYWJhY2QyYjczZDczNzVkZDEiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JzcC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY2FtZXJhLmpzIiwid2VicGFjazovLy8uL3NyYy90cmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21lc2guanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BoeXMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NvbGlkLmpzIiwid2VicGFjazovLy8uL3NyYy9wbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlY29yZGVyLmpzIl0sIm5hbWVzIjpbImNhbWVyYSIsImxvZyIsImJzcFRlc3RSaWdodCIsInB4IiwicHkiLCJueCIsIm55IiwiaW4iLCJvdXQiLCJic3BUZXN0Q3V0IiwiYnNwVGVzdFRvcFJpZ2h0IiwicGxheWluZyIsInBoeXMiLCJpbnB1dCIsImlucHV0QmluZCIsInJlY29yZGVyIiwicmVuZGVyIiwicmVuZGVyTmV4dEZyYW1lIiwicmVuZGVyTG9vcCIsInRpbWVTdGFtcCIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInBsYXlQYXVzZSIsInBwIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsIm5mIiwiZGlzYWJsZWQiLCJpbm5lckhUTUwiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsIm5leHRGcmFtZSIsImxlZnQiLCJyaWdodCIsInRocm90dGxlIiwiZmlyZSIsInRvZ2dsZUlucHV0IiwiaXNEb3duIiwiZSIsIndoaWNoIiwicHJldmVudERlZmF1bHQiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiaW5wdXRLZXlEb3duIiwiaW5pdGlhbGl6ZUZpZWxkIiwic2hhcGVQcm9wcyIsIngiLCJ5IiwibWFpbiIsImNhbnZhcyIsInJwIiwib25jbGljayIsImV2dCIsIm9ubW91c2Vtb3ZlIiwicCIsIm9mZnNldFgiLCJvZmZzZXRZIiwidG9GaXhlZCIsInNoaWZ0S2V5IiwiZXhwbG9zaXZlUGFydGljbGUiLCJ0IiwiYnNwIiwiYnNwVHJlZUNyZWF0ZSIsImluQnNwVHJlZSIsIm91dEJzcFRyZWUiLCJic3BTaWRlIiwiYnNwU2lkZVN0YWJsZSIsInMiLCJic3BJbnRlcnNlY3QiLCJheCIsImF5IiwiYngiLCJieSIsImN4IiwiY3kiLCJkeCIsImR5IiwiYnNwVHJlZVBvaW50U2lkZSIsImJzcFRyZWUiLCJzaWRlIiwiaW5SZXMiLCJvdXRSZXMiLCJic3BUcmVlUG9pbnRTcGxpdCIsImJzcFRyZWVDb2xsaWRlSW50ZXJpb3IiLCJhU2lkZSIsImJTaWRlIiwiaSIsIm8iLCJic3BUcmVlQ29sbGlkZSIsImJzcFNwbGl0IiwiYlRyZWVTaWRlIiwiYnNwVHJhbnNmb3JtIiwiaXgiLCJqeCIsIml5IiwiankiLCJic3BUcmVlVHJhbnNmb3JtIiwiYnNwVHJlZVRyYW5zZm9ybUNsb25lIiwiY2xvbmUiLCJic3BEZWJ1Z0xpbmVzQ2xpcEluIiwibGluZXMiLCJjbGlwcGVkIiwibGVuZ3RoIiwibGluZSIsImFzaWRlIiwiYSIsImJzaWRlIiwiYiIsInB1c2giLCJic3BEZWJ1Z0xpbmVzQ2xpcE91dCIsImJzcFRyZWVEZWJ1Z0xpbmVzIiwibCIsIm5TY2FsZSIsIk1hdGgiLCJzcXJ0IiwiY29uY2F0IiwiY2FtQ3JlYXRlIiwiZHJhd0NhbGxiYWNrIiwiY3R4IiwiZ2V0Q29udGV4dCIsIndpZHRoIiwiaGVpZ2h0Iiwic2V0VHJhbnNmb3JtIiwiY2FtIiwid29ybGRUb0NhbWVyYSIsIm1vZGVsVG9Xb3JsZCIsImNhbWVyYVRvTW9kZWwiLCJtb3VzZU1vZGVsIiwibW91c2VDYW1lcmEiLCJjYW1lcmFPbk1vdXNlV2hlZWwiLCJzY2FsZSIsImRlbHRhWSIsIkUiLCJkZWx0YSIsImRlbHRhWCIsImNhbVJlY29tcG9zZSIsImNhbWVyYU9uTW91c2VNb3ZlIiwibW9kZWxUb0NhbWVyYSIsImNhbVBvc2l0aW9uIiwiZCIsImNhbVB1c2hUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJvbGRNb2RlbFRvV29ybGQiLCJuZXdNb2RlbFRvV29ybGQiLCJjYW1Qb3BUcmFuc2Zvcm0iLCJwb3AiLCJjYW1DYW1lcmFUb01vZGVsIiwiY2FtQ2xlYXIiLCJjbGVhclJlY3QiLCJ0cmFuc2Zvcm1DcmVhdGUiLCJ0cmFuc2Zvcm1UcmFuc2xhdGVDcmVhdGUiLCJ0cmFuc2Zvcm1TY2FsZUNyZWF0ZSIsInRyYW5zZm9ybVN0cmV0Y2hDcmVhdGUiLCJzeCIsInN5IiwidHJhbnNmb3JtUm90YXRlQ3JlYXRlIiwiYW5nbGUiLCJjIiwiY29zIiwic2luIiwidHJhbnNmb3JtQ29tcG9zZSIsInQxIiwidDIiLCJ0cmFuc2Zvcm1UcmFuc2xhdGUiLCJ0cmFuc2Zvcm1TY2FsZSIsInRyYW5zZm9ybVJvdGF0ZSIsInRyYW5zZm9ybVN0cmV0Y2giLCJ0cmFuc2Zvcm1JbnZlcnQiLCJkZXQiLCJ0cmFuc2Zvcm1Qb2ludCIsInRyYW5zZm9ybU5vcm1hbCIsIm4iLCJtZXNoRWRnZVZlcmlmeSIsImVkZ2UiLCJwcmV2IiwibmV4dCIsImxpbmsiLCJtZXNoUG9seVNldEZsYWciLCJwb2x5IiwiZmxhZyIsIm1lc2hTZXRGbGFnIiwibWVzaCIsIm1lc2hQb2x5VmVyaWZ5IiwibWVzaEVkZ2VJblBvbHlWZXJpZnkiLCJtZXNoQ3JlYXRlIiwidmVydHMiLCJoZWFkIiwidGFpbCIsIm1lc2hFZGdlU3BsaXQiLCJuZXdFZGdlIiwibmV3TGluayIsIm1lc2hFZGdlQ2FuTWVyZ2UiLCJsaW5rTmV4dCIsImxpbmtOZXh0TmV4dCIsIm1lc2hFZGdlTWVyZ2UiLCJyZW1MaW5rIiwibWVzaFBvbHlTcGxpdCIsIm5ld0EiLCJuZXdCIiwibWVzaFBvbHlNZXJnZSIsImFOZXh0IiwiYk5leHQiLCJtZXNoUG9seVJlbW92ZSIsIm1lc2hQb2x5Q2VudHJvaWRBcmVhIiwicHJldlgiLCJwcmV2WSIsImFyZWEiLCJtZXNoUG9seU1vbWVudE9mSW5lcnRpYSIsIm51bSIsImRlbiIsImNyb3NzIiwibWVzaEVkZ2VQcmV2RXh0ZXJpb3IiLCJtZXNoRWRnZUlzRXh0ZXJpb3JDb252ZXgiLCJtZXNoUG9seVZlcnRpY2VzIiwidmVydGV4QXJyYXkiLCJtZXNoUG9seVJhZGl1c1NxdWFyZWQiLCJyIiwibWF4IiwibWVzaEVkZ2VUcmFuc2Zvcm0iLCJtZXNoUG9seVN0cm9rZSIsImJlZ2luUGF0aCIsIm1vdmVUbyIsImxpbmVUbyIsInN0cm9rZSIsImFyYyIsIlBJIiwiZmlsbFN0eWxlIiwiZmlsbCIsIm1lc2hQb2x5RmlsbCIsInBoeXNDcmVhdGUiLCJkdCIsImJvZGllcyIsInBhcnRpY2xlcyIsIkFycmF5IiwibnVtUGFydGljbGVzIiwibmV4dFBoeXNJZCIsInBoeXNSZXNldCIsInBoeXNCb2R5VmVsb2NpdHkiLCJib2R5IiwidiIsImRCb2R5IiwidkJvZHkiLCLPiUJvZHkiLCLPiSIsInBoeXNCb2R5UmVsYXRpdmVWZWxvY2l0eSIsInZ4IiwidnkiLCJwaHlzQm9keUFwcGx5TGluZWFySW1wdWxzZSIsImoiLCJtIiwicGh5c0JvZHlBcHBseUFuZ3VsYXJJbXB1bHNlIiwiSSIsInBoeXNCb2R5QXBwbHlJbXB1bHNlIiwicGh5c0JvZHlEdkJ5RGoiLCJubDIiLCJkdngiLCJkdnkiLCJkz4kiLCJwaHlzQm9keVByb3BlcnRpZXNDcmVhdGUiLCLPgSIsIm9uY29sbGlkZXBhcnRpY2xlIiwib25jb2xsaWRlYm9keSIsIm9udGltZXN0ZXAiLCJvbmNsaXAiLCJwaHlzQm9keUNyZWF0ZSIsInNvbGlkIiwizrgiLCJwcm9wZXJ0aWVzIiwibDJ3IiwiY2EiLCJjZW50ZXJUIiwicjIiLCJpZCIsIndvcmxkVG9Mb2NhbCIsImxvY2FsVG9Xb3JsZCIsInByZXZXb3JsZFRvTG9jYWwiLCJwcmV2TG9jYWxUb1dvcmxkIiwicGh5c1BhcnRpY2xlUHJvcGVydGllc0NyZWF0ZSIsIm9uY29sbGlkZSIsInBoeXNQYXJ0aWNsZUNyZWF0ZSIsInBoeXNSZW1vdmVQYXJ0aWNsZSIsInBoeXNGaXJzdENvbGxpc2lvbiIsImN1cnIiLCJoaXRCb2R5IiwibmwiLCJwaHlzQ29sbGlkZVBhcnRpY2xlIiwicGFydGljbGUiLCJwcmV2UG9zIiwiYm9keUR2RGoiLCJwYXJ0RHZEaiIsImJvZHlDb2xsaWRlVmVydHMiLCJib2R5TW92ZSIsIm90aGVyQm9keSIsInByZXZUIiwiY3VyclQiLCJib2R5Q29sbGlkZSIsInBoeXNCb2R5Rmlyc3RDb2xsaXNpb24iLCJwaHlzQ29sbGlkZUJvZHkiLCJvdGhlckJvZHlEdkRqIiwicGh5c1RpbWVTdGVwIiwiZFByZXZ4IiwiZFByZXZ5IiwizrhQcmV2Iiwicm90YXRpb25zIiwiY2VpbCIsInBoeXNQb2ludEluc2lkZUJvZGllcyIsInBoeXNDbGlwQm9kaWVzIiwibG9jYWxCc3AiLCJyZXN1bHQiLCJyZWdpb25zIiwiZXh0cmFjdGVkU29saWQiLCJjbGlwcGVkQm9keSIsInBoeXNEcmF3Y29sbGlzaW9uRGVidWdHcmlkIiwiZ3JpZCIsIm1pbiIsImV4Iiwic3Ryb2tlU3R5bGUiLCJsaW5lV2lkdGgiLCJwaHlzRHJhdyIsImZpbGxSZWN0IiwibW91c2VzaWRlIiwiZm9udCIsImZpbGxUZXh0IiwidG9TdHJpbmciLCJwaHlzQm9keUxvY2FsQ29vcmRpbmF0ZXNBdFBvc2l0aW9uIiwic29saWRDcmVhdGUiLCJzb2xpZFNldEZsYWciLCJzb2xpZE1hcmtDb25uZWN0ZWRSZWdpb25zSGVscGVyIiwibmV4dEZsYWciLCJzb2xpZE1hcmtDb25uZWN0ZWRSZWdpb25zIiwic29saWRFeHRyYWN0UmVnaW9uIiwiaW5Tb2xpZCIsIm91dFNvbGlkIiwic29saWRUcmFuc2Zvcm0iLCJzb2xpZFBvbHlDbGlwIiwiY3VyclNpZGUiLCJsZWF2ZUluIiwibGVhdmVJbk9uU3BsaXQiLCJsZWF2ZU91dCIsImxlYXZlT3V0T25TcGxpdCIsImFsbEluIiwiYWxsT3V0IiwibmV4dFNpZGUiLCJpblJlc3VsdCIsIm91dFJlc3VsdCIsInNvbGlkQ2xpcCIsInNvbGlkQ2VudHJvaWRBcmVhIiwiaW5DIiwib3V0QyIsInNvbGlkTW9tZW50T2ZJbmVydGlhIiwic29saWRSYWRpdXNTcXVhcmVkIiwic29saWRWZXJ0aWNlc0hlbHBlciIsInNvbGlkVmVydGljZXMiLCJzb2xpZEZpbGwiLCJzb2xpZFN0cm9rZSIsImJzcFRlc3RTcXVhcmUiLCJwbGF5ZXJDcmVhdGUiLCJzdGF0ZSIsImhlYWx0aCIsImNvb2xkb3duIiwicmVndWxhclBhcnRpY2xlIiwiZXhwbG9zaXZlUGFydGljbGVvbmNvbGxpZGUiLCJwcm9wcyIsInBsYXllck9uY29sbGlkZXBhcnRpY2xlIiwicGxheWVyT25jb2xsaWRlYm9keSIsInBsYXllck9udGltZXN0ZXAiLCJzcGVlZCIsInBsYXllck9uY2xpcCIsInJlY29yZGVyQ3JlYXRlIiwibG9nVGV4dCIsImZyYW1lVGV4dCIsImZyYW1lIiwibGFzdEZyYW1lSW5wdXQiLCJKU09OIiwic3RyaW5naWZ5IiwicmVjb3JkZXJUaW1lU3RlcCIsInRoaXNGcmFtZUlucHV0IiwidmFsdWUiLCJyZWNvcmRlclJlcGxheSIsImlucHV0TG9nIiwicGFyc2UiLCJyZXBsYXlUb0ZyYW1lIiwiTnVtYmVyIiwicmVjb3JkZXJSZXBsYXllciIsIm5ld0lucHV0Iiwic2hpZnQiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUN6QkE7O0FBSUE7O0FBTUE7O0FBSUE7O0FBV0E7O0FBS0E7O0FBTUE7O0FBSUE7O0FBckRBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEtBQUlBLE1BQUo7QUFDQSxLQUFJQyxHQUFKOztBQThDQSxLQUFJQyxlQUFlLEVBQUNDLElBQUksQ0FBTCxFQUFRQyxJQUFJLENBQVosRUFBZUMsSUFBSSxDQUFuQixFQUFzQkMsSUFBSSxDQUEx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aWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNDhjYWJhY2QyYjczZDczNzVkZDEiLCIvLyBtYWluLmpzXG4vL1xuLy8gQ29weXJpZ2h0IENoYXJsZXMgRGljayAyMDE1XG5cbi8vIFRPRE86IHVzZSB3ZWJwYWNrLCBjb252ZXJ0IHRvIG1vZHVsZXNcbi8vIFRPRE86IHVzZSByZWFjdFxuLy8gVE9ETzogYWRkIGxpc3Qgb2YgZmxhZ2dlZCBpdGVtc1xuLy8gVE9ETzogdXNlIGZsb3dcbi8vIFRPRE86IGF2b2lkIGFsbCBzaG9ydC1saXZlZCBhbGxvY2F0aW9ucyBieSB1c2luZyBhbGxvY2F0aW9uIHBvb2xzP1xuXG52YXIgY2FtZXJhO1xudmFyIGxvZztcblxuaW1wb3J0IHtcbiAgYnNwVHJlZVRyYW5zZm9ybUNsb25lXG59IGZyb20gJy4vYnNwLmpzJztcblxuaW1wb3J0IHtcbiAgY2FtQ2FtZXJhVG9Nb2RlbCxcbiAgY2FtQ3JlYXRlLFxuICBjYW1DbGVhcixcbn0gZnJvbSAnLi9jYW1lcmEuanMnO1xuXG5pbXBvcnQge1xuICBtZXNoQ3JlYXRlLFxufSBmcm9tICcuL21lc2guanMnO1xuXG5pbXBvcnQge1xuICBwaHlzQm9keUNyZWF0ZSxcbiAgcGh5c0JvZHlMb2NhbENvb3JkaW5hdGVzQXRQb3NpdGlvbixcbiAgcGh5c0JvZHlQcm9wZXJ0aWVzQ3JlYXRlLFxuICBwaHlzQ2xpcEJvZGllcyxcbiAgcGh5c0NyZWF0ZSxcbiAgcGh5c0RyYXcsXG4gIHBoeXNQYXJ0aWNsZUNyZWF0ZSxcbiAgcGh5c1Jlc2V0LFxufSBmcm9tICcuL3BoeXMuanMnO1xuXG5pbXBvcnQge1xuICBic3BUZXN0U3F1YXJlLCAgLy8gVE9ETzogbW92ZSB0aGlzXG4gIHBsYXllckNyZWF0ZSxcbn0gZnJvbSAnLi9wbGF5ZXIuanMnO1xuXG5pbXBvcnQge1xuICByZWNvcmRlckNyZWF0ZSxcbiAgcmVjb3JkZXJSZXBsYXksXG4gIHJlY29yZGVyVGltZVN0ZXAsXG59IGZyb20gJy4vcmVjb3JkZXIuanMnO1xuXG5pbXBvcnQge1xuICBzb2xpZENyZWF0ZSxcbn0gZnJvbSAnLi9zb2xpZC5qcyc7XG5cbmltcG9ydCB7XG4gIHRyYW5zZm9ybVRyYW5zbGF0ZUNyZWF0ZSxcbn0gZnJvbSAnLi90cmFuc2Zvcm0uanMnXG5cbnZhciBic3BUZXN0UmlnaHQgPSB7cHg6IDAsIHB5OiAwLCBueDogMSwgbnk6IDAsXG4gIGluOiBudWxsLFxuICBvdXQ6IG51bGxcbiAgfTtcblxudmFyIGJzcFRlc3RDdXQgPSB7cHg6IDQsIHB5OiAwLCBueDogMSwgbnk6IDAsXG4gIGluOiBudWxsLFxuICBvdXQ6IHtweDogLTQsIHB5OiAwLCBueDogLTEsIG55OiAwLFxuICAgIGluOiBudWxsLFxuICAgIG91dDogbnVsbFxuICAgIH1cbiAgfTtcblxuXG52YXIgYnNwVGVzdFRvcFJpZ2h0ID0ge3B4OiAwLCBweTogMCwgbng6IDEsIG55OiAwLFxuICBpbjogeyBweDogMCwgcHk6IDAsIG54OiAwLCBueTogMSxcbiAgICBpbjogbnVsbCxcbiAgICBvdXQ6IG51bGwgfSxcbiAgb3V0OiBudWxsIH07XG5cbnZhciBwbGF5aW5nID0gMDtcblxudmFyIHBoeXMgPSBwaHlzQ3JlYXRlKDAuMDE2NjY2NjY3KTtcbnZhciBpbnB1dCA9IGlucHV0QmluZCgpO1xudmFyIHJlY29yZGVyO1xuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gIGNhbUNsZWFyKGNhbWVyYSk7XG4gIHBoeXNEcmF3KHBoeXMsIGNhbWVyYSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck5leHRGcmFtZSgpIHtcbiAgLy8gVE9ETzogZGVjb3VwbGUgZnJhbWUgcmF0ZSBhbmQgcGh5cyB0aW1lIHN0ZXA/XG5cbiAgcmVjb3JkZXJUaW1lU3RlcChyZWNvcmRlcik7XG4gIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJMb29wKHRpbWVTdGFtcCkge1xuICByZW5kZXJOZXh0RnJhbWUoKTtcbiAgcGxheWluZyA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJMb29wKTtcbn1cblxuZnVuY3Rpb24gcGxheVBhdXNlKCkge1xuICB2YXIgcHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsYXlwYXVzZVwiKTtcbiAgdmFyIG5mID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXh0ZnJhbWVcIik7XG5cbiAgaWYgKHBsYXlpbmcgIT0gMCkge1xuICAgIG5mLmRpc2FibGVkID0gZmFsc2U7XG4gICAgcHAuaW5uZXJIVE1MID0gXCLilrZcIjtcbiAgICBjYW5jZWxBbmltYXRpb25GcmFtZShwbGF5aW5nKTtcbiAgICBwbGF5aW5nID0gMDtcbiAgfSBlbHNlIHtcbiAgICBuZi5kaXNhYmxlZCA9IHRydWU7XG4gICAgcHAuaW5uZXJIVE1MID0gXCLinZrinZpcIjtcbiAgICBwbGF5aW5nID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckxvb3ApO1xuICB9XG59XG5cbmZ1bmN0aW9uIG5leHRGcmFtZSgpIHtcbiAgcmVuZGVyTmV4dEZyYW1lKCk7XG59XG5cbi8vIFRPRE86IG1vdmUgdGhpcyBzb21ld2hlcmUsIGFuZCBtYXliZSBoYW5nIGl0IG9mZiBvZiBzb21ldGhpbmcgb3RoZXIgdGhhbiB0aGUgd2luZG93XG5mdW5jdGlvbiBpbnB1dEJpbmQoKSB7XG4gIHZhciBsb2cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9nJyk7XG5cbiAgdmFyIGlucHV0ID0ge1xuICAgIGxlZnQ6IGZhbHNlLFxuICAgIHJpZ2h0OiBmYWxzZSxcbiAgICB0aHJvdHRsZTogZmFsc2UsXG4gICAgZmlyZTogZmFsc2UsXG4gIH07XG5cbiAgZnVuY3Rpb24gdG9nZ2xlSW5wdXQoaXNEb3duLCBlKSB7XG4gICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICBjYXNlIDY1OiAgLy8gYSAtIGxlZnRcbiAgICAgIGlucHV0LmxlZnQgPSBpc0Rvd247XG4gICAgICBicmVhaztcblxuICAgICAgY2FzZSA2ODogIC8vIGQgLSByaWdodFxuICAgICAgaW5wdXQucmlnaHQgPSBpc0Rvd247XG4gICAgICBicmVhaztcblxuICAgICAgY2FzZSA4NzogLy8gdyAtIHRocm90dGxlXG4gICAgICBpbnB1dC50aHJvdHRsZSA9IGlzRG93bjtcbiAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDMyOiAvLyBzcGFjZSAtIGZpcmVcbiAgICAgIGlucHV0LmZpcmUgPSBpc0Rvd247XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH07XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbiBpbnB1dEtleURvd24oZSkge1xuICAgIHRvZ2dsZUlucHV0KHRydWUsIGUpO1xuICB9KTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbiBpbnB1dEtleURvd24oZSkge1xuICAgIHRvZ2dsZUlucHV0KGZhbHNlLCBlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGlucHV0O1xufTtcblxuZnVuY3Rpb24gaW5pdGlhbGl6ZUZpZWxkKCkge1xuICB2YXIgc2hhcGVQcm9wcyA9IHBoeXNCb2R5UHJvcGVydGllc0NyZWF0ZSgxLjAsIDAuOSwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgcGh5c1Jlc2V0KHBoeXMpO1xuXG4gIHBoeXNCb2R5Q3JlYXRlKHBoeXMsXG4gICAgc29saWRDcmVhdGUobWVzaENyZWF0ZShbeyB4OiAtNjQsIHk6IC02NCB9LHsgeDogNjQsIHk6IC02NCB9LHsgeDogNjQsIHk6IDY0IH0seyB4OiAtNjQsIHk6IDY0IH1dKSksXG4gICAgeyB4OiAwLjAsIHk6IDAuMCB9LCAwLjAsICAgIC8vIHBvc2l0aW9uXG4gICAgeyB4OiAwLjAsIHk6IDAuMCB9LCAwLjAsICAgIC8vIHZlbG9jaXR5XG4gICAgc2hhcGVQcm9wcyk7XG5cbiAgcGh5c0JvZHlDcmVhdGUocGh5cyxcbiAgICBzb2xpZENyZWF0ZShtZXNoQ3JlYXRlKFt7IHg6IC0zMiwgeTogLTMyIH0seyB4OiAzMiwgeTogLTMyIH0seyB4OiAzMiwgeTogMzIgfSx7IHg6IC0zMiwgeTogMzIgfV0pKSxcbiAgICB7IHg6IC0yNTYuMCwgeTogMC4wIH0sIDAuMCwgLy8gcG9zaXRpb25cbiAgICB7IHg6IDcyLjAsIHk6IDAuMCB9LCAwLjAsICAgLy8gdmVsb2NpdHlcbiAgICBzaGFwZVByb3BzKTtcblxuICBwaHlzQm9keUNyZWF0ZShwaHlzLFxuICAgIHNvbGlkQ3JlYXRlKG1lc2hDcmVhdGUoW3sgeDogLTMyLCB5OiAtMzIgfSx7IHg6IDMyLCB5OiAtMzIgfSx7IHg6IDMyLCB5OiAzMiB9LHsgeDogLTMyLCB5OiAzMiB9XSkpLFxuICAgIHsgeDogMjU2LjAsIHk6IDAuMCB9LCAwLjAsICAvLyBwb3NpdGlvblxuICAgIHsgeDogLTcwLjAsIHk6IDAuMCB9LCAwLjAsICAvLyB2ZWxvY2l0eVxuICAgIHNoYXBlUHJvcHMpO1xuXG4gIHBsYXllckNyZWF0ZShwaHlzLCB7IHg6IDAuMCwgeTogMTI4LjAgfSwgMC4wLCBpbnB1dCwgY2FtZXJhKTtcbn1cblxuZnVuY3Rpb24gbWFpbigpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcbiAgdmFyIHBwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGF5cGF1c2VcIik7XG4gIHZhciBuZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV4dGZyYW1lXCIpO1xuICB2YXIgcnAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlcGxheVwiKTtcbiAgcHAub25jbGljayA9IHBsYXlQYXVzZTtcbiAgbmYub25jbGljayA9IG5leHRGcmFtZTtcbiAgcnAub25jbGljayA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpbml0aWFsaXplRmllbGQoKTtcbiAgICByZWNvcmRlclJlcGxheShyZWNvcmRlciwgcmVuZGVyKTtcbiAgfTtcblxuICByZWNvcmRlciA9IHJlY29yZGVyQ3JlYXRlKFxuICAgIHBoeXMsXG4gICAgaW5wdXQsXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZycpLFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcmFtZScpKTtcblxuICBjYW1lcmEgPSBjYW1DcmVhdGUoY2FudmFzLCByZW5kZXIpO1xuXG4gIGluaXRpYWxpemVGaWVsZCgpO1xuXG4gIGNhbUNsZWFyKGNhbWVyYSk7XG4gIHBoeXNEcmF3KHBoeXMsIGNhbWVyYSk7XG5cbiAgY2FudmFzLm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIHZhciBwID0geyB4OiBldnQub2Zmc2V0WCwgeTogZXZ0Lm9mZnNldFkgfTtcbiAgICBjYW1DYW1lcmFUb01vZGVsKGNhbWVyYSwgcCk7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd29ybGR4JykuaW5uZXJIVE1MID0gcC54LnRvRml4ZWQoMyk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dvcmxkeScpLmlubmVySFRNTCA9IHAueS50b0ZpeGVkKDMpO1xuXG4gICAgaWYgKHBoeXNCb2R5TG9jYWxDb29yZGluYXRlc0F0UG9zaXRpb24ocGh5cywgcCkpIHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2NhbHgnKS5pbm5lckhUTUwgPSBwLngudG9GaXhlZCgzKTtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2NhbHknKS5pbm5lckhUTUwgPSBwLnkudG9GaXhlZCgzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvY2FseCcpLmlubmVySFRNTCA9ICdOL0EnO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvY2FseScpLmlubmVySFRNTCA9ICdOL0EnO1xuICAgIH1cbiAgfTtcblxuICBjYW52YXMub25jbGljayA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICB2YXIgcCA9IHsgeDogZXZ0Lm9mZnNldFgsIHk6IGV2dC5vZmZzZXRZIH07XG4gICAgY2FtQ2FtZXJhVG9Nb2RlbChjYW1lcmEsIHApO1xuXG4gICAgaWYgKGV2dC5zaGlmdEtleSkge1xuICAgICAgcGh5c1BhcnRpY2xlQ3JlYXRlKHBoeXMsIHAsIHsgeDogNzUuMCwgeTogMC4wIH0sIDUuMCwgZXhwbG9zaXZlUGFydGljbGUpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB0ID0gdHJhbnNmb3JtVHJhbnNsYXRlQ3JlYXRlKHAueCwgcC55KTtcbiAgICAgIHZhciBic3AgPSBic3BUcmVlVHJhbnNmb3JtQ2xvbmUoYnNwVGVzdFNxdWFyZSwgdCk7XG5cbiAgICAgIHBoeXNDbGlwQm9kaWVzKHBoeXMsIGJzcCk7XG4gICAgfVxuXG4gICAgaWYgKHBsYXlpbmcgPT0gMCkge1xuICAgICAgY2FtQ2xlYXIoY2FtZXJhKTtcbiAgICAgIHBoeXNEcmF3KHBoeXMsIGNhbWVyYSk7XG4gICAgfVxuICB9O1xufTtcblxubWFpbigpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21haW4uanMiLCIvLyBic3AuanNcbi8vXG4vLyBDb3B5cmlnaHQgQ2hhcmxlcyBEaWNrIDIwMTVcbi8vXG4vLyBUaGlzIGZpbGUgY29udGFpbnMgZnVuY3Rpb25zIHRvIGNyZWF0ZSBhbmQgbWFuaXB1bGF0ZSBCU1AgdHJlZXMgYW5kIHJlbGF0ZWQgc3RydWN0dXJlc1xuLy9cbi8vIFN0cnVjdHVyZXMgdXNlZDpcbi8vXG4vLyBic3AgLSBCaW5hcnkgU3BhY2UgUGFydGl0aW9uLCBzcGxpdHMgYSBwbGFuZSBpbiBoYWxmLlxuLy8gYnNwVHJlZSAtIFRyZWUgb2YgQmluYXJ5IFNwYWNlIFBhcnRpdGlvbnMsIGNhbiBkZXNjcmliZSBhcmJpdHJhcnkgcmVnaW9ucyBieSBuZXN0aW5nIHNwbGl0cy5cbi8vIGJzcFRyZWVTb2xpZCAtIGJzcFRyZWUgd2l0aCBhZGRlZCBwb2x5Z29uIGluZm9ybWF0aW9uLCBzbyB3ZSBrbm93IGhvdyB0byBkcmF3IHRoZSByZWdpb24gZGVzY3JpYmVkLlxuLy8gIFRoZSBwb2x5Z29ucyBjb3ZlciBhbGwgcGF0aHMgaW4gdGhlIHRyZWUsIG5vIHBvbHlnb24gY2FuIGJlIG9uIGEgYnJhbmNoIHVuZGVyIGEgYnJhbmNoIHdpdGggYSBwb2x5Z29uLlxuXG5mdW5jdGlvbiBic3BUcmVlQ3JlYXRlKHB4LCBweSwgbngsIG55LCBpbkJzcFRyZWUsIG91dEJzcFRyZWUpIHtcbiAgcmV0dXJuIHtcbiAgICBweDogcHgsXG4gICAgcHk6IHB5LFxuICAgIG54OiBueCxcbiAgICBueTogbnksXG4gICAgaW46IGluQnNwVHJlZSxcbiAgICBvdXQ6IG91dEJzcFRyZWVcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnNwU2lkZShic3AsIHgsIHkpIHtcbiAgcmV0dXJuICh4IC0gYnNwLnB4KSAqIGJzcC5ueCArICh5IC0gYnNwLnB5KSAqIGJzcC5ueTtcbn1cblxuZnVuY3Rpb24gYnNwU2lkZVN0YWJsZShic3AsIHgsIHkpIHtcbiAgLy8gcyA9IChwIC0gYnNwLnApIGRvdCBic3AublxuICB2YXIgcyA9ICh4IC0gYnNwLnB4KSAqIGJzcC5ueCArICh5IC0gYnNwLnB5KSAqIGJzcC5ueTtcblxuICBpZiAoKHMgKiBzKSAvIChic3AubnggKiBic3AubnggKyBic3AubnkgKiBic3AubnkpIDwgMC4wMSkge1xuICAgIHJldHVybiAwLjA7XG4gIH1cblxuICByZXR1cm4gcztcbn1cblxuLy8gcmV0dXJucyB0IHMudC4gaW50ZXJzZWN0aW9uIHBvaW50ID0gYSAqIHQgKyBiICogKDEgLSB0KVxuZnVuY3Rpb24gYnNwSW50ZXJzZWN0KGJzcCwgYXgsIGF5LCBieCwgYnkpIHtcbiAgdmFyIGN4ID0gYnNwLnB4OyAvLyBwb2ludCBvbiBzcGxpdFxuICB2YXIgY3kgPSBic3AucHk7XG5cbiAgdmFyIGR4ID0gYnNwLm55OyAvLyBkaXJlY3Rpb24gdmVjdG9yIG9uIHNwbGl0IChyb3RhdGUgbm9ybWFsKVxuICB2YXIgZHkgPSAtYnNwLm54O1xuXG4gIHZhciB0ID0gKGR4ICogYnkgLSBkeCAqIGN5IC0gZHkgKiBieCArIGR5ICogY3gpIC8gKGR5ICogYXggLSBkeSAqIGJ4IC0gZHggKiBheSArIGR4ICogYnkpO1xuXG4gIHJldHVybiB0O1xufVxuXG4vLyBic3BUcmVlUG9pbnRTaWRlXG4vLyAgZGV0ZXJtaW5lcyBpZiBwb2ludCAoeCwgeSkgaXMgaW4sIG91dCwgb3Igb24gdGhlIGVkZ2Ugb2YgcmVnaW9uIGRlc2NyaWJlZCBieSBic3BUcmVlXG4vLyByZXR1cm5zXG4vLyAgMSBpZmYgcG9pbnQgaXMgc3RyaWN0bHkgaW5cbi8vICAyIGlmZiBwb2ludCBpcyBzdHJpY2x5IG91dFxuLy8gIDMgaWZmIHBvaW50IGlzIG9uIGJvdW5kYXJ5XG5mdW5jdGlvbiBic3BUcmVlUG9pbnRTaWRlKGJzcFRyZWUsIHgsIHkpIHtcbiAgdmFyIHNpZGUgPSBic3BTaWRlU3RhYmxlKGJzcFRyZWUsIHgsIHkpO1xuXG4gIGlmIChzaWRlID4gMC4wKSB7XG4gICAgcmV0dXJuIGJzcFRyZWUuaW4gPT0gbnVsbCA/IDEgOiBic3BUcmVlUG9pbnRTaWRlKGJzcFRyZWUuaW4sIHgsIHkpO1xuICB9IGVsc2UgaWYgKHNpZGUgPCAwLjApIHtcbiAgICByZXR1cm4gYnNwVHJlZS5vdXQgPT0gbnVsbCA/IDIgOiBic3BUcmVlUG9pbnRTaWRlKGJzcFRyZWUub3V0LCB4LCB5KTtcbiAgfSBlbHNlIHsgIC8vIHNpZGUgPT0gMC4wXG4gICAgdmFyIGluUmVzID0gYnNwVHJlZS5pbiA9PSBudWxsID8gMSA6IGJzcFRyZWVQb2ludFNpZGUoYnNwVHJlZS5pbiwgeCwgeSk7XG4gICAgdmFyIG91dFJlcyA9IGJzcFRyZWUub3V0ID09IG51bGwgPyAyIDogYnNwVHJlZVBvaW50U2lkZShic3BUcmVlLm91dCwgeCwgeSk7XG4gICAgcmV0dXJuIGluUmVzIHwgb3V0UmVzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJzcFRyZWVQb2ludFNwbGl0KGJzcFRyZWUsIHgsIHkpIHtcbiAgdmFyIHNpZGUgPSBic3BTaWRlU3RhYmxlKGJzcFRyZWUsIHgsIHkpO1xuXG4gIGlmIChzaWRlID4gMC4wKSB7XG4gICAgcmV0dXJuIGJzcFRyZWUuaW4gJiYgYnNwVHJlZVBvaW50U3BsaXQoYnNwVHJlZS5pbiwgeCwgeSk7XG4gIH0gZWxzZSBpZiAoc2lkZSA8IDAuMCkge1xuICAgIHJldHVybiBic3BUcmVlLm91dCAmJiBic3BUcmVlUG9pbnRTcGxpdChic3BUcmVlLm91dCwgeCwgeSk7XG4gIH0gZWxzZSB7ICAvLyBzaWRlID09IDAuMFxuICAgIHJldHVybiBic3BUcmVlO1xuICB9XG59XG5cbi8vIGxvb2sgZm9yIGludGVyc2VjdGlvbnMgc3RyaWN0bHkgYmV0d2VlbiBhIGFuZCBiXG5mdW5jdGlvbiBic3BUcmVlQ29sbGlkZUludGVyaW9yKGJzcFRyZWUsIGF4LCBheSwgYngsIGJ5KSB7XG4gIGlmIChic3BUcmVlID09IG51bGwpIHtcbiAgICB0aHJvdyAnaW52YWxpZCBhcmd1bWVudCwgYnNwVHJlZSBjYW4gbm90IGJlIG51bGwnO1xuICB9XG5cbiAgdmFyIGFTaWRlID0gYnNwU2lkZVN0YWJsZShic3BUcmVlLCBheCwgYXkpO1xuICB2YXIgYlNpZGUgPSBic3BTaWRlU3RhYmxlKGJzcFRyZWUsIGJ4LCBieSk7XG5cbiAgaWYgKGFTaWRlID49IDAuMCAmJiBiU2lkZSA+PSAwLjApIHsgLy8gYWxsIGluXG4gICAgcmV0dXJuIGJzcFRyZWUuaW4gJiYgYnNwVHJlZUNvbGxpZGVJbnRlcmlvcihic3BUcmVlLmluLCBheCwgYXksIGJ4LCBieSk7XG4gIH0gZWxzZSBpZiAoYVNpZGUgPD0gMC4wICYmIGJTaWRlIDw9IDAuMCkgeyAgLy8gYWxsIG91dFxuICAgIHJldHVybiBic3BUcmVlLm91dCAmJiBic3BUcmVlQ29sbGlkZUludGVyaW9yKGJzcFRyZWUub3V0LCBheCwgYXksIGJ4LCBieSk7XG4gIH0gZWxzZSB7ICAvLyBjcm9zc2luZ1xuICAgIHZhciB0ID0gYnNwSW50ZXJzZWN0KGJzcFRyZWUsIGF4LCBheSwgYngsIGJ5KTtcblxuICAgIGlmICh0IDw9IDAuMCB8fCB0ID49IDEuMCkge1xuICAgICAgdGhyb3cgJ2Nyb3NzaW5nIHNlZ21lbnQgbm90IGNyb3NzaW5nJztcbiAgICB9XG5cbiAgICB2YXIgY3ggPSB0ICogYXggKyAoMS4wIC0gdCkgKiBieDtcbiAgICB2YXIgY3kgPSB0ICogYXkgKyAoMS4wIC0gdCkgKiBieTtcblxuICAgIGlmIChhU2lkZSA+IDAuMCAmJiBiU2lkZSA8IDAuMCkgeyAvLyBjaGVjayBpbiBzaWRlIGZpcnN0XG4gICAgICB2YXIgaSA9IGJzcFRyZWUuaW4gJiYgYnNwVHJlZUNvbGxpZGVJbnRlcmlvcihic3BUcmVlLmluLCBheCwgYXksIGN4LCBjeSk7XG4gICAgICB2YXIgeCA9IDMgPT0gYnNwVHJlZVBvaW50U2lkZShic3BUcmVlLCBjeCwgY3kpID8gYnNwVHJlZSA6IG51bGw7XG4gICAgICB2YXIgbyA9IGJzcFRyZWUub3V0ICYmIGJzcFRyZWVDb2xsaWRlSW50ZXJpb3IoYnNwVHJlZS5vdXQsIGN4LCBjeSwgYngsIGJ5KTtcblxuICAgICAgcmV0dXJuIChpIHx8ICh4IHx8IG8pKTtcbiAgICB9IGVsc2UgaWYgKGFTaWRlIDwgMC4wICYmIGJTaWRlID4gMC4wKSB7ICAvLyBjaGVjayBvdXQgc2lkZSBmaXJzdFxuICAgICAgdmFyIG8gPSBic3BUcmVlLm91dCAmJiBic3BUcmVlQ29sbGlkZUludGVyaW9yKGJzcFRyZWUub3V0LCBheCwgYXksIGN4LCBjeSk7XG4gICAgICB2YXIgeCA9IGJzcFRyZWVQb2ludFNpZGUoYnNwVHJlZSwgY3gsIGN5KTtcbiAgICAgIHZhciBpID0gYnNwVHJlZS5pbiAmJiBic3BUcmVlQ29sbGlkZUludGVyaW9yKGJzcFRyZWUuaW4sIGN4LCBjeSwgYngsIGJ5KTtcblxuICAgICAgcmV0dXJuIChvIHx8ICgoeCA9PSAzID8gYnNwVHJlZSA6IG51bGwpIHx8IGkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgJ2Nyb3NzaW5nIHNlZ21lbnQgbm90IGNyb3NzaW5nJztcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYnNwVHJlZUNvbGxpZGUoYnNwVHJlZSwgYXgsIGF5LCBieCwgYnkpIHtcbiAgLy8gbWFrZSBzdXJlIHdlJ3JlIHN0YXJ0aW5nIG9uIHRoZSBvdXRzaWRlIG9mIGEgcmVnaW9uXG4gIGlmICgyICE9IGJzcFRyZWVQb2ludFNpZGUoYnNwVHJlZSwgYXgsIGF5KSkge1xuICAgIHRocm93ICdzdGFydCBvZiBzZWdtZW50IG5vdCBvdXRzaWRlIGJzcFRyZWUnO1xuICB9XG5cbiAgLy8gY2hlY2sgZm9yIGFueSBjb2xsaXNpb24gcG9pbnRzIGJldHdlZW4gYSBhbmQgYlxuICB2YXIgYnNwU3BsaXQgPSBic3BUcmVlQ29sbGlkZUludGVyaW9yKGJzcFRyZWUsIGF4LCBheSwgYngsIGJ5KTtcblxuICBpZiAoYnNwU3BsaXQgIT0gbnVsbCkge1xuICAgIHJldHVybiBic3BTcGxpdDtcbiAgfVxuXG4gIHZhciBiVHJlZVNpZGUgPSBic3BUcmVlUG9pbnRTaWRlKGJzcFRyZWUsIGJ4LCBieSk7XG5cbiAgc3dpdGNoIChiVHJlZVNpZGUpIHtcbiAgICBjYXNlIDE6XG4gICAgICB0aHJvdyAnc2VnbWVudCBzdGFydGVkIG91dHNpZGUsIGVuZGVkIGluc2lkZSwgYnV0IGRpZG50IGNyb3NzIT8nO1xuXG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIG51bGw7ICAvLyBsaW5lIHNlZ21lbnQgaXMgb3V0c2lkZVxuXG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIGJzcFRyZWVQb2ludFNwbGl0KGJzcFRyZWUsIGJ4LCBieSk7ICAvLyBiIGlzIG9uIGEgc3BsaXQsIGZpbmQgaXRcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyAndW5leHBlY3RlZCByZXR1cm4gdmFsdWUgZnJvbSBic3BUcmVlUG9pbnRTaWRlJztcbiAgfVxufVxuXG5mdW5jdGlvbiBic3BUcmFuc2Zvcm0oYnNwLCB0KSB7XG4gIHZhciBweCA9IGJzcC5weCAqIHQuaXggKyBic3AucHkgKiB0Lmp4ICsgdC5keDtcbiAgdmFyIHB5ID0gYnNwLnB4ICogdC5peSArIGJzcC5weSAqIHQuankgKyB0LmR5O1xuICB2YXIgbnggPSBic3AubnggKiB0Lml4ICsgYnNwLm55ICogdC5qeDtcbiAgdmFyIG55ID0gYnNwLm54ICogdC5peSArIGJzcC5ueSAqIHQuank7XG5cbiAgYnNwLnB4ID0gcHg7XG4gIGJzcC5weSA9IHB5O1xuICBic3AubnggPSBueDtcbiAgYnNwLm55ID0gbnk7XG59XG5cbmZ1bmN0aW9uIGJzcFRyZWVUcmFuc2Zvcm0oYnNwVHJlZSwgdCkge1xuICBpZiAoYnNwVHJlZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgYnNwVHJlZVRyYW5zZm9ybShic3BUcmVlLmluLCB0KTtcbiAgYnNwVHJlZVRyYW5zZm9ybShic3BUcmVlLm91dCwgdCk7XG4gIGJzcFRyYW5zZm9ybShic3BUcmVlKTtcbn1cblxuZnVuY3Rpb24gYnNwVHJlZVRyYW5zZm9ybUNsb25lKGJzcFRyZWUsIHQpIHtcbiAgaWYgKGJzcFRyZWUgPT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBjbG9uZSA9IGJzcFRyZWVDcmVhdGUoYnNwVHJlZS5weCwgYnNwVHJlZS5weSwgYnNwVHJlZS5ueCwgYnNwVHJlZS5ueSwgbnVsbCwgbnVsbCk7XG5cbiAgYnNwVHJhbnNmb3JtKGNsb25lLCB0KTtcbiAgY2xvbmUuaW4gPSBic3BUcmVlVHJhbnNmb3JtQ2xvbmUoYnNwVHJlZS5pbiwgdCk7XG4gIGNsb25lLm91dCA9IGJzcFRyZWVUcmFuc2Zvcm1DbG9uZShic3BUcmVlLm91dCwgdCk7XG5cbiAgcmV0dXJuIGNsb25lO1xufVxuXG5mdW5jdGlvbiBic3BEZWJ1Z0xpbmVzQ2xpcEluKGJzcCwgbGluZXMpIHtcbiAgdmFyIGNsaXBwZWQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBsaW5lID0gbGluZXNbaV07XG4gICAgdmFyIGFzaWRlID0gYnNwU2lkZVN0YWJsZShic3AsIGxpbmUuYS54LCBsaW5lLmEueSk7XG4gICAgdmFyIGJzaWRlID0gYnNwU2lkZVN0YWJsZShic3AsIGxpbmUuYi54LCBsaW5lLmIueSk7XG4gICAgaWYgKGFzaWRlID49IDAuMCAmJiBic2lkZSA+PSAwLjApIHtcbiAgICAgIGNsaXBwZWQucHVzaChsaW5lKTtcbiAgICB9IGVsc2UgaWYgKGFzaWRlIDw9IDAuMCAmJiBic2lkZSA8PSAwLjApIHtcbiAgICAgIC8vIGNsaXBwZWQgb3V0XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB0ID0gYnNwSW50ZXJzZWN0KGJzcCwgbGluZS5hLngsIGxpbmUuYS55LCBsaW5lLmIueCwgbGluZS5iLnkpO1xuICAgICAgdmFyIGN4ID0gdCAqIGxpbmUuYS54ICsgKDEuMCAtIHQpICogbGluZS5iLng7XG4gICAgICB2YXIgY3kgPSB0ICogbGluZS5hLnkgKyAoMS4wIC0gdCkgKiBsaW5lLmIueTtcbiAgICAgIGlmIChhc2lkZSA+IDAuMCAmJiBic2lkZSA8IDAuMCkge1xuICAgICAgICBjbGlwcGVkLnB1c2goe2E6IGxpbmUuYSwgYjogeyB4OiBjeCwgeTogY3kgfSB9KTtcbiAgICAgIH0gZWxzZSBpZiAoYnNpZGUgPiAwLjAgJiYgYXNpZGUgPCAwLjApIHtcbiAgICAgICAgY2xpcHBlZC5wdXNoKHthOiB7IHg6IGN4LCB5OiBjeSB9LCBiOiBsaW5lLmIgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBcImxpbmUgdG8gYmUgY2xpcHBlZCBpcyBjcm9zc2luZyBhbmQgbm90IGNyb3NzaW5nIVwiO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY2xpcHBlZDtcbn1cblxuZnVuY3Rpb24gYnNwRGVidWdMaW5lc0NsaXBPdXQoYnNwLCBsaW5lcykge1xuICB2YXIgY2xpcHBlZCA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGxpbmUgPSBsaW5lc1tpXTtcbiAgICB2YXIgYXNpZGUgPSBic3BTaWRlU3RhYmxlKGJzcCwgbGluZS5hLngsIGxpbmUuYS55KTtcbiAgICB2YXIgYnNpZGUgPSBic3BTaWRlU3RhYmxlKGJzcCwgbGluZS5iLngsIGxpbmUuYi55KTtcbiAgICBpZiAoYXNpZGUgPD0gMC4wICYmIGJzaWRlIDw9IDAuMCkge1xuICAgICAgY2xpcHBlZC5wdXNoKGxpbmUpO1xuICAgIH0gZWxzZSBpZiAoYXNpZGUgPj0gMC4wICYmIGJzaWRlID49IDAuMCkge1xuICAgICAgLy8gY2xpcHBlZCBpblxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdCA9IGJzcEludGVyc2VjdChic3AsIGxpbmUuYS54LCBsaW5lLmEueSwgbGluZS5iLngsIGxpbmUuYi55KTtcbiAgICAgIHZhciBjeCA9IHQgKiBsaW5lLmEueCArICgxLjAgLSB0KSAqIGxpbmUuYi54O1xuICAgICAgdmFyIGN5ID0gdCAqIGxpbmUuYS55ICsgKDEuMCAtIHQpICogbGluZS5iLnk7XG4gICAgICBpZiAoYXNpZGUgPCAwLjAgJiYgYnNpZGUgPiAwLjApIHtcbiAgICAgICAgY2xpcHBlZC5wdXNoKHthOiBsaW5lLmEsIGI6IHsgeDogY3gsIHk6IGN5IH0gfSk7XG4gICAgICB9IGVsc2UgaWYgKGJzaWRlIDwgMC4wICYmIGFzaWRlID4gMC4wKSB7XG4gICAgICAgIGNsaXBwZWQucHVzaCh7YTogeyB4OiBjeCwgeTogY3kgfSwgYjogbGluZS5iIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgXCJsaW5lIHRvIGJlIGNsaXBwZWQgaXMgY3Jvc3NpbmcgYW5kIG5vdCBjcm9zc2luZyFcIjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNsaXBwZWQ7XG59XG5cbmZ1bmN0aW9uIGJzcFRyZWVEZWJ1Z0xpbmVzKGJzcFRyZWUsIHgsIHksIGwpIHtcbiAgaWYgKGJzcFRyZWUgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHZhciBuU2NhbGUgPSBsIC8gTWF0aC5zcXJ0KGJzcFRyZWUubnggKiBic3BUcmVlLm54ICsgYnNwVHJlZS5ueSAqIGJzcFRyZWUubnkpO1xuICB2YXIgc2lkZSA9IGJzcFNpZGVTdGFibGUoYnNwVHJlZSwgeCwgeSk7XG4gIHZhciBsaW5lID0ge1xuICAgIGE6IHtcbiAgICAgIHg6IGJzcFRyZWUucHggLSBic3BUcmVlLm55ICogblNjYWxlLFxuICAgICAgeTogYnNwVHJlZS5weSArIGJzcFRyZWUubnggKiBuU2NhbGUgfSxcbiAgICBiOiB7XG4gICAgICB4OiBic3BUcmVlLnB4ICsgYnNwVHJlZS5ueSAqIG5TY2FsZSxcbiAgICAgIHk6IGJzcFRyZWUucHkgLSBic3BUcmVlLm54ICogblNjYWxlIH0sXG4gICAgc2lkZTogc2lkZSB9O1xuXG4gIHZhciBsaW5lcztcbiAgaWYgKHNpZGUgPiAwLjApIHtcbiAgICBsaW5lcyA9IGJzcERlYnVnTGluZXNDbGlwSW4oYnNwVHJlZSwgYnNwVHJlZURlYnVnTGluZXMoYnNwVHJlZS5pbiwgeCwgeSwgbCkpO1xuICB9IGVsc2UgaWYgKHNpZGUgPCAwLjApIHtcbiAgICBsaW5lcyA9IGJzcERlYnVnTGluZXNDbGlwT3V0KGJzcFRyZWUsIGJzcFRyZWVEZWJ1Z0xpbmVzKGJzcFRyZWUub3V0LCB4LCB5LCBsKSk7XG4gIH0gZWxzZSB7XG4gICAgbGluZXMgPSBic3BEZWJ1Z0xpbmVzQ2xpcEluKGJzcFRyZWUsIGJzcFRyZWVEZWJ1Z0xpbmVzKGJzcFRyZWUuaW4sIHgsIHksIGwpKTtcbiAgICBsaW5lcyA9IGxpbmVzLmNvbmNhdChic3BEZWJ1Z0xpbmVzQ2xpcE91dChic3BUcmVlLCBic3BUcmVlRGVidWdMaW5lcyhic3BUcmVlLm91dCwgeCwgeSwgbCkpKTtcbiAgfVxuICBsaW5lcy5wdXNoKGxpbmUpO1xuICByZXR1cm4gbGluZXM7XG59XG5cbmV4cG9ydCB7XG4gIGJzcEludGVyc2VjdCxcbiAgYnNwU2lkZVN0YWJsZSxcbiAgYnNwVHJhbnNmb3JtLFxuICBic3BUcmVlQ29sbGlkZSxcbiAgYnNwVHJlZURlYnVnTGluZXMsXG4gIGJzcFRyZWVQb2ludFNpZGUsXG4gIGJzcFRyZWVUcmFuc2Zvcm1DbG9uZSxcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYnNwLmpzIiwiLy8gY2FtZXJhLmpzXG4vL1xuLy8gQ29weXJpZ2h0IENoYXJsZXMgRGljayAyMDE1XG5cbmltcG9ydCB7XG4gIHRyYW5zZm9ybUNvbXBvc2UsXG4gIHRyYW5zZm9ybUNyZWF0ZSxcbiAgdHJhbnNmb3JtSW52ZXJ0LFxuICB0cmFuc2Zvcm1Qb2ludCxcbiAgdHJhbnNmb3JtU2NhbGUsXG4gIHRyYW5zZm9ybVN0cmV0Y2gsXG4gIHRyYW5zZm9ybVN0cmV0Y2hDcmVhdGUsXG4gIHRyYW5zZm9ybVRyYW5zbGF0ZSxcbn0gZnJvbSAnLi90cmFuc2Zvcm0uanMnXG5cbmZ1bmN0aW9uIGNhbUNyZWF0ZShjYW52YXMsIGRyYXdDYWxsYmFjaykge1xuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgdmFyIHQgPSB0cmFuc2Zvcm1TdHJldGNoQ3JlYXRlKDEuMCwgLTEuMCk7ICAvLyBmbGlwIHkgYXhpc1xuICB0ID0gdHJhbnNmb3JtVHJhbnNsYXRlKHQsIGNhbnZhcy53aWR0aCAqIDAuNSwgY2FudmFzLmhlaWdodCAqIDAuNSk7XG5cbiAgY3R4LnNldFRyYW5zZm9ybSh0Lml4LCB0Lml5LCB0Lmp4LCB0Lmp5LCB0LmR4LCB0LmR5KTtcblxuICB2YXIgY2FtID0ge1xuICAgIGNhbnZhczogY2FudmFzLFxuICAgIGN0eDogY3R4LFxuICAgIHdvcmxkVG9DYW1lcmE6IHQsXG4gICAgbW9kZWxUb1dvcmxkOiBbdHJhbnNmb3JtQ3JlYXRlKCldLFxuICAgIGNhbWVyYVRvTW9kZWw6IHRyYW5zZm9ybUludmVydCh0KSxcbiAgICBtb3VzZU1vZGVsOiB7IHg6IDAuMCwgeTogMC4wIH0sXG4gICAgbW91c2VDYW1lcmE6IHsgeDogMC4wLCB5OiAwLjAgfVxuICB9O1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgZnVuY3Rpb24gY2FtZXJhT25Nb3VzZVdoZWVsKGV2dCkge1xuICAgIGlmIChldnQuc2hpZnRLZXkpIHtcbiAgICAgIHZhciBzY2FsZSA9IE1hdGgubG9nKCgtZXZ0LmRlbHRhWSAvIDUwMC4wKSArIE1hdGguRSk7XG4gICAgICB2YXIgd29ybGRUb0NhbWVyYSA9IGNhbS53b3JsZFRvQ2FtZXJhO1xuXG4gICAgICAvLyBjZW50cmUgY2FtZXJhIG9uIG1vdXNlIHBvc2l0aW9uXG4gICAgICB3b3JsZFRvQ2FtZXJhID0gdHJhbnNmb3JtVHJhbnNsYXRlKHdvcmxkVG9DYW1lcmEsIC1ldnQub2Zmc2V0WCwgLWV2dC5vZmZzZXRZKTtcbiAgICAgIHdvcmxkVG9DYW1lcmEgPSB0cmFuc2Zvcm1TY2FsZSh3b3JsZFRvQ2FtZXJhLCBzY2FsZSk7XG4gICAgICB3b3JsZFRvQ2FtZXJhID0gdHJhbnNmb3JtVHJhbnNsYXRlKHdvcmxkVG9DYW1lcmEsIGV2dC5vZmZzZXRYLCBldnQub2Zmc2V0WSk7XG5cbiAgICAgIGNhbS53b3JsZFRvQ2FtZXJhID0gd29ybGRUb0NhbWVyYTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGRlbHRhID0geyB4OiAtZXZ0LmRlbHRhWCwgeTogLWV2dC5kZWx0YVkgfTtcbiAgICAgIGNhbS53b3JsZFRvQ2FtZXJhID0gdHJhbnNmb3JtVHJhbnNsYXRlKGNhbS53b3JsZFRvQ2FtZXJhLCBkZWx0YS54LCBkZWx0YS55KTtcbiAgICB9XG5cbiAgICBjYW1SZWNvbXBvc2UoY2FtKTtcbiAgICBkcmF3Q2FsbGJhY2soKTtcblxuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9KTtcblxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24gY2FtZXJhT25Nb3VzZU1vdmUoZXZ0KSB7XG4gICAgY2FtLm1vdXNlQ2FtZXJhLnggPSBldnQub2Zmc2V0WDtcbiAgICBjYW0ubW91c2VDYW1lcmEueSA9IGV2dC5vZmZzZXRZO1xuICAgIGNhbS5tb3VzZU1vZGVsLnggPSBldnQub2Zmc2V0WDtcbiAgICBjYW0ubW91c2VNb2RlbC55ID0gZXZ0Lm9mZnNldFk7XG4gICAgdHJhbnNmb3JtUG9pbnQoY2FtLmNhbWVyYVRvTW9kZWwsIGNhbS5tb3VzZU1vZGVsKTtcblxuICAgIGRyYXdDYWxsYmFjaygpO1xuICB9KTtcblxuXG4gIHJldHVybiBjYW07XG59XG5cbmZ1bmN0aW9uIGNhbVJlY29tcG9zZShjYW0pIHtcbiAgdmFyIG1vZGVsVG9Xb3JsZCA9IGNhbS5tb2RlbFRvV29ybGRbY2FtLm1vZGVsVG9Xb3JsZC5sZW5ndGggLSAxXTtcbiAgdmFyIHdvcmxkVG9DYW1lcmEgPSBjYW0ud29ybGRUb0NhbWVyYTtcbiAgdmFyIG1vZGVsVG9DYW1lcmEgPSB0cmFuc2Zvcm1Db21wb3NlKG1vZGVsVG9Xb3JsZCwgd29ybGRUb0NhbWVyYSk7XG4gIGNhbS5jYW1lcmFUb01vZGVsID0gdHJhbnNmb3JtSW52ZXJ0KG1vZGVsVG9DYW1lcmEpO1xuICBjYW0uY3R4LnNldFRyYW5zZm9ybShcbiAgICBtb2RlbFRvQ2FtZXJhLml4LCBtb2RlbFRvQ2FtZXJhLml5LFxuICAgIG1vZGVsVG9DYW1lcmEuangsIG1vZGVsVG9DYW1lcmEuanksXG4gICAgbW9kZWxUb0NhbWVyYS5keCwgbW9kZWxUb0NhbWVyYS5keSk7XG5cbiAgY2FtLm1vdXNlTW9kZWwueCA9IGNhbS5tb3VzZUNhbWVyYS54O1xuICBjYW0ubW91c2VNb2RlbC55ID0gY2FtLm1vdXNlQ2FtZXJhLnk7XG4gIHRyYW5zZm9ybVBvaW50KGNhbS5jYW1lcmFUb01vZGVsLCBjYW0ubW91c2VNb2RlbCk7XG59XG5cbmZ1bmN0aW9uIGNhbVBvc2l0aW9uKGNhbSwgZCwgc2NhbGUpIHtcbiAgdmFyIGNhbnZhcyA9IGNhbS5jYW52YXM7XG4gIHZhciB0ID0gdHJhbnNmb3JtQ3JlYXRlKCk7XG4gIHQgPSB0cmFuc2Zvcm1TdHJldGNoKHQsIDEuMCwgLTEuMCk7ICAvLyBmbGlwIHkgYXhpc1xuICB0ID0gdHJhbnNmb3JtVHJhbnNsYXRlKHQsIGNhbnZhcy53aWR0aCAqIDAuNSwgY2FudmFzLmhlaWdodCAqIDAuNSk7XG4gIHQgPSB0cmFuc2Zvcm1UcmFuc2xhdGUodCwgLWQueCwgZC55KTtcbiAgY2FtLndvcmxkVG9DYW1lcmEgPSB0O1xuICBjYW1SZWNvbXBvc2UoY2FtKTtcbn1cblxuZnVuY3Rpb24gY2FtUHVzaFRyYW5zZm9ybShjYW0sIHRyYW5zZm9ybSkge1xuICB2YXIgb2xkTW9kZWxUb1dvcmxkID0gY2FtLm1vZGVsVG9Xb3JsZFtjYW0ubW9kZWxUb1dvcmxkLmxlbmd0aCAtIDFdO1xuICB2YXIgbmV3TW9kZWxUb1dvcmxkID0gdHJhbnNmb3JtQ29tcG9zZSh0cmFuc2Zvcm0sIG9sZE1vZGVsVG9Xb3JsZCk7XG5cbiAgY2FtLm1vZGVsVG9Xb3JsZFtjYW0ubW9kZWxUb1dvcmxkLmxlbmd0aF0gPSBuZXdNb2RlbFRvV29ybGQ7XG4gIGNhbVJlY29tcG9zZShjYW0pO1xufVxuXG5mdW5jdGlvbiBjYW1Qb3BUcmFuc2Zvcm0oY2FtKSB7XG4gIGlmIChjYW0ubW9kZWxUb1dvcmxkLmxlbmd0aCA9PSAxKSB7XG4gICAgdGhyb3cgXCJDYW4ndCBwb3AgZW1wdHkgdHJhbnNmb3JtIHN0YWNrXCI7XG4gIH1cblxuICBjYW0ubW9kZWxUb1dvcmxkLnBvcCgpO1xuICBjYW1SZWNvbXBvc2UoY2FtKTtcbn1cblxuZnVuY3Rpb24gY2FtQ2FtZXJhVG9Nb2RlbChjYW0sIHApIHtcbiAgdHJhbnNmb3JtUG9pbnQoY2FtLmNhbWVyYVRvTW9kZWwsIHApO1xufVxuXG5mdW5jdGlvbiBjYW1DbGVhcihjYW0pIHtcbiAgY2FtLmN0eC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XG4gIGNhbS5jdHguY2xlYXJSZWN0KDAsIDAsIGNhbS5jYW52YXMud2lkdGgsIGNhbS5jYW52YXMuaGVpZ2h0KTtcblxuICB2YXIgdCA9IHRyYW5zZm9ybUNvbXBvc2UoY2FtLm1vZGVsVG9Xb3JsZFtjYW0ubW9kZWxUb1dvcmxkLmxlbmd0aCAtIDFdLCBjYW0ud29ybGRUb0NhbWVyYSk7XG4gIGNhbS5jdHguc2V0VHJhbnNmb3JtKHQuaXgsIHQuaXksIHQuangsIHQuanksIHQuZHgsIHQuZHkpO1xufVxuXG5leHBvcnQge1xuICBjYW1DcmVhdGUsXG4gIGNhbUNhbWVyYVRvTW9kZWwsXG4gIGNhbUNsZWFyLFxuICBjYW1Qb3BUcmFuc2Zvcm0sXG4gIGNhbVBvc2l0aW9uLFxuICBjYW1QdXNoVHJhbnNmb3JtLFxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jYW1lcmEuanMiLCIvLyB0cmFuc2Zvcm0uanNcbi8vXG4vLyBDb3B5cmlnaHQgQ2hhcmxlcyBEaWNrIDIwMTVcblxuLy8gVE9ETzogdW5pdCB0ZXN0cywgaXQgd2lsbCBzdWNrIGlmIHRoZXJlIGlzIGEgdHlwbyBpbiBoZXJlLCBzbyBmaW5kIGl0IGZpcnN0IVxuXG4vLyBUT0RPOiBwdXQgdmVydGV4IGZ1bmN0aW9ucyBzb21ld2hlcmUgZWxzZSBvciByZW5hbWUgdGhpcyBtb2R1bGVcblxuZnVuY3Rpb24gdHJhbnNmb3JtQ3JlYXRlKCkge1xuICByZXR1cm4ge1xuICAgIGl4OiAxLjAsIGp4OiAwLjAsIGR4OiAwLjAsXG4gICAgaXk6IDAuMCwgank6IDEuMCwgZHk6IDAuMH07XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVRyYW5zbGF0ZUNyZWF0ZSh4LCB5KSB7XG4gIHJldHVybiB7XG4gICAgaXg6IDEuMCwgang6IDAuMCwgZHg6IHgsXG4gICAgaXk6IDAuMCwgank6IDEuMCwgZHk6IHl9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1TY2FsZUNyZWF0ZShzKSB7XG4gIHJldHVybiB7XG4gICAgaXg6IHMsIGp4OiAwLjAsIGR4OiAwLjAsXG4gICAgaXk6IDAuMCwgank6IHMsIGR5OiAwLjB9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1TdHJldGNoQ3JlYXRlKHN4LCBzeSkge1xuICByZXR1cm4ge1xuICAgIGl4OiBzeCwgang6IDAuMCwgZHg6IDAuMCxcbiAgICBpeTogMC4wLCBqeTogc3ksIGR5OiAwLjB9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Sb3RhdGVDcmVhdGUoYW5nbGUpIHtcbiAgdmFyIGMgPSBNYXRoLmNvcyhhbmdsZSk7XG4gIHZhciBzID0gTWF0aC5zaW4oYW5nbGUpO1xuICByZXR1cm4ge1xuICAgIGl4OiBjLCBqeDogLXMsIGR4OiAwLjAsXG4gICAgaXk6IHMsIGp5OiBjLCBkeTogMC4wfTtcbn1cblxuLy8gY29tYmluZSB0d28gdHJhbnNmb3Jtcywgc28gdDEgaXMgYXBwbGllZCwgdGhlbiB0MlxuZnVuY3Rpb24gdHJhbnNmb3JtQ29tcG9zZSh0MSwgdDIpIHtcbiAgcmV0dXJuIHtcbiAgICBpeDogdDIuaXggKiB0MS5peCArIHQyLmp4ICogdDEuaXksIGp4OiB0Mi5peCAqIHQxLmp4ICsgdDIuanggKiB0MS5qeSwgZHg6IHQyLml4ICogdDEuZHggKyB0Mi5qeCAqIHQxLmR5ICsgdDIuZHgsXG4gICAgaXk6IHQyLml5ICogdDEuaXggKyB0Mi5qeSAqIHQxLml5LCBqeTogdDIuaXkgKiB0MS5qeCArIHQyLmp5ICogdDEuanksIGR5OiB0Mi5peSAqIHQxLmR4ICsgdDIuankgKiB0MS5keSArIHQyLmR5fTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtVHJhbnNsYXRlKHQsIHgsIHkpIHtcbiAgcmV0dXJuIHtcbiAgICBpeDogdC5peCwgang6IHQuangsIGR4OiB0LmR4ICsgeCxcbiAgICBpeTogdC5peSwgank6IHQuanksIGR5OiB0LmR5ICsgeX07XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVNjYWxlKHQsIHMpIHtcbiAgcmV0dXJuIHtcbiAgICBpeDogcyAqIHQuaXgsIGp4OiBzICogdC5qeCwgZHg6IHMgKiB0LmR4LFxuICAgIGl5OiBzICogdC5peSwgank6IHMgKiB0Lmp5LCBkeTogcyAqIHQuZHl9O1xuXG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVJvdGF0ZSh0LCBhbmdsZSkge1xuICB2YXIgYyA9IE1hdGguY29zKGFuZ2xlKTtcbiAgdmFyIHMgPSBNYXRoLnNpbihhbmdsZSk7XG4gIHJldHVybiB7XG4gICAgaXg6IGMgKiB0Lml4IC0gcyAqIHQuaXksIGp4OiBjICogdC5qeCAtIHMgKiB0Lmp5LCBkeDogYyAqIHQuZHggLSBzICogdC5keSxcbiAgICBpeTogcyAqIHQuaXggKyBjICogdC5peSwgank6IGMgKiB0Lmp4ICsgcyAqIHQuanksIGR5OiBzICogdC5keCArIGMgKiB0LmR5fTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtU3RyZXRjaCh0LCBzeCwgc3kpIHtcbiAgcmV0dXJuIHtcbiAgICBpeDogc3ggKiB0Lml4LCBqeDogc3ggKiB0Lmp4LCBkeDogc3ggKiB0LmR4LFxuICAgIGl5OiBzeSAqIHQuaXksIGp5OiBzeSAqIHQuanksIGR5OiBzeSAqIHQuZHl9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1JbnZlcnQodCkge1xuICB2YXIgZGV0ID0gdC5peCAqIHQuankgLSB0Lmp4ICogdC5peTtcbiAgdmFyIGR4ID0gdC5qeCAqIHQuZHkgLSB0Lmp5ICogdC5keDtcbiAgdmFyIGR5ID0gdC5peSAqIHQuZHggLSB0Lml4ICogdC5keTtcbiAgcmV0dXJuIHtcbiAgICBpeDogIHQuankgLyBkZXQsIGp4OiAtdC5qeCAvIGRldCwgZHg6IGR4IC8gZGV0LFxuICAgIGl5OiAtdC5peSAvIGRldCwgank6ICB0Lml4IC8gZGV0LCBkeTogZHkgLyBkZXR9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Qb2ludCh0LCBwKSB7XG4gIHZhciB4ID0gcC54ICogdC5peCArIHAueSAqIHQuanggKyB0LmR4O1xuICB2YXIgeSA9IHAueCAqIHQuaXkgKyBwLnkgKiB0Lmp5ICsgdC5keTtcblxuICBwLnggPSB4O1xuICBwLnkgPSB5O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Ob3JtYWwodCwgbikge1xuICB2YXIgeCA9IG4ueCAqIHQuaXggKyBuLnkgKiB0Lmp4O1xuICB2YXIgeSA9IG4ueCAqIHQuaXkgKyBuLnkgKiB0Lmp5O1xuXG4gIG4ueCA9IHg7XG4gIG4ueSA9IHk7XG59XG5cbmV4cG9ydCB7XG4gIHRyYW5zZm9ybUNvbXBvc2UsXG4gIHRyYW5zZm9ybUNyZWF0ZSxcbiAgdHJhbnNmb3JtSW52ZXJ0LFxuICB0cmFuc2Zvcm1Ob3JtYWwsXG4gIHRyYW5zZm9ybVBvaW50LFxuICB0cmFuc2Zvcm1TY2FsZSxcbiAgdHJhbnNmb3JtU2NhbGVDcmVhdGUsXG4gIHRyYW5zZm9ybVN0cmV0Y2gsXG4gIHRyYW5zZm9ybVN0cmV0Y2hDcmVhdGUsXG4gIHRyYW5zZm9ybVRyYW5zbGF0ZSxcbiAgdHJhbnNmb3JtVHJhbnNsYXRlQ3JlYXRlLFxuICB0cmFuc2Zvcm1Sb3RhdGUsXG4gIHRyYW5zZm9ybVJvdGF0ZUNyZWF0ZSxcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdHJhbnNmb3JtLmpzIiwiLy8gbWVzaC5qc1xuLy9cbi8vIENvcHlyaWdodCBDaGFybGVzIERpY2sgMjAxNVxuXG4vLyBUT0RPOiBydWxlcyBvZiBtZXNoIG5vZGUgbGlmZXRpbWVzLCBzbyB3ZSBrbm93IHdoZW4gaXQncyBzYWZlIHRvIGtlZXAgYSByZWZlcmVuY2VcblxuLy8gZGVwZW5kcyBvbiB0cmFuc2Zvcm0uanNcbi8vIGRlcGVuZHMgb24gYnNwLmpzXG5cbmltcG9ydCB7XG4gIGJzcEludGVyc2VjdCxcbiAgYnNwU2lkZVN0YWJsZSxcbn0gZnJvbSAnLi9ic3AuanMnXG5cbmZ1bmN0aW9uIG1lc2hFZGdlVmVyaWZ5KGVkZ2UpIHtcbiAgdmFyIHByZXYgPSBlZGdlLnByZXY7XG4gIHZhciBuZXh0ID0gZWRnZS5uZXh0O1xuXG4gIGlmIChwcmV2Lm5leHQgIT0gZWRnZSB8fCBuZXh0LnByZXYgIT0gZWRnZSkge1xuICAgIHRocm93IFwibmV4dCBvciBwcmV2IHJlZnMgYnJva2VuXCI7XG4gIH1cblxuICBpZiAoZWRnZS5saW5rICE9IG51bGwpIHtcbiAgICBpZiAoZWRnZS5saW5rLmxpbmsgIT0gZWRnZSkge1xuICAgICAgdGhyb3cgXCJsaW5rIHJlZiBicm9rZW5cIjtcbiAgICB9XG4gIH1cblxuICB2YXIgcHggPSBlZGdlLnggLSBwcmV2Lng7XG4gIHZhciBweSA9IGVkZ2UueSAtIHByZXYueTtcbiAgdmFyIG54ID0gbmV4dC54IC0gZWRnZS54O1xuICB2YXIgbnkgPSBuZXh0LnkgLSBlZGdlLnk7XG5cbiAgaWYgKHB4ICogbnkgLSBweSAqIG54IDwgLTAuMDEpIHtcbiAgICB0aHJvdyBcInZlcnRleCBpcyBub3QgY29udmV4XCI7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWVzaFBvbHlTZXRGbGFnKHBvbHksIGZsYWcpIHtcbiAgdmFyIGkgPSBwb2x5O1xuXG4gIGRvIHtcbiAgICBpLmZsYWcgPSBmbGFnO1xuICAgIGkgPSBpLm5leHQ7XG4gIH0gd2hpbGUgKGkgIT0gcG9seSk7XG59XG5cbmZ1bmN0aW9uIG1lc2hTZXRGbGFnKG1lc2gsIGZsYWcpIHtcbiAgdmFyIGkgPSBtZXNoO1xuXG4gIHdoaWxlIChpLmZsYWcgIT0gZmxhZykge1xuICAgIGkuZmxhZyA9IGZsYWc7XG5cbiAgICBpZiAoaS5saW5rICE9IG51bGwpIHtcbiAgICAgIG1lc2hTZXRGbGFnKGkubGluaywgZmxhZyk7XG4gICAgfVxuXG4gICAgaSA9IGkubmV4dDtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZXNoUG9seVZlcmlmeShwb2x5KSB7XG4gIHZhciBpID0gcG9seTtcblxuICBkbyB7XG4gICAgbWVzaEVkZ2VWZXJpZnkoaSk7XG4gICAgaSA9IGkubmV4dDtcbiAgfSB3aGlsZSAoaSAhPSBwb2x5KTtcbn1cblxuZnVuY3Rpb24gbWVzaEVkZ2VJblBvbHlWZXJpZnkocG9seSwgZWRnZSkge1xuICB2YXIgaSA9IGVkZ2U7XG5cbiAgZG8ge1xuICAgIGlmIChpID09IHBvbHkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaSA9IGkubmV4dDtcbiAgfSB3aGlsZSAoaSAhPSBlZGdlKTtcbiAgdGhyb3cgXCJlZGdlIG5vdCBpbiBwb2x5XCI7XG59XG5cbmZ1bmN0aW9uIG1lc2hDcmVhdGUodmVydHMpIHtcbiAgaWYgKHZlcnRzLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgaGVhZCA9IHtcbiAgICB4OiB2ZXJ0c1swXS54LFxuICAgIHk6IHZlcnRzWzBdLnksXG4gICAgZmxhZzogMCxcbiAgICBwcmV2OiBudWxsLFxuICAgIG5leHQ6IG51bGwsXG4gICAgbGluazogbnVsbFxuICB9O1xuXG4gIHZhciB0YWlsID0gaGVhZDtcblxuICBmb3IgKHZhciBpID0gMTsgaSA8IHZlcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFpbC5uZXh0ID0ge1xuICAgICAgeDogdmVydHNbaV0ueCxcbiAgICAgIHk6IHZlcnRzW2ldLnksXG4gICAgICBmbGFnOiAwLFxuICAgICAgcHJldjogdGFpbCxcbiAgICAgIG5leHQ6IG51bGwsXG4gICAgICBsaW5rOiBudWxsXG4gICAgfTtcbiAgICB0YWlsID0gdGFpbC5uZXh0O1xuICB9XG5cbiAgdGFpbC5uZXh0ID0gaGVhZDtcbiAgaGVhZC5wcmV2ID0gdGFpbDtcblxuICBtZXNoUG9seVZlcmlmeShoZWFkKTtcblxuICByZXR1cm4gaGVhZDtcbn1cblxuZnVuY3Rpb24gbWVzaEVkZ2VTcGxpdChlZGdlLCBic3ApIHtcbiAgdmFyIG5leHQgPSBlZGdlLm5leHQ7XG5cbiAgaWYgKGJzcFNpZGVTdGFibGUoYnNwLCBlZGdlLngsIGVkZ2UueSkgKiBic3BTaWRlU3RhYmxlKGJzcCwgbmV4dC54LCBuZXh0LnkpID49IDAuMCkge1xuICAgIHRocm93IFwiZWRnZSBub3QgY3Jvc3NpbmcgYnNwXCI7XG4gIH1cblxuICB2YXIgdCA9IGJzcEludGVyc2VjdChic3AsIGVkZ2UueCwgZWRnZS55LCBuZXh0LngsIG5leHQueSk7XG5cbiAgdmFyIGxpbmsgPSBlZGdlLmxpbms7XG4gIHZhciBuZXdFZGdlID0ge1xuICAgIHg6IHQgKiBlZGdlLnggKyAoMS4wIC0gdCkgKiBuZXh0LngsXG4gICAgeTogdCAqIGVkZ2UueSArICgxLjAgLSB0KSAqIG5leHQueSxcbiAgICBmbGFnOiBlZGdlLmZsYWcsXG4gICAgcHJldjogZWRnZSxcbiAgICBuZXh0OiBlZGdlLm5leHQsXG4gICAgbGluazogbGlua1xuICB9O1xuXG4gIG5ld0VkZ2UubmV4dC5wcmV2ID0gbmV3RWRnZTtcbiAgZWRnZS5uZXh0ID0gbmV3RWRnZTtcblxuICBpZiAobGluayAhPSBudWxsKSB7XG4gICAgdmFyIG5ld0xpbmsgPSB7XG4gICAgICB4OiBuZXdFZGdlLngsXG4gICAgICB5OiBuZXdFZGdlLnksXG4gICAgICBmbGFnOiBlZGdlLmZsYWcsXG4gICAgICBwcmV2OiBsaW5rLFxuICAgICAgbmV4dDogbGluay5uZXh0LFxuICAgICAgbGluazogZWRnZVxuICAgIH07XG5cbiAgICBuZXdMaW5rLm5leHQucHJldiA9IG5ld0xpbms7XG4gICAgbGluay5uZXh0ID0gbmV3TGluaztcblxuICAgIGVkZ2UubGluayA9IG5ld0xpbms7XG4gICAgbGluay5saW5rID0gbmV3RWRnZTtcbiAgfVxuXG4gIG1lc2hQb2x5VmVyaWZ5KGVkZ2UpO1xuXG4gIHJldHVybiBuZXdFZGdlO1xufVxuXG5mdW5jdGlvbiBtZXNoRWRnZUNhbk1lcmdlKGVkZ2UpIHtcbiAgdmFyIGxpbmsgPSBlZGdlLmxpbms7XG5cbiAgaWYgKGxpbmsgPT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdmFyIG5leHQgPSBlZGdlLm5leHQ7XG5cbiAgaWYgKGxpbmsueCAhPSBuZXh0LnggfHwgbGluay55ICE9IG5leHQueSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBsaW5rTmV4dCA9IGxpbmsubmV4dDtcblxuICBpZiAoZWRnZS54ICE9IGxpbmtOZXh0LnggfHwgZWRnZS55ICE9IGxpbmtOZXh0LnkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJldiA9IGVkZ2UucHJldjtcbiAgdmFyIGxpbmtOZXh0TmV4dCA9IGxpbmtOZXh0Lm5leHQ7XG5cbiAgaWYgKHByZXYueCAhPSBsaW5rTmV4dE5leHQueCB8fCBwcmV2LnkgIT0gbGlua05leHROZXh0LnkgfHxcbiAgICAgIHByZXYubGluayAhPSBsaW5rTmV4dCB8fCBsaW5rTmV4dC5saW5rICE9IHByZXYpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gbWVzaEVkZ2VNZXJnZShlZGdlKSB7XG4gIHZhciBsaW5rID0gZWRnZS5saW5rO1xuXG4gIGlmICghbWVzaEVkZ2VDYW5NZXJnZShlZGdlKSkge1xuICAgIHRocm93IFwiQ2FuJ3QgbWVyZ2UgZWRnZVwiO1xuICB9XG5cbiAgaWYgKGxpbmsgIT0gbnVsbCkge1xuICAgIHZhciByZW1MaW5rID0gbGluay5uZXh0O1xuXG4gICAgcmVtTGluay5uZXh0LnByZXYgPSByZW1MaW5rLnByZXY7XG4gICAgcmVtTGluay5wcmV2Lm5leHQgPSByZW1MaW5rLm5leHQ7XG5cbiAgICBlZGdlLnByZXYubGluayA9IGxpbms7XG4gICAgbGluay5saW5rID0gZWRnZS5wcmV2O1xuXG4gICAgcmVtTGluay5uZXh0ID0gbnVsbDtcbiAgICByZW1MaW5rLnByZXYgPSBudWxsO1xuICAgIHJlbUxpbmsubGluayA9IG51bGw7XG4gIH1cblxuICBlZGdlLm5leHQucHJldiA9IGVkZ2UucHJldjtcbiAgZWRnZS5wcmV2Lm5leHQgPSBlZGdlLm5leHQ7XG5cbiAgZWRnZS5uZXh0ID0gbnVsbDtcbiAgZWRnZS5wcmV2ID0gbnVsbDtcbiAgZWRnZS5saW5rID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gbWVzaFBvbHlTcGxpdChhLCBiKSB7XG4gIG1lc2hFZGdlSW5Qb2x5VmVyaWZ5KGEsIGIpO1xuXG4gIHZhciBuZXdBID0ge1xuICAgIHg6IGEueCxcbiAgICB5OiBhLnksXG4gICAgZmxhZzogYS5mbGFnLFxuICAgIHByZXY6IGIsXG4gICAgbmV4dDogYS5uZXh0LFxuICAgIGxpbms6IGEubGlua1xuICB9O1xuXG4gIHZhciBuZXdCID0ge1xuICAgIHg6IGIueCxcbiAgICB5OiBiLnksXG4gICAgZmxhZzogYi5mbGFnLFxuICAgIHByZXY6IGEsXG4gICAgbmV4dDogYi5uZXh0LFxuICAgIGxpbms6IGIubGlua1xuICB9O1xuXG4gIG5ld0EubmV4dC5wcmV2ID0gbmV3QTtcbiAgaWYgKG5ld0EubGluayAhPSBudWxsKSB7XG4gICAgbmV3QS5saW5rLmxpbmsgPSBuZXdBO1xuICB9XG5cbiAgbmV3Qi5uZXh0LnByZXYgPSBuZXdCO1xuICBpZiAobmV3Qi5saW5rICE9IG51bGwpIHtcbiAgICBuZXdCLmxpbmsubGluayA9IG5ld0I7XG4gIH1cblxuICBhLm5leHQgPSBuZXdCO1xuICBiLm5leHQgPSBuZXdBO1xuICBhLmxpbmsgPSBiO1xuICBiLmxpbmsgPSBhO1xuXG4gIG1lc2hQb2x5VmVyaWZ5KGEpO1xuICBtZXNoUG9seVZlcmlmeShiKTtcbn1cblxuZnVuY3Rpb24gbWVzaFBvbHlNZXJnZShhLCBiKSB7XG4gIHZhciBhTmV4dCA9IGEubmV4dDtcbiAgdmFyIGJOZXh0ID0gYi5uZXh0O1xuXG4gIGlmIChhLmxpbmsgIT0gYiB8fCBiLmxpbmsgIT0gYSB8fFxuICAgICAgYS54ICE9IGJOZXh0LnggfHwgYS55ICE9IGJOZXh0LnkgfHxcbiAgICAgIGIueCAhPSBhTmV4dC54IHx8IGIueSAhPSBhTmV4dC55KSB7XG4gICAgdGhyb3cgXCJDYW5ub3QgbWVyZ2UgbWVzaFwiXG4gIH1cblxuICBhLm5leHQgPSBiTmV4dC5uZXh0O1xuICBhLm5leHQucHJldiA9IGE7XG4gIGEubGluayA9IGJOZXh0Lmxpbms7XG4gIGlmIChhLmxpbmsgIT0gbnVsbCkge1xuICAgIGEubGluay5saW5rID0gYTtcbiAgfVxuXG4gIGIubmV4dCA9IGFOZXh0Lm5leHQ7XG4gIGIubmV4dC5wcmV2ID0gYjtcbiAgYi5saW5rID0gYU5leHQubGluaztcbiAgaWYgKGIubGluayAhPSBudWxsKSB7XG4gICAgYi5saW5rLmxpbmsgPSBiO1xuICB9XG5cbiAgYU5leHQubmV4dCA9IG51bGw7XG4gIGFOZXh0LnByZXYgPSBudWxsO1xuICBhTmV4dC5saW5rID0gbnVsbDtcbiAgYk5leHQubmV4dCA9IG51bGw7XG4gIGJOZXh0LnByZXYgPSBudWxsO1xuICBiTmV4dC5saW5rID0gbnVsbDtcblxuICBtZXNoRWRnZUluUG9seVZlcmlmeShhLCBiKTtcbiAgbWVzaFBvbHlWZXJpZnkoYSk7XG59XG5cbmZ1bmN0aW9uIG1lc2hQb2x5UmVtb3ZlKHBvbHkpIHtcbiAgdmFyIGkgPSBwb2x5O1xuXG4gIGRvIHtcbiAgICBpZiAoaS5saW5rICE9IG51bGwpIHtcbiAgICAgIGkubGluay5saW5rID0gbnVsbDtcbiAgICAgIGkubGluayA9IG51bGw7XG4gICAgfVxuXG4gICAgaSA9IGkubmV4dDtcbiAgfSB3aGlsZSAoaSAhPSBwb2x5KTtcbn1cblxuZnVuY3Rpb24gbWVzaFBvbHlDZW50cm9pZEFyZWEocG9seSkge1xuICB2YXIgYSA9IDAuMDtcbiAgdmFyIGN4ID0gMC4wO1xuICB2YXIgY3kgPSAwLjA7XG5cbiAgdmFyIGkgPSBwb2x5O1xuXG4gIHZhciBwcmV2WCA9IGkucHJldi54O1xuICB2YXIgcHJldlkgPSBpLnByZXYueTtcblxuICBkbyB7XG4gICAgLy8gYWNjdW11bGF0ZSBhcmVhXG4gICAgYSArPSBwcmV2WCAqIGkueSAtIGkueCAqIHByZXZZO1xuXG4gICAgLy8gYWNjdW11bGF0ZSBjZW50cm9pZFxuICAgIGN4ICs9IChwcmV2WCArIGkueCkgKiAocHJldlggKiBpLnkgLSBpLnggKiBwcmV2WSk7XG4gICAgY3kgKz0gKHByZXZZICsgaS55KSAqIChwcmV2WCAqIGkueSAtIGkueCAqIHByZXZZKTtcblxuICAgIHByZXZYID0gaS54O1xuICAgIHByZXZZID0gaS55O1xuICAgIGkgPSBpLm5leHQ7XG4gIH0gd2hpbGUgKGkgIT0gcG9seSk7XG5cbiAgcmV0dXJuIHsgeDogY3ggLyAoMy4wICogYSksIHk6IGN5IC8gKDMuMCAqIGEpLCBhcmVhOiBhICogMC41IH1cbn1cblxuLy8gc2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfbW9tZW50c19vZl9pbmVydGlhXG5mdW5jdGlvbiBtZXNoUG9seU1vbWVudE9mSW5lcnRpYShwb2x5KSB7XG4gIHZhciBpID0gcG9seTtcblxuICB2YXIgcHJldlggPSBpLnByZXYueDtcbiAgdmFyIHByZXZZID0gaS5wcmV2Lnk7XG5cbiAgdmFyIG51bSA9IDAuMDtcbiAgdmFyIGRlbiA9IDAuMDtcblxuICBkbyB7XG4gICAgdmFyIGNyb3NzID0gaS54ICogcHJldlkgLSBpLnkgKiBwcmV2WDtcblxuICAgIGRlbiArPSBjcm9zcztcbiAgICBudW0gKz0gY3Jvc3MgKiAoXG4gICAgICBpLnggKiBpLnggKyBpLnkgKiBpLnkgK1xuICAgICAgaS54ICogcHJldlggKyBpLnkgKiBwcmV2WSArXG4gICAgICBwcmV2WCAqIHByZXZYICsgcHJldlkgKiBwcmV2WSk7XG5cbiAgICBwcmV2WCA9IGkueDtcbiAgICBwcmV2WSA9IGkueTtcbiAgICBpID0gaS5uZXh0O1xuICB9IHdoaWxlIChpICE9IHBvbHkpO1xuXG4gIHJldHVybiBudW0gLyAoNi4wICogZGVuKTtcbn1cblxuZnVuY3Rpb24gbWVzaEVkZ2VQcmV2RXh0ZXJpb3IoZWRnZSkge1xuICBpZiAoZWRnZS5saW5rICE9IG51bGwpIHtcbiAgICB0aHJvdyBcImVkZ2Ugbm90IGV4dGVyaW9yXCI7XG4gIH1cblxuICB3aGlsZSAoZWRnZS5wcmV2LmxpbmsgIT0gbnVsbCkge1xuICAgIGVkZ2UgPSBlZGdlLnByZXYubGluaztcbiAgfVxuICByZXR1cm4gZWRnZS5wcmV2O1xufVxuXG5mdW5jdGlvbiBtZXNoRWRnZUlzRXh0ZXJpb3JDb252ZXgoZWRnZSkge1xuICBpZiAoZWRnZS5saW5rICE9IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJldiA9IG1lc2hFZGdlUHJldkV4dGVyaW9yKGVkZ2UpO1xuXG4gIHZhciBheCA9IGVkZ2UueCAtIHByZXYueDtcbiAgdmFyIGF5ID0gZWRnZS55IC0gcHJldi55O1xuICB2YXIgYnggPSBlZGdlLm5leHQueCAtIHByZXYueDtcbiAgdmFyIGJ5ID0gZWRnZS5uZXh0LnkgLSBwcmV2Lnk7XG5cbiAgcmV0dXJuIGF4ICogYnkgLSBheSAqIGJ4ID4gMC4wO1xufVxuXG5mdW5jdGlvbiBtZXNoUG9seVZlcnRpY2VzKHBvbHksIHZlcnRleEFycmF5KSB7XG4gIHZhciBpID0gcG9seTtcbiAgZG8ge1xuICAgIGlmIChtZXNoRWRnZUlzRXh0ZXJpb3JDb252ZXgoaSkpIHtcbiAgICAgIHZlcnRleEFycmF5W3ZlcnRleEFycmF5Lmxlbmd0aF0gPSB7IHg6IGkueCwgeTogaS55IH07XG4gICAgfVxuICAgIGkgPSBpLm5leHQ7XG4gIH0gd2hpbGUgKGkgIT0gcG9seSk7XG59XG5cbmZ1bmN0aW9uIG1lc2hQb2x5UmFkaXVzU3F1YXJlZChwb2x5KSB7XG4gIHZhciBpID0gcG9seTtcbiAgdmFyIHIgPSAwLjA7XG4gIGRvIHtcbiAgICByID0gTWF0aC5tYXgociwgaS54ICogaS54ICsgaS55ICogaS55KTtcbiAgfSB3aGlsZSAoaSAhPSBwb2x5KTtcblxuICByZXR1cm4gcjtcbn1cblxuZnVuY3Rpb24gbWVzaEVkZ2VUcmFuc2Zvcm0oZWRnZSwgdCkge1xuICB2YXIgeCA9IGVkZ2UueCAqIHQuaXggKyBlZGdlLnkgKiB0Lmp4ICsgdC5keDtcbiAgdmFyIHkgPSBlZGdlLnggKiB0Lml5ICsgZWRnZS55ICogdC5qeSArIHQuZHk7XG5cbiAgZWRnZS54ID0geDtcbiAgZWRnZS55ID0geTtcbn1cblxuZnVuY3Rpb24gbWVzaFBvbHlTdHJva2UoZWRnZSwgY3R4KSB7XG4gIHZhciBpID0gZWRnZTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8oaS54LCBpLnkpO1xuXG4gIGRvIHtcbiAgICBpID0gaS5uZXh0O1xuICAgIGN0eC5saW5lVG8oaS54LCBpLnkpO1xuICB9IHdoaWxlIChpICE9IGVkZ2UpO1xuXG4gIGN0eC5zdHJva2UoKTtcblxuICBkbyB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5hcmMoaS54LCBpLnksIDIsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBpID0gaS5uZXh0O1xuICB9IHdoaWxlIChpICE9IGVkZ2UpO1xufVxuXG5mdW5jdGlvbiBtZXNoUG9seUZpbGwoZWRnZSwgY3R4KSB7XG4gIHZhciBpID0gZWRnZTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8oaS54LCBpLnkpO1xuICBkbyB7XG4gICAgaSA9IGkubmV4dDtcbiAgICBjdHgubGluZVRvKGkueCwgaS55KTtcbiAgfSB3aGlsZSAoaSAhPSBlZGdlKTtcblxuICBjdHguZmlsbFN0eWxlID0gJ2xpZ2h0Ymx1ZSc7XG4gIGN0eC5maWxsKCk7XG59XG5cbmV4cG9ydCB7XG4gIG1lc2hDcmVhdGUsXG4gIG1lc2hFZGdlTWVyZ2UsXG4gIG1lc2hFZGdlU3BsaXQsXG4gIG1lc2hFZGdlVHJhbnNmb3JtLFxuICBtZXNoUG9seUNlbnRyb2lkQXJlYSxcbiAgbWVzaFBvbHlGaWxsLFxuICBtZXNoUG9seU1lcmdlLFxuICBtZXNoUG9seU1vbWVudE9mSW5lcnRpYSxcbiAgbWVzaFBvbHlSYWRpdXNTcXVhcmVkLFxuICBtZXNoUG9seVJlbW92ZSxcbiAgbWVzaFBvbHlTZXRGbGFnLFxuICBtZXNoUG9seVNwbGl0LFxuICBtZXNoUG9seVN0cm9rZSxcbiAgbWVzaFBvbHlWZXJ0aWNlcyxcbiAgbWVzaFNldEZsYWcsXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21lc2guanMiLCIvLyBwaHlzLmpzXG4vL1xuLy8gQ29weXJpZ2h0IENoYXJsZXMgRGljayAyMDE1XG4vL1xuLy8gdHJhY2tzIGEgcGh5c2ljYWwgc3lzdGVtIG9mIGJvZHkgYW5kIHBhcnRpY2xlIG9iamVjdHMgdGhhdCBjYW4gaW50ZXJhY3Rcbi8vXG5cbi8vIHJlcXVpcmVzIGJzcC5qcywgdHJhbnNmb3JtLmpzLCBjYW1lcmEuanNcblxuLy8gVE9ETzogc3VwcG9ydCBzbmFwc2hvdHM/XG4vLyBUT0RPOiBuZXcgQVBJXG4vLyBnbG9iYWwgZnVuY3Rpb25zXG4vLyAgLWFkZCBib2R5IC0gY2FsbGJhY2tzIGZvciB0aW1lc3RlcCwgY29sbGlkZSBwYXJ0aWNsZSwgY29sbGlkZSBib2R5LCBjbGlwIChjYXVzaW5nIG5ldyBJRCBvciBzcGxpdHRpbmcpXG4vLyAgLWNsaXAgYm9keVxuLy8gIC1hZGQgcGFydGljbGVzIC0gY2FsbGJhY2tzIGZvciB0aW1lc3RlcCwgY29sbGlkZSBib2R5XG4vLyBib2R5IGZ1bmN0aW9uc1xuLy8gIC1hcHBseSBpbXB1bHNlIGF0IGNlbnRyZS90b3JxdWUgaW1wdWxzZS9pbXB1bHNlIGF0IHBvaW50XG4vLyAgLXNldCBkaXNwbGFjZW1lbnQsIHZlbG9jaXR5PyAtLSBubywgbm90IHVubGVzcyB3ZSByZWFsbHkgbmVlZCB0aGVtXG4vLyBwYXJ0aWNsZSBmdW5jdGlvbnNcbi8vICAtYXBwbHkgaW1wdWxzZVxuLy8gIC1raWxsIHBhcnRpY2xlXG4vLyBub3RlIHRoYXQgYWxsIHRoZSBhYm92ZSBmdW5jdGlvbnMgbXVzdCBiZSBzYWZlIHRvIGNhbGwgZnJvbSBjYWxsYmFja3Ncbi8vIE5COiBjbGlwIGlzIHVuc2FmZSwgaXQgaW52YWxpZGF0ZXMgYW55IHNoYXBlIHRoYXQgaXMgY2xpcHBlZCwgd2hpY2ggbWlnaHQgYmUgcGFzc2VkIHRvIGEgY2FsbGJhY2tcbi8vICBUT0RPOiBmaWd1cmUgb3V0IHJ1bGVzIGZvciBjYWxsYmFja3Ncbi8vIGFsc28sIHNhdmluZyByZWZlcmVuY2VzIHRvIHBhcnRpY2xlcyBhbmQgYm9kaWVzIHBhc3NlZCB0byBjYWxsYmFja3MgaXMgZm9yYmlkZGVuXG5cbi8vIFRPRE86IGZhY3RvciBvdXQgZHJhd2luZyBjb2RlIHRvIHNvbWV0aGluZyBlbHNlLCB0aGlzIGNvZGUgc2hvdWxkIGp1c3QgcHJvdmlkZSBwb2x5Z29ucyBvciB3aGF0ZXZlciwgYW5kIG5vdCBjYXJlIGFib3V0IG1hdGVyaWFscyBldGMuXG4vLyBUT0RPOiBmcmljdGlvblxuLy8gSURFQTogb24gY29sbGlzaW9uLCBnaXZlIGJvZHkgYW5vdGhlciB0aW1lc3RlcCAob3Igbikgc28gdGhleSBkb24ndCBsb2NrIHVwPyBBbHNvLCBib2RpZXMgdGhhdCBjb2xsaWRlIG1vcmUgZ2V0IHB1c2hlZCB0byBlbmQgb2YgYXJyYXkgc29tZWhvdz9cbi8vIFRPRE86IGFjY2VsZXJhdGlvbiBzdHJ1Y3R1cmVzIGZvciBwaHlzaWNzIGFuZCBjbGlwcGluZzpcbi8vICAtYm91bmRpbmcgY2lyY2xlXG4vLyAgLWdyaWQvb2N0VHJlZS9ydHJlZT9cblxuaW1wb3J0IHtcbiAgYnNwSW50ZXJzZWN0LFxuICBic3BUcmVlQ29sbGlkZSxcbiAgYnNwVHJlZURlYnVnTGluZXMsXG4gIGJzcFRyZWVQb2ludFNpZGUsXG4gIGJzcFRyZWVUcmFuc2Zvcm1DbG9uZSxcbn0gZnJvbSAnLi9ic3AuanMnO1xuXG5pbXBvcnQge1xuICBjYW1Qb3BUcmFuc2Zvcm0sXG4gIGNhbVB1c2hUcmFuc2Zvcm0sXG59IGZyb20gJy4vY2FtZXJhLmpzJztcblxuaW1wb3J0IHtcbiAgc29saWRDZW50cm9pZEFyZWEsXG4gIHNvbGlkQ2xpcCxcbiAgc29saWRFeHRyYWN0UmVnaW9uLFxuICBzb2xpZEZpbGwsXG4gIHNvbGlkTWFya0Nvbm5lY3RlZFJlZ2lvbnMsXG4gIHNvbGlkTW9tZW50T2ZJbmVydGlhLFxuICBzb2xpZFJhZGl1c1NxdWFyZWQsXG4gIHNvbGlkVHJhbnNmb3JtLFxuICBzb2xpZFZlcnRpY2VzLFxufSBmcm9tICcuL3NvbGlkLmpzJztcblxuaW1wb3J0IHtcbiAgdHJhbnNmb3JtQ29tcG9zZSxcbiAgdHJhbnNmb3JtSW52ZXJ0LFxuICB0cmFuc2Zvcm1Ob3JtYWwsXG4gIHRyYW5zZm9ybVBvaW50LFxuICB0cmFuc2Zvcm1Sb3RhdGVDcmVhdGUsXG4gIHRyYW5zZm9ybVN0cmV0Y2hDcmVhdGUsXG4gIHRyYW5zZm9ybVRyYW5zbGF0ZSxcbiAgdHJhbnNmb3JtVHJhbnNsYXRlQ3JlYXRlLFxufSBmcm9tICcuL3RyYW5zZm9ybS5qcydcblxuZnVuY3Rpb24gcGh5c0NyZWF0ZShkdCkge1xuICByZXR1cm4ge1xuICAgIGJvZGllczogW10sXG4gICAgcGFydGljbGVzOiBuZXcgQXJyYXkoNjU1MzYpLCAgLy8gVE9ETzogdGhpcyBpcyBzdHVwaWQsIGRvIHByb3BlciBhbGxvY2F0aW5vIHN0dWZmXG4gICAgbnVtUGFydGljbGVzOiAwLFxuICAgIGR0OiBkdCxcbiAgICBuZXh0UGh5c0lkOiAxXG4gIH07XG4gIC8vIFRPRE86IGFjY2VsZXJhdGlvbiBzdHJ1Y3R1cmVzIGV0Yy5cbn1cblxuZnVuY3Rpb24gcGh5c1Jlc2V0KHBoeXMpIHtcbiAgcGh5cy5ib2RpZXMgPSBbXTtcbiAgcGh5cy5udW1QYXJ0aWNsZXMgPSAwO1xuICBwaHlzLm5leHRQaHlzSWQgPSAxO1xuXG59XG5cbi8vIHJldHVybnMgdmVsb2NpdHkgb2YgYm9keSBhdCBwb2ludCBwIGluIHZcbmZ1bmN0aW9uIHBoeXNCb2R5VmVsb2NpdHkoYm9keSwgcCwgdikge1xuICB2YXIgZEJvZHkgPSBib2R5LmQ7XG4gIHZhciB2Qm9keSA9IGJvZHkudjtcbiAgdmFyIM+JQm9keSA9IGJvZHkuz4k7XG5cbiAgdi54ID0gdkJvZHkueCArIChkQm9keS55IC0gcC55KSAqIM+JQm9keTtcbiAgdi55ID0gdkJvZHkueSArIChwLnggLSBkQm9keS54KSAqIM+JQm9keTtcbn1cblxuLy8gdmVsb2NpdHkgb2YgYm9keSBpbiBkaXJlY3Rpb24gb2YgbiBhdCBwXG5mdW5jdGlvbiBwaHlzQm9keVJlbGF0aXZlVmVsb2NpdHkoYm9keSwgcCwgbikge1xuICB2YXIgZEJvZHkgPSBib2R5LmQ7XG4gIHZhciB2Qm9keSA9IGJvZHkudjtcbiAgdmFyIM+JQm9keSA9IGJvZHkuz4k7XG5cbiAgdmFyIHZ4ID0gdkJvZHkueCArIChkQm9keS55IC0gcC55KSAqIM+JQm9keTtcbiAgdmFyIHZ5ID0gdkJvZHkueSArIChwLnggLSBkQm9keS54KSAqIM+JQm9keTtcblxuICByZXR1cm4gbi54ICogdnggKyBuLnkgKiB2eTtcbn1cblxuZnVuY3Rpb24gcGh5c0JvZHlBcHBseUxpbmVhckltcHVsc2UoYm9keSwgbiwgaikge1xuICBib2R5LnYueCArPSBuLnggKiBqIC8gYm9keS5tO1xuICBib2R5LnYueSArPSBuLnkgKiBqIC8gYm9keS5tO1xufVxuXG5mdW5jdGlvbiBwaHlzQm9keUFwcGx5QW5ndWxhckltcHVsc2UoYm9keSwgaikge1xuICBib2R5Ls+JICs9IGogLyBib2R5Lkk7XG59XG5cbmZ1bmN0aW9uIHBoeXNCb2R5QXBwbHlJbXB1bHNlKGJvZHksIHAsIG4sIGopIHtcbiAgLy8gYXBwbHkgaW1wdWxzZSB0byBjZW50ZXIgb2YgbWFzcyBhbmQgdXBkYXRlIHJvdGF0aW9uIGJhc2VkIG9uIGNyb3NzIHByb2R1Y3Q/XG4gIC8vIG9yIGRvdCBwcm9kdWN0XG5cbiAgdmFyIGR4ID0gYm9keS5kLnggLSBwLng7ICAvLyBwIC0+IGJvZHkuZFxuICB2YXIgZHkgPSBib2R5LmQueSAtIHAueTtcblxuICAvLyB1cGRhdGUgdHJhbnNsYXRpb25hbCB2ZWxvY2l0eVxuICBwaHlzQm9keUFwcGx5TGluZWFySW1wdWxzZShib2R5LCBuLCBqKTtcblxuICAvLyB1cGRhdGUgcm90YXRpb25hbCB2ZWxvY2l0eVxuICBwaHlzQm9keUFwcGx5QW5ndWxhckltcHVsc2UoYm9keSwgKG4ueCAqIGR5IC0gbi55ICogZHgpICogaik7XG59XG5cbi8vIHZlbG9jaXR5IGNoYW5nZSBhdCBwIGluIGRpcmVjdGlvbiBvZiBuIHBlciB1bml0IG9mIGltcHVsc2UgYXBwbGllZCBhdFxuLy8gcCBpbiBkaXJlY3Rpb24gb2YgblxuZnVuY3Rpb24gcGh5c0JvZHlEdkJ5RGooYm9keSwgcCwgbikge1xuICB2YXIgbmwyID0gbi54ICogbi54ICsgbi55ICogbi55O1xuICBpZiAobmwyIDwgMC45OTk5IHx8IG5sMiA+IDEuMDAwMSkge1xuICAgIHRocm93IFwibm9ybWFsIG11c3QgYmUgYSB1bml0IHZlY3RvclwiO1xuICB9XG5cbiAgdmFyIGR4ID0gYm9keS5kLnggLSBwLng7ICAvLyBwIC0+IGJvZHkuZFxuICB2YXIgZHkgPSBib2R5LmQueSAtIHAueTtcblxuICAvLyBkZWx0YSdzIHRvIHZlbG9jaXR5IGNvbXBvbmVudHNcbiAgdmFyIGR2eCA9IG4ueCAvIGJvZHkubTtcbiAgdmFyIGR2eSA9IG4ueSAvIGJvZHkubTtcbiAgdmFyIGTPiSA9IChuLnggKiBkeSAtIG4ueSAqIGR4KSAvIGJvZHkuSTtcblxuICAvLyBjaGFuZ2UgaW4gdmVsb2NpdHkgYXQgcG9pbnQgcFxuICB2YXIgdnggPSBkdnggKyBkeSAqIGTPiTtcbiAgdmFyIHZ5ID0gZHZ5IC0gZHggKiBkz4k7XG5cbiAgLy8gcHJvamVjdCBvbnRvIG5vcm1hbFxuICByZXR1cm4gbi54ICogdnggKyBuLnkgKiB2eTtcbn1cblxuZnVuY3Rpb24gcGh5c0JvZHlQcm9wZXJ0aWVzQ3JlYXRlKM+BLCBlLCBvbmNvbGxpZGVwYXJ0aWNsZSwgb25jb2xsaWRlYm9keSwgb250aW1lc3RlcCwgb25jbGlwKSB7XG4gIHJldHVybiB7XG4gICAgz4E6IM+BLCAvLyBkZW5zaXR5XG4gICAgZTogZSwgLy8gY29lZmZpY2llbnQgb2YgcmVzdGl0dXRpb24gZm9yIGNvbGxpc2lvbnNcbiAgICBvbmNvbGxpZGVwYXJ0aWNsZTogb25jb2xsaWRlcGFydGljbGUsXG4gICAgb25jb2xsaWRlYm9keTogb25jb2xsaWRlYm9keSxcbiAgICBvbnRpbWVzdGVwOiBvbnRpbWVzdGVwLFxuICAgIG9uY2xpcDogb25jbGlwXG4gIH07XG59XG5cbmZ1bmN0aW9uIHBoeXNCb2R5Q3JlYXRlKHBoeXMsIHNvbGlkLCBkLCDOuCwgdiwgz4ksIHByb3BlcnRpZXMpIHtcbiAgdmFyIGwydyA9IHRyYW5zZm9ybVRyYW5zbGF0ZSh0cmFuc2Zvcm1Sb3RhdGVDcmVhdGUozrgpLCBkLngsIGQueSk7XG5cbiAgdmFyIGNhID0gc29saWRDZW50cm9pZEFyZWEoc29saWQpO1xuICB2YXIgY2VudGVyVCA9IHRyYW5zZm9ybVRyYW5zbGF0ZUNyZWF0ZSgtY2EueCwgLWNhLnkpO1xuXG4gIC8vIHJlY2VudGVyIHNvbGlkIHRvIGhhdmUgY2VudHJvaWQgYmUgYXQgKDAsIDApXG4gIHNvbGlkVHJhbnNmb3JtKHNvbGlkLCBjZW50ZXJUKTtcblxuICAvLyBnZXQgdGhlIHJhZGl1cyBzbyB3ZSBjYW4gZG8gY29sbGlzaW9ucyBmYXN0ZXJcbiAgdmFyIHIyID0gc29saWRSYWRpdXNTcXVhcmVkKHNvbGlkKTtcblxuICAvLyBnZXQgY2VudHJvaWQgaW4gd29ybGQgY29vcmRpbmF0ZWFcbiAgdHJhbnNmb3JtUG9pbnQobDJ3LCBjYSk7XG5cbiAgLy8gY29ycmVjdCB2ZWxvY2l0eSBkdWUgdG8gbW92ZW1lbnQgY2F1c2VkIGJ5IHJvdGF0aW9uIG9mIG5ldyBjZW50ZXIgb2YgbWFzcyBpbiB0aGUgb2xkIGZyYW1lIG9mIHJlZmVyZW5jZVxuICB2LnggKz0gKGQueSAtIGNhLnkpICogz4k7XG4gIHYueSArPSAoY2EueCAtIGQueCkgKiDPiTtcblxuICAvLyBjb3JyZWN0IHBvc2l0aW9uIHRvIGJlIHdvcmxkIGNvb3JkaW5hdGVkIG9mIHRoZSBuZXcgY2VudGVyIG9mIG1hc3NcbiAgZC54ID0gY2EueDtcbiAgZC55ID0gY2EueTtcblxuICBsMncgPSB0cmFuc2Zvcm1UcmFuc2xhdGUodHJhbnNmb3JtUm90YXRlQ3JlYXRlKM64KSwgZC54LCBkLnkpO1xuXG4gIHZhciBib2R5ID0ge1xuICAgIGlkOiBwaHlzLm5leHRQaHlzSWQrKyxcbiAgICBzb2xpZDogc29saWQsXG4gICAgdmVydHM6IHNvbGlkVmVydGljZXMoc29saWQpLFxuICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsXG4gICAgbTogcHJvcGVydGllcy7PgSAqIGNhLmFyZWEsXG4gICAgSTogcHJvcGVydGllcy7PgSAqIGNhLmFyZWEgKiBzb2xpZE1vbWVudE9mSW5lcnRpYShzb2xpZCksXG4gICAgZDogZCxcbiAgICByMjogcjIsXG4gICAgzrg6IM64LFxuICAgIHY6IHYsXG4gICAgz4k6IM+JLFxuICAgIHdvcmxkVG9Mb2NhbDogdHJhbnNmb3JtSW52ZXJ0KGwydyksXG4gICAgbG9jYWxUb1dvcmxkOiBsMncsXG4gICAgcHJldldvcmxkVG9Mb2NhbDogdHJhbnNmb3JtSW52ZXJ0KGwydyksXG4gICAgcHJldkxvY2FsVG9Xb3JsZDogbDJ3XG4gIH07XG5cbiAgcGh5cy5ib2RpZXMucHVzaChib2R5KTtcblxuICByZXR1cm4gYm9keTtcbn1cblxuLy8gVE9ETzogbWFrZSBzdXJlIGFsbCBleHRlcm5hbCBBUElzIGFyZSBzYWZlIHRvIGNhbGwgZnJvbSBhbnkgY2FsbGJhY2tcblxuZnVuY3Rpb24gcGh5c1BhcnRpY2xlUHJvcGVydGllc0NyZWF0ZShtLCBlLCBvbmNvbGxpZGUsIG9udGltZXN0ZXApIHtcbiAgcmV0dXJuIHtcbiAgICBtOiBtLCAgICAgICAgICAgICAgICAgICAvLyBtYXNzXG4gICAgZTogZSwgICAgICAgICAgICAgICAgICAgLy8gY29lZmZpY2llbnQgb2YgcmVzdGl0dXRpb25cbiAgICBvbmNvbGxpZGU6IG9uY29sbGlkZSwgICAvLyBvbmNvbGxpZGUocGFydGljbGUsIGJvZHksIGNvbGxpc2lvbiBub3JtYWwsIGltcHVsc2UpXG4gICAgb250aW1lc3RlcDogb250aW1lc3RlcCAgLy8gb250aW1lc3RlcChwYXJ0aWNsZSwgZHQpXG4gIH07XG59XG5cbmZ1bmN0aW9uIHBoeXNQYXJ0aWNsZUNyZWF0ZShwaHlzLCBkLCB2LCB0LCBwcm9wZXJ0aWVzKSB7XG4gIGlmIChwaHlzLm51bVBhcnRpY2xlcyA8IHBoeXMucGFydGljbGVzLmxlbmd0aCkge1xuICAgIHBoeXMucGFydGljbGVzW3BoeXMubnVtUGFydGljbGVzXSA9IHtcbiAgICAgIGlkOiBwaHlzLm5leHRQaHlzSWQrKyxcbiAgICAgIGQ6IGQsXG4gICAgICB2OiB2LFxuICAgICAgdDogdCxcbiAgICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXNcbiAgICB9O1xuXG4gICAgcGh5cy5udW1QYXJ0aWNsZXMrKztcbiAgfVxufVxuXG5mdW5jdGlvbiBwaHlzUmVtb3ZlUGFydGljbGUocGh5cywgaSkge1xuICBpZiAoaSA8IDAgfHwgaSA+PSBwaHlzLm51bVBhcnRpY2xlcykge1xuICAgIHRocm93IFwiaW5kZXggb3V0IG9mIGJvdW5kcyFcIjtcbiAgfVxuXG4gIGlmIChpICE9IHBoeXMubnVtUGFydGljbGVzIC0gMSkge1xuICAgIHBoeXMucGFydGljbGVzW2ldID0gcGh5cy5wYXJ0aWNsZXNbcGh5cy5udW1QYXJ0aWNsZXMgLSAxXTtcbiAgfVxuXG4gIHBoeXMubnVtUGFydGljbGVzLS07XG4gIHBoeXMucGFydGljbGVzW3BoeXMubnVtUGFydGljbGVzXSA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIHBoeXNGaXJzdENvbGxpc2lvbihwaHlzLCBjdXJyLCBwcmV2LCBuKSB7XG4gIC8vIFRPRE86IHVzZSBib3VuZGluZyBjaXJjbGUgLSBtaWdodCBuZWVkIHByZXZEIG9uIGJvZHlcbiAgdmFyIGhpdEJvZHkgPSBudWxsO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBoeXMuYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJvZHkgPSBwaHlzLmJvZGllc1tpXTtcbiAgICB2YXIgYSA9IHsgeDogcHJldi54LCB5OiBwcmV2LnkgfTtcbiAgICB2YXIgYiA9IHsgeDogY3Vyci54LCB5OiBjdXJyLnkgfTtcbiAgICB0cmFuc2Zvcm1Qb2ludChib2R5LnByZXZXb3JsZFRvTG9jYWwsIGEpO1xuICAgIHRyYW5zZm9ybVBvaW50KGJvZHkud29ybGRUb0xvY2FsLCBiKTtcblxuICAgIHZhciBic3AgPSBic3BUcmVlQ29sbGlkZShib2R5LnNvbGlkLCBhLngsIGEueSwgYi54LCBiLnkpO1xuXG4gICAgaWYgKGJzcCAhPSBudWxsKSB7XG4gICAgICB2YXIgdCA9IGJzcEludGVyc2VjdChic3AsIGEueCwgYS55LCBiLngsIGIueSk7XG5cbiAgICAgIGhpdEJvZHkgPSBib2R5O1xuXG4gICAgICAvL2EueCA9IGEueCAqICgxLjAgLSB0KSArIGIueCAqIHQ7XG4gICAgICAvL2EueSA9IGEueSAqICgxLjAgLSB0KSArIGIueSAqIHQ7XG4gICAgICAvLyBUT0RPOiB1c2UgcG9zaXRpb24ganVzdCBvdXRzaWRlIGJvZHkgZm9yIHBhcnRpY2xlLCBjaGVjayB0byBtYWtlIHN1cmUgaXQncyBub3QgaW4gc29tZSBvdGhlciBib2R5XG5cbiAgICAgIHZhciBubCA9IE1hdGguc3FydChic3AubnggKiBic3AubnggKyBic3AubnkgKiBic3AubnkpO1xuICAgICAgbi54ID0gYnNwLm54IC8gbmw7XG4gICAgICBuLnkgPSBic3AubnkgLyBubDtcblxuICAgICAgY3Vyci54ID0gYS54O1xuICAgICAgY3Vyci55ID0gYS55O1xuICAgICAgdHJhbnNmb3JtUG9pbnQoYm9keS5sb2NhbFRvV29ybGQsIGN1cnIpO1xuICAgICAgdHJhbnNmb3JtTm9ybWFsKGJvZHkubG9jYWxUb1dvcmxkLCBuKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaGl0Qm9keTtcbn1cblxuZnVuY3Rpb24gcGh5c0NvbGxpZGVQYXJ0aWNsZShwaHlzLCBwYXJ0aWNsZSwgcHJldlBvcykge1xuICB2YXIgbiA9IHsgeDogMC4wLCB5OiAwLjAgfTtcblxuICB2YXIgYm9keSA9IHBoeXNGaXJzdENvbGxpc2lvbihwaHlzLCBwYXJ0aWNsZS5kLCBwcmV2UG9zLCBuKTtcblxuICBpZiAoYm9keSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gcGFydGljbGUgaGl0IHNvbWV0aGluZ1xuICB2YXIgdiA9IHBoeXNCb2R5UmVsYXRpdmVWZWxvY2l0eShib2R5LCBwYXJ0aWNsZS5kLCBuKTtcbiAgdmFyIGogPSAwLjA7XG5cbiAgdiAtPSBwYXJ0aWNsZS52LnggKiBuLnggKyBwYXJ0aWNsZS52LnkgKiBuLnk7XG5cbiAgaWYgKHYgPCAwLjApIHsgIC8vIGFjdHVhbGx5IGNvbnZlcmdpbmcgYXQgY29sbGlzaW9uIHBvaW50XG4gICAgLy8gZ2V0IGRlbHRhIHYgbmVlZGVkIGZvciBjb3JyZWN0IHNlcGFyYXRpb24gdmVsb2NpdHlcbiAgICB2YXIgZSA9IChwYXJ0aWNsZS5wcm9wZXJ0aWVzLmUgKyBib2R5LnByb3BlcnRpZXMuZSkgKiAwLjU7ICAvLyB1c2UgbWVhbiBjb2VmZmljaWVudCBvZiByZXN0aXR1dGlvblxuICAgIHYgPSAtdiAqICgxLjAgKyBlKTtcblxuICAgIC8vIGNhbGN1bGF0ZSBjaGFuZ2UgaW4gdmVsb2NpdHkgcGVyIHVuaXQgb2YgaW1wdWxzZVxuICAgIHZhciBib2R5RHZEaiA9IHBoeXNCb2R5RHZCeURqKGJvZHksIHBhcnRpY2xlLmQsIG4pO1xuICAgIHZhciBwYXJ0RHZEaiA9IDEuMCAvIHBhcnRpY2xlLnByb3BlcnRpZXMubTtcblxuICAgIGogPSB2IC8gKGJvZHlEdkRqICsgcGFydER2RGopO1xuXG4gICAgcGh5c0JvZHlBcHBseUltcHVsc2UoYm9keSwgcGFydGljbGUuZCwgbiwgaik7XG4gICAgcGFydGljbGUudi54IC09IG4ueCAqIGogLyBwYXJ0aWNsZS5wcm9wZXJ0aWVzLm07XG4gICAgcGFydGljbGUudi55IC09IG4ueSAqIGogLyBwYXJ0aWNsZS5wcm9wZXJ0aWVzLm07XG4gIH1cblxuICBpZiAocGFydGljbGUucHJvcGVydGllcy5vbmNvbGxpZGUpIHtcbiAgICBwYXJ0aWNsZS5wcm9wZXJ0aWVzLm9uY29sbGlkZShwYXJ0aWNsZSwgYm9keSwgbik7XG4gIH1cblxuICBpZiAoYm9keS5wcm9wZXJ0aWVzLm9uY29sbGlkZXBhcnRpY2xlKSB7XG4gICAgYm9keS5wcm9wZXJ0aWVzLm9uY29sbGlkZXBhcnRpY2xlKGJvZHksIHBhcnRpY2xlLCBuLCBqKTtcbiAgfVxuXG4gIC8vIFRPRE86IHJlZmxlY3QgbmV3IHBvc2l0aW9uIG92ZXIgY29sbGlzaW9uIHBvaW50PyBPciBqdXN0IHRyYW5zZm9ybSBwcmV2aW91cyBwb3NpdGlvbiB0byBuZXcgZ2xvYmFsIGNvb3JkaW5hdGVzP1xuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyBpZiB2ZXJ0aWNpZXMgZnJvbSBib2R5IGhpdCBvdGhlckJvZHkgaW4gdGhlIHByZXZpb3VzIGZyYW1lXG4vLyByZXR1cm5zIHRydWUgaWYgdGhlcmUgd2FzIGEgaGl0XG4vLyBwLCBuIHNldCB0byBwb3NpdGlvbiBhbmQgbm9ybWFsIG9mIGZpcnN0IGhpdFxuLy8gVE9ETzogZmluZCAnZmlyc3QnIGhpdCwgbm90IGp1c3QgYW55XG5mdW5jdGlvbiBib2R5Q29sbGlkZVZlcnRzKGJvZHksIGJvZHlNb3ZlLCBvdGhlckJvZHksIHAsIG4pIHtcbiAgLy8gVE9ETzogdHJhbnNmb3JtcyBkZXBlbmQgb24gaWYgYm9keSBvciBvdGhlckJvZHkgYXJlIHRoZSBvbmVzIGJlaW5nIG1vdmVkXG4gIHZhciBwcmV2VDtcbiAgdmFyIGN1cnJUO1xuXG4gIGlmIChib2R5TW92ZSkge1xuICAgIHByZXZUID0gdHJhbnNmb3JtQ29tcG9zZShib2R5LnByZXZMb2NhbFRvV29ybGQsIG90aGVyQm9keS53b3JsZFRvTG9jYWwpO1xuICAgIGN1cnJUID0gdHJhbnNmb3JtQ29tcG9zZShib2R5LmxvY2FsVG9Xb3JsZCwgb3RoZXJCb2R5LndvcmxkVG9Mb2NhbCk7XG4gIH0gZWxzZSB7XG4gICAgcHJldlQgPSB0cmFuc2Zvcm1Db21wb3NlKGJvZHkubG9jYWxUb1dvcmxkLCBvdGhlckJvZHkucHJldldvcmxkVG9Mb2NhbCk7XG4gICAgY3VyclQgPSB0cmFuc2Zvcm1Db21wb3NlKGJvZHkubG9jYWxUb1dvcmxkLCBvdGhlckJvZHkud29ybGRUb0xvY2FsKTtcbiAgfVxuXG4gIHZhciB2ZXJ0cyA9IGJvZHkudmVydHM7XG4gIHZhciBic3BUcmVlID0gb3RoZXJCb2R5LnNvbGlkO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdmVydHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdiA9IHZlcnRzW2ldO1xuICAgIHZhciBwcmV2ID0geyB4OiB2LngsIHk6IHYueSB9O1xuICAgIHZhciBjdXJyID0geyB4OiB2LngsIHk6IHYueSB9O1xuICAgIHRyYW5zZm9ybVBvaW50KHByZXZULCBwcmV2KTtcbiAgICB0cmFuc2Zvcm1Qb2ludChjdXJyVCwgY3Vycik7XG5cbiAgICB2YXIgYnNwID0gYnNwVHJlZUNvbGxpZGUoYnNwVHJlZSwgcHJldi54LCBwcmV2LnksIGN1cnIueCwgY3Vyci55KTtcblxuICAgIGlmIChic3AgIT0gbnVsbCkge1xuICAgICAgdmFyIHQgPSBic3BJbnRlcnNlY3QoYnNwLCBjdXJyLngsIGN1cnIueSwgcHJldi54LCBwcmV2LnkpO1xuXG4gICAgICBwLnggPSBjdXJyLnggKiB0ICsgcHJldi54ICogKDEuMCAtIHQpO1xuICAgICAgcC55ID0gY3Vyci55ICogdCArIHByZXYueSAqICgxLjAgLSB0KTtcbiAgICAgIHRyYW5zZm9ybVBvaW50KG90aGVyQm9keS5sb2NhbFRvV29ybGQsIHApO1xuXG4gICAgICB2YXIgbmwgPSBNYXRoLnNxcnQoYnNwLm54ICogYnNwLm54ICsgYnNwLm55ICogYnNwLm55KTtcbiAgICAgIG4ueCA9IGJzcC5ueCAvIG5sO1xuICAgICAgbi55ID0gYnNwLm55IC8gbmw7XG4gICAgICB0cmFuc2Zvcm1Ob3JtYWwob3RoZXJCb2R5LmxvY2FsVG9Xb3JsZCwgbik7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gYm9keUNvbGxpZGUoYm9keSwgb3RoZXJCb2R5LCBwLCBuKSB7XG4gIGlmIChib2R5Q29sbGlkZVZlcnRzKGJvZHksIHRydWUsIG90aGVyQm9keSwgcCwgbikpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoYm9keUNvbGxpZGVWZXJ0cyhvdGhlckJvZHksIGZhbHNlLCBib2R5LCBwLCBuKSkge1xuICAgIG4ueCA9IC1uLng7XG4gICAgbi55ID0gLW4ueTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHBoeXNCb2R5Rmlyc3RDb2xsaXNpb24ocGh5cywgYm9keSwgcCwgbikge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBoeXMuYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG90aGVyQm9keSA9IHBoeXMuYm9kaWVzW2ldO1xuXG4gICAgaWYgKGJvZHkuaWQgIT0gb3RoZXJCb2R5LmlkKSB7XG4gICAgICBpZiAoYm9keUNvbGxpZGUoYm9keSwgb3RoZXJCb2R5LCBwLCBuKSkge1xuICAgICAgICByZXR1cm4gb3RoZXJCb2R5O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gcGh5c0NvbGxpZGVCb2R5KHBoeXMsIGJvZHkpIHtcbiAgdmFyIG4gPSB7IHg6IDAuMCwgeTogMC4wIH07XG4gIHZhciBwID0geyB4OiAwLjAsIHk6IDAuMCB9O1xuICB2YXIgb3RoZXJCb2R5ID0gcGh5c0JvZHlGaXJzdENvbGxpc2lvbihwaHlzLCBib2R5LCBwLCBuKTtcblxuICBpZiAob3RoZXJCb2R5ID09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBoYXZlIGEgY29sbGlzaW9uIVxuICAvLyBub3JtYWwgaXMgaW53YXJkIG9uIG90aGVyQm9keVxuXG4gIC8vIHJlc29sdmUgaW1wdWxzZVxuICAvLyBnZXQgcmVsYXRpdmUgdmVsb2NpdHlcbiAgdmFyIHYgPSBwaHlzQm9keVJlbGF0aXZlVmVsb2NpdHkob3RoZXJCb2R5LCBwLCBuKSAtIHBoeXNCb2R5UmVsYXRpdmVWZWxvY2l0eShib2R5LCBwLCBuKTtcbiAgdmFyIGogPSAwLjA7XG5cbiAgaWYgKHYgPCAwLjApIHtcbiAgICAvLyBkZWx0YSB2IGZvciBjb3JyZWN0IHNlcGFyYXRpb24gdmVsb2NpdHlcbiAgICB2YXIgZSA9IChib2R5LnByb3BlcnRpZXMuZSArIG90aGVyQm9keS5wcm9wZXJ0aWVzLmUpICogMC41OyAvLyB1c2UgbWVhbiBvZiB0aGUgdHdvIGNvZWZmaWNpZW50cyBvZiByZXN0aXR1dGlvblxuICAgIHYgPSAtdiAqICgxLjAgKyBlKTtcblxuICAgIC8vIGdldCBpbXB1bHNlIG5lZWRlZCBwZXIgZGVsdGEgdlxuICAgIHZhciBib2R5RHZEaiA9IHBoeXNCb2R5RHZCeURqKGJvZHksIHAsIHsgeDogLW4ueCwgeTogLW4ueSB9ICk7XG4gICAgdmFyIG90aGVyQm9keUR2RGogPSBwaHlzQm9keUR2QnlEaihvdGhlckJvZHksIHAsIG4pO1xuICAgIGogPSB2IC8gKGJvZHlEdkRqICsgb3RoZXJCb2R5RHZEaik7XG5cbiAgICAvLyBhcHBseSBpbXB1bHNlXG4gICAgcGh5c0JvZHlBcHBseUltcHVsc2UoYm9keSwgcCwgbiwgLWopO1xuICAgIHBoeXNCb2R5QXBwbHlJbXB1bHNlKG90aGVyQm9keSwgcCwgbiwgaik7XG4gIH1cblxuICBpZiAoYm9keS5wcm9wZXJ0aWVzLm9uY29sbGlkZWJvZHkpIHtcbiAgICBib2R5LnByb3BlcnRpZXMub25jb2xsaWRlYm9keShib2R5LCBvdGhlckJvZHksIHAsIG4sIC1qKTtcbiAgfVxuXG4gIGlmIChvdGhlckJvZHkucHJvcGVydGllcy5vbmNvbGxpZGVib2R5KSB7XG4gICAgb3RoZXJCb2R5LnByb3BlcnRpZXMub25jb2xsaWRlYm9keShvdGhlckJvZHksIGJvZHksIHAsIG4sIGopO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHBoeXNUaW1lU3RlcChwaHlzKSB7XG4gIHZhciBkdCA9IHBoeXMuZHQ7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwaHlzLmJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBib2R5ID0gcGh5cy5ib2RpZXNbaV07XG5cbiAgICAvLyBKdXN0IHVzZSBmb3J3YXJkIGV1bGVyLCBzaW5jZSB3ZSBkb24ndCBjYXJlIGFib3V0IGdyYXZpdHkgKHdoaWNoIGRvZXNuJ3QgZXhpc3QgeWV0KSBiZWluZyBhY2N1cmF0ZVxuICAgIC8vIGFuZCBhbGwgb3RoZXIgYWNjZWxlcmF0aW9ucyBhcmUgaW1wdWxzZXMgd2hpY2ggYXJlIG5vdCBpbnRlZ3JhdGVkIGhlcmVcbiAgICB2YXIgZFByZXZ4ID0gYm9keS5kLng7XG4gICAgdmFyIGRQcmV2eSA9IGJvZHkuZC55O1xuICAgIHZhciDOuFByZXYgPSBib2R5Ls64O1xuXG4gICAgYm9keS5kLnggKz0gYm9keS52LnggKiBkdDtcbiAgICBib2R5LmQueSArPSBib2R5LnYueSAqIGR0O1xuICAgIGJvZHkuzrggKz0gYm9keS7PiSAqIGR0O1xuXG4gICAgaWYgKGJvZHkuzrggPCAwKSB7XG4gICAgICB2YXIgcm90YXRpb25zID0gTWF0aC5jZWlsKC1ib2R5Ls64IC8gKDIuMCAqIE1hdGguUEkpKTtcbiAgICAgIGJvZHkuzrggKz0gcm90YXRpb25zICogMi4wICogTWF0aC5QSTtcbiAgICB9IGVsc2UgaWYgKGJvZHkuzrggPj0gMi4wICogTWF0aC5QSSkge1xuICAgICAgdmFyIHJvdGF0aW9ucyA9IE1hdGguY2VpbCgtYm9keS7OuCAvICgyLjAgKiBNYXRoLlBJKSk7XG4gICAgICBib2R5Ls64ICs9IHJvdGF0aW9ucyAqIDIuMCAqIE1hdGguUEk7XG4gICAgfVxuXG4gICAgYm9keS5wcmV2V29ybGRUb0xvY2FsID0gYm9keS53b3JsZFRvTG9jYWw7XG4gICAgYm9keS5wcmV2TG9jYWxUb1dvcmxkID0gYm9keS5sb2NhbFRvV29ybGQ7XG4gICAgYm9keS5sb2NhbFRvV29ybGQgPSB0cmFuc2Zvcm1UcmFuc2xhdGUodHJhbnNmb3JtUm90YXRlQ3JlYXRlKGJvZHkuzrgpLCBib2R5LmQueCwgYm9keS5kLnkpO1xuICAgIGJvZHkud29ybGRUb0xvY2FsID0gdHJhbnNmb3JtSW52ZXJ0KGJvZHkubG9jYWxUb1dvcmxkKTtcblxuICAgIC8vIGJvZHktYm9keSBjb2xsaXNpb24gZGV0ZWN0aW9uXG4gICAgaWYgKHBoeXNDb2xsaWRlQm9keShwaHlzLCBib2R5KSkge1xuICAgICAgLy8gYmFjayB1cCBib3RoIGJvZHkgYW5kIG90aGVyQm9keSB0byBwcmV2aW91cyB0aW1lc3RlcFxuICAgICAgYm9keS5kLnggPSBkUHJldng7XG4gICAgICBib2R5LmQueSA9IGRQcmV2eTtcbiAgICAgIGJvZHkuzrggPSDOuFByZXY7XG5cbiAgICAgIGJvZHkubG9jYWxUb1dvcmxkID0gdHJhbnNmb3JtVHJhbnNsYXRlKHRyYW5zZm9ybVJvdGF0ZUNyZWF0ZShib2R5Ls64KSwgYm9keS5kLngsIGJvZHkuZC55KTtcbiAgICAgIGJvZHkud29ybGRUb0xvY2FsID0gdHJhbnNmb3JtSW52ZXJ0KGJvZHkubG9jYWxUb1dvcmxkKTtcbiAgICB9XG5cbiAgICBpZiAoYm9keS5wcm9wZXJ0aWVzLm9udGltZXN0ZXApIHtcbiAgICAgIGJvZHkucHJvcGVydGllcy5vbnRpbWVzdGVwKGJvZHksIGR0KTtcbiAgICB9XG4gIH1cblxuICB2YXIgcGFydGljbGVzID0gcGh5cy5wYXJ0aWNsZXM7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGh5cy5udW1QYXJ0aWNsZXM7IGkrKykge1xuICAgIHZhciBwYXJ0aWNsZSA9IHBhcnRpY2xlc1tpXTtcbiAgICB2YXIgcHJldiA9IHsgeDogcGFydGljbGUuZC54LCB5OiBwYXJ0aWNsZS5kLnkgfTtcbiAgICB2YXIgaGl0Qm9keSA9IG51bGw7XG5cbiAgICBpZiAocGh5c1BvaW50SW5zaWRlQm9kaWVzKHBoeXMsIHByZXYpKSB7XG4gICAgICBwYXJ0aWNsZS50ID0gMC4wO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0aWNsZS50IC09IGR0O1xuICAgICAgcGFydGljbGUuZC54ICs9IHBhcnRpY2xlLnYueCAqIGR0O1xuICAgICAgcGFydGljbGUuZC55ICs9IHBhcnRpY2xlLnYueSAqIGR0O1xuXG4gICAgICBwaHlzQ29sbGlkZVBhcnRpY2xlKHBoeXMsIHBhcnRpY2xlLCBwcmV2KTtcblxuICAgICAgaWYgKHBhcnRpY2xlLnByb3BlcnRpZXMub250aW1lc3RlcCkge1xuICAgICAgICBwYXJ0aWNsZS5wcm9wZXJ0aWVzLm9udGltZXN0ZXAocGFydGljbGUsIGR0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZW1vdmUgYW55IHBhcnRpY2xlcyB0aGF0IGhhdmUgdGltZWQgb3V0XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGh5cy5udW1QYXJ0aWNsZXM7KSB7XG4gICAgaWYgKHBhcnRpY2xlc1tpXS50IDw9IDAuMCkge1xuICAgICAgcGh5c1JlbW92ZVBhcnRpY2xlKHBoeXMsIGkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpKys7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBoeXNDbGlwQm9kaWVzKHBoeXMsIGJzcCkge1xuICB2YXIgYm9kaWVzID0gcGh5cy5ib2RpZXM7XG4gIHBoeXMuYm9kaWVzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYm9keSA9IGJvZGllc1tpXTtcbiAgICAvLyBUT0RPOiBib3VuZGluZyBjaXJjbGVzIG9yIHNvbWV0aGluZy4uLlxuXG4gICAgLy8gdHJhbnNmb3JtIGJzcCBpbnRvIGxvY2FsIGNvb3JkaW5hdGVzXG4gICAgdmFyIGxvY2FsQnNwID0gYnNwVHJlZVRyYW5zZm9ybUNsb25lKGJzcCwgYm9keS53b3JsZFRvTG9jYWwpXG4gICAgdmFyIHJlc3VsdCA9IHNvbGlkQ2xpcChib2R5LnNvbGlkLCBsb2NhbEJzcCk7XG5cbiAgICBpZiAoIXJlc3VsdC5jbGlwcGVkKSB7XG4gICAgICBwaHlzLmJvZGllcy5wdXNoKGJvZHkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc29saWQgPSByZXN1bHQuc29saWQ7XG4gICAgICB2YXIgcmVnaW9ucyA9IHNvbGlkTWFya0Nvbm5lY3RlZFJlZ2lvbnMocmVzdWx0LnNvbGlkKTtcblxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCByZWdpb25zOyBqKyspIHtcbiAgICAgICAgdmFyIGV4dHJhY3RlZFNvbGlkID0gc29saWRFeHRyYWN0UmVnaW9uKHNvbGlkLCBqKTtcblxuICAgICAgICB2YXIgY2xpcHBlZEJvZHkgPSBwaHlzQm9keUNyZWF0ZShcbiAgICAgICAgICBwaHlzLFxuICAgICAgICAgIGV4dHJhY3RlZFNvbGlkLFxuICAgICAgICAgIHsgeDogYm9keS5kLngsIHk6IGJvZHkuZC55IH0sXG4gICAgICAgICAgYm9keS7OuCxcbiAgICAgICAgICB7IHg6IGJvZHkudi54LCB5OiBib2R5LnYueSB9LFxuICAgICAgICAgIGJvZHkuz4ksXG4gICAgICAgICAgYm9keS5wcm9wZXJ0aWVzKTtcblxuICAgICAgICBpZiAoY2xpcHBlZEJvZHkucHJvcGVydGllcy5vbmNsaXApIHtcbiAgICAgICAgICBjbGlwcGVkQm9keS5wcm9wZXJ0aWVzLm9uY2xpcChib2R5LCBjbGlwcGVkQm9keSwgYnNwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBwaHlzRHJhd2NvbGxpc2lvbkRlYnVnR3JpZChwaHlzLCBjYW0pIHtcbiAgdmFyIGN0eCA9IGNhbS5jdHg7XG4gIHZhciBncmlkID0gW107XG5cbiAgdmFyIHAgPSBjYW0ubW91c2VNb2RlbDtcblxuICBmb3IgKHZhciBhID0gMC4wOyBhIDwgMi4wICogTWF0aC5QSTsgYSArPSAyLjAgKiBNYXRoLlBJIC8gMzIuMCkge1xuICAgIGdyaWQucHVzaCh7XG4gICAgICBhOiB7IHg6IHAueCwgeTogcC55IH0sXG4gICAgICBiOiB7IHg6IHAueCArIE1hdGguY29zKGEpICogNjQuMCwgeTogcC55ICsgTWF0aC5zaW4oYSkgKiA2NC4wIH0sXG4gICAgICB0OiAxLjBcbiAgICB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGh5cy5ib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYm9keSA9IHBoeXMuYm9kaWVzW2ldO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBncmlkLmxlbmd0aDsgaisrKSB7XG4gICAgICB2YXIgbGluZSA9IGdyaWRbal07XG4gICAgICB2YXIgYSA9IHsgeDogbGluZS5hLngsIHk6IGxpbmUuYS55IH07XG4gICAgICB2YXIgYiA9IHsgeDogbGluZS5iLngsIHk6IGxpbmUuYi55IH07XG5cbiAgICAgIHRyYW5zZm9ybVBvaW50KGJvZHkud29ybGRUb0xvY2FsLCBhKTtcbiAgICAgIHRyYW5zZm9ybVBvaW50KGJvZHkud29ybGRUb0xvY2FsLCBiKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGJzcCA9IGJzcFRyZWVDb2xsaWRlKGJvZHkuc29saWQsIGEueCwgYS55LCBiLngsIGIueSk7XG5cbiAgICAgICAgaWYgKGJzcCAhPSBudWxsKSB7XG4gICAgICAgICAgbGluZS50ID0gTWF0aC5taW4obGluZS50LCBic3BJbnRlcnNlY3QoYnNwLCBiLngsIGIueSwgYS54LCBhLnkpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY2F0Y2ggKGV4KVxuICAgICAge1xuXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGdyaWQubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbGluZSA9IGdyaWRbaV07XG4gICAgdmFyIHQgPSBsaW5lLnQ7XG4gICAgY3R4Lm1vdmVUbyhsaW5lLmEueCwgbGluZS5hLnkpO1xuICAgIGN0eC5saW5lVG8obGluZS5hLnggKiAoMS4wIC0gdCkgKyBsaW5lLmIueCAqIHQsIGxpbmUuYS55ICogKDEuMCAtIHQpICsgbGluZS5iLnkgKiB0KTtcbiAgfVxuICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JleSc7XG4gIGN0eC5saW5lV2lkdGggPSAwLjI7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgY3R4LmxpbmVXaWR0aCA9IDEuMDtcbn1cblxuZnVuY3Rpb24gcGh5c0RyYXcocGh5cywgY2FtKSB7XG4gIHZhciBjdHggPSBjYW0uY3R4O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGh5cy5ib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYm9keSA9IHBoeXMuYm9kaWVzW2ldO1xuXG4gICAgY2FtUHVzaFRyYW5zZm9ybShjYW0sIGJvZHkubG9jYWxUb1dvcmxkKTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgYm9keS52ZXJ0cy5sZW5ndGg7IGorKykge1xuICAgICAgdmFyIHYgPSBib2R5LnZlcnRzW2pdO1xuICAgICAgY3R4LmZpbGxSZWN0KHYueCAtIDEuNSwgdi55IC0gMS41LCAzLjAsIDMuMCk7XG4gICAgfVxuXG4gICAgY2FtUG9wVHJhbnNmb3JtKGNhbSk7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBoeXMuYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJvZHkgPSBwaHlzLmJvZGllc1tpXTtcblxuICAgIGNhbVB1c2hUcmFuc2Zvcm0oY2FtLCBib2R5LmxvY2FsVG9Xb3JsZCk7XG5cbiAgICBzb2xpZEZpbGwoYm9keS5zb2xpZCwgY2FtLmN0eCk7XG5cbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmFyYygwLjAsIDAuMCwgNCwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcbiAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICBjdHguZmlsbCgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8oMC4wLCAwLjApO1xuICAgIGN0eC5saW5lVG8oMTYuMCwgMC4wKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICAgIGN0eC5zdHJva2UoKTtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgbW91c2VzaWRlID0gYnNwVHJlZVBvaW50U2lkZShib2R5LnNvbGlkLCBjYW0ubW91c2VNb2RlbC54LCBjYW0ubW91c2VNb2RlbC55KTtcbiAgICBpZiAobW91c2VzaWRlID09IDEgfHwgbW91c2VzaWRlID09IDMpIHtcbiAgICAgIHZhciBsaW5lcyA9IGJzcFRyZWVEZWJ1Z0xpbmVzKGJvZHkuc29saWQsIGNhbS5tb3VzZU1vZGVsLngsIGNhbS5tb3VzZU1vZGVsLnksIDI1Ni4wKTtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGluZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tqXTtcbiAgICAgICAgY3R4Lm1vdmVUbyhsaW5lLmEueCwgbGluZS5hLnkpO1xuICAgICAgICBjdHgubGluZVRvKGxpbmUuYi54LCBsaW5lLmIueSk7XG4gICAgICB9XG4gICAgfVxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZWQnO1xuICAgIGN0eC5saW5lV2lkdGggPSAwLjI1O1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHgubGluZVdpZHRoID0gMS4wO1xuXG4gICAgY2FtUHVzaFRyYW5zZm9ybShjYW0sIHRyYW5zZm9ybVN0cmV0Y2hDcmVhdGUoMS4wLCAtMS4wKSk7XG4gICAgY3R4LmZvbnQgPSAnMTJweCBDb3VyaWVyJztcbiAgICBjdHguZmlsbFRleHQoYm9keS5pZC50b1N0cmluZygpLCA0LCAtMik7XG4gICAgY2FtUG9wVHJhbnNmb3JtKGNhbSk7XG4gICAgY2FtUG9wVHJhbnNmb3JtKGNhbSk7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBoeXMubnVtUGFydGljbGVzOyBpKyspIHtcbiAgICB2YXIgcGFydGljbGUgPSBwaHlzLnBhcnRpY2xlc1tpXTtcblxuICAgIGN0eC5maWxsUmVjdChwYXJ0aWNsZS5kLnggLSAxLjUsIHBhcnRpY2xlLmQueSAtIDEuNSwgMy4wLCAzLjApO1xuICB9XG5cbiAgLy9waHlzRHJhd2NvbGxpc2lvbkRlYnVnR3JpZChwaHlzLCBjYW0pO1xufVxuXG5mdW5jdGlvbiBwaHlzQm9keUxvY2FsQ29vcmRpbmF0ZXNBdFBvc2l0aW9uKHBoeXMsIHApIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwaHlzLmJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBib2R5ID0gcGh5cy5ib2RpZXNbaV07XG4gICAgdmFyIGwgPSB7IHg6IHAueCwgeTogcC55IH07XG5cbiAgICB0cmFuc2Zvcm1Qb2ludChib2R5LndvcmxkVG9Mb2NhbCwgbCk7XG5cbiAgICBpZiAoMSA9PSAoMSAmIGJzcFRyZWVQb2ludFNpZGUoYm9keS5zb2xpZCwgbC54LCBsLnkpKSkge1xuICAgICAgcC54ID0gbC54O1xuICAgICAgcC55ID0gbC55O1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBwaHlzUG9pbnRJbnNpZGVCb2RpZXMocGh5cywgcCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBoeXMuYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJvZHkgPSBwaHlzLmJvZGllc1tpXTtcbiAgICB2YXIgbCA9IHsgeDogcC54LCB5OiBwLnkgfTtcblxuICAgIHRyYW5zZm9ybVBvaW50KGJvZHkud29ybGRUb0xvY2FsLCBsKTtcblxuICAgIGlmICgxID09ICgxICYgYnNwVHJlZVBvaW50U2lkZShib2R5LnNvbGlkLCBsLngsIGwueSkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCB7XG4gIHBoeXNCb2R5QXBwbHlBbmd1bGFySW1wdWxzZSxcbiAgcGh5c0JvZHlBcHBseUxpbmVhckltcHVsc2UsXG4gIHBoeXNCb2R5Q3JlYXRlLFxuICBwaHlzQm9keUxvY2FsQ29vcmRpbmF0ZXNBdFBvc2l0aW9uLFxuICBwaHlzQm9keVByb3BlcnRpZXNDcmVhdGUsXG4gIHBoeXNCb2R5VmVsb2NpdHksXG4gIHBoeXNDbGlwQm9kaWVzLFxuICBwaHlzQ3JlYXRlLFxuICBwaHlzRHJhdyxcbiAgcGh5c1BhcnRpY2xlQ3JlYXRlLFxuICBwaHlzUGFydGljbGVQcm9wZXJ0aWVzQ3JlYXRlLFxuICBwaHlzUG9pbnRJbnNpZGVCb2RpZXMsXG4gIHBoeXNSZXNldCxcbiAgcGh5c1RpbWVTdGVwLFxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9waHlzLmpzIiwiLy8gc29saWQuanNcbi8vXG4vLyBDb3B5cmlnaHQgQ2hhcmxlcyBEaWNrIDIwMTVcblxuLy8gVE9ETzogbWFpbnRhaW4gcHJvcGVydHkgdGhhdCBhbGwgYnJhbmNoZXMgYmVmb3JlIHBvbHkgaGF2ZSBib3RoIGluIGFuZCBvdXRcbi8vIHN1YiB0cmVlc1xuXG5pbXBvcnQge1xuICBic3BUcmFuc2Zvcm0sXG4gIGJzcFNpZGVTdGFibGUsXG59IGZyb20gJy4vYnNwLmpzJztcblxuaW1wb3J0IHtcbiAgbWVzaEVkZ2VNZXJnZSxcbiAgbWVzaEVkZ2VTcGxpdCxcbiAgbWVzaEVkZ2VUcmFuc2Zvcm0sXG4gIG1lc2hQb2x5Q2VudHJvaWRBcmVhLFxuICBtZXNoUG9seUZpbGwsXG4gIG1lc2hQb2x5TWVyZ2UsXG4gIG1lc2hQb2x5TW9tZW50T2ZJbmVydGlhLFxuICBtZXNoUG9seVJhZGl1c1NxdWFyZWQsXG4gIG1lc2hQb2x5UmVtb3ZlLFxuICBtZXNoUG9seVNldEZsYWcsXG4gIG1lc2hQb2x5U3BsaXQsXG4gIG1lc2hQb2x5U3Ryb2tlLFxuICBtZXNoUG9seVZlcnRpY2VzLFxuICBtZXNoU2V0RmxhZyxcbn0gZnJvbSAnLi9tZXNoLmpzJztcblxuZnVuY3Rpb24gc29saWRDcmVhdGUocG9seSkge1xuICAgIHZhciBzb2xpZCA9IG51bGw7XG5cbiAgICAvLyBtYWtlIGFuIGluIGhlYXZ5IEJTUCB0cmVlIChubyBvdXQgbm9kZXMpXG4gICAgLy8gVE9ETzogZG8gc29tZXRoaW5nIG1vcmUgY29tcGxpY2F0ZWQgdGhhdCBpc24ndCBzbyB1bmJhbGFuY2VkXG5cbiAgICB2YXIgaSA9IHBvbHk7XG4gICAgZG8ge1xuICAgICAgdmFyIG5leHQgPSBpLm5leHQ7XG5cbiAgICAgIGlmIChpLmxpbmsgPT0gbnVsbCkge1xuICAgICAgICBzb2xpZCA9IHtcbiAgICAgICAgICBweDogaS54LFxuICAgICAgICAgIHB5OiBpLnksXG4gICAgICAgICAgbng6IGkueSAtIG5leHQueSxcbiAgICAgICAgICBueTogbmV4dC54IC0gaS54LFxuICAgICAgICAgIGluOiBzb2xpZCxcbiAgICAgICAgICBvdXQ6IG51bGwsXG4gICAgICAgICAgcG9seTogbnVsbFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBpID0gbmV4dDtcbiAgICB9IHdoaWxlIChpICE9IHBvbHkpO1xuXG4gICAgaWYgKHNvbGlkID09IG51bGwpIHtcbiAgICAgIC8vIGlmIGFsbCBlZGdlcyBpbiB0aGUgcG9seSBhcmUgc2hhcmVkIGVkZ2VzLCB3ZSBqdXN0IG5lZWQgYSBkdW1teSBzcGxpdFxuICAgICAgLy8gdG8gaGFuZyB0aGUgcG9seSBvZmYgb2YsIHBpY2sgdGhlIGZpcnN0IGVkZ2VcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHg6IGkueCxcbiAgICAgICAgcHk6IGkueSxcbiAgICAgICAgbng6IGkueSAtIGkubmV4dC55LFxuICAgICAgICBueTogaS5uZXh0LnggLSBpLngsXG4gICAgICAgIGluOiBudWxsLFxuICAgICAgICBvdXQ6IG51bGwsXG4gICAgICAgIHBvbHk6IHBvbHlcbiAgICAgIH07XG4gICAgfVxuXG4gICAgc29saWQucG9seSA9IHBvbHk7XG4gICAgcmV0dXJuIHNvbGlkO1xufVxuXG5mdW5jdGlvbiBzb2xpZFNldEZsYWcoc29saWQsIGZsYWcpIHtcbiAgaWYgKHNvbGlkID09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoc29saWQucG9seSAhPSBudWxsKSB7XG4gICAgbWVzaFBvbHlTZXRGbGFnKHNvbGlkLnBvbHksIGZsYWcpO1xuICB9IGVsc2Uge1xuICAgIHNvbGlkU2V0RmxhZyhzb2xpZC5pbiwgZmxhZyk7XG4gICAgc29saWRTZXRGbGFnKHNvbGlkLm91dCwgZmxhZyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc29saWRNYXJrQ29ubmVjdGVkUmVnaW9uc0hlbHBlcihzb2xpZCwgbmV4dEZsYWcpIHtcbiAgaWYgKHNvbGlkID09IG51bGwpIHtcbiAgICByZXR1cm4gbmV4dEZsYWc7XG4gIH1cblxuICBpZiAoc29saWQucG9seSAhPSBudWxsKSB7XG4gICAgaWYgKHNvbGlkLnBvbHkuZmxhZyA9PSAtMSkge1xuICAgICAgbWVzaFNldEZsYWcoc29saWQucG9seSwgbmV4dEZsYWcpO1xuICAgICAgcmV0dXJuIG5leHRGbGFnICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5leHRGbGFnO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBuZXh0RmxhZyA9IHNvbGlkTWFya0Nvbm5lY3RlZFJlZ2lvbnNIZWxwZXIoc29saWQuaW4sIG5leHRGbGFnKTtcbiAgICBuZXh0RmxhZyA9IHNvbGlkTWFya0Nvbm5lY3RlZFJlZ2lvbnNIZWxwZXIoc29saWQub3V0LCBuZXh0RmxhZyk7XG4gICAgcmV0dXJuIG5leHRGbGFnO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNvbGlkTWFya0Nvbm5lY3RlZFJlZ2lvbnMoc29saWQpIHtcbiAgc29saWRTZXRGbGFnKHNvbGlkLCAtMSk7XG4gIHJldHVybiBzb2xpZE1hcmtDb25uZWN0ZWRSZWdpb25zSGVscGVyKHNvbGlkLCAwKTtcbn1cblxuZnVuY3Rpb24gc29saWRFeHRyYWN0UmVnaW9uKHNvbGlkLCBmbGFnKSB7XG4gIGlmIChzb2xpZCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAoc29saWQucG9seSAhPSBudWxsKSB7XG4gICAgaWYgKHNvbGlkLnBvbHkuZmxhZyA9PSBmbGFnKSB7XG4gICAgICAvLyBuZWVkIHRvIHJlY3JlYXRlLCBzaW5jZSB3ZSBkb24ndCBrbm93IGlmIHdlIHdpbGwga2VlcCBoaWdoZXIgc3BsaXRzIHRoYXRcbiAgICAgIC8vIGNvdmVyIG91ciB1bmxpbmtlZCBlZGdlcyB0aGF0IG5ldmVyIGdvdCBhIHNwbGl0IG9mIHRoZWlyIG93blxuICAgICAgcmV0dXJuIHNvbGlkQ3JlYXRlKHNvbGlkLnBvbHkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGluU29saWQgPSBzb2xpZEV4dHJhY3RSZWdpb24oc29saWQuaW4sIGZsYWcpO1xuICAgIHZhciBvdXRTb2xpZCA9IHNvbGlkRXh0cmFjdFJlZ2lvbihzb2xpZC5vdXQsIGZsYWcpO1xuXG4gICAgaWYgKGluU29saWQgIT0gbnVsbCAmJiBvdXRTb2xpZCAhPSBudWxsKSB7XG4gICAgICAvLyB3ZSBuZWVkIHRoaXMgYnJhbmNoLCBjb3B5IGl0XG4gICAgICByZXR1cm4ge1xuICAgICAgICBweDogc29saWQucHgsXG4gICAgICAgIHB5OiBzb2xpZC5weSxcbiAgICAgICAgbng6IHNvbGlkLm54LFxuICAgICAgICBueTogc29saWQubnksXG4gICAgICAgIGluOiBpblNvbGlkLFxuICAgICAgICBvdXQ6IG91dFNvbGlkLFxuICAgICAgICBwb2x5OiBudWxsXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoaW5Tb2xpZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gaW5Tb2xpZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG91dFNvbGlkOyAgLy8gY291bGQgYmUgbnVsbFxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzb2xpZFRyYW5zZm9ybShzb2xpZCwgdCkge1xuICBpZiAoc29saWQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICB9XG5cbiAgc29saWRUcmFuc2Zvcm0oc29saWQuaW4sIHQpO1xuICBzb2xpZFRyYW5zZm9ybShzb2xpZC5vdXQsIHQpO1xuXG4gIGJzcFRyYW5zZm9ybShzb2xpZCwgdCk7XG5cbiAgaWYgKHNvbGlkLnBvbHkgIT0gbnVsbCkge1xuICAgIHZhciBwb2x5ID0gc29saWQucG9seTtcbiAgICB2YXIgaSA9IHBvbHk7XG5cbiAgICBkbyB7XG4gICAgICBtZXNoRWRnZVRyYW5zZm9ybShpLCB0KTtcbiAgICAgIGkgPSBpLm5leHQ7XG4gICAgfSB3aGlsZSAoaSAhPSBwb2x5KTtcbiAgfVxufVxuXG4vLyByZXR1cm4geyBjbGlwcGVkOiA8Ym9vbD4sIHNvbGlkOiA8c29saWQ+IH1cblxuZnVuY3Rpb24gc29saWRQb2x5Q2xpcChzb2xpZCwgYnNwVHJlZSkge1xuICBpZiAoYnNwVHJlZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHsgY2xpcHBlZDogZmFsc2UsIHNvbGlkOiBzb2xpZCB9O1xuICB9XG5cbiAgaWYgKHNvbGlkID09IG51bGwgfHwgc29saWQucG9seSA9PSBudWxsKSB7XG4gICAgdGhyb3cgXCJpbnZhbGlkIGFyZ3MhXCI7XG4gIH1cblxuICB2YXIgcG9seSA9IHNvbGlkLnBvbHk7XG4gIHZhciBpID0gcG9seTtcbiAgdmFyIGN1cnJTaWRlID0gYnNwU2lkZVN0YWJsZShic3BUcmVlLCBpLngsIGkueSk7XG4gIHZhciBsZWF2ZUluID0gbnVsbDtcbiAgdmFyIGxlYXZlSW5PblNwbGl0ID0gZmFsc2U7XG4gIHZhciBsZWF2ZU91dCA9IG51bGw7XG4gIHZhciBsZWF2ZU91dE9uU3BsaXQgPSBmYWxzZTtcbiAgdmFyIGFsbEluID0gdHJ1ZTtcbiAgdmFyIGFsbE91dCA9IHRydWU7XG5cbiAgZG8ge1xuICAgIHZhciBuZXh0U2lkZSA9IGJzcFNpZGVTdGFibGUoYnNwVHJlZSwgaS5uZXh0LngsIGkubmV4dC55KTtcblxuICAgIGlmIChjdXJyU2lkZSA8PSAwLjAgJiYgbmV4dFNpZGUgPiAwLjApIHtcbiAgICAgIGxlYXZlT3V0ID0gaTtcblxuICAgICAgaWYgKGN1cnJTaWRlID09IDAuMCkge1xuICAgICAgICBsZWF2ZU91dE9uU3BsaXQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjdXJyU2lkZSA+PSAwLjAgJiYgbmV4dFNpZGUgPCAwLjApIHtcbiAgICAgIGxlYXZlSW4gPSBpO1xuXG4gICAgICBpZiAoY3VyclNpZGUgPT0gMC4wKSB7XG4gICAgICAgIGxlYXZlSW5PblNwbGl0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY3VyclNpZGUgPiAwLjApIHtcbiAgICAgIGFsbE91dCA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoY3VyclNpZGUgPCAwLjApIHtcbiAgICAgIGFsbEluID0gZmFsc2U7XG4gICAgfVxuXG4gICAgY3VyclNpZGUgPSBuZXh0U2lkZTtcbiAgICBpID0gaS5uZXh0O1xuICB9IHdoaWxlIChpICE9IHBvbHkpO1xuXG4gIGlmIChhbGxJbikge1xuICAgIGlmIChic3BUcmVlLmluICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBzb2xpZFBvbHlDbGlwKHNvbGlkLCBic3BUcmVlLmluKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gcG9seSBpcyBpbiwgc28gd2UgZGlkbid0IGRvIGFueSBjbGlwcGluZ1xuICAgICAgcmV0dXJuIHsgY2xpcHBlZDogZmFsc2UsIHNvbGlkOiBzb2xpZCB9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChhbGxPdXQpIHtcbiAgICBpZiAoYnNwVHJlZS5vdXQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHNvbGlkUG9seUNsaXAoc29saWQsIGJzcFRyZWUub3V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY2xpcHBlZCBvdXQsIHBydW5lIHRoZSBzb2xpZFxuICAgICAgbWVzaFBvbHlSZW1vdmUocG9seSk7XG4gICAgICByZXR1cm4geyBjbGlwcGVkOiB0cnVlLCBzb2xpZDogbnVsbCB9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChsZWF2ZUluICE9IG51bGwgJiYgbGVhdmVPdXQgIT0gbnVsbCkgeyAvLyBjcm9zc2luZ1xuICAgIC8vIGFkZCB0aGUgY3Jvc3NpbmcgcG9pbnRzXG4gICAgaWYgKCFsZWF2ZU91dE9uU3BsaXQpIHtcbiAgICAgIGxlYXZlT3V0ID0gbWVzaEVkZ2VTcGxpdChsZWF2ZU91dCwgYnNwVHJlZSk7XG4gICAgfVxuXG4gICAgaWYgKCFsZWF2ZUluT25TcGxpdCkge1xuICAgICAgbGVhdmVJbiA9IG1lc2hFZGdlU3BsaXQobGVhdmVJbiwgYnNwVHJlZSk7XG4gICAgfVxuXG4gICAgbWVzaFBvbHlTcGxpdChsZWF2ZUluLCBsZWF2ZU91dCk7XG5cbiAgICB2YXIgaW5SZXN1bHQgPSBudWxsO1xuICAgIHZhciBvdXRSZXN1bHQgPSBudWxsO1xuXG4gICAgLy8gVE9ETzogY2FuIHdlIGF2b2lkIHRoZSBzb2xpZENyZWF0ZSBpbiB0ZWggcmVjdXJzaXZlIHN0ZXA/IGRvZXMgaXQgbWF0dGVyP1xuXG4gICAgaWYgKGJzcFRyZWUuaW4gIT0gbnVsbCkge1xuICAgICAgaW5SZXN1bHQgPSBzb2xpZFBvbHlDbGlwKHNvbGlkQ3JlYXRlKGxlYXZlSW4pLCBic3BUcmVlLmluKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5SZXN1bHQgPSB7IGNsaXBwZWQ6IGZhbHNlLCBzb2xpZDogc29saWRDcmVhdGUobGVhdmVJbikgfTtcbiAgICB9XG5cbiAgICBpZiAoYnNwVHJlZS5vdXQgIT0gbnVsbCkge1xuICAgICAgb3V0UmVzdWx0ID0gc29saWRQb2x5Q2xpcChzb2xpZENyZWF0ZShsZWF2ZU91dCksIGJzcFRyZWUub3V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWVzaFBvbHlSZW1vdmUobGVhdmVPdXQpO1xuICAgICAgb3V0UmVzdWx0ID0geyBjbGlwcGVkOiB0cnVlLCBzb2xpZDogbnVsbCB9O1xuICAgIH1cblxuICAgIGlmIChpblJlc3VsdC5jbGlwcGVkIHx8IG91dFJlc3VsdC5jbGlwcGVkKSB7XG4gICAgICAvLyBUT0RPOiBkb24ndCBjcmVhdGUgYSBzcGxpdCBpZiBpdCBkb2Vzbid0IGhhdmUgYm90aCBjaGlsZHJlblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xpcHBlZDogdHJ1ZSxcbiAgICAgICAgc29saWQ6IHtcbiAgICAgICAgICBweDogYnNwVHJlZS5weCxcbiAgICAgICAgICBweTogYnNwVHJlZS5weSxcbiAgICAgICAgICBueDogYnNwVHJlZS5ueCxcbiAgICAgICAgICBueTogYnNwVHJlZS5ueSxcbiAgICAgICAgICBpbjogaW5SZXN1bHQuc29saWQsXG4gICAgICAgICAgb3V0OiBvdXRSZXN1bHQuc29saWQsXG4gICAgICAgICAgcG9seTogbnVsbFxuICAgICAgICB9IH07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG5vIGNsaXBwaW5nLCBwdXQgdGhlIHBvbHkgYmFjayB0b2dldGhlclxuICAgICAgbWVzaFBvbHlNZXJnZShsZWF2ZUluLCBsZWF2ZU91dCk7XG5cbiAgICAgIGlmICghbGVhdmVPdXRPblNwbGl0KSB7XG4gICAgICAgIGxlYXZlT3V0ID0gbWVzaEVkZ2VNZXJnZShsZWF2ZU91dCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghbGVhdmVJbk9uU3BsaXQpIHtcbiAgICAgICAgbGVhdmVJbiA9IG1lc2hFZGdlTWVyZ2UobGVhdmVJbik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7IGNsaXBwZWQ6IGZhbHNlLCBzb2xpZDogc29saWQgfTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgXCJwb2x5IGJvdGggY3Jvc3NpbmcgYW5kIG5vdCBjcm9zc2luZyE/XCI7XG4gIH1cbn1cblxuZnVuY3Rpb24gc29saWRDbGlwKHNvbGlkLCBic3BUcmVlKSB7XG4gIGlmIChzb2xpZCA9PSBudWxsIHx8IGJzcFRyZWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB7IGNsaXBwZWQ6IGZhbHNlLCBzb2xpZDogc29saWQgfTtcbiAgfVxuXG4gIC8vIGRlc2NlbmQgc29saWQgbG9va2luZyBmb3IgcG9seWdvbnNcbiAgLy8gVE9ETzogYWRkIGJvdW5kaW5nIGNpcmNsZXMgdG8gc29saWQsIHNvIHdlIGNhbiBkZXNjZW5kIGJzcCBhdCB0aGUgc2FtZSB0aW1lXG5cbiAgaWYgKHNvbGlkLnBvbHkgIT0gbnVsbCkge1xuICAgIC8vIGZvdW5kIGEgcG9seWdvbiwgc3BsaXQgdGhhdCBwb2x5IHdoaWNoIGJ1aWxkcyBhIG5ldyBic3BUcmVlU29saWRcbiAgICAvLyB0aGVyZSBjYW4gYmUgbm8gb3RoZXIgcG9seWdvbnMgdW5kZXIgdGhpc1xuICAgIHJldHVybiBzb2xpZFBvbHlDbGlwKHNvbGlkLCBic3BUcmVlKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaW5SZXN1bHQgPSBzb2xpZENsaXAoc29saWQuaW4sIGJzcFRyZWUpO1xuICAgIHZhciBvdXRSZXN1bHQgPSBzb2xpZENsaXAoc29saWQub3V0LCBic3BUcmVlKTtcblxuICAgIGlmIChpblJlc3VsdC5zb2xpZCA9PSBudWxsICYmIG91dFJlc3VsdC5zb2xpZCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4geyBjbGlwcGVkOiB0cnVlLCBzb2xpZDogbnVsbCB9O1xuICAgIH1cblxuICAgIHNvbGlkLmluID0gaW5SZXN1bHQuc29saWQ7XG4gICAgc29saWQub3V0ID0gb3V0UmVzdWx0LnNvbGlkO1xuICAgIHJldHVybiB7IGNsaXBwZWQ6IGluUmVzdWx0LmNsaXBwZWQgfHwgb3V0UmVzdWx0LmNsaXBwZWQsIHNvbGlkOiBzb2xpZCB9O1xuICB9XG59XG5cblxuLy8gU2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUG9seWdvbiNBcmVhX2FuZF9jZW50cm9pZFxuXG5mdW5jdGlvbiBzb2xpZENlbnRyb2lkQXJlYShzb2xpZCkge1xuICBpZiAoc29saWQgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2UgaWYgKHNvbGlkLnBvbHkgIT0gbnVsbCkge1xuICAgIC8vIExlYWYgc3RlcCwgZm91bmQgYSBwb2x5Z29uXG4gICAgcmV0dXJuIG1lc2hQb2x5Q2VudHJvaWRBcmVhKHNvbGlkLnBvbHkpO1xuICB9IGVsc2Uge1xuICAgIC8vIFJlY3Vyc2l2ZSBzdGVwLCBwb3NzaWJseSBtZXJnZSB0d28gY2VudHJvaWRzXG4gICAgdmFyIGluQyA9IHNvbGlkQ2VudHJvaWRBcmVhKHNvbGlkLmluKTtcbiAgICB2YXIgb3V0QyA9IHNvbGlkQ2VudHJvaWRBcmVhKHNvbGlkLm91dCk7XG5cbiAgICBpZiAoaW5DICE9IG51bGwgJiYgb3V0QyAhPSBudWxsKSB7XG4gICAgICAvLyBhdmVyYWdlIGNlbnRyb2lkc1xuICAgICAgdmFyIGFyZWEgPSBpbkMuYXJlYSArIG91dEMuYXJlYTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogKGluQy54ICogaW5DLmFyZWEgKyBvdXRDLnggKiBvdXRDLmFyZWEpIC8gYXJlYSxcbiAgICAgICAgeTogKGluQy55ICogaW5DLmFyZWEgKyBvdXRDLnkgKiBvdXRDLmFyZWEpIC8gYXJlYSxcbiAgICAgICAgYXJlYTogYXJlYVxuICAgICAgfTtcblxuICAgIH0gZWxzZSBpZiAoaW5DICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBpbkM7XG4gICAgfSBlbHNlIGlmIChvdXRDICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBvdXRDO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc29saWRNb21lbnRPZkluZXJ0aWEoc29saWQpIHtcbiAgaWYgKHNvbGlkID09IG51bGwpIHtcbiAgICByZXR1cm4gMC4wO1xuICB9IGVsc2UgaWYgKHNvbGlkLnBvbHkgIT0gbnVsbCkge1xuICAgIC8vIExlYWYgc3RlcCwgZm91bmQgYSBwb2x5Z29uXG4gICAgcmV0dXJuIG1lc2hQb2x5TW9tZW50T2ZJbmVydGlhKHNvbGlkLnBvbHkpO1xuICB9IGVsc2Uge1xuICAgIC8vIFdlIGNhbiBqdXN0IGFkZCB0b2dldGhlciBiZWNhdXNlIGV2ZXJ5dGhpbmcgaXMgdXNpbmcgdGhlIHNhbWUgYXhpcyBvZlxuICAgIC8vIHJvdGF0aW9uICh0aGUgb3JpZ2luKVxuICAgIHJldHVybiBzb2xpZE1vbWVudE9mSW5lcnRpYShzb2xpZC5pbikgKyBzb2xpZE1vbWVudE9mSW5lcnRpYShzb2xpZC5vdXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNvbGlkUmFkaXVzU3F1YXJlZChzb2xpZCkge1xuICBpZiAoc29saWQgPT0gbnVsbCkge1xuICAgIHJldHVybiAwLjA7XG4gIH1cblxuICBpZiAoc29saWQucG9seSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIG1lc2hQb2x5UmFkaXVzU3F1YXJlZChzb2xpZC5wb2x5KTtcbiAgfVxuXG4gIHJldHVybiBNYXRoLm1heChzb2xpZFJhZGl1c1NxdWFyZWQoc29saWQuaW4pLCBzb2xpZFJhZGl1c1NxdWFyZWQoc29saWQub3V0KSk7XG59XG5cbmZ1bmN0aW9uIHNvbGlkVmVydGljZXNIZWxwZXIoc29saWQsIHZlcnRleEFycmF5KSB7XG4gIGlmIChzb2xpZCA9PSBudWxsKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHNvbGlkLnBvbHkgIT0gbnVsbCkge1xuICAgIG1lc2hQb2x5VmVydGljZXMoc29saWQucG9seSwgdmVydGV4QXJyYXkpO1xuICB9IGVsc2Uge1xuICAgIHNvbGlkVmVydGljZXNIZWxwZXIoc29saWQuaW4sIHZlcnRleEFycmF5KTtcbiAgICBzb2xpZFZlcnRpY2VzSGVscGVyKHNvbGlkLm91dCwgdmVydGV4QXJyYXkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNvbGlkVmVydGljZXMoc29saWQpIHtcbiAgdmFyIHZlcnRleEFycmF5ID0gW107XG4gIHNvbGlkVmVydGljZXNIZWxwZXIoc29saWQsIHZlcnRleEFycmF5KTtcbiAgcmV0dXJuIHZlcnRleEFycmF5O1xufVxuXG5mdW5jdGlvbiBzb2xpZEZpbGwoc29saWQsIGN0eCkge1xuICBpZiAoc29saWQgPT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfSBlbHNlIGlmIChzb2xpZC5wb2x5KSB7XG4gICAgbWVzaFBvbHlGaWxsKHNvbGlkLnBvbHksIGN0eCk7XG4gIH0gZWxzZSB7XG4gICAgc29saWRGaWxsKHNvbGlkLmluLCBjdHgpO1xuICAgIHNvbGlkRmlsbChzb2xpZC5vdXQsIGN0eCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc29saWRTdHJva2Uoc29saWQsIGN0eCkge1xuICBpZiAoc29saWQgPT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfSBlbHNlIGlmIChzb2xpZC5wb2x5KSB7XG4gICAgbWVzaFBvbHlTdHJva2Uoc29saWQucG9seSwgY3R4KTtcbiAgfSBlbHNlIHtcbiAgICBzb2xpZFN0cm9rZShzb2xpZC5pbiwgY3R4KTtcbiAgICBzb2xpZFN0cm9rZShzb2xpZC5vdXQsIGN0eCk7XG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgc29saWRDcmVhdGUsXG4gIHNvbGlkQ2VudHJvaWRBcmVhLFxuICBzb2xpZENsaXAsXG4gIHNvbGlkRXh0cmFjdFJlZ2lvbixcbiAgc29saWRGaWxsLFxuICBzb2xpZE1hcmtDb25uZWN0ZWRSZWdpb25zLFxuICBzb2xpZE1vbWVudE9mSW5lcnRpYSxcbiAgc29saWRSYWRpdXNTcXVhcmVkLFxuICBzb2xpZFRyYW5zZm9ybSxcbiAgc29saWRWZXJ0aWNlcyxcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvc29saWQuanMiLCIvLyBwbGF5ZXIuanNcbi8vXG4vLyBDb3B5cmlnaHQgQ2hhcmxlcyBEaWNrIDIwMTVcbi8vXG4vLyBDb250cm9scyBhIHBsYXllciBpbiB0aGUgd29ybGQgc2ltdWxhdGVkIGJ5IHBoeXMuanNcbi8vIFRPRE86IGJpbmRzIGNvbnRyb2xzXG4vLyBUT0RPOiB0cmFja3MgZGFtYWdlXG5cbmltcG9ydCB7XG4gIGJzcFRyZWVUcmFuc2Zvcm1DbG9uZSxcbn0gZnJvbSAnLi9ic3AuanMnO1xuXG5pbXBvcnQge1xuICBjYW1Qb3NpdGlvbixcbn0gZnJvbSAnLi9jYW1lcmEuanMnO1xuXG5pbXBvcnQge1xuICBtZXNoQ3JlYXRlLFxufSBmcm9tICcuL21lc2guanMnO1xuXG5pbXBvcnQge1xuICBwaHlzUGFydGljbGVQcm9wZXJ0aWVzQ3JlYXRlLFxuICBwaHlzUG9pbnRJbnNpZGVCb2RpZXMsXG4gIHBoeXNQYXJ0aWNsZUNyZWF0ZSxcbiAgcGh5c0JvZHlDcmVhdGUsXG4gIHBoeXNCb2R5QXBwbHlBbmd1bGFySW1wdWxzZSxcbiAgcGh5c0JvZHlBcHBseUxpbmVhckltcHVsc2UsXG4gIHBoeXNCb2R5UHJvcGVydGllc0NyZWF0ZSxcbiAgcGh5c0JvZHlWZWxvY2l0eSxcbiAgcGh5c0NsaXBCb2RpZXMsXG59IGZyb20gJy4vcGh5cy5qcyc7XG5cbmltcG9ydCB7XG4gIHNvbGlkQ3JlYXRlLFxufSBmcm9tICcuL3NvbGlkLmpzJztcblxuaW1wb3J0IHtcbiAgdHJhbnNmb3JtVHJhbnNsYXRlQ3JlYXRlLFxufSBmcm9tICcuL3RyYW5zZm9ybS5qcyc7XG5cbnZhciBic3BUZXN0U3F1YXJlID0geyBweDogMCwgcHk6IDAsIG54OiAxLCBueTogMSxcbiAgICBpbjogeyBweDogMCwgcHk6IDE2LCBueDogMCwgbnk6IDEsXG4gICAgICAgIGluOiBudWxsLFxuICAgICAgICBvdXQ6IHsgcHg6IDE2LCBweTogMCwgbng6IDEsIG55OiAwLCBpbjogbnVsbCwgb3V0Om51bGwgfVxuICAgICAgICB9LFxuICAgIG91dDogeyBweDogMCwgcHk6IC0xNiwgbng6IDAsIG55OiAtMSxcbiAgICAgICAgaW46IG51bGwsXG4gICAgICAgIG91dDogeyBweDogLTE2LCBweTogMCwgbng6IC0xLCBueTogMCwgaW46IG51bGwsIG91dDogbnVsbCB9XG4gICAgICAgIH1cbiAgICB9O1xuXG5mdW5jdGlvbiBwbGF5ZXJDcmVhdGUocGh5cywgZCwgzrgsIGlucHV0LCBjYW1lcmEpIHtcbiAgdmFyIHN0YXRlID0ge1xuICAgIGhlYWx0aDogMTAwLjAsXG4gICAgY29vbGRvd246IDAuMCxcbiAgfTtcblxuICB2YXIgcmVndWxhclBhcnRpY2xlID0gcGh5c1BhcnRpY2xlUHJvcGVydGllc0NyZWF0ZSg5LjAsIDAuOSwgbnVsbCwgbnVsbCk7XG5cbiAgdmFyIGV4cGxvc2l2ZVBhcnRpY2xlID0gcGh5c1BhcnRpY2xlUHJvcGVydGllc0NyZWF0ZSgxMDAuMCwgMC45LFxuICAgIGZ1bmN0aW9uIGV4cGxvc2l2ZVBhcnRpY2xlb25jb2xsaWRlKHBhcnRpY2xlLCBib2R5LCBuKSB7XG4gICAgICB2YXIgdCA9IHRyYW5zZm9ybVRyYW5zbGF0ZUNyZWF0ZShwYXJ0aWNsZS5kLngsIHBhcnRpY2xlLmQueSk7XG4gICAgICB2YXIgYnNwID0gYnNwVHJlZVRyYW5zZm9ybUNsb25lKGJzcFRlc3RTcXVhcmUsIHQpO1xuXG4gICAgICAvLyBraWxsIHRoZSBwYXJ0aWNsZVxuICAgICAgcGFydGljbGUudCA9IDA7XG5cbiAgICAgIC8vIGFkZCBleHBsb3Npb24gZGVicmlzXG4gICAgICBmb3IgKHZhciB4ID0gLTE1LjA7IHggPD0gMTUuMDsgeCArPSAzLjApIHtcbiAgICAgICAgZm9yICh2YXIgeSA9IC0xNS4wOyB5IDw9IDE1LjA7IHkgKz0gMy4wKSB7XG4gICAgICAgICAgdmFyIHAgPSB7IHg6IHBhcnRpY2xlLmQueCArIHgsIHk6IHBhcnRpY2xlLmQueSArIHkgfTtcblxuICAgICAgICAgIGlmIChwaHlzUG9pbnRJbnNpZGVCb2RpZXMocGh5cywgcCkpIHtcbiAgICAgICAgICAgIHZhciB2ID0geyB4OiAwLjAsIHk6IDAuMCB9O1xuICAgICAgICAgICAgcGh5c0JvZHlWZWxvY2l0eShib2R5LCBwLCB2KTtcblxuICAgICAgICAgICAgdi54ICs9ICh4IC0gbi54ICogMzIpICogMi4wO1xuICAgICAgICAgICAgdi55ICs9ICh5IC0gbi55ICogMzIpICogMi4wO1xuXG4gICAgICAgICAgICBwaHlzUGFydGljbGVDcmVhdGUoXG4gICAgICAgICAgICAgIHBoeXMsXG4gICAgICAgICAgICAgIHAsXG4gICAgICAgICAgICAgIHYsXG4gICAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgICAgcmVndWxhclBhcnRpY2xlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcGh5c0NsaXBCb2RpZXMocGh5cywgYnNwKTtcbiAgICB9LFxuICAgIG51bGxcbiAgKTtcblxuICB2YXIgcHJvcHMgPSBwaHlzQm9keVByb3BlcnRpZXNDcmVhdGUoXG4gICAgMS4wLCAgLy8gZGVuc2l0eVxuICAgIDEuMCwgIC8vIGNvZWZmaWNpZW50IG9mIHJlc3RpdHV0aW9uXG4gICAgZnVuY3Rpb24gcGxheWVyT25jb2xsaWRlcGFydGljbGUoYm9keSwgcGFydGljbGUsIG4sIGopIHtcbiAgICAgIC8vIFRPRE86IHRha2UgZGFtYWdlXG4gICAgfSxcbiAgICBmdW5jdGlvbiBwbGF5ZXJPbmNvbGxpZGVib2R5KGJvZHksIG90aGVyQm9keSwgcCwgbiwgaikge1xuICAgICAgLy8gVE9ETzogdGFrZSBkYW1hZ2VcbiAgICB9LFxuICAgIGZ1bmN0aW9uIHBsYXllck9udGltZXN0ZXAoYm9keSwgZHQpIHtcbiAgICAgIHZhciBzcGVlZCA9IE1hdGguc3FydChib2R5LnYueCAqIGJvZHkudi54ICsgYm9keS52LnkgKiBib2R5LnYueSk7XG5cbiAgICAgIGNhbVBvc2l0aW9uKFxuICAgICAgICBjYW1lcmEsXG4gICAgICAgIHsgeDogYm9keS5kLnggKyBib2R5LnYueCAqIDAuMjUsIHk6IGJvZHkuZC55ICsgYm9keS52LnkgKiAwLjI1IH0sXG4gICAgICAgIDEuMCAvICgxLjAgKyBzcGVlZCAvIDI1Ni4wKVxuICAgICAgKTtcblxuICAgICAgLy8gb3JpZW50YXRpb24gY29udHJvbHNcbiAgICAgIGlmIChpbnB1dC5sZWZ0ID09IHRydWUpIHtcbiAgICAgICAgaWYgKGJvZHkuz4kgPCA2LjI0KSB7XG4gICAgICAgICAgLy8gVE9ETzogUElEIGNvbnRyb2xsZXI/XG4gICAgICAgICAgcGh5c0JvZHlBcHBseUFuZ3VsYXJJbXB1bHNlKGJvZHksIDIwMDAwLjApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGlucHV0LnJpZ2h0ID09IHRydWUpIHtcbiAgICAgICAgaWYgKGJvZHkuz4kgPiAtNi4yNCkge1xuICAgICAgICAgIHBoeXNCb2R5QXBwbHlBbmd1bGFySW1wdWxzZShib2R5LCAtMjAwMDAuMCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChib2R5Ls+JID4gMC4wKSB7XG4gICAgICAgICAgcGh5c0JvZHlBcHBseUFuZ3VsYXJJbXB1bHNlKGJvZHksIC0yMDAwMC4wKTtcbiAgICAgICAgfSBlbHNlIGlmIChib2R5Ls+JIDwgMC4wKSB7XG4gICAgICAgICAgcGh5c0JvZHlBcHBseUFuZ3VsYXJJbXB1bHNlKGJvZHksIDIwMDAwLjApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHRocm90dGxlIGNvbnRyb2xzXG4gICAgICBpZiAoaW5wdXQudGhyb3R0bGUgPT0gdHJ1ZSkge1xuICAgICAgICB2YXIgbiA9IHtcbiAgICAgICAgICB4OiBNYXRoLmNvcyhib2R5Ls64KSxcbiAgICAgICAgICB5OiBNYXRoLnNpbihib2R5Ls64KSxcbiAgICAgICAgfTtcblxuICAgICAgICBwaHlzQm9keUFwcGx5TGluZWFySW1wdWxzZShib2R5LCBuLCA1MDAwLjApO1xuICAgICAgfVxuXG4gICAgICAvLyBmaXJlIGNvbnRyb2xzXG4gICAgICBpZiAoc3RhdGUuY29vbGRvd24gPiAwLjApIHtcbiAgICAgICAgc3RhdGUuY29vbGRvd24gLT0gZHQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbnB1dC5maXJlID09IHRydWUgJiYgc3RhdGUuY29vbGRvd24gPD0gMC4wKSB7XG4gICAgICAgIHN0YXRlLmNvb2xkb3duICs9IDAuMTtcblxuICAgICAgICB2YXIgbiA9IHtcbiAgICAgICAgICB4OiBNYXRoLmNvcyhib2R5Ls64KSxcbiAgICAgICAgICB5OiBNYXRoLnNpbihib2R5Ls64KSxcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgZCA9IHtcbiAgICAgICAgICB4OiBib2R5LmQueCArIG4ueCAqIDI0LjAsXG4gICAgICAgICAgeTogYm9keS5kLnkgKyBuLnkgKiAyNC4wLFxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB2ID0ge1xuICAgICAgICAgIHg6IGJvZHkudi54ICsgbi54ICogMjAwLjAsXG4gICAgICAgICAgeTogYm9keS52LnkgKyBuLnkgKiAyMDAuMCxcbiAgICAgICAgfTtcblxuICAgICAgICBwaHlzUGFydGljbGVDcmVhdGUocGh5cywgZCwgdiwgMy4wLCBleHBsb3NpdmVQYXJ0aWNsZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBmdW5jdGlvbiBwbGF5ZXJPbmNsaXAoYm9keSwgY2xpcHBlZEJvZHksIGJzcCkge1xuICAgICAgLy8gVE9ETzogZGllP1xuICAgIH1cbiAgKTtcblxuICB2YXIgbWVzaCA9IG1lc2hDcmVhdGUoW3sgeDogLTE2LjAsIHk6IC0xNi4wIH0sIHsgeDogMTYuMCwgeTogMC4wIH0sIHsgeDogLTE2LjAsIHk6IDE2LjAgfV0pXG4gIHZhciBzb2xpZCA9IHNvbGlkQ3JlYXRlKG1lc2gpO1xuXG4gIHZhciBib2R5ID0gcGh5c0JvZHlDcmVhdGUoXG4gICAgcGh5cyxcbiAgICBzb2xpZCxcbiAgICBkLCDOuCxcbiAgICB7IHg6IDAuMCwgeTogMC4wIH0sIDAuMCxcbiAgICBwcm9wcyk7XG5cbiAgLy8gTkI6IHBsYXllciBkb2Vzbid0IGluY2x1ZGUgdGhlIGJvZHkgc2luY2UgaXQncyBub3QgZ3VhcmVudGVlZCB0byBiZSB0aGVcbiAgLy8gc2FtZSBmcm9tIGZyYW1lIHRvIGZyYW1lIChwaHlzIGNhbiByZXVzZSB0aGVtIGV0Yy4pXG4gIHJldHVybiB7XG4gICAgc3RhdGU6IHN0YXRlLFxuICAgIGNhbWVyYTogY2FtZXJhLFxuICB9O1xufVxuXG5leHBvcnQge1xuICBwbGF5ZXJDcmVhdGUsXG4gIGJzcFRlc3RTcXVhcmUsXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3BsYXllci5qcyIsIi8vIERldGVybWluaXN0aWMgcmVjb3JkZXIgbG9nXG4vLyBjYXB0dXJlcyBleHRlcm5hbCBzdGF0ZSBjaGFuZ2VzLCBhbGxvd3MgdGhlbSB0byBiZSByZXBsYXllZFxuLy8gd3JhcHMgYWxsIGlucHV0cyBpbnRvIHBoeXMgc28gdGhhdCBpdCBjYW4gYmUgcmVwbGF5ZWRcblxuLy8gY2xpY2tzIGlzIGFsbCB3ZSBjYXJlIGFib3V0LiBSZWNvcmQgaW4gd29ybGQgY29vcmRpbmF0ZXMgdG8gbWFrZSBpdCB2aWV3IGluZGVwZW5kZW50XG5cbi8vIFRPRE86IGZpZ3VyZSBvdXQgaG93IHRvIGRvIGlucHV0IHdpdGggbGVzcyBhY3Rpb24gYXQgYSBkaXN0YW5jZVxuLy8gIHdlIGNhbid0IGhhbmRsZSBrZXlwcmVzc2VzIGR1cmluZyByZXBsYXkgbm93Li4uXG5cbmltcG9ydCB7XG4gIHBoeXNUaW1lU3RlcCxcbn0gZnJvbSAnLi9waHlzLmpzJztcblxuZnVuY3Rpb24gcmVjb3JkZXJDcmVhdGUocGh5cywgaW5wdXQsIGxvZ1RleHQsIGZyYW1lVGV4dCkge1xuICByZXR1cm4ge1xuICAgIHBoeXM6IHBoeXMsXG4gICAgZnJhbWU6IDAsXG4gICAgaW5wdXQ6IGlucHV0LFxuICAgIGxhc3RGcmFtZUlucHV0OiBKU09OLnN0cmluZ2lmeShpbnB1dCksXG4gICAgbG9nVGV4dDogbG9nVGV4dCxcbiAgICBmcmFtZVRleHQ6IGZyYW1lVGV4dCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVjb3JkZXJUaW1lU3RlcChyZWNvcmRlcikge1xuICAvLyByZWNvcmQgaW5wdXRcbiAgdmFyIHRoaXNGcmFtZUlucHV0ID0gSlNPTi5zdHJpbmdpZnkocmVjb3JkZXIuaW5wdXQpO1xuXG4gIGlmICh0aGlzRnJhbWVJbnB1dCAhPT0gcmVjb3JkZXIubGFzdEZyYW1lSW5wdXQpIHtcbiAgICByZWNvcmRlci5sb2dUZXh0LnZhbHVlICs9ICcsXFxuJyArIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGZyYW1lOiByZWNvcmRlci5mcmFtZSxcbiAgICAgIGlucHV0OiByZWNvcmRlci5pbnB1dFxuICAgIH0pO1xuICB9XG5cbiAgcGh5c1RpbWVTdGVwKHJlY29yZGVyLnBoeXMpO1xuICByZWNvcmRlci5sYXN0RnJhbWVJbnB1dCA9IHRoaXNGcmFtZUlucHV0O1xuICByZWNvcmRlci5mcmFtZSsrO1xuICByZWNvcmRlci5mcmFtZVRleHQudmFsdWUgPSByZWNvcmRlci5mcmFtZS50b1N0cmluZygpO1xufVxuXG5mdW5jdGlvbiByZWNvcmRlclJlcGxheShyZWNvcmRlciwgcmVuZGVyKSB7XG4gIHZhciBpbnB1dExvZyA9IEpTT04ucGFyc2UoJ1snICsgcmVjb3JkZXIubG9nVGV4dC52YWx1ZSArICddJyk7XG4gIHZhciByZXBsYXlUb0ZyYW1lID0gTnVtYmVyKHJlY29yZGVyLmZyYW1lVGV4dC52YWx1ZSk7XG5cbiAgcmVjb3JkZXIubG9nVGV4dC5pbm5lckhUTUwgPSAne1wiZnJhbWVcIjowLFwiaW5wdXRcIjp7XCJsZWZ0XCI6ZmFsc2UsXCJyaWdodFwiOmZhbHNlLFwidGhyb3R0bGVcIjpmYWxzZSxcImZpcmVcIjpmYWxzZX19JztcbiAgcmVjb3JkZXIuZnJhbWUgPSAwO1xuICByZWNvcmRlci5mcmFtZVRleHQudmFsdWUgPSAnMCc7XG5cbiAgZnVuY3Rpb24gcmVjb3JkZXJSZXBsYXllcigpIHtcbiAgICB3aGlsZSAoaW5wdXRMb2cubGVuZ3RoID4gMCAmJiBpbnB1dExvZ1swXS5mcmFtZSA9PSByZWNvcmRlci5mcmFtZSkge1xuICAgICAgdmFyIG5ld0lucHV0ID0gaW5wdXRMb2dbMF0uaW5wdXQ7XG4gICAgICByZWNvcmRlci5pbnB1dC5sZWZ0ID0gbmV3SW5wdXQubGVmdDtcbiAgICAgIHJlY29yZGVyLmlucHV0LnJpZ2h0ID0gbmV3SW5wdXQucmlnaHQ7XG4gICAgICByZWNvcmRlci5pbnB1dC50aHJvdHRsZSA9IG5ld0lucHV0LnRocm90dGxlO1xuICAgICAgcmVjb3JkZXIuaW5wdXQuZmlyZSA9IG5ld0lucHV0LmZpcmU7XG4gICAgICBpbnB1dExvZy5zaGlmdCgpO1xuICAgIH1cblxuICAgIHJlY29yZGVyVGltZVN0ZXAocmVjb3JkZXIpO1xuICAgIHJlbmRlcigpO1xuXG4gICAgaWYgKHJlY29yZGVyLmZyYW1lIDwgcmVwbGF5VG9GcmFtZSkge1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlY29yZGVyUmVwbGF5ZXIpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChyZXBsYXlUb0ZyYW1lID4gMCkge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZWNvcmRlclJlcGxheWVyKTtcbiAgfVxufVxuXG5leHBvcnQge1xuICByZWNvcmRlckNyZWF0ZSxcbiAgcmVjb3JkZXJSZXBsYXksXG4gIHJlY29yZGVyVGltZVN0ZXAsXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3JlY29yZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==