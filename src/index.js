import React from 'react';
import { render } from 'react-dom';
import Lobby from './client/lobby';
import Room from './client/room';

const START_IN_LOBBY = false;

class App extends React.Component {
    render() {
        return START_IN_LOBBY ? <Lobby /> : <Room />;
    }
}

render(<App />, document.getElementById("root"));
