import React from 'react';
import { Client } from 'boardgame.io/react';
import { SanGuoSha } from '../lib/game';
import { SanGuoShaBoard } from './board';
import logger from 'redux-logger';
import { applyMiddleware } from 'redux';
import { SocketIO } from 'boardgame.io/multiplayer';

const MULTIPLAYER = false;

const SanGuoShaClient = Client({
    game: SanGuoSha,
    board: SanGuoShaBoard,
    numPlayers: 3,
    multiplayer: MULTIPLAYER ? SocketIO({ server: 'http://localhost:8000/' }) : undefined,
    enhancer: applyMiddleware(logger),
});

export default class Room extends React.Component {
    state = { playerID: null };

    render() {
        if (this.state.playerID === null && MULTIPLAYER) {
            return (
                <div>
                    <p>Play as</p>
                    <button onClick={() => this.setState({ playerID: "0" })}>
                        Player 0
                    </button>
                    <button onClick={() => this.setState({ playerID: "1" })}>
                        Player 1
                    </button>
                    <button onClick={() => this.setState({ playerID: "2" })}>
                        Player 2
                    </button>
                </div>
            );
        }
        return (
            <div>
                <SanGuoShaClient playerID={this.state.playerID} />
            </div>
        );
    }
}
