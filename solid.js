// solid.js
//
// Copywrite Charles Dick 2015
//
// depends on transform.js
// depends on bsp.js

// TODO: maintain property that all branches before poly have both in and out
// sub trees

// TODO: clip can create new non-linked edges on existing poly, which will mess up their
// bspTree (only on separation of non-connected?)

// TODO: to fix above, merge clip to marked regions, have new merged function return something
// that isn't a solid, and the caller has to use solidExtractRegion

function solidCreate(poly) {
    var solid = null;

    // make an in heavy BSP tree (no out nodes)
    // TODO: do something more complicated that isn't so unbalanced

    var i = poly;
    do {
      var next = i.next;

      if (i.link == null) {
        solid = {
          px: i.x,
          py: i.y,
          nx: i.y - next.y,
          ny: next.x - i.x,
          in: solid,
          out: null,
          poly: null
        };
      }

      i = next;
    } while (i != poly);

    if (solid == null) {
      // if all edges in the poly are shared edges, we just need a dummy split
      // to hang the poly off of, pick the first edge

      return {
        px: i.x,
        py: i.y,
        nx: i.y - i.next.y,
        ny: i.next.x - i.x,
        in: null,
        out: null,
        poly: poly
      };
    }

    solid.poly = poly;
    return solid;
}

function solidSetFlag(solid, flag) {
  if (solid == null) {
    return;
  }

  if (solid.poly != null) {
    meshPolySetFlag(solid.poly, flag);
  } else {
    solidSetFlag(solid.in, flag);
    solidSetFlag(solid.out, flag);
  }
}

function solidMarkConnectedRegionsHelper(solid, nextFlag) {
  if (solid == null) {
    return nextFlag;
  }

  if (solid.poly != null) {
    if (solid.poly.flag == -1) {
      meshSetFlag(solid.poly, nextFlag);
      return nextFlag + 1;
    } else {
      return nextFlag;
    }
  } else {
    nextFlag = solidMarkConnectedRegionsHelper(solid.in, nextFlag);
    nextFlag = solidMarkConnectedRegionsHelper(solid.out, nextFlag);
    return nextFlag;
  }
}

function solidMarkConnectedRegions(solid) {
  solidSetFlag(solid, -1);
  return solidMarkConnectedRegionsHelper(solid, 0);
}

function solidExtractRegion(solid, flag) {
  if (solid == null) {
    return null;
  }

  if (solid.poly != null) {
    if (solid.poly.flag == flag) {
      // need to recreate, since we don't know if we will keep higher splits that
      // cover our unlinked edges that never got a split of their own
      return solidCreate(solid.poly);
    } else {
      return null;
    }
  } else {
    var inSolid = solidExtractRegion(solid.in, flag);
    var outSolid = solidExtractRegion(solid.out, flag);

    if (inSolid != null && outSolid != null) {
      // we need this branch, copy it
      return {
        px: solid.px,
        py: solid.py,
        nx: solid.nx,
        ny: solid.ny,
        in: inSolid,
        out: outSolid,
        poly: null
      };
    } else if (inSolid != null) {
      return inSolid;
    } else {
      return outSolid;  // could be null
    }
  }
}

function solidTransform(solid, t) {
  if (solid == null) {
      return;
  }

  solidTransform(solid.in, t);
  solidTransform(solid.out, t);

  bspTransform(solid, t);

  if (solid.poly != null) {
    var poly = solid.poly;
    var i = poly;

    do {
      meshEdgeTransform(i, t);
      i = i.next;
    } while (i != poly);
  }
}

// return { clipped: <bool>, solid: <solid> }

function solidPolyClip(solid, bspTree) {
  if (bspTree == null) {
    return { clipped: false, solid: solid };
  }

  if (solid == null || solid.poly == null) {
    throw "invalid args!";
  }

  var poly = solid.poly;
  var i = poly;
  var currSide = bspSideStable(bspTree, i.x, i.y);
  var leaveIn = null;
  var leaveInOnSplit = false;
  var leaveOut = null;
  var leaveOutOnSplit = false;
  var allIn = true;
  var allOut = true;

  do {
    var nextSide = bspSideStable(bspTree, i.next.x, i.next.y);

    if (currSide <= 0.0 && nextSide > 0.0) {
      leaveOut = i;

      if (currSide == 0.0) {
        leaveOutOnSplit = true;
      }
    }

    if (currSide >= 0.0 && nextSide < 0.0) {
      leaveIn = i;

      if (currSide == 0.0) {
        leaveInOnSplit = true;
      }
    }

    if (currSide > 0.0) {
      allOut = false;
    } else if (currSide < 0.0) {
      allIn = false;
    }

    currSide = nextSide;
    i = i.next;
  } while (i != poly);

  if (allIn) {
    if (bspTree.in != null) {
      return solidPolyClip(solid, bspTree.in);
    } else {
      // poly is in, so we didn't do any clipping
      return { clipped: false, solid: solid };
    }
  } else if (allOut) {
    if (bspTree.out != null) {
      return solidPolyClip(solid, bspTree.out);
    } else {
      // clipped out, prune the solid
      meshPolyRemove(poly);
      return { clipped: true, solid: null };
    }
  } else if (leaveIn != null && leaveOut != null) { // crossing
    // add the crossing points
    if (!leaveOutOnSplit) {
      leaveOut = meshEdgeSplit(leaveOut, bspTree);
    }

    if (!leaveInOnSplit) {
      leaveIn = meshEdgeSplit(leaveIn, bspTree);
    }

    meshPolySplit(leaveIn, leaveOut);

    var inResult = null;
    var outResult = null;

    // TODO: can we avoid the solidCreate in teh recursive step? does it matter?

    if (bspTree.in != null) {
      inResult = solidPolyClip(solidCreate(leaveIn), bspTree.in);
    } else {
      inResult = { clipped: false, solid: solidCreate(leaveIn) };
    }

    if (bspTree.out != null) {
      outResult = solidPolyClip(solidCreate(leaveOut), bspTree.out);
    } else {
      meshPolyRemove(leaveOut);
      outResult = { clipped: true, solid: null };
    }

    if (inResult.clipped || outResult.clipped) {
      // TODO: don't create a split if it doesn't have both children
      return {
        clipped: true,
        solid: {
          px: bspTree.px,
          py: bspTree.py,
          nx: bspTree.nx,
          ny: bspTree.ny,
          in: inResult.solid,
          out: outResult.solid,
          poly: null
        } };
    } else {
      // no clipping, put the poly back together
      meshPolyMerge(leaveIn, leaveOut);

      if (!leaveOutOnSplit) {
        leaveOut = meshEdgeMerge(leaveOut);
      }

      if (!leaveInOnSplit) {
        leaveIn = meshEdgeMerge(leaveIn);
      }

      return { clipped: false, solid: solid };
    }
  } else {
    throw "poly both crossing and not crossing!?";
  }
}

function solidClip(solid, bspTree) {
  if (solid == null || bspTree == null) {
    return { clipped: false, solid: solid };
  }

  // descend solid looking for polygons
  // TODO: add bounding circles to solid, so we can descend bsp at the same time

  if (solid.poly != null) {
    // found a polygon, split that poly which builds a new bspTreeSolid
    // there can be no other polygons under this
    return solidPolyClip(solid, bspTree);
  } else {
    var inResult = solidClip(solid.in, bspTree);
    var outResult = solidClip(solid.out, bspTree);

    if (inResult.solid == null && outResult.solid == null) {
      return { clipped: true, solid: null };
    }

    solid.in = inResult.solid;
    solid.out = outResult.solid;
    return { clipped: inResult.clipped || outResult.clipped, solid: solid };
  }
}


// See http://en.wikipedia.org/wiki/Polygon#Area_and_centroid

function solidCentroidArea(solid) {
  if (solid == null) {
    return null;
  } else if (solid.poly != null) {
    // Leaf step, found a polygon
    return meshPolyCentroidArea(solid.poly);
  } else {
    // Recursive step, possibly merge two centroids
    var inC = solidCentroidArea(solid.in);
    var outC = solidCentroidArea(solid.out);

    if (inC != null && outC != null) {
      // average centroids
      var area = inC.area + outC.area;

      return {
        x: (inC.x * inC.area + outC.x * outC.area) / area,
        y: (inC.y * inC.area + outC.y * outC.area) / area,
        area: area
      };

    } else if (inC != null) {
      return inC;
    } else if (outC != null) {
      return outC;
    } else {
      return null;
    }
  }
}

function solidMomentOfInertia(solid) {
  if (solid == null) {
    return 0.0;
  } else if (solid.poly != null) {
    // Leaf step, found a polygon
    return meshPolyMomentOfInertia(solid.poly);
  } else {
    // We can just add together because everything is using the same axis of
    // rotation (the origin)
    return solidMomentOfInertia(solid.in) + solidMomentOfInertia(solid.out);
  }
}

function solidRadiusSquared(solid) {
  if (solid == null) {
    return 0.0;
  }

  if (solid.poly != null) {
    return meshPolyRadiusSquared(solid.poly);
  }

  return Math.max(solidRadiusSquared(solid.in), solidRadiusSquared(solid.out));
}

function solidFill(solid, ctx) {
  if (solid == null) {
    return;
  } else if (solid.poly) {
    meshPolyFill(solid.poly, ctx);
  } else {
    solidFill(solid.in, ctx);
    solidFill(solid.out, ctx);
  }
}

function solidStroke(solid, ctx) {
  if (solid == null) {
    return;
  } else if (solid.poly) {
    meshPolyStroke(solid.poly, ctx);
  } else {
    solidStroke(solid.in, ctx);
    solidStroke(solid.out, ctx);
  }
}
