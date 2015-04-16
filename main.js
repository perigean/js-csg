var camera;
var log;


var errorRepro = [
    { x:46, y: -53},
    { x:-69, y: 70 },
    { x:-74, y: 70 },
    { x:-76, y: 70 },
    { x:-76, y: 70 },
    { x:-77, y: 70 },
    { x:-77, y: 70 },
    { x:-77, y: 70 },
    { x:-77, y: 70 },
    { x:-77, y: 67 },
    { x:-77, y: 58 },
    { x:-77, y: 58 },
    { x:-67, y: 57 },
    { x:-59, y: 57 },
    { x:-50, y: 57 },
    { x:-18, y: 32 },
    { x:-18, y: 18 },
    { x:-19, y: 14 },
    { x:-19, y: 6 },
    { x:2, y: 2 },
    { x:8, y: 2 },
    { x:0, y: -16 },
    { x:-26, y: -16 },
    { x:-73, y: 21 },
    { x:-77, y: 52 },
    { x:-22, y: 56 },
    { x:18, y: 55 },
    { x:26, y: 33 },
    { x:14, y: 33 },
    { x:12, y: 39 },
    { x:11, y: 52 },
    { x:8, y: 63 },
    { x:0, y: 70 },
    { x:-10, y: 71 },
    { x:-18, y: 71 },
    { x:-32, y: 71 },
    { x:-56, y: 71 },
    { x:-67, y: 74 },
    { x:-67, y: 75 },
    { x:-80, y: 93 },
    { x:-54, y: 94 },
    { x:-6, y: 94 },
    { x:-6, y: 94 },
    { x:-26, y: 94 },
    { x:-26, y: 94 },
    { x:-45, y: 95 },
    { x:-46, y: 95 },
    { x:67, y: 90 },
    { x:62, y: 90 },
    { x:44, y: 90 },
    { x:44, y: 90 },
    { x:44, y: 90 },
    { x:38, y: 90 },
    { x:29, y: 90 },
    { x:27, y: 90 },
    { x:47, y: 81 },
    { x:47, y: 81 },
    { x:48, y: 80 },
    { x:48, y: 74 },
    { x:48, y: 71 },
    { x:48, y: 71 },
    { x:48, y: 71 },
    { x:49, y: 69 },
    { x:50, y: 65 },
    { x:52, y: 62 },
    { x:55, y: 62 },
    { x:55, y: 62 },
    { x:56, y: 57 },
    { x:59, y: 54 },
    { x:60, y: 53 },
    { x:67, y: 46 },
    { x:67, y: 42 },
    { x:67, y: 41 },
    { x:67, y: 36 },
    { x:67, y: 32 },
    { x:67, y: 28 },
    { x:67, y: 28 },
    { x:74, y: 14 },
    { x:77, y: 11 },
    { x:77, y: 5 },
    { x:72, y: 5 },
    { x:68, y: 3 },
    { x:67, y: 3 },
    { x:66, y: 2 },
    { x:65, y: 2 },
    { x:53, y: -2 } ];

var bspTestSquare = { px: 0, py: 0, nx: 1, ny: 1,
    in: { px: 0, py: 16, nx: 0, ny: 1,
        out: { px: 16, py: 0, nx: 1, ny: 0 }
        },
    out: { px: 0, py: -16, nx: 0, ny: -1,
        out: { px: -16, py: 0, nx: -1, ny: 0 }
        }
    };

var bspTestDiag = { px: 0, py: 0, nx: 1, ny: 1 };

var bspTestWedge = { px: 0, py: 0, nx: 1, ny: 1,
    in: null,
    out: { px: 0, py: 0, nx: 1, ny: -1, in: null, out: null }
    };

var polyTestSquare = [
    { x: -128, y: -128, exterior: true },
    { x: 128, y: -128, exterior: true },
    { x: 128, y: 128, exterior: true },
    { x: -128, y: 128, exterior: true } ];

var polyTestTriangle = [
    { x: -128, y: -128, exterior: true },
    { x: 128, y: -128, exterior: true },
    { x: -128, y: 128, exterior: true } ];

function polyPath(poly, ctx) {
    ctx.beginPath();
    ctx.moveTo(poly[0].x, poly[0].y);
    for (var i = 1; i < poly.length; i++) {
        ctx.lineTo(poly[i].x, poly[i].y);
    }
    ctx.closePath();
}

function bspSolidFill(bsp, ctx) {
    if (bsp == null) {
        return;
    } else if (bsp.poly) {
        polyPath(bsp.poly, ctx);
        ctx.fill();
    } else {
        bspSolidFill(bsp.in, ctx);
        bspSolidFill(bsp.out, ctx);
    }
}

function bspSolidStroke(bsp, ctx) {
    if (bsp == null) {
        return;
    } else if (bsp.poly) {
        polyPath(bsp.poly, ctx);
        ctx.stroke();
    } else {
        bspSolidStroke(bsp.in, ctx);
        bspSolidStroke(bsp.out, ctx);
    }
}

function splitListPath(splits, ctx) {
    ctx.beginPath();
    for (var i = 0; i < splits.length; i++) {
        var edge = splits[i];
        var px = (edge.a.x + edge.b.x) * 0.5;
        var py = (edge.a.y + edge.b.y) * 0.5;
        var nx = edge.a.y - edge.b.y;
        var ny = edge.b.x - edge.a.x;
        var l = Math.sqrt(nx * nx + ny * ny);
        nx /= l;
        ny /= l;
        
        ctx.moveTo(edge.a.x, edge.a.y);
        ctx.lineTo(edge.b.x, edge.b.y);
        ctx.moveTo(px, py);
        ctx.lineTo(px + nx * 8.0, py + ny * 8.0);
    }
}

var solid;

function draw() {
    var ctx = camera.ctx;
    
    ctx.fillStyle = 'lightblue';
    bspSolidFill(solid, ctx);
    
    ctx.strokeStyle = 'black';
    bspSolidStroke(solid, ctx);
    
    //var splits = [];
    //bspSolidGetSplitList(solid, splits, 1000.0);
    
    //splitListPath(splits, ctx);
    //ctx.stroke();
}

function main() {
    var canvas = document.getElementById('canvas');
    camera = camCreate(canvas);
    log = document.getElementById('log');

    solid = bspSolidCreate(polyTestSquare);

    function subShape(p) {
        var bsp = bspTreeTranslate(bspTestSquare, p);
        
        var temp = inList;
        inList = [];
        
        bspIntersectPolyList(bsp, temp, inList, outList);
    }
    
    camClear(camera);
    camTransform(camera);
    draw();
    
    canvas.onclick = function (evt) {
        var p = camScreenToWorld(camera, evt.offsetX, evt.offsetY);
        log.innerHTML += "(" + p.x + ", " + p.y + ") <br />";
        
        var bsp = bspTreeTranslate(bspTestSquare, p);
        
        solid = bspTreeSolidClip(bsp, solid);
        
        camClear(camera);
        camTransform(camera);
        draw();
    };
    
};
