import React from 'react';
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
                <button
                    className='clickable'
                    onClick={() => moves.harvest()}
                >
                    {'Harvest'}
                </button>
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
            const hasStarted = privateZone.filter(item => item.source.deck).length > 0;
            if (hasStarted) {
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
        const { mode, moves, setMode, setSelectedIndex } = this.props;
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
            case "e":
                moves.endPlay();
                break;
            default:
                break;
        }
        if (e.keyCode >= 49 && e.keyCode <= 57) {
            const index = e.keyCode - 49;
            if (mode === SetModePanel.DEFAULT_MODE) {
                moves.play(index);
            } else if (mode === SetModePanel.GIVE_MODE) {
                setSelectedIndex(index);
            } else if (mode === SetModePanel.DISMANTLE_MODE) {
                moves.discardCard(index);
            }
        }
    };
}
