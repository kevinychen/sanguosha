import React from 'react';
import { render } from 'react-dom';
import Room from './client/room';
import Lobby from './client/lobby';

class App extends React.Component {
    render() {
        return process.env.REACT_APP_LOCAL ? <Room /> : <Lobby />;
    }
}

render(<App />, document.getElementById("root"));
