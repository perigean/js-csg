var bspTestSquare = { px: 0, py: 0, nx: 1, ny: 1,
    in: { px: 0, py: 128, nx: 0, ny: 1,
        out: { px: 128, py: 0, nx: 1, ny: 0 }
        },
    out: { px: 0, py: -128, nx: 0, ny: -1,
        out: { px: -128, py: 0, nx: -1, ny: 0 }
        }
    };

var bspTestDiag = { px: 0, py: 0, nx: 1, ny: 1 };

// determine what side of a split a point is on
// NOTE: we need to add some fuzzyness so that stuff we just split
// across a BSP doesn't get intersected again
// we do this by saying that stuff that is close to the split is on the split
// this is done by checking if the point distance * bsp normal is < 1

function bspSide(bsp, px, py) {
    var s = (px - bsp.px) * bsp.nx + (py - bsp.py) * bsp.ny;

    if (s * s < 1) {
        return 0;
    } else {
        return s;
    }
}

function bspTreeIn(bsp, px, py) {
    var side = bspSide(bsp, px, py);

    if (side >= 0) {
        return bsp.in ? bspTreeIn(bsp.in, px, py) : true;
    } else {
        return bsp.out ? bspTreeIn(bsp.out, px, py) : false;
    }
}

function bspTreeTranslate(bsp, dx, dy) {
    var tbsp = {
        px: bsp.px + dx,
        py: bsp.py + dy,
        nx: bsp.nx,
        ny: bsp.ny
    };

    if (bsp.in) {
        tbsp.in = bspTreeTranslate(bsp.in, dx, dy);
    }

    if (bsp.out) {
        tbsp.out = bspTreeTranslate(bsp.out, dx, dy);
    }

    return tbsp;
}

function bspCross(bsp, ax, ay, bx, by) {
    var as = bspSide(bsp, ax, ay);
    var bs = bspSide(bsp, bx, by);
    
    if (as * bs < 0) {
        return true;
    } else {
        return false;
    }
}

function bspIntersect(bsp, ax, ay, bx, by) {
    var cx = bsp.px; // point on split
    var cy = bsp.py;

    var dx = bsp.ny; // direction vector on split (rotate normal)
    var dy = -bsp.nx;

    var t = (dx*by - dx*cy - dy*bx + dy*cx) / (dy*ax - dy*bx - dx*ay + dx*by);

    return { x: t * ax + (1 - t) * bx, y: t * ay + (1 - t) * by };
}

function bspTreeIntersectEdge(bsp, ax, ay, bx, by) {
    var as = bspSide(bsp, ax, ay);
    var bs = bspSide(bsp, bx, by);

    if (as > 0) {
        if (bs >= 0) {
            return bsp.in ? bspTreeIntersectEdge(bsp.in, ax, ay, bx, by) : undefined;
        } else {
            var c = bspIntersectEdge(bsp, ax, ay, bx, by);

            // check in side of tree
            if (bsp.in) {
                var p = bspTreeIntersectEdge(bsp.in, ax, ay, c.x, c.y);
                if (p) return p;
            }

            // check if c is on opposite sides of subtrees
            var cins = bsp.in ? bspTreeIn(bsp.in, c.x, c.y) : true;
            var couts = bsp.out ? bspTreeIn(bsp.out, c.x, c.y) : false;
            if (cins != couts) return c;

            // check out side of tree
            if (bsp.out) {
                var p = bspTreeIntersectEdge(bsp.out, c.x, c.y, bx, by);
                if (p) return p;
            }
            return undefined;
        }
    } else if (as < 0) {
        if (bs <= 0) {
            return bsp.out ? bspTreeIntersectEdge(bsp.out, ax, ay, bx, by) : undefined;
        } else {
            var c = bspIntersectEdge(bsp, ax, ay, bx, by);

            // check out side of tree
            if (bsp.out) {
                var p = bspTreeIntersectEdge(bsp.out, ax, ay, c.x, c.y);
                if (p) return p;
            }

            // check if c is on opposite sides of subtrees
            var cins = bsp.in ? bspTreeIn(bsp.in, c.x, c.y) : true;
            var couts = bsp.out ? bspTreeIn(bsp.out, c.x, c.y) : false;
            if (cins != couts) return c;

            // check in side of tree
            if (bsp.in) {
                var p = bspTreeIntersectEdge(bsp.in, c.x, c.y, bx, by);
                if (p) return p;
            }
            return undefined;
        }
    } else {
        if (bs >= 0) {
            return bsp.in ? bspTreeIntersectEdge(bsp.in, ax, ay, bx, by) : undefined;
        } else {
            return bsp.out ? bspTreeIntersectEdge(bsp.out, ax, ay, bx, by) : undefined;
        }
    }
}


