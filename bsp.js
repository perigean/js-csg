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

  if (side >= 0) { // we are strict about being in
    return bspTree.in ? bspTreeIn(bspTree.in, x, y) : true;
  } else {
    return bspTree.out ? bspTreeIn(bspTree.out, x, y) : false;
  }
}

function bspTreeCollide(bspTree, inChild, beginBsp, ax, ay, bx, by) {
  if (bspTree == null) {
    if (inChild) {
      if (beginBsp == null) {
        throw "segment is in, but has no begin split";
      }
      return beginBsp;
    }
    return null;
  }

  var aSide = bspSideStable(bspTree, ax, ay);
  var bSide = bspSideStable(bspTree, bx, by);

  if (aSide < 0.0) {
    if (bSide < 0.0) {  // all out
      return bspTreeCollide(bspTree.out, false, beginBsp, ax, ay, bx, by);
    } else if (bSide > 0.0) { // crossing in
      return bspTreeCollideCross(bspTree, bspTree.out, bspTree.in, beginBsp, ax, ay, bx, by);
    } else {  // out, but touching in
      return bspTreeCollideTouch(bspTree, bspTree.out, beginBsp, ax, ay, bx, by);
    }
  } else if (aSide > 0.0) {
    if (bSide < 0.0) {  // crossing out
      return bspTreeCollideCross(bspTree, bspTree.in, bspTree.out, beginBsp, ax, ay, bx, by);
    } else if (bSide > 0.0) { // all in
      return bspTreeCollide(bspTree.in, true, beginBsp, ax, ay, bx, by);
    } else {  // in, but touching out
      return bspTreeCollideTouch(bspTree, bspTree.in, beginBsp, ax, ay, bx, by);
    }
  } else {  // if (aSide == 0.0)
    if (bSide < 0.0) {  // all out
      return bspTreeCollide(bspTree.out, false, beginBsp, ax, ay, bx, by);
    } else if (bSide > 0.0) { // all in
      return bspTreeCollide(bspTree.in, true, beginBsp, ax, ay, bx, by);
    } else {  // on split
      // TODO: find first split
      throw "not implemented yet!";
    }
  }
}

// no, check beginning

// checks to see if segment crosses into bspTree anywhere in (a b]
// returns ?
function bspTreeCrossInRecurse(bspTree, inChild, ax, ay, bx, by) {
  if (bspTree == null) {
    return inChild ? true : false;
  }

  var aSide = bspSideStable(bspTree, ax, ay);
  var bSide = bspSideStable(bspTree, bx, by);

  if (aSide == 0.0 && bSide == 0.0) {  // segment colinear
    return bspTreeIntersectRecurse(bspTree.in, ax, ay, bx, by) || // TODO: do we care which side hits first?
      bspTreeIntersectRecurse(bspTree.out, ax, ay, bx, by);
  } else if (aSide >= 0.0 && bSide >= 0.0) { // segment in
    return bspTreeIntersectRecurse(bspTree.in, ax, ay, bx, by);
  } else if (aSide <= 0.0 && bSide <= 0.0) {  // segment out
    return bspTreeIntersectRecurse(bspTree.out, ax, ay, bx, by);
  } else {  // crossing
    var t = bspIntersect(bspTree, ax, ay, bx, by);
    var cx = t * ax + (1.0 - t) * bx;
    var cy = t * ay + (1.0 - t) * by;
  }

  // segment is crossing or at least touching



  if (aSide > 0.0 && bSide < 0.0) { // segment crossing out



  } else if (aSide < 0.0 && bSide > 0.0) {  // segment crossing in

  }

  if (bSide == 0.0) { // end of segment on split
    var inIn = bspTree.in == null ? true : bspTreeIn(bspTree.in, bx, by);
    var inOut = bspTree.out == null ? false : bspTreeIn(bspTree.out, bx, by);
    if (inIn != inOut) {
      return bspTree;
    }
  }

  return null;
}

function bspTreeIntersect(bspTree, ax, ay, bx, by) {
  return bspTreeIntersectRecurse(bspTree, false, ax, ay, bx, by);
}

function bspTreeIntersectionNormal(bspTree, ax, ay, bx, by, n) {
  if (bspTree == null) {
    return false;
  }

  var aSide = bspSideStable(bspTree, ax, ay);

  if (aSide > 0.0) {
    return bspTreeIntersectionNormal(bspTree.in, ax, ay, bx, by, n);
  } else if (aSide < 0.0) {
    return bspTreeIntersectionNormal(bspTree.out, ax, ay, bx, by, n);
  } else {
    var bSide = bspSideStable(bspTree, bx, by);

    if (bSide != 0.0) {
      var nl = Math.sqrt(bspTree.nx * bspTree.nx + bspTree.ny * bspTree.ny);
      n.x = bspTree.nx / nl;
      n.y = bspTree.ny / nl;
      return true;
    }

    return bspTreeIntersectionNormal(bspTree.in, ax, ay, bx, by, n)
      || bspTreeIntersectionNormal(bspTree.out, ax, ay, bx, by, n);
  }
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
