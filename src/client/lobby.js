import React from 'react';
import { Lobby } from 'boardgame.io/react';
import { SanGuoSha } from '../lib/game';
import { SanGuoShaBoard } from './board';

const server = `http://${window.location.hostname}:8000`;
const importedGames = [{ game: SanGuoSha, board: SanGuoShaBoard }];

export default () => (
    <div>
        <h1>Lobby</h1>
        <Lobby gameServer={server} lobbyServer={server} gameComponents={importedGames} />
    </div>
);
