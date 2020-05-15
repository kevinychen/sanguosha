import React from 'react';
import { Lobby } from 'boardgame.io/react';
import { TicTacToe } from '../lib/game';
import { TicTacToeBoard } from './board';

const server = `http://${window.location.hostname}:8000`;
const importedGames = [{ game: TicTacToe, board: TicTacToeBoard }];

export default () => (
    <div>
        <h1>Lobby</h1>
        <Lobby gameServer={server} lobbyServer={server} gameComponents={importedGames} />
    </div>
);
