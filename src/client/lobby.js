import React from 'react';
import { Lobby } from 'boardgame.io/react';
import { SanGuoSha } from '../lib/game';
import { SanGuoShaBoard } from './board';
import './lobby.css';

const SERVER = document.location.toString().replace(/\/$/, '');
const GAMES = [{ game: SanGuoSha, board: SanGuoShaBoard }];

export default class SanGuoShaLobby extends React.Component {

    render() {
        return <div className='lobby'>
            <div className='title'>
                <img src='./name.png' alt='sanguosha' />
            </div>
            <Lobby gameServer={SERVER} lobbyServer={SERVER} gameComponents={GAMES} />
        </div>;
    }
}
