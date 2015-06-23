// mesh.js
//
// Copywrite Charles Dick 2015

// TODO: rules of mesh node lifetimes, so we know when it's safe to keep a reference

// depends on transform.js
// depends on bsp.js

function meshEdgeVerify(edge) {
  var prev = edge.prev;
  var next = edge.next;

  if (prev.next != edge || next.prev != edge) {
    throw "next or prev refs broken";
  }

  if (edge.link != null) {
    if (edge.link.link != edge) {
      throw "link ref broken";
    }
  }

  var px = edge.x - prev.x;
  var py = edge.y - prev.y;
  var nx = next.x - edge.x;
  var ny = next.y - edge.y;

  if (px * ny - py * nx < -0.01) {
    throw "vertex is not convex";
  }
}

function meshPolySetFlag(poly, flag) {
  var i = poly;

  do {
    i.flag = flag;
    i = i.next;
  } while (i != poly);
}

function meshSetFlag(mesh, flag) {
  var i = mesh;

  while (i.flag != flag) {
    i.flag = flag;

    if (i.link != null) {
      meshSetFlag(i.link, flag);
    }

    i = i.next;
  }
}

function meshPolyVerify(poly) {
  var i = poly;

  do {
    meshEdgeVerify(i);
    i = i.next;
  } while (i != poly);
}

function meshEdgeInPolyVerify(poly, edge) {
  var i = edge;

  do {
    if (i == poly) {
      return;
    }
    i = i.next;
  } while (i != edge);
  throw "edge not in poly";
}

function meshCreate(verts) {
  if (verts.length == 0) {
    return null;
  }

  var head = {
    x: verts[0].x,
    y: verts[0].y,
    flag: 0,
    prev: null,
    next: null,
    link: null
  };

  var tail = head;

  for (var i = 1; i < verts.length; i++) {
    tail.next = {
      x: verts[i].x,
      y: verts[i].y,
      flag: 0,
      prev: tail,
      next: null,
      link: null
    };
    tail = tail.next;
  }

  tail.next = head;
  head.prev = tail;

  meshPolyVerify(head);

  return head;
}

function meshEdgeSplit(edge, bsp) {
  var next = edge.next;

  if (bspSideStable(bsp, edge.x, edge.y) * bspSideStable(bsp, next.x, next.y) >= 0.0) {
    throw "edge not crossing bsp";
  }

  var t = bspIntersect(bsp, edge.x, edge.y, next.x, next.y);

  var link = edge.link;
  var newEdge = {
    x: t * edge.x + (1.0 - t) * next.x,
    y: t * edge.y + (1.0 - t) * next.y,
    flag: edge.flag,
    prev: edge,
    next: edge.next,
    link: link
  };

  newEdge.next.prev = newEdge;
  edge.next = newEdge;

  if (link != null) {
    var newLink = {
      x: newEdge.x,
      y: newEdge.y,
      flag: edge.flag,
      prev: link,
      next: link.next,
      link: edge
    };

    newLink.next.prev = newLink;
    link.next = newLink;

    edge.link = newLink;
    link.link = newEdge;
  }

  meshPolyVerify(edge);

  return newEdge;
}

function meshEdgeCanMerge(edge) {
  var link = edge.link;

  if (link == null) {
    return true;
  }

  var next = edge.next;

  if (link.x != next.x || link.y != next.y) {
    return false;
  }

  var linkNext = link.next;

  if (edge.x != linkNext.x || edge.y != linkNext.y) {
    return false;
  }

  var prev = edge.prev;
  var linkNextNext = linkNext.next;

  if (prev.x != linkNextNext.x || prev.y != linkNextNext.y ||
      prev.link != linkNext || linkNext.link != prev) {
    return false;
  }

  return true;
}

function meshEdgeMerge(edge) {
  var link = edge.link;

  if (!meshEdgeCanMerge(edge)) {
    throw "Can't merge edge";
  }

  if (link != null) {
    var remLink = link.next;

    remLink.next.prev = remLink.prev;
    remLink.prev.next = remLink.next;

    edge.prev.link = link;
    link.link = edge.prev;

    remLink.next = null;
    remLink.prev = null;
    remLink.link = null;
  }

  edge.next.prev = edge.prev;
  edge.prev.next = edge.next;

  edge.next = null;
  edge.prev = null;
  edge.link = null;
}

function meshPolySplit(a, b) {
  meshEdgeInPolyVerify(a, b);

  var newA = {
    x: a.x,
    y: a.y,
    flag: a.flag,
    prev: b,
    next: a.next,
    link: a.link
  };

  var newB = {
    x: b.x,
    y: b.y,
    flag: b.flag,
    prev: a,
    next: b.next,
    link: b.link
  };

  newA.next.prev = newA;
  if (newA.link != null) {
    newA.link.link = newA;
  }

  newB.next.prev = newB;
  if (newB.link != null) {
    newB.link.link = newB;
  }

  a.next = newB;
  b.next = newA;
  a.link = b;
  b.link = a;

  meshPolyVerify(a);
  meshPolyVerify(b);
}

function meshPolyMerge(a, b) {
  var aNext = a.next;
  var bNext = b.next;

  if (a.link != b || b.link != a ||
      a.x != bNext.x || a.y != bNext.y ||
      b.x != aNext.x || b.y != aNext.y) {
    throw "Cannot merge mesh"
  }

  a.next = bNext.next;
  a.next.prev = a;
  a.link = bNext.link;
  if (a.link != null) {
    a.link.link = a;
  }

  b.next = aNext.next;
  b.next.prev = b;
  b.link = aNext.link;
  if (b.link != null) {
    b.link.link = b;
  }

  aNext.next = null;
  aNext.prev = null;
  aNext.link = null;
  bNext.next = null;
  bNext.prev = null;
  bNext.link = null;

  meshEdgeInPolyVerify(a, b);
  meshPolyVerify(a);
}

function meshPolyRemove(poly) {
  var i = poly;

  do {
    if (i.link != null) {
      i.link.link = null;
      i.link = null;
    }

    i = i.next;
  } while (i != poly);
}

function meshPolyCentroidArea(poly) {
  var a = 0.0;
  var cx = 0.0;
  var cy = 0.0;

  var i = poly;

  var prevX = i.prev.x;
  var prevY = i.prev.y;

  do {
    // accumulate area
    a += prevX * i.y - i.x * prevY;

    // accumulate centroid
    cx += (prevX + i.x) * (prevX * i.y - i.x * prevY);
    cy += (prevY + i.y) * (prevX * i.y - i.x * prevY);

    prevX = i.x;
    prevY = i.y;
    i = i.next;
  } while (i != poly);

  return { x: cx / (3.0 * a), y: cy / (3.0 * a), area: a * 0.5 }
}

function meshPolyRadiusSquared(poly) {
  var i = poly;
  var r = 0.0;
  do {
    r = Math.max(r, i.x * i.x + i.y * i.y);
  } while (i != poly);

  return r;
}

function meshEdgeTransform(edge, t) {
  var x = edge.x * t.ix + edge.y * t.jx + t.dx;
  var y = edge.x * t.iy + edge.y * t.jy + t.dy;

  edge.x = x;
  edge.y = y;
}

function meshPolyStroke(edge, ctx) {
  var i = edge;

  ctx.beginPath();
  ctx.moveTo(i.x, i.y);

  do {
    i = i.next;
    ctx.lineTo(i.x, i.y);
  } while (i != edge);

  ctx.stroke();

  do {
    ctx.beginPath();
    ctx.arc(i.x, i.y, 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'black';
    ctx.fill();
    i = i.next;
  } while (i != edge);
}

function meshPolyFill(edge, ctx) {
  var i = edge;

  ctx.beginPath();
  ctx.moveTo(i.x, i.y);
  do {
    i = i.next;
    ctx.lineTo(i.x, i.y);
  } while (i != edge);

  ctx.fillStyle = 'lightblue';
  ctx.fill();
}
