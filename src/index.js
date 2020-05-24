import React from 'react';
import { render } from 'react-dom';
import Room from './client/room';
import Lobby from './client/lobby';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.audio = new Audio();
        this.audio.src = './background.mp3';
        this.audio.volume = 0.1;
        this.audio.loop = true;
        this.audio.play();
    }

    render() {
        return process.env.REACT_APP_LOCAL ? <Room /> : <Lobby audio={this.audio} />;
    }
}

render(<App />, document.getElementById("root"));
