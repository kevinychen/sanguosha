import React from 'react';
import './setModePanel.css';

export default class SetModePanel extends React.Component {

    static DEFAULT_MODE = 'Default';
    static GIVE_MODE = 'Give';
    static DISMANTLE_MODE = 'Dismantle';
    static STEAL_MODE = 'Steal';
    static REVEAL_MODE = 'Reveal';
    static HELP_MODE = 'Help';
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

    handleHotkey = e => {
        const { mode, moves, setMode, setSelectedIndex } = this.props;
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
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
            case "j":
                moves.judgment();
                break;
            case "l":
                moves.passLightning();
                break;
            case "c":
                moves.draw();
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
