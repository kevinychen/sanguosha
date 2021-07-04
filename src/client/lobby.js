import React from 'react';
import { LobbyClient } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/react';
import { SanGuoSha } from '../lib/game';
import { SanGuoShaBoard } from './board';
import './lobby.css';

const SERVER = process.env.REACT_APP_PROXY || document.location.toString().replace(/\/$/, '');
const NAME_KEY = 'name';
const MATCH_INFO_KEY = 'matchInfo';
const INPUT_NAME_ID = 'name-input';
const EXPANSIONS = ['wind', 'fire', 'wood', 'knight11', 'hill', 'sp11', 'knight12'];

const SanGuoShaClient = Client({
    game: SanGuoSha,
    board: SanGuoShaBoard,
    multiplayer: SocketIO({ server: SERVER }),
    debug: false,
});

export default class SanGuoShaLobby extends React.Component {

    constructor(props) {
        super(props);
        this.lobbyClient = new LobbyClient({ server: SERVER });
        const matchInfo = window.localStorage.getItem(MATCH_INFO_KEY);
        this.state = {
            name: window.localStorage.getItem(NAME_KEY),
            matchInfo: matchInfo ? JSON.parse(matchInfo) : undefined, // { matchID, playerID, credentials }
            matches: [],
            inGame: false,
        };
    }

    componentDidMount() {
        // Mobile requires explicit user action to play audio
        document.querySelector('#lobby-view').addEventListener('click', this.props.playAudio);
        this.refreshLobbyState();
    }

    componentWillUnmount() {
        document.querySelector('#lobby-view').removeEventListener('click', this.props.playAudio);
    }

    refreshLobbyState = async () => {
        const { matchInfo } = this.state;
        const { matches } = await this.lobbyClient.listMatches(SanGuoSha.name);

        if (matchInfo !== undefined) {
            const { matchID, playerID } = matchInfo;

            const match = matches.find(match => match.matchID === matchID);
            if (match === undefined) {
                this.setState({ matchInfo: undefined });
                await this.leaveMatch();
                this.refreshLobbyState();
                return;
            }

            if (match.setupData.parentMatchID !== undefined) {
                this.setState({ inGame: true });
                return;
            }

            const childMatch = matches.find(match => match.setupData.parentMatchID === matchID);
            if (childMatch !== undefined) {
                await this.leaveMatch();
                await this.joinMatch(childMatch.matchID, playerID);
                this.refreshLobbyState();
                return;
            }
        }

        this.setState({ matches });
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.refreshLobbyState, 1000);
        return;
    }

    render() {
        const { matchInfo, inGame } = this.state;
        if (inGame) {
            const { matchID, playerID, credentials } = matchInfo;
            return <div>
                <SanGuoShaClient
                    matchID={matchID}
                    playerID={playerID}
                    credentials={credentials}
                    playAgain={playerID === '-1' ? undefined : () => {
                        this.setState({ inGame: false });
                        this.playAgain().then(this.refreshLobbyState);
                    }}
                />
                <button
                    className="leave-button"
                    onClick={() => {
                        this.setState({ inGame: false });
                        this.leaveMatch().then(this.refreshLobbyState);
                    }}
                >
                    {'Leave'}
                </button>
            </div>;
        }
        return <div className='lobby'>
            <div className='title'>
                <img src='./name.png' alt='sanguosha' />
            </div>
            <div id="lobby-view">{this.renderLobby()}</div>
        </div>;
    }

    resetName = () => {
        window.localStorage.removeItem(NAME_KEY);
        this.setState({ name: null });
        this.renderLobby();
    }

    renderLobby() {
        const { name, matches } = this.state;
        if (name === null || name === undefined) {
            return <div>
                <p>{'Choose a player name:'}</p>
                <input
                    id={INPUT_NAME_ID}
                    type="text"
                    defaultValue="Visitor"
                    onKeyPress={e => {
                        if (e.nativeEvent.key === 'Enter') {
                            this.setName();
                        }
                    }}
                />
                <button onClick={this.setName}>{'Enter'}</button>
            </div>;
        } else {
            return <div>
                <p>{`Welcome, ${name}`}</p>
                <button onClick={this.resetName}>Reset Name</button>
                {this.maybeRenderCreateButton()}
                <div id="instances">
                    <table>
                        <tbody>
                            <tr>
                                <th>{'Creation time'}</th>
                                <th>{'Players'}</th>
                                <th>{'Status'}</th>
                                <th></th>
                            </tr>
                            {matches.map(this.renderMatch)}
                        </tbody>
                    </table>
                </div>
            </div>;
        };
    }

    maybeRenderCreateButton() {
        const { matchInfo } = this.state;
        if (matchInfo !== undefined) {
            return;
        }
        return <button
            onClick={() => this.createMatch(SanGuoSha.maxPlayers, undefined)
                .then(matchID => this.joinMatch(matchID, '0'))
                .then(this.refreshLobbyState)}
        >
            {'Create new room'}
        </button>;
    }

    renderMatch = match => {
        const { name, matchInfo } = this.state;
        const { createdAt, gameover, matchID, players, setupData } = match;
        const playerNames = players.map(player => player.name).filter(name => name !== undefined);
        let status;
        if (gameover) {
            status = 'Completed';
        } else if (setupData.parentMatchID !== undefined) {
            status = 'In progress';
        } else if (playerNames.length < SanGuoSha.minPlayers) {
            status = 'Waiting for more players';
        } else if (playerNames[0] === name) {
            EXPANSIONS.forEach((s) => this.state[`expansion-${s}`] = true);
            status = ['Expansions:', ...EXPANSIONS.map(expansion => <span key={expansion} className='expansion'>
                <input
                    type='checkbox'
                    value={this.state[`expansion-${expansion}`]}
                    onChange={e => this.setState({ [`expansion-${expansion}`]: e.target.checked })}
                    checked='true'
                />
                {expansion}
            </span>)];
        } else {
            status = 'Waiting for host to start';
        }
        const buttons = [];
        if (matchInfo === undefined || matchInfo.matchID !== matchID) {
            if (!gameover && players.some(player => player.name === undefined)) {
                buttons.push(
                    <button
                        key="join"
                        onClick={() => this.leaveMatch()
                            .then(() => this.joinMatch(matchID, players.find(player => player.name === undefined).id.toString()))
                            .then(this.refreshLobbyState)}
                    >
                        {'Join'}
                    </button>
                );
            } else {
                buttons.push(
                    <button
                        key="watch"
                        onClick={() => this.leaveMatch()
                            .then(() => this.setState({ matchInfo: { matchID: matchID, playerID: '-1', }, inGame: true }))}
                    >
                        {'Watch'}
                    </button>
                );
            }
        } else {
            if (playerNames[0] === name && playerNames.length >= SanGuoSha.minPlayers) {
                buttons.push(
                    <button
                        key="start"
                        onClick={() => this.createMatch(playerNames.length, matchID).then(this.refreshLobbyState)}
                    >
                        {'Start'}
                    </button>
                );
            }
            buttons.push(
                <button key="leave"
                    onClick={() => this.leaveMatch().then(this.refreshLobbyState)}
                >
                    {'Leave'}
                </button>
            );
        }
        return <tr key={matchID}>
            <td>{new Date(createdAt).toLocaleString()}</td>
            <td>{playerNames.join(', ')}</td>
            <td>{status}</td>
            <td>{buttons}</td>
        </tr>;
    }

    setName = () => {
        const name = document.getElementById(INPUT_NAME_ID).value;
        this.setState({ name });
        window.localStorage.setItem(NAME_KEY, name);
    }

    createMatch = async (numPlayers, parentMatchID) => {
        const { matchID } = await this.lobbyClient.createMatch(
            SanGuoSha.name,
            {
                numPlayers,
                setupData: {
                    parentMatchID,
                    expansions: EXPANSIONS.filter(expansion => this.state[`expansion-${expansion}`]),
                },
            },
        );
        return matchID;
    }

    joinMatch = async (matchID, playerID) => {
        const { name } = this.state;
        const { playerCredentials } = await this.lobbyClient.joinMatch(
            SanGuoSha.name,
            matchID,
            {
                playerID,
                playerName: name,
            },
        );
        const matchInfo = {
            matchID,
            playerID,
            credentials: playerCredentials,
        };
        this.setState({ matchInfo });
        window.localStorage.setItem(MATCH_INFO_KEY, JSON.stringify(matchInfo));
    }

    leaveMatch = async () => {
        const { matchInfo } = this.state;
        this.setState({ matchInfo: undefined, inGame: false });
        window.localStorage.removeItem(MATCH_INFO_KEY);
        if (matchInfo === undefined || matchInfo.credentials === undefined) {
            return;
        }
        const { matchID, playerID, credentials } = matchInfo;
        await this.lobbyClient.leaveMatch(
            SanGuoSha.name,
            matchID,
            {
                playerID,
                credentials,
            },
        );
    }

    playAgain = async () => {
        const { matchInfo: { matchID, playerID, credentials } } = this.state;
        const { nextMatchID } = await this.lobbyClient.playAgain(SanGuoSha.name, matchID, {
            playerID,
            credentials,
            numPlayers: SanGuoSha.maxPlayers,
            setupData: {},
        });
        await this.leaveMatch();
        this.joinMatch(nextMatchID, playerID);
    }
}
