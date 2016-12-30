// Deterministic recorder log
// captures external state changes, allows them to be replayed
// wraps all inputs into phys so that it can be replayed

// clicks is all we care about. Record in world coordinates to make it view independent

// TODO: figure out how to do input with less action at a distance
//  we can't handle keypresses during replay now...

import {
  physTimeStep,
} from './phys.js';

function recorderCreate(phys, input, logText, frameText) {
  return {
    phys: phys,
    frame: 0,
    input: input,
    lastFrameInput: JSON.stringify(input),
    logText: logText,
    frameText: frameText,
  };
}

function recorderTimeStep(recorder) {
  // record input
  var thisFrameInput = JSON.stringify(recorder.input);

  if (thisFrameInput !== recorder.lastFrameInput) {
    recorder.logText.value += ',\n' + JSON.stringify({
      frame: recorder.frame,
      input: recorder.input
    });
  }

  physTimeStep(recorder.phys);
  recorder.lastFrameInput = thisFrameInput;
  recorder.frame++;
  recorder.frameText.value = recorder.frame.toString();
}

function recorderReplay(recorder, render) {
  var inputLog = JSON.parse('[' + recorder.logText.value + ']');
  var replayToFrame = Number(recorder.frameText.value);

  recorder.logText.innerHTML = '{"frame":0,"input":{"left":false,"right":false,"throttle":false,"fire":false}}';
  recorder.frame = 0;
  recorder.frameText.value = '0';

  function recorderReplayer() {
    while (inputLog.length > 0 && inputLog[0].frame == recorder.frame) {
      var newInput = inputLog[0].input;
      recorder.input.left = newInput.left;
      recorder.input.right = newInput.right;
      recorder.input.throttle = newInput.throttle;
      recorder.input.fire = newInput.fire;
      inputLog.shift();
    }

    recorderTimeStep(recorder);
    render();

    if (recorder.frame < replayToFrame) {
      requestAnimationFrame(recorderReplayer);
    }
  }

  if (replayToFrame > 0) {
    requestAnimationFrame(recorderReplayer);
  }
}

export {
  recorderCreate,
  recorderReplay,
  recorderTimeStep,
};
