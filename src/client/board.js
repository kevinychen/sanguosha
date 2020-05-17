import React from 'react';
import './board.css';

const PLAYER_AREA_WIDTH = 200;
const PLAYER_AREA_HEIGHT = 300;

// Minimum number of pixels needed between two characters
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
        return <div id='board' ref={el => this.el = el}>
            {this.renderNodes()}
        </div>;
    }

    renderNodes() {
        const {
            G: { characterChoices, characters },
            ctx: { numPlayers, playOrder, phase, activePlayers },
            moves: { selectCharacter },
            playerID,
        } = this.props;
        const { clientRect } = this.state;

        if (!clientRect) {
            return undefined;
        }

        const { width, height } = clientRect;
        const { playerAreas, scale } = this.findPlayerAreas(numPlayers);
        const scaledWidth = PLAYER_AREA_WIDTH * scale;
        const scaledHeight = PLAYER_AREA_HEIGHT * scale;
        const myPlayerIndex = playOrder.indexOf(playerID);

        const cards = [];
        const nodes = [];

        // render each player's character
        playerAreas.forEach((playerArea, i) => {
            const player = (myPlayerIndex + i) % numPlayers;
            const character = characters[player];
            const name = character ? character.name : 'Unknown Character';
            cards.push(<img
                key={`playerArea-img-${i}`}
                className='character'
                src={`./characters/${name}.jpg`}
                alt={name}
                style={{
                    left: playerArea.x,
                    top: playerArea.y,
                    width: scaledWidth,
                    height: scaledHeight,
                }}
            />);
        });

        // render the three starting characters (select one)
        if (phase === 'selectCharacters') {
            if (activePlayers[playerID] === 'selectCharacter') {
                const choices = characterChoices[playerID];
                const startX = (width - choices.length * scaledWidth - (choices.length - 1) * DELTA) / 2;
                choices.forEach((choice, i) => {
                    cards.push(<img
                        key={`characterChoices-img-${i}`}
                        className='character selectable'
                        src={`./characters/${choice.name}.jpg`}
                        alt={choice.name}
                        style={{
                            left: startX + (scaledWidth + DELTA) * i,
                            top: (height - scaledHeight) / 2,
                            width: scaledWidth,
                            height: scaledHeight,
                        }}
                        onClick={() => selectCharacter(i)}
                    />);
                });
            }
        }

        return <div>
            <div
                className='my-region'
                style={{
                    height: scaledHeight + 2 * DELTA,
                }}
            />
            {cards}
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
    findPlayerAreas(numPlayers) {
        const { clientRect: {width, height} } = this.state;

        // find maximum scale of player areas so that they still fit
        let maxScale = 0.1;
        let bestLayout = undefined;
        for (var numSide = 0; numSide <= (numPlayers - 1) / 3; numSide++) {
            const numTop = numPlayers - 1 - 2 * numSide;

            let scale = 1;
            scale = Math.min(scale, (width - 4 * DELTA) / 6 / PLAYER_AREA_WIDTH);
            scale = Math.min(scale, (height - 4 * DELTA) / 3.5 / PLAYER_AREA_HEIGHT);
            scale = Math.min(scale, (width - (numTop + 3) * DELTA) / (numTop + 1) / PLAYER_AREA_WIDTH);
            scale = Math.min(scale, (height - (numSide + 2) * DELTA) / (numSide + 1) / PLAYER_AREA_HEIGHT);
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
