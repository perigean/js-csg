import React from 'react';

class JsCsg extends React.Component {
  render() {
    return (
      <div>
        <canvas
          ref={canvas => this.canvas = canvas}
          style={{
            borderStyle: 'solid',
            borderColor: 'black',
            width: '640px',
            height: '480px',
          }} />
      </div>
    );
  }

  //componentDidMount() {

  //}
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
