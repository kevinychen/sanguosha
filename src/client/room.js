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
    multiplayer: MULTIPLAYER ? SocketIO({ server: document.location.toString() }) : undefined,
    enhancer: applyMiddleware(logger),
});

export default class Room extends React.Component {

    render() {
        return (
            <div>
                <SanGuoShaClient playerID={"0"} />
            </div>
        );
    }
}
