var camera;
var log;

function main() {
    var canvas = document.getElementById('canvas');
    camera = camCreate(canvas);
    log = document.getElementById('log');

    camClear(camera);
    camTransform(camera);
    meshDraw(meshTest, camera.ctx);
    
    canvas.onclick = function (evt) {
        var p = camScreenToWorld(camera, evt.offsetX, evt.offsetY);

        log.innerHTML += "(" + p.x + ", " + p.y + ") <br />";
        
        var bsp = bspTreeTranslate(bspTestDiag, p.x, p.y);
        
        meshSplitBspTree(meshTest, bsp);
        
        camClear(camera);
        camTransform(camera);
        meshDraw(meshTest, camera.ctx);
    };
};
