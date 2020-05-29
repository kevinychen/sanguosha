import * as classNames from 'classnames';
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
        this.state = { volume: 0.1 };
    }

    render() {
        return <div>
            {process.env.REACT_APP_LOCAL ? <Room /> : <Lobby playAudio={() => this.audio.play()} />}
            <button
                className={classNames('toggle-sound', this.state.volume === 0 ? 'off' : 'on')}
                onClick={() => {
                    this.audio.volume = 0.1 - this.audio.volume;
                    this.setState({ volume: this.audio.volume });
                }}
            />
        </div>;
    }
}

render(<App />, document.getElementById("root"));
