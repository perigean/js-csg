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
  var side = bspSide(bspTree, x, y);

  if (side >= 0) {
    return bsp.in ? bspTreeIn(bspTree.in, x, y) : true;
  } else {
    return bsp.out ? bspTreeIn(bspTree.out, x, y) : false;
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
