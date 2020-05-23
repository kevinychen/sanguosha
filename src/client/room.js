import React from 'react';
import { Client } from 'boardgame.io/react';
import { SanGuoSha } from '../lib/game';
import { SanGuoShaBoard } from './board';
import logger from 'redux-logger';
import { applyMiddleware } from 'redux';

const SanGuoShaClient = Client({
    game: SanGuoSha,
    board: SanGuoShaBoard,
    numPlayers: 3,
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
