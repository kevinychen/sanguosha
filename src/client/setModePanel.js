import React from 'react';
import './setModePanel.css';

export default class SetModePanel extends React.Component {

    static DEFAULT_MODE = 'Default';
    static DISMANTLE_MODE = 'Dismantle';

    render() {
        const { harvest } = this.props;
        return <div className='set-mode-panel'>
            <div className='section'>
                {this.renderButton(SetModePanel.DEFAULT_MODE)}
                {this.renderButton(SetModePanel.DISMANTLE_MODE)}
            </div>
            <div className='section'>
                <button
                    className='clickable'
                    onClick={() => harvest()}
                >
                    {'Harvest'}
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
}
