import React from 'react';
import GameArea from './gameArea.js';
import './board.css';

const CARD_WIDTH = 210;
const CARD_HEIGHT = 300;
const DELTA = 10;

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
        const { ctx } = this.props;
        const { clientRect } = this.state;
        let gameArea = undefined;
        if (clientRect) {
            const { playerAreas, scale } = this.findPlayerAreas(ctx.numPlayers, clientRect);
            gameArea = <GameArea
                width={clientRect.width}
                height={clientRect.height}
                playerAreas={playerAreas}
                scaledWidth={CARD_WIDTH * scale}
                scaledHeight={CARD_HEIGHT * scale}
                {...this.props}
            />;
        }
        return <div className='board' ref={el => this.el = el}>
            {gameArea}
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

    /**
     * Find the player areas (given by their top left coordinates, and their scale) that look the
     * most uniform around the screen.
     */
    findPlayerAreas(numPlayers, { width, height }) {
        // find maximum scale of player areas so that they still fit
        let maxScale = 0.1;
        let bestLayout = undefined;
        for (var numSide = 0; numSide <= (numPlayers - 1) / 3; numSide++) {
            const numTop = numPlayers - 1 - 2 * numSide;

            let scale = 1;
            scale = Math.min(scale, (width - 4 * DELTA) / 6 / CARD_WIDTH);
            scale = Math.min(scale, (height - 4 * DELTA) / 3.5 / CARD_HEIGHT);
            scale = Math.min(scale, (width - (numTop + 3) * DELTA) / (numTop + 1) / CARD_WIDTH);
            scale = Math.min(scale, (height - (numSide + 2) * DELTA) / (numSide + 1) / CARD_HEIGHT);
            if (scale >= maxScale) {
                maxScale = scale;
                bestLayout = { numTop, numSide };
            }
        }
        return this.findPlayerAreasGivenLayout(maxScale, bestLayout, { width, height });
    }

    findPlayerAreasGivenLayout(scale, { numTop, numSide }, { width, height }) {
        const scaledWidth = CARD_WIDTH * scale;
        const scaledHeight = CARD_HEIGHT * scale;
        const sideSpacing = (height - (numSide + 1) * scaledHeight) / (numSide + 1);
        const topSpacing = (width - 2 * DELTA - (numTop + 2) * scaledWidth) / (numTop + 1);

        const playerAreas = [];
        playerAreas.push({
            x: width - DELTA - scaledWidth,
            y: height - DELTA - scaledHeight,
        });
        for (let i = 0; i < numSide; i++) {
            playerAreas.push({
                x: width - scaledWidth - DELTA,
                y: sideSpacing + (scaledHeight + sideSpacing) * (numSide - i - 1),
            });
        }
        for (let i = 0; i < numTop; i++) {
            playerAreas.push({
                x: width - DELTA - scaledWidth - (scaledWidth + topSpacing) * (i + 1),
                y: DELTA,
            });
        }
        for (let i = 0; i < numSide; i++) {
            playerAreas.push({
                x: DELTA,
                y: sideSpacing + (scaledHeight + sideSpacing) * i,
            });
        }
        return { playerAreas, scale };
    }
}
