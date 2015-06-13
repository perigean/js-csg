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

var mesh = meshCreate([{ x: 0, y: 0 },{ x: 128, y: 0 },{ x: 128, y: 128 },{ x: 0, y: 128 }]);


function main() {
    var canvas = document.getElementById('canvas');
    camera = camCreate(canvas);
    log = document.getElementById('log');

    phys = physCreate();
    physAddShape(phys, solidCreate(mesh), { x: 0.0, y: 0.0 }, 0.0 /*Math.PI * 0.25*/);

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
