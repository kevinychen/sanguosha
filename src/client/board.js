import React from 'react';
import './board.css';
import GameArea from './gameArea.js';

export class SanGuoShaBoard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    render() {
        const { clientRect } = this.state;
        return <div id='board' ref={el => this.el = el}>
            {clientRect ? <GameArea clientRect={clientRect} {...this.props} /> : undefined}
        </div>;
    }

    updateDimensions = () => {
        if (this.el) {
            this.setState({
                clientRect: {
                    width: this.el.clientWidth,
                    height: this.el.clientHeight,
                }
            });
        }
    }
}
