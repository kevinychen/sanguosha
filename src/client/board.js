import React from 'react';
import GameArea from './gameArea.js';
import './board.css';

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
        return <div className='board' ref={el => this.el = el}>
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
