import React from 'react';
import { Lobby } from 'boardgame.io/react';
import { SanGuoSha } from '../lib/game';
import { SanGuoShaBoard } from './board';
import './lobby.css';

const SERVER = process.env.REACT_APP_PROXY || document.location.toString().replace(/\/$/, '');
const GAMES = [{ game: SanGuoSha, board: SanGuoShaBoard }];

export default class SanGuoShaLobby extends React.Component {

    componentDidMount() {
        // Mobile requires explicit user action to play audio
        document.querySelector('#lobby-view').addEventListener('click', this.props.playAudio);
    }

    componentWillUnmount() {
        document.querySelector('#lobby-view').removeEventListener('click', this.props.playAudio);
    }

    render() {
        return <div className='lobby'>
            <div className='title'>
                <img src='./name.png' alt='sanguosha' />
            </div>
            <Lobby gameServer={SERVER} lobbyServer={SERVER} gameComponents={GAMES} />
        </div>;
    }
}
