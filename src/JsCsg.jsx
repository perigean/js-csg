import React from 'react';

import {
  camCreate,
  camClear,
} from './camera.js';

import {
  physCreate,
  physBodyAdd,
  physDraw,
} from './phys.js';

class JsCsg extends React.Component {
  constructor(props) {
    super(props);
    const phys = physCreate(0.016666667);
    if (props.bodies) {
      for (const body of props.bodies) {
        physBodyAdd(phys, body);
      }
    }
    this.state = {
      phys: phys,
    };
  }

  render() {
    const canvasRef = (canvas) => {
      this.camera = camCreate(canvas, (camera) => {
        camClear(camera);
        physDraw(this.state.phys, camera);
      });
    };
    return (
      <div>
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{
            borderStyle: 'solid',
            borderColor: 'black',
          }} />
      </div>
    );
  }
}

export {
  JsCsg
};

/*
<br />
<button id="playpause">▶</button>
<button id="nextframe">▶|</button>
<button id="replay">replay</button>
<span>frame: <input id="frame" type="text" value="0" /></span>
<div style="font-family: monospace;">
  World: (<span id="worldx" class="width: 128px;"></span> px,
  <span id="worldy" class="width: 128px;"></span> px)
</div>
<div style="font-family: monospace;">
  Local: (<span id="localx" class="width: 128px;"></span> px,
  <span id="localy" class="width: 128px;"></span> px)
</div>
<textarea id="log" rows="8" cols="80">{"frame":0,"input":{"left":false,"right":false,"throttle":false,"fire":false}}</textarea>
<textarea id="flagged" rows="1" cols="80"></textarea>
*/
