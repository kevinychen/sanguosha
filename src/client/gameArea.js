import * as classNames from 'classnames';
import React from 'react';
import CARD_CATEGORIES from '../lib/cardCategories.js';
import SetModePanel from './setModePanel';
import AnimatedBoard from './animatedBoard';
import './gameArea.css';

// Standard margin between objects
const DELTA = 10;

// Number of pixels between info objects inside the character card to the character card's border
const INFO_DELTA = 4;

// Ratio of ratio card to normal cards
const ROLE_RATIO = 0.25;

// Ratio of other player hand cards and equipment cards to normal cards
const CARD_RATIO = 0.3;

// Ratio of cards in the deck to normal cards
const DECK_RATIO = 0.5;

export default class GameArea extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            mode: SetModePanel.DEFAULT_MODE,
            selectedIndex: undefined,
        };
    }

    componentDidUpdate() {
        const { G, ctx, events, moves } = this.props;
        window.sanguosha = { G, ctx, events, moves };
    }

    render() {
        const { G, ctx, playerID, width, height, playerAreas, scaledWidth, scaledHeight } = this.props;
        const { characters } = G;
        const { numPlayers, playOrder } = ctx;

        const characterCards = [];
        const healthPoints = [];
        const normalCards = [];
        const nodes = [];

        this.addCharacterChoices(characterCards);

        const myPlayerIndex = Math.max(playOrder.indexOf(playerID), 0);
        playerAreas.forEach((playerArea, i) => {
            const playerIndex = (myPlayerIndex + i) % numPlayers;
            const player = playOrder[playerIndex];

            this.addCharacterRole(playerArea, playerIndex, nodes);

            const character = characters[playerIndex];
            this.addCharacterCard(playerArea, character, player, characterCards);
            if (!character) {
                return;
            }

            this.addHealth(playerArea, player, healthPoints, nodes);
            this.addChain(playerArea, player, nodes);
            this.addPlayerEquipment(playerArea, player, normalCards);
            if (player !== playerID) {
                this.addOtherPlayerHand(playerArea, player, normalCards, nodes);
            }
        });

        this.addDeck(normalCards);
        this.addMyHand(normalCards);

        this.addDiscardCards(normalCards);
        this.addHarvestCards(normalCards);

        return <div>
            {this.renderSetModePanel()}
            {this.renderMyArea()}
            <AnimatedBoard
                width={width}
                height={height}
                scaledWidth={scaledWidth}
                scaledHeight={scaledHeight}
                characterCards={characterCards}
                healthPoints={healthPoints}
                normalCards={normalCards}
            />
            {this.renderActionButton()}
            {nodes}
        </div>;
    }

    addCharacterChoices(characterCards) {
        const { G, moves, playerID, width, height, scaledWidth, scaledHeight } = this.props;
        const { characterChoices } = G;
        const choices = characterChoices[playerID];
        if (this.stage() === 'selectCharacter' && choices !== undefined) {
            const startX = (width - choices.length * scaledWidth - (choices.length - 1) * DELTA) / 2;
            choices.forEach((choice, i) => {
                characterCards.push({
                    key: `character-${choice.name}`,
                    name: choice.name,
                    opacity: 1,
                    left: startX + (scaledWidth + DELTA) * i,
                    top: (height - scaledHeight) / 2,
                    width: scaledWidth,
                    height: scaledHeight,
                    onClick: () => moves.selectCharacter(i),
                });
            });
        }
    }

    addCharacterRole(playerArea, playerIndex, nodes) {
        const { G, scaledWidth, scaledHeight } = this.props;
        const { roles } = G;
        const role = roles[playerIndex];
        const roleName = role.name || 'Role Back';
        nodes.push(<img
            key={`role-${role.id}`}
            className='positioned'
            src={`./roles/${roleName}.jpg`}
            alt={roleName}
            style={{
                left: playerArea.x + (1 - ROLE_RATIO) * scaledWidth - INFO_DELTA,
                top: playerArea.y + INFO_DELTA,
                width: scaledWidth * ROLE_RATIO,
                height: scaledHeight * ROLE_RATIO,
            }}
        />);
    }

    addCharacterCard(playerArea, character, player, characterCards) {
        const { G, moves, scaledWidth, scaledHeight } = this.props;
        const { mode, selectedIndex } = this.state;
        const { isAlive } = G;
        let onClick = undefined;
        if (mode === SetModePanel.GIVE_MODE && selectedIndex !== undefined) {
            onClick = () => {
                moves.give(selectedIndex, player);
                this.setState({ mode: SetModePanel.DEFAULT_MODE, selectedIndex: undefined });
            };
        } else if (mode === SetModePanel.JUDGMENT_MODE) {
            onClick = () => {
                moves.play(selectedIndex, player);
                this.setState({ mode: SetModePanel.DEFAULT_MODE });
            };
        }
        characterCards.push({
            key: character ? `character-${character.name}` : `character-back-${player}`,
            name: character ? character.name : 'Character Back',
            opacity: isAlive[player] ? 1 : 0.5,
            left: playerArea.x,
            top: playerArea.y,
            width: scaledWidth,
            height: scaledHeight,
            onClick,
        });
    }

    addHealth(playerArea, player, healthPoints, nodes) {
        const { G, moves, playerID, width, height, scaledWidth, scaledHeight } = this.props;
        const { healths, isAlive } = G;
        for (let i = 0; i < healths[player].max; i++) {
            const color = i < healths[player].current ? 'green' : 'red';
            healthPoints.push({
                key: `health-${player}-${i}-${color}`,
                color,
                left: playerArea.x + scaledWidth * (0.23 + i * 0.06),
                top: playerArea.y + scaledHeight * 0.01,
                width: scaledWidth * 0.06,
                height: scaledHeight * 0.05,
            });
        }

        if (isAlive[player] && healths[player].current <= 0) {
            const SAVE_ME_WIDTH = 100; // pixels
            const SAVE_ME_HEIGHT = 25; // pixels
            nodes.push(<button
                key='save-me'
                className='positioned bad'
                style={{
                    left: playerArea.x + (scaledWidth - SAVE_ME_WIDTH) / 2,
                    top: playerArea.y + (scaledHeight - SAVE_ME_HEIGHT) / 2,
                    width: SAVE_ME_WIDTH,
                    height: SAVE_ME_HEIGHT,
                }}
                disabled={true}
            >
                {'Save me!'}
            </button>);
        }

        if (player !== playerID) {
            return;
        }

        if (healths[playerID].current > 0) {
            nodes.push(<div
                key='decrease-health'
                className='positioned image-div selectable decrease-health'
                style={{
                    left: playerArea.x + scaledWidth * 0.23,
                    top: playerArea.y + scaledHeight * 0.1,
                    width: scaledWidth * 0.12,
                    height: scaledHeight * 0.1,
                }}
                onClick={() => moves.updateHealth(-1)}
            />);
        } else if (isAlive[playerID]) {
            const DIE_BUTTON_WIDTH = 180;
            const DIE_BUTTON_HEIGHT = 30;
            nodes.push(<button
                key='die'
                className={`positioned selectable bad`}
                style={{
                    left: (width - DIE_BUTTON_WIDTH) / 2,
                    top: (height - DIE_BUTTON_HEIGHT) / 2,
                    width: DIE_BUTTON_WIDTH,
                    height: DIE_BUTTON_HEIGHT,
                }}
                onClick={() => moves.die()}
            >
                {'Die and leave game'}
            </button>);
        }
        if (healths[playerID].current < healths[playerID].max) {
            nodes.push(<div
                key='increase-health'
                className='positioned image-div selectable increase-health'
                style={{
                    left: playerArea.x + scaledWidth * 0.39,
                    top: playerArea.y + scaledHeight * 0.1,
                    width: scaledWidth * 0.12,
                    height: scaledHeight * 0.1,
                }}
                onClick={() => moves.updateHealth(+1)}
            />);
        }
    }

    addChain(playerArea, player, nodes) {
        const { G, moves, playerID, scaledWidth, scaledHeight } = this.props;
        const { isChained } = G;
        let onClick = undefined;
        if (player === playerID) {
            onClick = () => moves.toggleChain();
        }
        if (player === playerID || isChained[player]) {
            nodes.push(<div
                key={`chain-${player}`}
                className={classNames('positioned image-div selectable chain', {'gray': !isChained[player]})}
                style={{
                    left: playerArea.x + (1 - ROLE_RATIO) * scaledWidth - 2 * INFO_DELTA,
                    top: playerArea.y + scaledHeight * 0.2,
                    width: scaledWidth * ROLE_RATIO + 2 * INFO_DELTA,
                    height: scaledHeight * 0.16,
            }}
                onClick={onClick}
            />);
        }
    }

    addPlayerEquipment(playerArea, player, normalCards) {
        const { G, moves, playerID, scaledWidth, scaledHeight } = this.props;
        const { mode } = this.state;
        const { equipment } = G;
        ['Weapon', 'Shield', '+1', '-1', 'Lightning', 'Capture', 'Starvation'].forEach((category, i) => {
            const card = equipment[player][category];
            if (card) {
                let onClick = undefined;
                if ((mode === SetModePanel.DEFAULT_MODE && player === playerID)
                    || mode === SetModePanel.DISMANTLE_MODE
                    || (mode === SetModePanel.STEAL_MODE && player !== playerID)) {
                    onClick = () => {
                        (mode === SetModePanel.DEFAULT_MODE || mode === SetModePanel.DISMANTLE_MODE ? moves.dismantle : moves.steal)({
                            playerID: player,
                            category,
                        });
                        this.setState({ mode: SetModePanel.DEFAULT_MODE });
                    };
                }
                if (i < 4) {
                    // Equipment cards
                    normalCards.push({
                        key: `card-${card.id}`,
                        className: 'small-shadow',
                        card,
                        faceUp: true,
                        opacity: 1,
                        left: playerArea.x + (scaledWidth - (CARD_RATIO * scaledWidth + INFO_DELTA) * (2 - i % 2)),
                        top: playerArea.y + (scaledHeight - (CARD_RATIO * scaledHeight + INFO_DELTA) * (2 - Math.floor(i / 2))),
                        scale: CARD_RATIO,
                        onClick,
                    });
                } else {
                    // Judgment cards
                    normalCards.push({
                        key: `card-${card.id}`,
                        className: 'small-shadow',
                        card,
                        faceUp: true,
                        sideways: true,
                        opacity: 1,
                        left: playerArea.x + scaledWidth * 0.33,
                        top: playerArea.y + scaledHeight * (0.16 + 0.18 * (i - 4)),
                        scale: CARD_RATIO,
                        onClick,
                    });
                }
            }
        });
    }

    addOtherPlayerHand(playerArea, player, normalCards, nodes) {
        const { G, moves, scaledWidth, scaledHeight } = this.props;
        const { mode } = this.state;
        const { hands } = G;
        const hand = hands[player];
        // Show the card backs
        hand.forEach(card => {
            let onClick = undefined;
            if (mode === SetModePanel.DISMANTLE_MODE || mode === SetModePanel.STEAL_MODE) {
                onClick = () => {
                    (mode === SetModePanel.DISMANTLE_MODE ? moves.dismantle : moves.steal)({
                        playerID: player,
                        index: Math.floor(Math.random() * hand.length),
                    });
                    this.setState({ mode: SetModePanel.DEFAULT_MODE });
                };
            }
            normalCards.push({
                key: `card-${card.id}`,
                className: 'small-shadow',
                card,
                opacity: 1,
                left: playerArea.x + INFO_DELTA,
                top: playerArea.y + (1 - CARD_RATIO) * scaledHeight - INFO_DELTA,
                scale: CARD_RATIO,
                onClick,
            });
        });
        // Show the card count
        if (hand.length > 0) {
            nodes.push(<div
                key={`card-count-${player}`}
                className='game-label'
                style={{
                    left: playerArea.x + INFO_DELTA,
                    top: playerArea.y + (1 - CARD_RATIO) * scaledHeight - INFO_DELTA,
                    width: scaledWidth * CARD_RATIO,
                    height: scaledHeight * CARD_RATIO,
                    marginLeft: scaledWidth * CARD_RATIO * 0.1,
                    marginTop: scaledWidth * CARD_RATIO * 0.1,
                    fontSize: scaledWidth * CARD_RATIO * 0.6,
                }}
            >
                {hand.length}
            </div>);
        }
    }

    addDeck(normalCards) {
        const { G, moves, height, scaledHeight } = this.props;
        const { mode } = this.state;
        const { deck } = G;
        const MAX_CARDS_SHOWN = 10;
        deck.slice(-MAX_CARDS_SHOWN).forEach((card, i) => {
            let onClick = undefined;
            if (mode === SetModePanel.DEFAULT_MODE && card === deck[deck.length - 1]) {
                onClick = () => moves.draw();
            }
            normalCards.push({
                key: `card-${card.id}`,
                card,
                opacity: 1,
                left: DELTA * (1 - i / MAX_CARDS_SHOWN),
                top: height - scaledHeight * DECK_RATIO - DELTA * (i / MAX_CARDS_SHOWN),
                scale: DECK_RATIO,
                onClick,
            });
        });
    }

    addMyHand(normalCards) {
        const { G, moves, playerID, width, height, scaledWidth, scaledHeight } = this.props;
        const { mode, selectedIndex } = this.state;
        const { hands } = G;
        const myHand = hands[playerID];
        if (myHand) {
            const spacing = Math.min(scaledWidth + DELTA, (width - (2 + DECK_RATIO) * scaledWidth - 5 * DELTA) / (hands[playerID].length - 1));
            hands[playerID].forEach((card, i) => {
                let onClick = undefined;
                if (mode === SetModePanel.DEFAULT_MODE && this.stage() === 'play') {
                    if (['Lightning', 'Capture', 'Starvation'].includes(CARD_CATEGORIES[card.type])) {
                        onClick = () => this.setState({ mode: SetModePanel.JUDGMENT_MODE, selectedIndex: i });
                    } else {
                        onClick = () => moves.play(i);
                    }
                } else if (mode === SetModePanel.DEFAULT_MODE && this.stage() === 'discard') {
                    onClick = () => moves.discardCard(i);
                } else if (mode === SetModePanel.GIVE_MODE && selectedIndex === undefined) {
                    onClick = () => this.setState({ selectedIndex: i });
                } else if (mode === SetModePanel.DISMANTLE_MODE) {
                    onClick = () => {
                        moves.dismantle({
                            playerID,
                            index: i,
                        });
                        this.setState({ mode: SetModePanel.DEFAULT_MODE });
                    };
                }
                normalCards.push({
                    key: `card-${card.id}`,
                    card,
                    faceUp: true,
                    opacity: onClick !== undefined ? 1 : 0.3,
                    left: DECK_RATIO * scaledWidth + 2 * DELTA + spacing * i,
                    top: height - scaledHeight - DELTA,
                    scale: 1,
                    onClick: onClick,
                });
            })
        }
    }
 
    addDiscardCards(normalCards) {
        const { G, moves, width, height, scaledWidth, scaledHeight } = this.props;
        const { mode } = this.state;
        const { discard, harvest } = G;
        const MAX_DISCARDS_SHOWN = 4;
        const DISCARD_RATIO = 0.7;
        const numCardsShown = Math.min(discard.length, MAX_DISCARDS_SHOWN);
        const startX = (width - numCardsShown * scaledWidth * DISCARD_RATIO - (numCardsShown - 1) * DELTA) / 2;
        for (let i = 0; i < discard.length && i <= MAX_DISCARDS_SHOWN; i++) {
            const card = discard[discard.length - 1 - i];
            let onClick = undefined;
            if (mode === SetModePanel.DEFAULT_MODE && i < MAX_DISCARDS_SHOWN && harvest.length === 0) {
                onClick = () => moves.pickUp(discard.length - 1 - i);
            }
            normalCards.push({
                key: `card-${card.id}`,
                className: 'shadow',
                card,
                faceUp: true,
                opacity: i === MAX_DISCARDS_SHOWN || harvest.length > 0 ? 0 : 1,
                left: startX + (scaledWidth * DISCARD_RATIO + DELTA) * i,
                top: (height - scaledHeight * DISCARD_RATIO) / 2,
                scale: DISCARD_RATIO,
                onClick,
            });
        }
    }

    addHarvestCards(normalCards) {
        const { G, moves, width, height, scaledWidth, scaledHeight } = this.props;
        const { mode } = this.state;
        const { harvest } = G;
        const HARVEST_RATIO = 0.7;
        const startX = (width - harvest.length * scaledWidth * HARVEST_RATIO - (harvest.length - 1) * DELTA) / 2;
        harvest.forEach((card, i) => {
            let onClick = undefined;
            if (mode === SetModePanel.DEFAULT_MODE) {
                onClick = () => moves.pickUpHarvest(i);
            }
            normalCards.push({
                key: `card-${card.id}`,
                className: 'shadow',
                card,
                faceUp: true,
                opacity: 1,
                left: startX + (scaledWidth * HARVEST_RATIO + DELTA) * i,
                top: (height - scaledHeight * HARVEST_RATIO) / 2,
                scale: HARVEST_RATIO,
                onClick,
            });
        });
    }

    renderSetModePanel() {
        const { moves } = this.props;
        const { mode } = this.state;
        return <SetModePanel
            key='set-mode-panel'
            mode={mode}
            setMode={mode => this.setState({ mode })}
            moves={moves}
        />;
    }

    renderMyArea() {
        const { scaledHeight } = this.props;
        return <div
            key='my-area'
            className='my-area'
            style={{
                height: scaledHeight + 2 * DELTA,
            }}
        />;
    }

    renderActionButton() {
        const { G, ctx, moves, playerID, width, height, scaledHeight } = this.props;
        const { mode, selectedIndex } = this.state;
        const { isAlive } = G;
        const { currentPlayer } = ctx;
        const ACTION_BUTTON_WIDTH = 160;
        const ACTION_BUTTON_HEIGHT = 30;
        let actionButton = undefined;
        if ((mode === SetModePanel.GIVE_MODE && selectedIndex !== undefined)
            || mode === SetModePanel.JUDGMENT_MODE) {
            actionButton = {
                text: 'Select player',
                type: 'disabled',
            };
        } else if (this.stage() === 'play' && currentPlayer === playerID) {
            actionButton = {
                text: 'End turn',
                type: 'selectable warn',
                onClick: () => moves.endPlay(),
            }
        } else if (this.stage() === 'discard') {
            actionButton = {
                text: 'Discard cards',
                type: 'disabled',
            };
        }
        if (isAlive[playerID] && actionButton !== undefined) {
            const { text, type, onClick } = actionButton;
            return <button
                className={`positioned ${type}`}
                style={{
                    left: (width - ACTION_BUTTON_WIDTH) / 2,
                    top: height - scaledHeight - ACTION_BUTTON_HEIGHT - 3 * DELTA,
                    width: ACTION_BUTTON_WIDTH,
                    height: ACTION_BUTTON_HEIGHT,
                }}
                onClick={onClick}
                disabled={onClick === undefined}
            >
                {text}
            </button>;
        }
    }

    stage() {
        const { ctx, playerID } = this.props;
        const { activePlayers } = ctx;
        return activePlayers && activePlayers[playerID];
    }
}
