


function camCreate(canvas) {
    var ctx = canvas.getContext('2d');
    return {
        ctx: ctx,
        x: 0,
        y: 0,
        zoom: 1.0,
        screenWidth: canvas.width,
        screenHeight: canvas.height,
    };
}

function camTransform(camera) {
    var x = camera.screenWidth * 0.5 - camera.x;
    var y = camera.screenHeight * 0.5 - camera.y;

    camera.ctx.setTransform(camera.zoom, 0, 0, camera.zoom, x, y);
}

function camScreenToWorld(camera, x, y) {
    return {
        x: ((x - camera.screenWidth * 0.5) / camera.zoom) + camera.x,
        y: ((y - camera.screenHeight * 0.5) / camera.zoom) + camera.y
    };
}

function camClear(camera) {
    camera.ctx.setTransform(1, 0, 0, 1, 0, 0);
    camera.ctx.clearRect(0, 0, camera.screenWidth, camera.screenHeight);
}

