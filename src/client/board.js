import React from 'react';
import './board.css';

const PLAYER_AREA_WIDTH = 200;
const PLAYER_AREA_HEIGHT = 300;

// Minimum number of pixels needed between two characters
const DELTA = 20;

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
        return <div id='board' ref={el => this.el = el}>
            {this.renderNodes()}
        </div>;
    }

    renderNodes() {
        const {
            G: { characters },
            ctx: { numPlayers, playOrder, phase, activePlayers },
            playerID,
        } = this.props;
        const { clientRect } = this.state;

        if (!clientRect) {
            return undefined;
        }

        const { playerAreas, scale } = this.findPlayerAreas(numPlayers - 1);
        const myPlayerIndex = playOrder.indexOf(playerID);

        const nodes = [];

        playerAreas.forEach((playerArea, i) => {
            const player = (myPlayerIndex + i) % numPlayers;
            const character = characters[player];
            const name = character ? character.name : 'Unknown Character';
            nodes.push(<img
                key={`playerArea-img-${i}`}
                className='character'
                src={name + '.jpg'}
                alt={name}
                style={{
                    left: playerArea.x,
                    top: playerArea.y,
                    width: PLAYER_AREA_WIDTH * scale,
                    height: PLAYER_AREA_HEIGHT * scale,
                }}
            />);
        });

        if (phase === 'selectCharacters') {
            if (activePlayers[playerID] === 'selectCharacter') {
                // TODO
            }
        }

        return nodes;
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
    findPlayerAreas(numPlayerAreas) {
        const { clientRect: {width, height} } = this.state;

        // find maximum scale of player areas so that they still fit
        let maxScale = 0;
        let bestLayout = undefined;
        for (var numSide = 0; numSide <= numPlayerAreas / 3; numSide++) {
            const numTop = numPlayerAreas - 2 * numSide;

            let scale = 1;
            scale = Math.min(scale, width / 6 / PLAYER_AREA_WIDTH);
            scale = Math.min(scale, height / 3 / PLAYER_AREA_HEIGHT);
            scale = Math.min(scale, (width - (numTop + 3) * DELTA) / (numTop + 2) / PLAYER_AREA_WIDTH);
            scale = Math.min(scale, (height - (numSide + 1) * DELTA) / numSide / PLAYER_AREA_HEIGHT);
            if (scale >= maxScale) {
                maxScale = scale;
                bestLayout = { numTop, numSide };
            }
        }
        return this.findPlayerAreasGivenLayout(maxScale, bestLayout);
    }

    findPlayerAreasGivenLayout(scale, { numTop, numSide }) {
        const { clientRect: {width, height} } = this.state;

        const scaledWidth = PLAYER_AREA_WIDTH * scale;
        const scaledHeight = PLAYER_AREA_HEIGHT * scale;
        const sideSpacing = (height - numSide * scaledHeight) / (numSide + 1);
        const topSpacing = (width - 2 * DELTA - (numTop + 2) * scaledWidth) / (numTop + 1);

        const playerAreas = [];
        for (let i = 0; i < numSide; i++) {
            playerAreas.push({
                x: width - scaledWidth - DELTA,
                y: height - (scaledHeight + sideSpacing) * (i + 1),
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
