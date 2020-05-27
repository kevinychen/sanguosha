import React from 'react';
import { ROLE_DIST } from '../lib/roles';
import './setModePanel.css';

export default class SetModePanel extends React.Component {

    static DEFAULT_MODE = 'Default';
    static GIVE_MODE = 'Give';
    static DISMANTLE_MODE = 'Dismantle';
    static STEAL_MODE = 'Steal';
    static REVEAL_MODE = 'Reveal';
    static HELP_MODE = 'Help';
    static SHOW_HOTKEYS_MODE = 'Hotkeys';
    static GIVE_JUDGMENT_MODE = 'Give Judgment';

    componentDidMount() {
        document.addEventListener('keydown', this.handleHotkey);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleHotkey);
    }

    render() {
        const { moves } = this.props;
        return <div className='set-mode-panel'>
            <div className='section'>
                {this.renderButton(SetModePanel.DEFAULT_MODE)}
                {this.renderButton(SetModePanel.GIVE_MODE)}
                {this.renderButton(SetModePanel.DISMANTLE_MODE)}
                {this.renderButton(SetModePanel.STEAL_MODE)}
                {this.renderButton(SetModePanel.REVEAL_MODE)}
                {this.renderButton(SetModePanel.HELP_MODE)}
                {this.renderButton(SetModePanel.SHOW_HOTKEYS_MODE)}
            </div>
            <div className='section'>
                <button
                    className='clickable'
                    onClick={() => moves.judgment()}
                >
                    {'Judgment'}
                </button>
                {this.renderHarvestButton()}
                <button
                    className='clickable'
                    onClick={() => moves.passLightning()}
                >
                    {'Lightning'}
                </button>
                {this.renderSpecialButton()}
                {this.renderHotkeys()}
            </div>
        </div>
    }

    renderButton(targetMode) {
        const { mode, setMode } = this.props;
        return <button
            className={mode === targetMode ? 'toggled' : 'selectable'}
            disabled={mode === targetMode}
            onClick={() => setMode(targetMode)}
        >
            {targetMode}
        </button>
    }

    renderHarvestButton() {
        const { G, moves } = this.props;
        const { harvest } = G;
        if (harvest.length === 0) {
            return <button
                className='clickable'
                onClick={() => moves.harvest()}
            >
                {'Harvest'}
            </button>;
        } else {
            return <button
                className='clickable'
                onClick={() => moves.finishHarvest()}
            >
                {'Finish'}
            </button>;
        }
    }

    renderSpecialButton() {
        const { G, ctx, moves, playerID } = this.props;
        const { characters, privateZone } = G;
        const { currentPlayer } = ctx;
        const character = characters[playerID];
        if (character === undefined) {
            return;
        }
        if (character.name === 'Lu Meng' && currentPlayer === playerID) {
            return <button
                className='clickable'
                onClick={() => moves.restraint()}
            >
                {'Restraint'}
            </button>;
        } else if (character.name === 'Zhuge Liang' && currentPlayer === playerID) {
            const doingAstrology = privateZone.filter(item => item.source.deck).length > 0;
            if (doingAstrology) {
                return <button
                    className='clickable'
                    onClick={() => moves.finishAstrology()}
                >
                    {'Finish'}
                </button>;
            } else {
                return <button
                    className='clickable'
                    onClick={() => moves.astrology()}
                >
                    {'Astrology'}
                </button>;
            }
        }
    }

    renderHotkeys() {
        const { mode, setMode } = this.props;
        if (mode === SetModePanel.SHOW_HOTKEYS_MODE) {
            return <div
                className='hotkeys-panel'
            >
                {this.renderRoleDistribution()}
                <table><tbody></tbody></table>
                <div>Modifier hotkeys: press the hotkey to modify what your next click will do.</div>
                <table>
                    <tbody>
                        <tr>
                            <td>Esc</td>
                            <td>Return to default mode</td>
                        </tr>
                        <tr>
                            <td>G</td>
                            <td>Give your next selected card to someone else</td>
                        </tr>
                        <tr>
                            <td>D</td>
                            <td>Discard/dismantle your next selected card</td>
                        </tr>
                        <tr>
                            <td>S</td>
                            <td>Steal your next selected card into your hand</td>
                        </tr>
                        <tr>
                            <td>R</td>
                            <td>Reveal your next selected card to someone else</td>
                        </tr>
                        <tr>
                            <td>H</td>
                            <td>Render help for the selected card</td>
                        </tr>
                    </tbody>
                </table>
                <div>Action hotkeys: press the hotkey to trigger an action immediately.</div>
                <table>
                    <tbody>
                        <tr>
                            <td>1-9</td>
                            <td>Play the Nth card in your hand</td>
                        </tr>
                        <tr>
                            <td>J</td>
                            <td>Flip over a judgment card from the deck</td>
                        </tr>
                        <tr>
                            <td>V</td>
                            <td>Turn over N cards from the deck for harvest</td>
                        </tr>
                        <tr>
                            <td>L</td>
                            <td>Pass lightning card to the next player</td>
                        </tr>
                        <tr>
                            <td>C</td>
                            <td>Draw a card into your hand</td>
                        </tr>
                        <tr>
                            <td>Q</td>
                            <td>Decrease your health by 1</td>
                        </tr>
                        <tr>
                            <td>W</td>
                            <td>Increase your health by 1</td>
                        </tr>
                        <tr>
                            <td>T</td>
                            <td>Toggle your chain state</td>
                        </tr>
                        <tr>
                            <td>E</td>
                            <td>End your play phase (and start discard phase)</td>
                        </tr>
                        <tr>
                            <td>?</td>
                            <td>Open this menu</td>
                        </tr>
                    </tbody>
                </table>
                <button
                    className='selectable'
                    onClick={() => setMode(SetModePanel.DEFAULT_MODE)}
                >
                    {'X'}
                </button>
            </div>;
        }
    }

    handleHotkey = e => {
        const { G, mode, moves, setMode, setSelectedIndex } = this.props;
        const { harvest } = G;
        if (e.altKey || e.ctrlKey || e.metaKey) {
            return;
        }
        switch (e.key) {
            case "Escape":
                setMode(SetModePanel.DEFAULT_MODE);
                break;
            case "g":
                setMode(SetModePanel.GIVE_MODE);
                break;
            case "d":
                setMode(SetModePanel.DISMANTLE_MODE);
                break;
            case "s":
                setMode(SetModePanel.STEAL_MODE);
                break;
            case "r":
                setMode(SetModePanel.REVEAL_MODE);
                break;
            case "h":
                setMode(SetModePanel.HELP_MODE);
                break;
            case "/":
            case "?":
                setMode(SetModePanel.SHOW_HOTKEYS_MODE);
                break;
            case "j":
                moves.judgment();
                break;
            case "v":
                (harvest.length === 0 ? moves.harvest : moves.finishHarvest)();
                break;
            case "l":
                moves.passLightning();
                break;
            case "c":
                moves.draw();
                break;
            case "q":
                moves.updateHealth(-1);
                break;
            case "w":
                moves.updateHealth(+1);
                break;
            case "t":
                moves.toggleChain();
                break;
            case "e":
                moves.endPlay();
                break;
            default:
                break;
        }
        if (e.keyCode >= 49 && e.keyCode <= 57) {
            const index = e.keyCode - 49;
            if (mode === SetModePanel.DEFAULT_MODE) {
                if (this.stage() === 'play') {
                    moves.play(index);
                } else if (this.stage() === 'discard') {
                    moves.discardCard(index);
                }
            } else if (mode === SetModePanel.GIVE_MODE || mode === SetModePanel.REVEAL_MODE) {
                setSelectedIndex(index);
            } else if (mode === SetModePanel.DISMANTLE_MODE) {
                moves.discardCard(index);
            }
        }
    };

    renderRoleDistribution() {
        const { ctx } = this.props;
        const { numPlayers } = ctx;
        const [numKings, numRebels, numLoyalists, numSpies] = ROLE_DIST[numPlayers];
        return <div>
            This game has {numKings} {numKings !== 1 ? 'kings' : 'king'},{' '}
            {numRebels} {numRebels !== 1 ? 'rebels' : 'rebel'},{' '}
            {numLoyalists} {numLoyalists !== 1 ? 'loyalists' : 'loyalist'}, and{' '}
            {numSpies} {numSpies !== 1 ? 'spies' : 'spy'}.
        </div>
    }

    stage() {
        const { ctx, playerID } = this.props;
        const { activePlayers } = ctx;
        return activePlayers && activePlayers[playerID];
    }
}
