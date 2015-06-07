var camera;
var log;

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
    { x: 0, y: 0, exterior: true },
    { x: 128, y: 0, exterior: true },
    { x: 128, y: 128, exterior: true },
    { x: 0, y: 128, exterior: true } ];

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

var phys;

function main() {
    var canvas = document.getElementById('canvas');
    camera = camCreate(canvas);
    log = document.getElementById('log');

    phys = physCreate();
    physAddShape(phys, bspSolidCreate(polyTestSquare), { x: 0.0, y: 0.0 }, 0.0 /*Math.PI * 0.25*/);

    camClear(camera);
    physDraw(phys, camera);

    canvas.onclick = function (evt) {
        var p = { x: evt.offsetX, y: evt.offsetY };
        camScreenToWorld(camera, p);

        log.innerHTML += "(" + p.x + ", " + p.y + ") <br />";

        var t = transformTranslateCreate(p.x, p.y);
        var bsp = bspTreeTransformClone(bspTestSquare, t);

        physClipBodies(phys, bsp);

        camClear(camera);
        physDraw(phys, camera);
    };

};
