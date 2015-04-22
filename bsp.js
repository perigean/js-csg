// bsp.js
//
// Copywrite Charles Dick 2015
//
// This file contains functions to create and manipulate BSP trees and related structures
//
// Structures used:
//
// bsp - Binary Space Partition, splits a plane in half.
// bspTree - Tree of Binary Space Partitions, can describe arbitrary regions by nesting splits.
// bspTreeSolid - bspTree with added polygon information, so we know how to draw the region described.
//  The polygons cover all paths in the tree, no polygon can be on a branch under a branch with a polygon.
//
//


function bspSide(bsp, p) {
    return (p.x - bsp.px) * bsp.nx + (p.y - bsp.py) * bsp.ny;
}

function bspSideStable(bsp, p) {
    // s = (p - bsp.p) dot bsp.n
    var s = (p.x - bsp.px) * bsp.nx + (p.y - bsp.py) * bsp.ny;

    if ((s * s) / (bsp.nx * bsp.nx + bsp.ny * bsp.ny) < 0.01) {
        return 0.0;
    }

    return s;
}

function bspTreeIn(bsp, p) {
    var side = bspSide(bsp, p);

    if (side >= 0) {
        return bsp.in ? bspTreeIn(bsp.in, p) : true;
    } else {
        return bsp.out ? bspTreeIn(bsp.out, p) : false;
    }
}

// TODO: bspTransform, add in transform
function bspTreeTranslate(bsp, d) {
    if (bsp == null) {
        return null;
    }

    return {
        px: bsp.px + d.x,
        py: bsp.py + d.y,
        nx: bsp.nx,
        ny: bsp.ny,
        in: bspTreeTranslate(bsp.in, d),
        out: bspTreeTranslate(bsp.out, d)};
}

function bspIntersect(bsp, a, b) {
    var cx = bsp.px; // point on split
    var cy = bsp.py;

    var dx = bsp.ny; // direction vector on split (rotate normal)
    var dy = -bsp.nx;

    var t = (dx * b.y - dx * cy - dy * b.x + dy * cx) / (dy * a.x - dy * b.x - dx * a.y + dx * b.y);

    return { x: a.x * t + b.x * (1.0 - t), y: a.y * t + b.y * (1.0 - t), exterior: a.exterior };
}

function polyArea(poly) {
    var polyLen = poly.length;
    var prev = poly[polyLen - 1];
    var area = 0;

    for (var i = 0; i < polyLen; i++) {
        var curr = poly[i];

        area += prev.x * curr.y - curr.x * prev.y;

        prev = curr;
    }

    return area * 0.5;
}

function bspSolidCreate(poly) {
    var bsp = null;

    // make an in heavy BSP tree (no out nodes)

    for (var i = 0; i < poly.length; i++) {
        //var j = (i * 127) % poly.length;
        var j = i;
        var a = poly[j];
        var b = poly[(j + 1) % poly.length];

        if (poly[i].exterior) {
            bsp = {
                px: a.x,
                py: a.y,
                nx: a.y - b.y,
                ny: b.x - a.x,
                in: bsp,
                out: null,
                poly: null};
        }
    }

    bsp.poly = poly;
    return bsp;
}

function bspClipEdgeIn(bsp, edge) {
    var aSide = bspSide(bsp, edge.a);
    var bSide = bspSide(bsp, edge.b);

    if (aSide >= 0.0) {
        if (bSide < 0.0) {
            edge.b = bspIntersect(bsp, edge.a, edge.b);
        }
    } else /* if (aSide < 0.0) */ {
        if (bSide > 0.0) {
            edge.a = bspIntersect(bsp, edge.a, edge.b);
        } else /* if (bSide <= 0.0) */ {
            throw "Can't clip edge that is all outside in";
        }
    }
}

function bspClipEdgeOut(bsp, edge) {
    var aSide = bspSide(bsp, edge.a);
    var bSide = bspSide(bsp, edge.b);

    if (aSide <= 0.0) {
        if (bSide > 0.0) {
            edge.b = bspIntersect(bsp, edge.a, edge.b);
        }
    } else /* if (aSide > 0.0) */ {
        if (bSide < 0.0) {
            edge.a = bspIntersect(bsp, edge.a, edge.b);
        } else /* if (bSide <= 0.0) */ {
            throw "Can't clip edge that is all inside out";
        }
    }
}

function bspSolidGetSplitList(bsp, list, r) {
    if (bsp == null) {
        return;
    }

    var inBegin = list.length;
    bspSolidGetSplitList(bsp.in, list, r);
    var outBegin = list.length;
    bspSolidGetSplitList(bsp.out, list, r);
    var outEnd = list.length;

    // clip to this split
    for (var i = inBegin; i != outBegin; i++) {
        bspClipEdgeIn(bsp, list[i]);
    }

    for (var i = outBegin; i != outEnd; i++) {
        bspClipEdgeOut(bsp, list[i]);
    }

    // add this split

    var rx = bsp.ny;
    var ry = -bsp.nx;
    var l = Math.sqrt(rx * rx + ry * ry);
    rx = (rx / l) * r;
    ry = (ry / l) * r;

    list.push({
        a: {x: bsp.px - rx, y: bsp.py - ry},
        b: {x: bsp.px + rx, y: bsp.py + ry}});
}

function bspTreePolyClip(bsp, poly) {
    if (bsp == null) {
        return {    // placeholder, we build the BSP tree as soon as we know it won't get merged back together (in bspTreeSolidClip())
            px: 0.0,
            py: 0.0,
            nx: 0.0,
            ny: 0.0,
            in: null,
            out: null,
            poly: poly};
    }

    var polyLen = poly.length;

    var crossIn = -1;       // vertex beginning the edge that crosses into bsp
    var crossInNext = -1;
    var inOnSplit = false;
    var crossOut = -1;      // vertex beginning the edge that crosses out of bsp
    var crossOutNext = -1;
    var outOnSplit = false;

    // try to find the verticies beginning edges that cross in or out of the
    // bsp split

    var previ = polyLen - 1;
    var prevSide = bspSideStable(bsp, poly[previ]);

    for (var i = 0; i < polyLen; i++) {
        var side = bspSideStable(bsp, poly[i]);

        if (prevSide <= 0.0 && side > 0.0) {
            // we crossed into the splits
            crossIn = previ;
            crossInNext = i;

            if (prevSide == 0.0) {
                inOnSplit = true;
            }
        } else if (prevSide >= 0.0 && side < 0.0) {
            // we crossed out of the split
            crossOut = previ;
            crossOutNext = i;

            if (prevSide == 0.0) {
                outOnSplit = true;
            }
        }

        previ = i;
        prevSide = side;
    }

    // now, if crossIn AND crossOut were found, we have a poly crossing the bsp
    // otherwise, we can just recurse (if only one is set, the poly hits the bsp
    // but doesn't cross)

    if (crossIn >= 0 && crossOut >= 0) {
        // split poly across bsp

        if (crossIn == crossOut) {
            throw "crossIn vertex same as crossOut vertex !?"
        }

        var onIn;   // new or existing verts that are on the split
        var onOut;

        if (inOnSplit) {
            onIn = poly[crossIn];
        } else {
            onIn = bspIntersect(bsp, poly[crossIn], poly[crossInNext]);
        }

        if (outOnSplit) {
            onOut = poly[crossOut];
        } else {
            onOut = bspIntersect(bsp, poly[crossOut], poly[crossOutNext]);
        }

        // generate in poly
        var inPoly = [ onIn ];
        for (var i = crossInNext; i != crossOutNext; i = (i + 1) % polyLen) {
            inPoly[inPoly.length] = poly[i];
        }
        if (!outOnSplit) {
            inPoly[inPoly.length] = onOut;
        }
        if (!inPoly[inPoly.length-1].exterior) {
            inPoly[inPoly.length-1] = {
                x: inPoly[inPoly.length-1].x,
                y: inPoly[inPoly.length-1].y,
                exterior: false};
        }

        // generate the out poly
        var outPoly = [ onOut ];
        for (var i = crossOutNext; i != crossInNext; i = (i + 1) % polyLen) {
            outPoly[outPoly.length] = poly[i];
        }
        if (!inOnSplit) {
            outPoly[outPoly.length] = onIn;
        }
        if (!outPoly[outPoly.length-1].exterior) {
            outPoly[outPoly.length-1] = {
                x: outPoly[outPoly.length-1].x,
                y: outPoly[outPoly.length-1].y,
                exterior: false};
        }

        // TODO: if chk
        if (polyArea(inPoly) == 0.0) {
            throw "inPoly degenerate!?";
        }

        if (polyArea(outPoly) == 0.0) {
            throw "outPoly degenerate!?";
        }

        // push both their respective sides of the bsp
        var inRes = bspTreePolyClip(bsp.in, inPoly);
        var outRes;
        if (bsp.out != null) {
            outRes = bspTreePolyClip(bsp.out, outPoly);
        } else {
            // clipped out of tree
            outRes = null;
        }

        if (inRes == null && outRes == null)
        {
            // nothing left
            return null;
        }

        if (inRes != null && inRes.poly == inPoly && outRes != null && outRes.poly != null) {
            // bsp didn't actually do anything, so return the poly we got
            return {
                px: 0.0,
                py: 0.0,
                nx: 0.0,
                ny: 0.0,
                in: null,
                out: null,
                poly: poly};
        }

        if (inRes != null && inRes.nx == 0.0 && inRes.ny == 0.0) {
            if (inRes.poly == null) {
                throw "expected to build a poly subtree, but found no poly";
            }
            inRes = bspSolidCreate(inRes.poly);
        }

        if (outRes != null && outRes.nx == 0.0 && outRes.ny == 0.0) {
            if (outRes.poly == null) {
                throw "expected to build a poly subtree, but found no poly";
            }
            outRes = bspSolidCreate(outRes.poly);
        }

        return {
            px: bsp.px,
            py: bsp.py,
            nx: bsp.nx,
            ny: bsp.ny,
            in: inRes,
            out: outRes,
            poly: null};

    } else if (prevSide > 0 || crossIn >= 0) {
        return bspTreePolyClip(bsp.in, poly);
    } else if (prevSide < 0 || crossOut >= 0) {
        if (bsp.out != null) {
            return bspTreePolyClip(bsp.out, poly);
        } else {
            // clipped out of tree
            return null;
        }
    } else {
        throw "poly not crossing and not not crossing!?"
    }
}

function bspTreeSolidClip(bsp, solid) {
    if (solid == null) {
        return null;
    }

    if (bsp == null) {
        return solid;
    }

    // descend solid looking for polygons

    if (solid.poly != null) {
        // found a polygon, split that poly
        // there can be no other polygons under this
        return bspTreePolyClip(bsp, solid.poly);
    } else {
        var inRes = bspTreeSolidClip(bsp, solid.in);
        var outRes = bspTreeSolidClip(bsp, solid.out);

        if (inRes == null && outRes == null) {
            return null;
        }

        return {
            px: solid.px,
            py: solid.py,
            nx: solid.nx,
            ny: solid.ny,
            in: inRes,
            out: outRes,
            poly: null};
    }

    return solid;
}
