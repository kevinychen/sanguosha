import React from 'react';
import { LobbyClient } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/react';
import { SanGuoSha } from '../lib/game';
import { SanGuoShaBoard } from './board';
import './lobby.css';

const SERVER = process.env.REACT_APP_PROXY || document.location.toString().replace(/\/$/, '');
const NAME_KEY = 'name';
const CREDENTIALS_KEY = 'credentials';
const INPUT_NAME_ID = 'name-input';

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
        this.state = {
            name: window.localStorage.getItem(NAME_KEY),
            credentials: window.localStorage.getItem(CREDENTIALS_KEY),
            matches: [],
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
        const { name } = this.state;
        const { matches } = await this.lobbyClient.listMatches(SanGuoSha.name);
        const myMatch = matches.find(match => match.players.some(player => name !== undefined && player.name === name));

        if (myMatch !== undefined) {
            if (myMatch.setupData.parentMatchID !== undefined) {
                this.setState({ matches, myMatch, activePlayerID: myMatch.players.find(player => player.name === name).id.toString() });
                return;
            }

            const childMatch = matches.find(match => match.setupData.parentMatchID === myMatch.matchID);
            if (childMatch !== undefined) {
                const playerID = await this.leaveMatch(myMatch);
                await this.joinMatch(childMatch.matchID, playerID);
                this.refreshLobbyState();
                return;
            }
        }

        this.setState({ matches, myMatch });
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.refreshLobbyState, 1000);
        return;
    }

    render() {
        const { credentials, myMatch, watchingMatch, activePlayerID } = this.state;
        if (activePlayerID !== undefined) {
            return <div>
                <SanGuoShaClient
                    matchID={(myMatch || watchingMatch).matchID}
                    playerID={activePlayerID}
                    credentials={credentials}
                    playAgain={myMatch === undefined ? undefined : () => {
                        this.client = undefined;
                        this.setState({ activePlayerID: undefined });
                        this.playAgain((myMatch || watchingMatch).matchID, activePlayerID).then(this.refreshLobbyState);
                    }}
                />
                <button
                    className="leave-button"
                    onClick={() => {
                        this.client = undefined;
                        this.setState({ activePlayerID: undefined });
                        this.leaveMatch(myMatch).then(this.refreshLobbyState);
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
                {this.maybeRenderCreateButton()}
                <div id="instances">
                    <table>
                        <tbody>{matches.map(this.renderMatch)}</tbody>
                    </table>
                </div>
            </div>;
        };
    }

    maybeRenderCreateButton() {
        const { myMatch } = this.state;
        if (myMatch !== undefined) {
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
        const { name, myMatch } = this.state;
        const { createdAt, gameover, matchID, players, setupData } = match;
        const playerNames = players.map(player => player.name).filter(name => name !== undefined);
        let status;
        if (gameover) {
            status = 'Completed';
        } else if (setupData.parentMatchID !== undefined) {
            status = 'In progress';
        } else if (playerNames.length < SanGuoSha.minPlayers) {
            status = 'Waiting for more players';
        } else {
            status = 'Waiting for host to start';
        }
        const buttons = [];
        if (myMatch === undefined || matchID !== myMatch.matchID) {
            if (!gameover && players.some(player => player.name === undefined)) {
                buttons.push(
                    <button
                        key="join"
                        onClick={() => this.leaveMatch(myMatch)
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
                        onClick={() => this.leaveMatch(myMatch)
                            .then(() => this.setState({ myMatch: undefined, watchingMatch: match, activePlayerID: "-1" }))}
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
                    onClick={() => this.leaveMatch(myMatch).then(this.refreshLobbyState)}
                >
                    {'Leave'}
                </button>
            );
        }
        return <tr key={matchID}>
            <td>{`Created ${new Date(createdAt).toLocaleString()}`}</td>
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
                setupData: { parentMatchID },
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
        this.setState({ credentials: playerCredentials });
        window.localStorage.setItem(CREDENTIALS_KEY, playerCredentials);
    }

    leaveMatch = async match => {
        if (match === undefined) {
            return;
        }
        const { name, credentials } = this.state;
        const { matchID, players } = match;
        const player = players.find(player => player.name === name);
        await this.lobbyClient.leaveMatch(
            SanGuoSha.name,
            matchID,
            {
                playerID: player.id.toString(),
                credentials,
            },
        );
        return player.id.toString();
    }

    playAgain = async (matchID, playerID) => {
        const { credentials, myMatch } = this.state;
        const { nextMatchID } = await this.lobbyClient.playAgain(SanGuoSha.name, matchID, {
            playerID,
            credentials,
            numPlayers: SanGuoSha.maxPlayers,
            setupData: {},
        });
        await this.leaveMatch(myMatch);
        this.joinMatch(nextMatchID, playerID);
    }
}
