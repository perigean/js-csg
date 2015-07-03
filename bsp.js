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

// depends on transform.js

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

  if ((s * s) / (bsp.nx * bsp.nx + bsp.ny * bsp.ny) < 0.01) {
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

function bspTreeIn(bspTree, x, y) {
  var side = bspSideStable(bspTree, x, y);

  if (side > 0) { // we are strict about being in
    return bspTree.in ? bspTreeIn(bspTree.in, x, y) : true;
  } else {
    return bspTree.out ? bspTreeIn(bspTree.out, x, y) : false;
  }
}

function bspTreeOut(bspTree, x, y) {
  var side = bspSideStable(bspTree, x, y);

  if (side < 0) {
    return bspTree.out != null ? bspTreeOut(bspTree.out, x, y) : true;
  } else {
    return bspTree.in != null ? bspTreeOut(bspTree.in, x, y) : false;
  }
}

function bspTreeIntersectRecurse(bspTree, ax, ay, bx, by, aBsp) {
  var aSide = bspSideStable(bspTree, ax, ay);
  var bSide = bspSideStable(bspTree, bx, by);

  if (aSide == 0.0) {
    // grazing a split, set normal so it will be the normal returned if a is in
    // need this because outermost segment could be grazing edge
    aBsp = bspTree;
  }

  if (aSide <= 0.0 && bSide <= 0.0) { // out
    return bspTree.out != null ? bspTreeIntersectRecurse(bspTree.out, ax, ay, bx, by, aBsp) : null;
  } else if (aSide >= 0.0 && bSide >= 0.0) {  // in
    return bspTree.in != null ? bspTreeIntersectRecurse(bspTree.in, ax, ay, bx, by, aBsp) : aBsp;
  } else {  // crossing
    var t = bspIntersect(bspTree, ax, ay, bx, by);

    var cx = t * ax + (1.0 - t) * bx;
    var cy = t * ay + (1.0 - t) * by;

    if (aSide > 0.0) {  // start inside
      var res = bspTree.in != null ? bspTreeIntersectRecurse(bspTree.in, ax, ay, cx, cy, aBsp) : aBsp;
      if (res != null) {
        return res;
      }

      aBsp = bspTree;
      return bspTree.out != null ? bspTreeIntersectRecurse(bspTree.out, cx, cy, bx, by, aBsp) : null;
    } else {  // start outside
      var res = bspTree.out != null ? bspTreeIntersectRecurse(bspTree.out, ax, ay, cx, cy, aBsp) : null;
      if (res != null) {
        return res;
      }

      aBsp = bspTree;
      return bspTree.in != null ? bspTreeIntersectRecurse(bspTree.in, cx, cy, bx, by, aBsp) : bspTree;
    }
  }
}

function bspTreeIntersect(bspTree, ax, ay, bx, by) {
  if (bspTree == null) {
    return null;
  }

  return bspTreeIntersectRecurse(bspTree, ax, ay, bx, by, null);
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
