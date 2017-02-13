// camera.js
//
// Copyright Charles Dick 2015

import {
  transformCompose,
  transformCreate,
  transformInvert,
  transformPoint,
  transformScale,
  transformStretch,
  transformStretchCreate,
  transformTranslate,
} from './transform.js'

function camCreate(canvas, drawCallback) {
  var ctx = canvas.getContext('2d');

  var t = transformStretchCreate(1.0, -1.0);  // flip y axis
  t = transformTranslate(t, canvas.width * 0.5, canvas.height * 0.5);

  ctx.setTransform(t.ix, t.iy, t.jx, t.jy, t.dx, t.dy);

  var cam = {
    canvas: canvas,
    ctx: ctx,
    worldToCamera: t,
    modelToWorld: [transformCreate()],
    cameraToModel: transformInvert(t),
    mouseModel: { x: 0.0, y: 0.0 },
    mouseCamera: { x: 0.0, y: 0.0 }
  };

  canvas.addEventListener('mousewheel', function cameraOnMouseWheel(evt) {
    if (evt.shiftKey) {
      var scale = Math.log((-evt.deltaY / 500.0) + Math.E);
      var worldToCamera = cam.worldToCamera;

      // centre camera on mouse position
      worldToCamera = transformTranslate(worldToCamera, -evt.offsetX, -evt.offsetY);
      worldToCamera = transformScale(worldToCamera, scale);
      worldToCamera = transformTranslate(worldToCamera, evt.offsetX, evt.offsetY);

      cam.worldToCamera = worldToCamera;
    } else {
      var delta = { x: -evt.deltaX, y: -evt.deltaY };
      cam.worldToCamera = transformTranslate(cam.worldToCamera, delta.x, delta.y);
    }

    camRecompose(cam);
    drawCallback(cam);

    evt.preventDefault();
  });

  canvas.addEventListener('mousemove', function cameraOnMouseMove(evt) {
    cam.mouseCamera.x = evt.offsetX;
    cam.mouseCamera.y = evt.offsetY;
    cam.mouseModel.x = evt.offsetX;
    cam.mouseModel.y = evt.offsetY;
    transformPoint(cam.cameraToModel, cam.mouseModel);

    drawCallback(cam);
  });

  drawCallback(cam);
  return cam;
}

function camRecompose(cam) {
  var modelToWorld = cam.modelToWorld[cam.modelToWorld.length - 1];
  var worldToCamera = cam.worldToCamera;
  var modelToCamera = transformCompose(modelToWorld, worldToCamera);
  cam.cameraToModel = transformInvert(modelToCamera);
  cam.ctx.setTransform(
    modelToCamera.ix, modelToCamera.iy,
    modelToCamera.jx, modelToCamera.jy,
    modelToCamera.dx, modelToCamera.dy);

  cam.mouseModel.x = cam.mouseCamera.x;
  cam.mouseModel.y = cam.mouseCamera.y;
  transformPoint(cam.cameraToModel, cam.mouseModel);
}

function camPosition(cam, d, scale) {
  var canvas = cam.canvas;
  var t = transformCreate();
  t = transformStretch(t, 1.0, -1.0);  // flip y axis
  t = transformTranslate(t, canvas.width * 0.5, canvas.height * 0.5);
  t = transformTranslate(t, -d.x, d.y);
  cam.worldToCamera = t;
  camRecompose(cam);
}

function camPushTransform(cam, transform) {
  var oldModelToWorld = cam.modelToWorld[cam.modelToWorld.length - 1];
  var newModelToWorld = transformCompose(transform, oldModelToWorld);

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
  transformPoint(cam.cameraToModel, p);
}

function camClear(cam) {
  cam.ctx.setTransform(1, 0, 0, 1, 0, 0);
  cam.ctx.clearRect(0, 0, cam.canvas.width, cam.canvas.height);

  var t = transformCompose(cam.modelToWorld[cam.modelToWorld.length - 1], cam.worldToCamera);
  cam.ctx.setTransform(t.ix, t.iy, t.jx, t.jy, t.dx, t.dy);
}

export {
  camCreate,
  camCameraToModel,
  camClear,
  camPopTransform,
  camPosition,
  camPushTransform,
};
