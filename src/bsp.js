// bsp.js
//
// Copyright Charles Dick 2015
//
// This file contains functions to create and manipulate BSP trees and related structures
//
// Structures used:
//
// bsp - Binary Space Partition, splits a plane in half.
// bspTree - Tree of Binary Space Partitions, can describe arbitrary regions by nesting splits.
// bspTreeSolid - bspTree with added polygon information, so we know how to draw the region described.
//  The polygons cover all paths in the tree, no polygon can be on a branch under a branch with a polygon.

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

// bspTreePointSide
//  determines if point (x, y) is in, out, or on the edge of region described by bspTree
// returns
//  1 iff point is strictly in
//  2 iff point is stricly out
//  3 iff point is on boundary
function bspTreePointSide(bspTree, x, y) {
  var side = bspSideStable(bspTree, x, y);

  if (side > 0.0) {
    return bspTree.in == null ? 1 : bspTreePointSide(bspTree.in, x, y);
  } else if (side < 0.0) {
    return bspTree.out == null ? 2 : bspTreePointSide(bspTree.out, x, y);
  } else {  // side == 0.0
    var inRes = bspTree.in == null ? 1 : bspTreePointSide(bspTree.in, x, y);
    var outRes = bspTree.out == null ? 2 : bspTreePointSide(bspTree.out, x, y);
    return inRes | outRes;
  }
}

function bspTreePointSplit(bspTree, x, y) {
  var side = bspSideStable(bspTree, x, y);

  if (side > 0.0) {
    return bspTree.in && bspTreePointSplit(bspTree.in, x, y);
  } else if (side < 0.0) {
    return bspTree.out && bspTreePointSplit(bspTree.out, x, y);
  } else {  // side == 0.0
    return bspTree;
  }
}

// look for intersections strictly between a and b
function bspTreeCollideInterior(bspTree, ax, ay, bx, by) {
  if (bspTree == null) {
    throw 'invalid argument, bspTree can not be null';
  }

  var aSide = bspSideStable(bspTree, ax, ay);
  var bSide = bspSideStable(bspTree, bx, by);

  if (aSide >= 0.0 && bSide >= 0.0) { // all in
    return bspTree.in && bspTreeCollideInterior(bspTree.in, ax, ay, bx, by);
  } else if (aSide <= 0.0 && bSide <= 0.0) {  // all out
    return bspTree.out && bspTreeCollideInterior(bspTree.out, ax, ay, bx, by);
  } else {  // crossing
    var t = bspIntersect(bspTree, ax, ay, bx, by);

    if (t <= 0.0 || t >= 1.0) {
      throw 'crossing segment not crossing';
    }

    var cx = t * ax + (1.0 - t) * bx;
    var cy = t * ay + (1.0 - t) * by;

    if (aSide > 0.0 && bSide < 0.0) { // check in side first
      var i = bspTree.in && bspTreeCollideInterior(bspTree.in, ax, ay, cx, cy);
      var x = 3 == bspTreePointSide(bspTree, cx, cy) ? bspTree : null;
      var o = bspTree.out && bspTreeCollideInterior(bspTree.out, cx, cy, bx, by);

      return (i || (x || o));
    } else if (aSide < 0.0 && bSide > 0.0) {  // check out side first
      var o = bspTree.out && bspTreeCollideInterior(bspTree.out, ax, ay, cx, cy);
      var x = bspTreePointSide(bspTree, cx, cy);
      var i = bspTree.in && bspTreeCollideInterior(bspTree.in, cx, cy, bx, by);

      return (o || ((x == 3 ? bspTree : null) || i));
    } else {
      throw 'crossing segment not crossing';
    }
  }
}

function bspTreeCollide(bspTree, ax, ay, bx, by) {
  // make sure we're starting on the outside of a region
  if (2 != bspTreePointSide(bspTree, ax, ay)) {
    throw 'start of segment not outside bspTree';
  }

  // check for any collision points between a and b
  var bspSplit = bspTreeCollideInterior(bspTree, ax, ay, bx, by);

  if (bspSplit != null) {
    return bspSplit;
  }

  var bTreeSide = bspTreePointSide(bspTree, bx, by);

  switch (bTreeSide) {
    case 1:
      throw 'segment started outside, ended inside, but didnt cross!?';

    case 2:
      return null;  // line segment is outside

    case 3:
      return bspTreePointSplit(bspTree, bx, by);  // b is on a split, find it

    default:
      throw 'unexpected return value from bspTreePointSide';
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

function bspDebugLinesClipIn(bsp, lines) {
  var clipped = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var aside = bspSideStable(bsp, line.a.x, line.a.y);
    var bside = bspSideStable(bsp, line.b.x, line.b.y);
    if (aside >= 0.0 && bside >= 0.0) {
      clipped.push(line);
    } else if (aside <= 0.0 && bside <= 0.0) {
      // clipped out
    } else {
      var t = bspIntersect(bsp, line.a.x, line.a.y, line.b.x, line.b.y);
      var cx = t * line.a.x + (1.0 - t) * line.b.x;
      var cy = t * line.a.y + (1.0 - t) * line.b.y;
      if (aside > 0.0 && bside < 0.0) {
        clipped.push({a: line.a, b: { x: cx, y: cy } });
      } else if (bside > 0.0 && aside < 0.0) {
        clipped.push({a: { x: cx, y: cy }, b: line.b });
      } else {
        throw "line to be clipped is crossing and not crossing!";
      }
    }
  }
  return clipped;
}

function bspDebugLinesClipOut(bsp, lines) {
  var clipped = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var aside = bspSideStable(bsp, line.a.x, line.a.y);
    var bside = bspSideStable(bsp, line.b.x, line.b.y);
    if (aside <= 0.0 && bside <= 0.0) {
      clipped.push(line);
    } else if (aside >= 0.0 && bside >= 0.0) {
      // clipped in
    } else {
      var t = bspIntersect(bsp, line.a.x, line.a.y, line.b.x, line.b.y);
      var cx = t * line.a.x + (1.0 - t) * line.b.x;
      var cy = t * line.a.y + (1.0 - t) * line.b.y;
      if (aside < 0.0 && bside > 0.0) {
        clipped.push({a: line.a, b: { x: cx, y: cy } });
      } else if (bside < 0.0 && aside > 0.0) {
        clipped.push({a: { x: cx, y: cy }, b: line.b });
      } else {
        throw "line to be clipped is crossing and not crossing!";
      }
    }
  }
  return clipped;
}

function bspTreeDebugLines(bspTree, x, y, l) {
  if (bspTree == null) {
    return [];
  }

  var nScale = l / Math.sqrt(bspTree.nx * bspTree.nx + bspTree.ny * bspTree.ny);
  var side = bspSideStable(bspTree, x, y);
  var line = {
    a: {
      x: bspTree.px - bspTree.ny * nScale,
      y: bspTree.py + bspTree.nx * nScale },
    b: {
      x: bspTree.px + bspTree.ny * nScale,
      y: bspTree.py - bspTree.nx * nScale },
    side: side };

  var lines;
  if (side > 0.0) {
    lines = bspDebugLinesClipIn(bspTree, bspTreeDebugLines(bspTree.in, x, y, l));
  } else if (side < 0.0) {
    lines = bspDebugLinesClipOut(bspTree, bspTreeDebugLines(bspTree.out, x, y, l));
  } else {
    lines = bspDebugLinesClipIn(bspTree, bspTreeDebugLines(bspTree.in, x, y, l));
    lines = lines.concat(bspDebugLinesClipOut(bspTree, bspTreeDebugLines(bspTree.out, x, y, l)));
  }
  lines.push(line);
  return lines;
}

export {
  bspIntersect,
  bspSideStable,
  bspTransform,
  bspTreeCollide,
  bspTreeDebugLines,
  bspTreePointSide,
  bspTreeTransformClone,
};
