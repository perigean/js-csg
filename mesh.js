
// TODO: rules of mesh node lifetimes, so we know when it's safe to keep a reference

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
    prev: null,
    next: null,
    link: null
  };

  var tail = head;

  for (var i = 1; i < verts.length; i++) {
    tail.next = {
      x: verts[i].x,
      y: verts[i].y,
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

function meshSplitEdge(edge, x, y) {
  var link = edge.link;
  var newEdge = {
    x: x,
    y: y,
    prev: edge,
    next: edge.next,
    link: link
  };

  edge.next.prev = newEdge;
  edge.next = newEdge;

  if (link != null) {
    var newLink = {
      x: x,
      y: y,
      prev: link,
      next: link.next,
      link: edge
    };

    link.next.prev = newLink;
    link.next = newLink;

    edge.link = newLink;
    link.link = newEdge;
  }

  meshPolyVerify(edge);

  return newEdge;
}

function meshSplitPoly(a, b) {
  meshEdgeInPolyVerify(a, b);

  var newA = {
    x: a.x,
    y: a.y,
    prev: b,
    next: a.next,
    link: a.link
  };

  var newB = {
    x: b.x,
    y: b.y,
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

function meshMergePoly(a, b) {
  var aNext = a.next;
  var bNext = b.next;

  if (a.link != b || b.link != a ||
      a.x != bNext.x || a.y != bNext.y ||
      b.x != aNext.a || b.y != aNext.y) {
    throw "Cannot merge mesh"
  }

  a.next = bNext.next;
  a.next.prev = a;
  a.link = bNext.link;
  a.link.link = a;

  b.next = aNext.next;
  b.next.prev = b;
  b.link = aNext.link;
  b.link.link = b;

  meshEdgeInPolyVerify(a, b);
  meshPolyVerify(a);
}

function meshRemovePoly(edge) {
  var i = edge;

  do {
    i.link.link = null;
    i.link = null;
    i = i.next;
  } while (i != edge);
}

function meshStrokePoly(edge, ctx) {
  var i = edge;

  ctx.beginPath();
  ctx.moveTo(i.x, i.y);

  do {
    i = i.next;
    ctx.lineTo(i.x, i.y);
  } while (i != edge);

  ctx.stroke();
}

function meshFillPoly(edge, ctx) {
  var i = edge;

  ctx.beginPath();
  ctx.moveTo(i.x, i.y);

  do {
    i = i.next;
    ctx.lineTo(i.x, i.y);
  } while (i != edge);

  ctx.fill();
}
