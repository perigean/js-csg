
// TODO: make this a polygon mesh instead, have big array of edges, indexes for next and link? Why not big array of polys, each having a set of links?

// requires bsp.js

var meshTest = {
    // array of vertices, every 2 elements is a 2d point
    vert: [
        -200, -200,
        200, -200,
        200,  200
    ],
    // array of triangles, every 3 elements are indices into vert
    // vertices are in counter-clockwise order
    tri: [
        0, 1, 2
    ],
    // array of links, same indices as tri, -1 is no link, >= 0 is index of
    // linked vertex. Linked vertices share their following edges
    // link[i] >= 0 ==> link[link[i]] == i, i.e. links are reciprocal
    link: [
        -1, -1, -1 // don't have links to start out...
    ]
    /*
    link: [
        -1, -1, 3,
        2, -1, -1
    ]
    */
};

function meshVerify(mesh) {
    // no duplicate points
    // no points inside triangles
    // all triangles are CCW (also ==> no degenerate triangles)
    // only 2 edges can share vertices, but only in opposite direction, and
    // they must be linked
}

function meshDraw(mesh, ctx) {

    // draw vertices
    ctx.fillStyle = "#000000";
    for (var v = 0; v < mesh.vert.length; v += 2) {
        ctx.beginPath();
        ctx.arc(mesh.vert[v], mesh.vert[v + 1], 3, 0, 6.28318530718);
        ctx.fill();
    }

    ctx.strokeStyle = "#000000";
    for (var t = 0; t < mesh.tri.length; t += 3) {
        var v0 = mesh.tri[t];
        var v1 = mesh.tri[t + 1];
        var v2 = mesh.tri[t + 2];

        var v0x = mesh.vert[v0 * 2];
        var v0y = mesh.vert[v0 * 2 + 1];
        var v1x = mesh.vert[v1 * 2];
        var v1y = mesh.vert[v1 * 2 + 1];
        var v2x = mesh.vert[v2 * 2];
        var v2y = mesh.vert[v2 * 2 + 1];

        ctx.beginPath();
        ctx.moveTo(0.96 * v0x + 0.02 * v1x + 0.02 * v2x, 0.96 * v0y + 0.02 * v1y + 0.02 * v2y);
        ctx.lineTo(0.02 * v0x + 0.96 * v1x + 0.02 * v2x, 0.02 * v0y + 0.96 * v1y + 0.02 * v2y);
        ctx.lineTo(0.02 * v0x + 0.02 * v1x + 0.96 * v2x, 0.02 * v0y + 0.02 * v1y + 0.96 * v2y);
        ctx.closePath();
        ctx.stroke();

        ctx.fillText((t / 3).toString(), (v0x + v1x + v2x) / 3, (v0y + v1y + v2y) / 3);
    }
}

// checks to see if an edge crosses a binary space partition
// if it does cross, adds the intersection point to mesh.vert,
// and returns the point's index
// if it doesn't cross, return -1
//
// mesh: mesh containing edge to be split
//  tri: index of triangle in mesh (first vertex is mesh.tri[tri*3]
// edge: index of edge in mesh, (vertex is mesh.tri[tri + edge]
//  bsp: binary space partition splitting edge
function meshIntersectEdgeBsp(mesh, tri, edge, bsp) {
    // indices of vertex for edge
    var va = mesh.tri[tri * 3 + edge];
    var vb = mesh.tri[tri * 3 + (edge + 1) % 3];

    // endpoints of edge
    var ax = mesh.vert[va * 2];
    var ay = mesh.vert[va * 2 + 1];
    var bx = mesh.vert[vb * 2];
    var by = mesh.vert[vb * 2 + 1];

    if (bspCross(bsp, ax, ay, bx, by)) {
        // get intersection point
        var p = bspIntersect(bsp, ax, ay, bx, by);

        // get index of new point, and add to vertex list
        var vp = mesh.vert.length / 2;
        mesh.vert.push(p.x);
        mesh.vert.push(p.y);

        return vp;
    } else {
        return -1;
    }
}

function meshLinkEdge(mesh, u, v) {
    var triu = Math.floor(u / 3);
    var triv = Math.floor(v / 3);

    // u1 is next vertex in triu after u, v1 is after v
    var u1 = (u + 1) % 3 + triu;
    var v1 = (v + 1) % 3 + triv;

    // assert that beginning and end of linked edge share vertices
    if (mesh.tri[u] != mesh.tri[v1]) {
        throw "linked edges " + u + " and " + v + " don't line up";
    }
    if (mesh.tri[v] != mesh.tri[u1]) {
        throw "linked edges " + u + " and " + v + " don't line up";
    }

    mesh.link[u] = v;
    mesh.link[v] = u;
}

function meshSplitEdge(mesh, tri, edge, point) {
    var v0 = tri * 3 + edge;
    var v1 = tri * 3 + (edge + 1) % 3;
    var v2 = tri * 3 + (edge + 2) % 3;

    var p0 = mesh.tri[v0];
    var p1 = mesh.tri[v1];
    var p2 = mesh.tri[v2];

    // add the new triangle
    var newTri = mesh.tri.length / 3;
    mesh.tri.push(point);
    mesh.tri.push(p1);
    mesh.tri.push(p2);
    mesh.link.push(-1);
    mesh.link.push(-1);
    mesh.link.push(-1);

    // link new tri to possible other triangle linked from v1
    if (mesh.link[v1] >= 0) {
        meshLinkEdge(mesh, newTri * 3 + 1, mesh.link[v1]);
    }

    // shrink tri to make room for newTri, link newTri to tri
    mesh.tri[v1] = point;

    //mesh.linkEdge(mesh, v1, newTri + 2);

    // if the split edge is linked to another triangle
    if (mesh.link[v0] >= 0) {
        throw "not implemented yet!";
    }
}

function meshTriBspSide(mesh, tri, bsp) {
    var p0 = mesh.tri[tri * 3];
    var p1 = mesh.tri[tri * 3 + 1];
    var p2 = mesh.tri[tri * 3 + 2];

    var px = (mesh.vert[p0 * 2] + mesh.vert[p1 * 2] + mesh.vert[p2 * 2]) / 3;
    var py = (mesh.vert[p0 * 2 + 1] + mesh.vert[p1 * 2 + 1] + mesh.vert[p2 * 2 + 1]) / 3;

    return bspSide(bsp, px, py);
}

// splits a triangle from a mesh over a a single binary space partition
// splits/adds triangles so that no triangle is crossing bsp
// if a linked edge is split, the linked triangle is also split
//
// mesh: mesh containing triangle to be split
//  tri: index of triangle to be split in mesh
//  bsp: binary space partition to split triangle
function meshSplitTriBspTree(mesh, tri, bsp) {
    for (var edge = 0; edge < 3; edge++) {
        var point = meshIntersectEdgeBsp(mesh, tri, edge, bsp);

        if (point >= 0) {
            meshSplitEdge(mesh, tri, edge, point);
        }
    }

    if (meshTriBspSide(mesh, tri, bsp >= 0)) {
        if (bsp.in) {
            meshSplitTriBspTree(mesh, tri, bsp.in);
        }
    } else {
        if (bsp.out) {
            meshSplitTriBspTree(mesh, tri, bsp.out);
        }
    }
}

function meshSplitBspTree(mesh, bsp) {
    for(var tri = 0; tri < mesh.tri.length / 3; tri++) {
        meshSplitTriBspTree(mesh, tri, bsp);
    }
}

/*
// prototype, real version should be compatible with WebGL buffer objects

// a mesh is just a list of triangles, triangle just an array of points

var meshTest = [
    [ { x: -200, y: -200}, { x: 200, y: -200}, { x: 200, y: 200} ],
    [ { x: -200, y: -200}, { x: -200, y: 200}, { x: 200, y: 200} ]
];

function meshDraw(mesh, ctx) {
    ctx.beginPath();
    for (var i = 0; i < mesh.length; i++) {
        var tri = mesh[i];

        ctx.moveTo(tri[0].x, tri[0].y);
        ctx.lineTo(tri[1].x, tri[1].y);
        ctx.lineTo(tri[2].x, tri[2].y);
        ctx.lineTo(tri[0].x, tri[0].y);
    }
    ctx.stroke();
}


function triSplit(tri, bsp, mesh) {
}

function meshBspIntersect(mesh, bsp) {
    for (var t = 0; t < mesh.length; t++) {
        var tri = mesh[t];
        var noIntersectCount = 0;

        for (var v = 0; noIntersectCount < 3; v++) {
            var v0 = tri[v % 3];       // current vertex in triangle
            var v1 = tri[(v + 1) % 3]; // next vertex
            var v2 = tri[(v + 2) % 3]; // previous (next next) vertex
            var p = bspTreeIntersect(bsp, v0.x, v0.y, v1.x, v1.y);

            if (p) {
            // todo: check to see if p is close to points on the triangle
                // make a new triangle for the other side of the split
                // this triangle might need to be split again, so put it at the end
                mesh.push([
                    { x: p.x, y: p.y },
                    { x: v1.x, y: v1.y },
                    { x: v2.x, y: v2.y }
                ]);

                // make room for newTri by moving the next vertex
                v1.x = p.x;
                v1.y = p.y;
                noIntersectCount = 0;
            } else {
                noIntersectCount++;
            }
        }
        camClear(camera);
        camTransform(camera);
        meshDraw(meshTest, camera.ctx);
    }

//    for (var t = 0; t < mesh.length;) {
//        var tri = mesh[t];
//        if (bspTreeIn(bsp,
//            (tri[0].x + tri[1].x + tri[2].x) / 3,
//            (tri[0].y + tri[1].y + tri[2].y) / 3)) {
//
//            t++;
//        } else {
//            mesh.splice(t, 1);
//        }
//    }
}
*/
