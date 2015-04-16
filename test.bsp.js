var bspTestSquare = { px: 0, py: 0, nx: 1, ny: 1,
    in: { px: 0, py: 128, nx: 0, ny: 1,
        out: { px: 128, py: 0, nx: 1, ny: 0 }
        },
    out: { px: 0, py: -128, nx: 0, ny: -1,
        out: { px: -128, py: 0, nx: -1, ny: 0 }
        }
    };

var bspTestDiag = { px: 0, py: 0, nx: 1, ny: 1 };

var polyTestSquare = [ { x: -50, y: -50}, { x: 50, y: -50}, { x: 50, y: 50}, { x: -50, y: 50} ];

var testInSet = [];
var testOutSet = [];



bspTreeIntersectPoly(bspTestDiag, polyTestSquare, testInSet, testOutSet);

testInSet;
testOutSet;
