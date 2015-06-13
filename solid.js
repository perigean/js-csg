
// depends on transform.js
// depends on bsp.js

// TODO: be consistent with how we use bsp and bspTree

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
          poly: null};
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
        poly: poly};
    }

    solid.poly = poly;
    return solid;
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

function solidEmpty(solid) {
  return solid != null && solid.poly == null && solid.in == null && solid.out == null;
}

// TODO: what does this actually do? always modify solid unless there is no clipping
// if left with a poly, we should overwrite solid?

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
      return null;
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
