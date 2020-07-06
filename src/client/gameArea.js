import * as classNames from 'classnames';
import React from 'react';
import CARD_CATEGORIES from '../lib/cardCategories.js';
import RULES from '../lib/rules.json';
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

// Ratio of cards in the middle to normal cards
const MIDDLE_CARD_RATIO = 0.7;

export default class GameArea extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            mode: SetModePanel.DEFAULT_MODE,
            selectedIndex: undefined,
            helpCard: undefined,
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

        const myPlayerIndex = Math.max(playOrder.indexOf(playerID), 0);
        playerAreas.forEach((playerArea, i) => {
            const playerIndex = (myPlayerIndex + i) % numPlayers;
            const player = playOrder[playerIndex];

            this.addPlayerName(playerArea, playerIndex, player, nodes);
            this.addCharacterRole(playerArea, playerIndex, nodes);

            const character = characters[player];
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

        this.addCharacterChoices(characterCards);

        this.addDeck(normalCards);
        this.addMyHand(normalCards);

        // Once cards of some type are found, remaining cards are rendered transparently.
        // We splice from the beginning so that these transparent cards don't block existing ones.
        const middleCards = [];
        middleCards.splice(0, 0, ...this.getPrivateZoneCards(middleCards.length > 0));
        middleCards.splice(0, 0, ...this.getHarvestCards(middleCards.length > 0));
        middleCards.splice(0, 0, ...this.getDiscardCards(middleCards.length > 0));
        normalCards.push(...middleCards);

        return <div>
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
            {nodes}
            {this.renderActionButton()}
            {this.renderHelp()}
            {this.renderSetModePanel()}
        </div>;
    }

    addCharacterChoices(characterCards) {
        const { G, playerID, width, height, scaledWidth, scaledHeight } = this.props;
        const { mode, selectedIndex } = this.state;
        const { characterChoices } = G;
        const choices = characterChoices[playerID];
        if (this.stage() === 'selectCharacter' && choices !== undefined) {
            const startX = (width - choices.length * scaledWidth - (choices.length - 1) * DELTA) / 2;
            choices.forEach((choice, i) => {
                let onClick;
                if (mode === SetModePanel.DEFAULT_MODE) {
                    onClick = () => this.setState({ selectedIndex: i === selectedIndex ? undefined : i });
                } else if (mode === SetModePanel.HELP_MODE) {
                    onClick = () => this.setState({ helpCard: { key: choice.name, src: `./characters/${choice.name}.jpg` } });
                }
                characterCards.push({
                    key: `character-${choice.name}`,
                    name: choice.name,
                    faceUp: true,
                    opacity: 1,
                    left: startX + (scaledWidth + DELTA) * i,
                    top: (height - scaledHeight) / 2 - (i === selectedIndex ? 20 : 0),
                    width: scaledWidth,
                    height: scaledHeight,
                    onClick,
                });
            });
        }
    }

    addPlayerName(playerArea, playerIndex, player, nodes) {
        const { ctx, playerID, gameMetadata, scaledWidth, scaledHeight } = this.props;
        const { currentPlayer } = ctx;
        if (gameMetadata !== undefined && player !== playerID) {
            nodes.push(<div
                key={`name-${playerIndex}`}
                className={classNames('positioned player-name', { 'current-player': currentPlayer === player })}
                style={{
                    left: playerArea.x + INFO_DELTA,
                    top: playerArea.y + scaledHeight + INFO_DELTA,
                    width: scaledWidth - 2 * INFO_DELTA,
                    height: scaledHeight * 0.2,
                }}
            >
                {gameMetadata[playerIndex].name}
            </div>);
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
        const { isAlive, isFlipped } = G;
        let onClick = undefined;
        if (mode === SetModePanel.GIVE_MODE && selectedIndex !== undefined) {
            onClick = () => {
                moves.give(selectedIndex, player);
                this.setState({ mode: SetModePanel.DEFAULT_MODE, selectedIndex: undefined });
            };
        } else if (mode === SetModePanel.GIVE_JUDGMENT_MODE) {
            onClick = () => {
                moves.play(selectedIndex, player);
                this.setState({ mode: SetModePanel.DEFAULT_MODE });
            };
        } else if (mode === SetModePanel.REVEAL_MODE && selectedIndex !== undefined) {
            onClick = () => {
                moves.reveal(selectedIndex, player);
                this.setState({ mode: SetModePanel.DEFAULT_MODE });
            };
        } else if (mode === SetModePanel.FLIP_MODE) {
            onClick = () => {
                moves.flipObject(player);
                this.setState({ mode: SetModePanel.DEFAULT_MODE });
            };
        } else if (mode === SetModePanel.HELP_MODE) {
            onClick = () => this.setState({ helpCard: { key: character.name, src: `./characters/${character.name}.jpg` } });
        } else if (mode === SetModePanel.COUNTRY_SCENE_MODE && selectedIndex !== undefined) {
            onClick = () => {
                moves.play(selectedIndex, player, 'Capture');
                this.setState({ mode: SetModePanel.DEFAULT_MODE });
            };
        }
        characterCards.push({
            key: character ? `character-${character.name}` : `character-back-${player}`,
            name: character ? character.name : 'Character Back',
            faceUp: character !== undefined && !isFlipped[player],
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
        const { characters, healths, isAlive, refusingDeath } = G;

        const isRefusingDeath = characters[playerID] && characters[playerID].name === 'Zhou Tai' && healths[player].current <= 0;
        const isDying = isRefusingDeath ? new Set(refusingDeath).size < refusingDeath.length : healths[player].current <= 0;

        for (let i = 0; i < (isRefusingDeath ? refusingDeath.length : healths[player].max); i++) {
            const color = !isRefusingDeath && i < healths[player].current ? 'green' : 'red';
            healthPoints.push({
                key: `health-${player}-${i}-${color}`,
                color,
                left: playerArea.x + scaledWidth * (0.23 + i * 0.06),
                top: playerArea.y + scaledHeight * 0.01,
                width: scaledWidth * 0.06,
                height: scaledHeight * 0.05,
            });
        }

        if (isAlive[player] && isDying) {
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

        if (!isDying) {
            nodes.push(<div
                key='decrease-health'
                className='positioned image-div selectable decrease-health'
                style={{
                    left: playerArea.x + scaledWidth * 0.23,
                    top: playerArea.y + scaledHeight * 0.1,
                    width: scaledWidth * 0.12,
                    height: scaledHeight * 0.1,
                }}
                onClick={() => (isRefusingDeath ? moves.refusingDeath : moves.updateHealth)(-1)}
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
                onClick={() => (isRefusingDeath ? moves.refusingDeath : moves.updateHealth)(+1)}
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
                className={classNames('positioned image-div chain', { 'gray': !isChained[player] }, { 'selectable': onClick !== undefined })}
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
        const { equipment, isFlipped } = G;
        ['Weapon', 'Shield', '+1', '-1', 'Lightning', 'Capture', 'Starvation'].forEach((category, i) => {
            const card = equipment[player][category];
            if (card) {
                let onClick = undefined;
                if ((mode === SetModePanel.DEFAULT_MODE && player === playerID)
                    || mode === SetModePanel.DISMANTLE_MODE
                    || mode === SetModePanel.STEAL_MODE) {
                    onClick = () => {
                        (mode === SetModePanel.DEFAULT_MODE || mode === SetModePanel.DISMANTLE_MODE ? moves.dismantle : moves.steal)({
                            playerID: player,
                            category,
                        });
                        this.setState({ mode: SetModePanel.DEFAULT_MODE });
                    };
                } else if (mode === SetModePanel.HELP_MODE) {
                    onClick = () => this.setState({ helpCard: { key: card.type, src: `./cards/${card.type}.jpg` } });
                }
                if (i < 4) {
                    // Equipment cards
                    normalCards.push({
                        key: `card-${card.id}`,
                        className: 'small-shadow',
                        card,
                        faceUp: !isFlipped[card.id],
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
        const { deck, privateZone } = G;
        const MAX_CARDS_SHOWN = 10;
        deck.slice(-MAX_CARDS_SHOWN).forEach((card, i) => {
            let onClick = undefined;
            if (mode === SetModePanel.DEFAULT_MODE && card === deck[deck.length - 1]) {
                const doingAstrology = privateZone.filter(item => item.source.deck).length > 0;
                if (doingAstrology) {
                    onClick = () => moves.astrology(1);
                } else {
                    onClick = () => moves.draw();
                }
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
        const { hands, isFlipped, harvest } = G;
        const myHand = hands[playerID];
        if (myHand) {
            const spacing = Math.min(scaledWidth + DELTA, (width - (2 + DECK_RATIO) * scaledWidth - 5 * DELTA) / (hands[playerID].length - 1));
            hands[playerID].forEach((card, i) => {
                let onClick = undefined;
                if (mode === SetModePanel.DEFAULT_MODE && this.stage() === 'play') {
                    if (harvest.length > 0) {
                        onClick = () => moves.putDownHarvest(i);
                    } else if (['Capture', 'Starvation'].includes(CARD_CATEGORIES[card.type])) {
                        onClick = () => this.setState({ mode: SetModePanel.GIVE_JUDGMENT_MODE, selectedIndex: i });
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
                } else if (mode === SetModePanel.REVEAL_MODE && selectedIndex === undefined) {
                    onClick = () => this.setState({ selectedIndex: i });
                } else if (mode === SetModePanel.FLIP_MODE) {
                    onClick = () => {
                        moves.flipObject(card.id);
                        this.setState({ mode: SetModePanel.DEFAULT_MODE });
                    };
                } else if (mode === SetModePanel.HELP_MODE) {
                    onClick = () => this.setState({ helpCard: { key: card.type, src: `./cards/${card.type}.jpg` } });
                } else if (mode === SetModePanel.COUNTRY_SCENE_MODE && selectedIndex === undefined) {
                    if (card.suit === 'DIAMOND') {
                        onClick = () => this.setState({ mode: SetModePanel.COUNTRY_SCENE_MODE, selectedIndex: i });
                    }
                }
                normalCards.push({
                    key: `card-${card.id}`,
                    card,
                    faceUp: !isFlipped[card.id],
                    opacity: onClick !== undefined ? 1 : 0.3,
                    left: DECK_RATIO * scaledWidth + 2 * DELTA + spacing * i,
                    top: height - scaledHeight - DELTA,
                    scale: 1,
                    onClick: onClick,
                });
            })
        }
    }
 
    getPrivateZoneCards(middleCardsFound) {
        const { G, moves, playerID, width, height, scaledWidth, scaledHeight } = this.props;
        const { mode } = this.state;
        const { privateZone } = G;
        const privateCards = privateZone.filter(item => item.visibleTo.includes(playerID));
        const startX = (width - privateCards.length * scaledWidth * MIDDLE_CARD_RATIO - (privateCards.length - 1) * DELTA) / 2;
        const normalCards = [];
        privateCards.forEach(({ card, visibleTo }, i) => {
            let onClick = undefined;
            if (mode === SetModePanel.DEFAULT_MODE) {
                onClick = () => moves.returnCard(card.id);
            } else if (mode === SetModePanel.HELP_MODE) {
                onClick = () => this.setState({ helpCard: { key: card.type, src: `./cards/${card.type}.jpg` } });
            }
            normalCards.push({
                key: `card-${card.id}`,
                className: 'shadow',
                card,
                faceUp: true,
                opacity: middleCardsFound ? 0 : 1,
                left: startX + (scaledWidth * MIDDLE_CARD_RATIO + DELTA) * i,
                top: (height - scaledHeight * MIDDLE_CARD_RATIO) / 2,
                scale: MIDDLE_CARD_RATIO,
                onClick: middleCardsFound ? undefined : onClick,
            });
        });
        return normalCards;
    }

    getHarvestCards(middleCardsFound) {
        const { G, moves, width, height, scaledWidth, scaledHeight } = this.props;
        const { mode } = this.state;
        const { harvest } = G;
        const startX = (width - harvest.length * scaledWidth * MIDDLE_CARD_RATIO - (harvest.length - 1) * DELTA) / 2;
        const normalCards = [];
        harvest.forEach((card, i) => {
            let onClick = undefined;
            if (mode === SetModePanel.DEFAULT_MODE) {
                onClick = () => moves.pickUpHarvest(i);
            } else if (mode === SetModePanel.HELP_MODE) {
                onClick = () => this.setState({ helpCard: { key: card.type, src: `./cards/${card.type}.jpg` } });
            }
            normalCards.push({
                key: `card-${card.id}`,
                className: 'shadow',
                card,
                faceUp: true,
                opacity: middleCardsFound ? 0 : 1,
                left: startX + (scaledWidth * MIDDLE_CARD_RATIO + DELTA) * i,
                top: (height - scaledHeight * MIDDLE_CARD_RATIO) / 2,
                scale: MIDDLE_CARD_RATIO,
                onClick: middleCardsFound ? undefined : onClick,
            });
        });
        return normalCards;
    }

    getDiscardCards(middleCardsFound) {
        const { G, moves, width, height, scaledWidth, scaledHeight } = this.props;
        const { mode } = this.state;
        const { discard, isFlipped } = G;
        const MAX_DISCARDS_SHOWN = 4;
        const numCardsShown = Math.min(discard.length, MAX_DISCARDS_SHOWN);
        const startX = (width - numCardsShown * scaledWidth * MIDDLE_CARD_RATIO - (numCardsShown - 1) * DELTA) / 2;
        const normalCards = [];
        for (let i = 0; i < discard.length && i <= MAX_DISCARDS_SHOWN; i++) {
            const card = discard[discard.length - 1 - i];
            let onClick = undefined;
            if (mode === SetModePanel.DEFAULT_MODE && i < MAX_DISCARDS_SHOWN) {
                onClick = () => moves.pickUp(discard.length - 1 - i);
            } else if (mode === SetModePanel.FLIP_MODE) {
                onClick = () => {
                    moves.flipObject(card.id);
                    this.setState({ mode: SetModePanel.DEFAULT_MODE });
                };
            } else if (mode === SetModePanel.HELP_MODE) {
                onClick = () => this.setState({ helpCard: { key: card.type, src: `./cards/${card.type}.jpg` } });
            }
            normalCards.push({
                key: `card-${card.id}`,
                className: 'shadow',
                card,
                faceUp: !isFlipped[card.id],
                opacity: i === MAX_DISCARDS_SHOWN || middleCardsFound ? 0 : 1,
                left: startX + (scaledWidth * MIDDLE_CARD_RATIO + DELTA) * i,
                top: (height - scaledHeight * MIDDLE_CARD_RATIO) / 2,
                scale: MIDDLE_CARD_RATIO,
                onClick: middleCardsFound ? undefined : onClick,
            });
        }
        return normalCards;
    }

    renderSetModePanel() {
        const { G, ctx, moves, playerID } = this.props;
        const { mode } = this.state;
        return <SetModePanel
            key='set-mode-panel'
            G={G}
            ctx={ctx}
            moves={moves}
            playerID={playerID}
            mode={mode}
            setMode={mode => this.setState({ mode, selectedIndex: undefined, helpCard: undefined })}
            setSelectedIndex={selectedIndex => this.setState({ selectedIndex })}
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
        const { isAlive, privateZone } = G;
        const { currentPlayer } = ctx;
        const ACTION_BUTTON_WIDTH = 160;
        const ACTION_BUTTON_HEIGHT = 30;
        let actionButton = undefined;
        if (this.stage() === 'selectCharacter' && selectedIndex !== undefined) {
            actionButton = {
                text: 'Select',
                type: 'selectable warn',
                onClick: () => {
                    moves.selectCharacter(selectedIndex);
                    this.setState({ selectedIndex: undefined });
                },
            }
        } else if ((mode === SetModePanel.GIVE_MODE && selectedIndex !== undefined)
            || (mode === SetModePanel.REVEAL_MODE && selectedIndex !== undefined)
            || mode === SetModePanel.GIVE_JUDGMENT_MODE
            || (mode === SetModePanel.COUNTRY_SCENE_MODE && selectedIndex !== undefined)) {
            actionButton = {
                text: 'Select player',
                type: 'disabled',
            };
        } else if (this.stage() === 'play' && currentPlayer === playerID && privateZone.length === 0) {
            actionButton = {
                text: 'End play',
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

    renderHelp() {
        const { mode, helpCard } = this.state;
        if (mode === SetModePanel.HELP_MODE && helpCard !== undefined) {
            return <div
                className='help-panel'
            >
                <img src={helpCard.src} alt='card' />
                <div dangerouslySetInnerHTML={{ __html: RULES[helpCard.key] }} />
                <button
                    className='selectable bad'
                    onClick={() => this.setState({ mode: SetModePanel.DEFAULT_MODE, helpCard: undefined })}
                >
                    {'X'}
                </button>
            </div>;
        }
    }

    stage() {
        const { ctx, playerID } = this.props;
        const { activePlayers } = ctx;
        return activePlayers && activePlayers[playerID];
    }
}
