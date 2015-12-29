// Deterministic recorder log
// captures external state changes, allows them to be replayed
// wraps all inputs into phys so that it can be replayed

// requires phys.js

// TODO: don't couple to phys, do only for input
// IDEA: allow people to register callbacks for events
// clicks is all we care about. Record in world coordinates to make it view independent
/*
function recorderCreate(phys, logText) {
  return {
    phys: phys,
    frame: 0,
    logText: logText
  };
}

function recorderLogCall(rec, op, args) {
  var logJSON = JSON.stringify(
    { op: op, args: args }
  );

  if(rec.logText.value != '') {
    rec.logText.value += ',\n' + logJSON;
  } else {
    rec.logText.value = logJSON;
  }
}

function recorderNextFrame(rec) {
  recorderLogCall(rec, 'NextFrame', []);
  physTimeStep(rec.phys);
}

function recorderAddShape(rec, verts, d, θ, v, ω, properties) {
  recorderLogCall(rec, 'AddShape', [ verts, properties, d, θ, v, ω ]);

  var mesh = meshCreate(verts);
  var solid = solidCreate(mesh);
  physBodyCreate(rec.phys, solid, d, θ, v, ω, properties);
}

function recorderAddParticle(rec, m, d, v, t) {
  recorderLogCall(rec, 'AddParticle', [ m, d, v, t ]);
  physParticleCreate(rec.phys, m, d, v, t);
}

function recorderClipBodies(rec, bsp) {
  recorderLogCall(rec, 'ClipBodies', [ bsp ]);
  physClipBodies(rec.phys, bsp);
}

function recorderReplay(rec, frame) {
  var replayJSON = '[' + rec.logText.value + ']';
  var replay = JSON.parse(replayJSON);
  rec.logText.value = '';

  physReset(rec.phys);

  for (var i = 0; i < replay.length; i++) {
    var action = replay[i];

    switch (action.op) {
      case 'NextFrame':
      recorderNextFrame(rec);
      break;

      case 'AddShape':
        recorderAddShape.apply(this, [rec].concat(action.args));
        break;

      case 'AddParticle':
        recorderAddParticle.apply(this, [rec].concat(action.args));
        break;

      case 'ClipBodies':
        recorderClipBodies.apply(this, [rec].concat(action.args));
        break;

      default:
        throw 'unknown replay action';
    }
  }
}
*/
