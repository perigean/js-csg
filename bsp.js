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

  if (side > 0) {
    return bsp.in ? bspTreeIn(bspTree.in, x, y) : true;
  } else {
    return bsp.out ? bspTreeIn(bspTree.out, x, y) : false;
  }
}

function bspTreeIntersectHelper(bspTree, ax, ay, bx, by, prevOut) {
  var aSide = bspSideStable(bspTree, ax, ay);
  var bSide = bspSideStable(bspTree, bx, by);

  if (aSide <= 0.0 && bSide <= 0.0) { // out (on split counts as out)
    if (bspTree.out != null) {
      return bspTreeIntersectHelper(bspTree.out, ax, ay, bx, by, prevOut);
    } else {
      return 2.0; // we are out, can't be crossing
    }
  } else if (aSide >= 0.0 && bSide >= 0.0) {  // in
    if (bspTree.in != null) {
      return bspTreeIntersectHelper(bspTree.in, ax, ay, bx, by, prevOut);
    } else if (prevOut) {
      return 0.0; // we are in, and previously out, intersection happens at (ax, ay)
    } else {
      return 1.0; // we are in, but not previously out, didn't find a cross in point
    }
  } else {  // crossing
    if (aSide == 0.0 || bSide == 0.0) {
      throw "supposed to be crossing!";
    }

    // we want t to be 0 at (ax, ay) and 1 at (bx, by), so reverse points
    var t = bspIntersect(bspTree, bx, by, ax, ay);
    var cx = t * bx + (1.0 - t) * ax;
    var cy = t * by + (1.0 - t) * ay;

    if (bspSideStable(bspTree, cx, cy) != 0.0) {
      throw "intersection point not on split";
    }

    if (t <= 0.0 || t >= 1.0) {
      throw "edge supposed to be intersecting"
    }

    if (aSide > 0.0) {
      if (bspTree.in != null) {
        var tChild = bspTreeIntersectHelper(bspTree.in, ax, ay, cx, cy, prevOut);
        if (tChild < 1.0) {
          return t * tChild;
        } else if (tChild == 2.0) {
          prevOut = true;
        }
      } else if (prevOut) {
        return 0.0; // in on a leaf, and previously out
      } else {
        prevOut = false;
      }

      if (bspTree.out != null) {
        var tChild = bspTreeIntersectHelper(bspTree.out, cx, cy, bx, by, prevOut);
        if (tChild < 1.0) {
          return t + (1.0 - t) * tChild;
        } else {
          return tChild;  // 2.0 if ended outside, 1.0 if not
        }
      } else {
        return 2.0; // edge ended out
      }
    } else { // if (aSide < 0.0)
      if (bspTree.out != null) {
        var tChild = bspTreeIntersectHelper(bspTree.out, ax, ay, cx, cy, prevOut);
        if (tChild < 1.0) {
          return t * tChild;
        } else if (tChild == 2.0) {
          prevOut = true;
        }
      } else {
        prevOut = true;
      }

      if (bspTree.in != null) {
        var tChild = bspTreeIntersectHelper(bspTree.in, cx, cy, bx, by, prevOut);
        if (tChild < 1.0) {
          return t + (1.0 - t) * tChild;
        } else {
          return tChild;
        }
      } else if (prevOut) {
        return t;
      } else {
        return 1.0; // no intersection, but we ended inside
      }
    }
  }
}

function bspTreeIntersect(bspTree, ax, ay, bx, by) {
  var t = bspTreeIntersectHelper(bspTree, ax, ay, bx, by, false);
  return Math.min(1.0, t);
}

/*
// return t s.t. intersection point = a * t + b * (1 - t)
// 0 if (ax, ay) in bsp
// 1 if line segment never intersects with bsp
function bspTreeIntersectHelper(bspTree, ax, ay, bx, by, tDefault) {
  if (bspTree == null) {
    return tDefault;
  }

  var aSide = bspSideStable(bspTree, ax, ay);
  var bSide = bspSideStable(bspTree, bx, by);

  if (aSide <= 0.0 && bSide <= 0.0) { // out (on split counts as out)
    return bspTreeIntersectHelper(bspTree.out, ax, ay, bx, by, 1.0); // if empty we didn't intersect at all
  } else if (aSide >= 0.0 && bSide >= 0.0) {  // in
    return bspTreeIntersectHelper(bspTree.in, ax, ay, bx, by, 0.0); // if empty, we were in and intersected immediately
  } else {  // crossing
    if (aSide == 0.0 || bSide == 0.0) {
      throw "supposed to be crossing!";
    }

    var t = bspIntersect(bspTree, ax, ay, bx, by);
    var cx = t * ax + (1.0 - t) * bx;
    var cy = t * ay + (1.0 - t) * by;

    var child1 = bspTree.in;
    var tChild1 = 0.0;  // default if child1 is null (0.0 for in, 1.0 for out)
    var child2 = bspTree.out;
    var tChild2 = 1.0;

    if (aSide < 0.0) {
      child1 = bspTree.out;
      tChild1 = 1.0;
      child2 = bspTree.in;
      tChild2 = 0.0;
    }

    tChild1 = bspTreeIntersectHelper(child1, ax, ay, cx, cy, tChild1);
    if (tChild1 < 1.0) {
      return t * tChild1; // found an intersection before rthe split
    }

    tChild2 = bspTreeIntersectHelper(child2, cx, cy, bx, by, tChild2);
    if (tChild2 < 1.0) {
      return (1.0 - t) * tChild2 + t;
    }

    return 1.0;
  }
}
*/
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
