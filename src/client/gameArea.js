import React from 'react';
import { animated } from 'react-spring';
import { CARD_TYPES } from '../lib/cards.js';
import AnimatedItems from './animatedItems';

const PLAYER_AREA_WIDTH = 200;
const PLAYER_AREA_HEIGHT = 300;

// Standard margin between objects
const DELTA = 10;

// Number of pixels between info objects inside the character card to the character card's border
const INFO_DELTA = 4;

function canSelectPlayer(G, ctx, playerID, selectedPlayerID) {
    const { isAlive, activeCardType, activeCardData } = G;
    if (isAlive[playerID] && isAlive[selectedPlayerID] && activeCardType !== undefined) {
        const { canSelectPlayer } = CARD_TYPES[activeCardType].current(activeCardData);
        return canSelectPlayer && canSelectPlayer(G, ctx, playerID, selectedPlayerID);
    }
}

function canPlayCard(G, ctx, playerID, card) {
    const { isAlive, activeCardType, activeCardData } = G;
    if (isAlive[playerID] && activeCardType !== undefined) {
        const { canPlayCard } = CARD_TYPES[activeCardType].current(activeCardData);
        return canPlayCard && canPlayCard(G, ctx, playerID, card);
    } else {
        return CARD_TYPES[card.type].canPlayCard();
    }
}

export default props => {
    const { G, ctx, moves, events, playerID, clientRect } = props;
    const { roles, characterChoices, characters, healths, isAlive, discard, hands} = G;
    const { activeCardType, activeCardData, targets, dyingPlayer, passedPlayers } = G;
    const { activePlayers, numPlayers, playOrder } = ctx;

    const { width, height } = clientRect;
    const { playerAreas, scale } = findPlayerAreas(numPlayers, clientRect);
    const scaledWidth = PLAYER_AREA_WIDTH * scale;
    const scaledHeight = PLAYER_AREA_HEIGHT * scale;
    const playerIDIndex = Math.max(playOrder.indexOf(playerID), 0);
    const stage = activePlayers && activePlayers[playerID];

    // regular nodes to render
    const backNodes = [];
    const frontNodes = [];

    const playerCards = [];

    const characterCards = [];
    const healthPoints = [];
    playerAreas.forEach((playerArea, i) => {
        const playerIndex = (playerIDIndex + i) % numPlayers;
        const player = playOrder[playerIndex];

        // Render each player's character
        const character = characters[playerIndex];
        backNodes.push(<img
            key={`character-back-${i}`}
            className='positioned'
            src={`./characters/Character Back.jpg`}
            alt='Character Back'
            style={{
                left: playerArea.x,
                top: playerArea.y,
                width: scaledWidth,
                height: scaledHeight,
            }}
        />);
        if (character) {
            const canSelect = ['play'].includes(stage) && canSelectPlayer(G, ctx, playerID, player);
            characterCards.push({
                key: character ? `character-${character.name}` : `character-back-${i}`,
                name: character ? character.name : 'Character Back',
                opacity: isAlive[player] ? 1 : 0.5,
                left: playerArea.x,
                top: playerArea.y,
                onClick: canSelect ? () => moves.selectPlayer(player) : undefined,
            });
        }

        // Render the player's health
        if (healths[player]) {
            for (let j = 0; j < healths[player].max; j++) {
                const color = j < healths[player].current ? 'green' : 'red';
                healthPoints.push({
                    key: `health-${i}-${j}-${color}`,
                    color,
                    left: playerArea.x + scaledWidth * (0.23 + j * 0.06),
                    top: playerArea.y + scaledHeight * 0.01,
                    width: scaledWidth * 0.06,
                    height: scaledHeight * 0.05,
                });
            }
        }

        // Render "Save me!" if the player is dying
        if (stage === 'brinkOfDeath' && player === dyingPlayer) {
            const SAVE_ME_WIDTH = 100; // pixels
            const SAVE_ME_HEIGHT = 25; // pixels
            frontNodes.push(<button
                key='save-me'
                className='positioned save-me'
                style={{
                    left: playerArea.x + (scaledWidth - SAVE_ME_WIDTH) / 2,
                    top: playerArea.y + (scaledHeight - SAVE_ME_HEIGHT) / 2,
                    width: SAVE_ME_WIDTH,
                    height: SAVE_ME_HEIGHT,
                }}
            >
                {'Save me!'}
            </button>);
        }

        // Ratio of role card size in top right of character card, to character card size
        const ROLE_RATIO = 0.25;
        const role = roles[playerIndex];
        const roleName = role.name || 'Role Back';
        frontNodes.push(<img
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

        // Show other player's hands
        const CARD_RATIO = 0.3;
        if (player !== playerID) {
            const hand = hands[player];
            // Show the card backs
            hand.forEach(card => {
                playerCards.push({
                    key: `card-${card.id}`,
                    name: 'Card Back',
                    opacity: 1,
                    left: playerArea.x + INFO_DELTA,
                    top: playerArea.y + (1 - CARD_RATIO) * scaledHeight - INFO_DELTA,
                    width: scaledWidth * CARD_RATIO,
                    height: scaledHeight * CARD_RATIO,
                });
            });
            // Show the card count
            if (hand.length > 0) {
                frontNodes.push(<div
                    key={`card-count-${i}`}
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
    });

    if (discard !== undefined) {
        const MAX_DISCARDS_SHOWN = 4;
        const DISCARD_RATIO = 0.7;
        const numCardsShown = Math.min(discard.length, MAX_DISCARDS_SHOWN);
        const startX = (width - numCardsShown * scaledWidth * DISCARD_RATIO - (numCardsShown - 1) * DELTA) / 2;
        for (let i = 0; i < discard.length && i <= MAX_DISCARDS_SHOWN; i++) {
            const card = discard[discard.length - 1 - i];
            playerCards.push({
                key: `card-${card.id}`,
                name: card.type,
                opacity: i === MAX_DISCARDS_SHOWN ? 0 : 1,
                left: startX + (scaledWidth * DISCARD_RATIO + DELTA) * i,
                top: (height - scaledHeight * DISCARD_RATIO) / 2,
                width: scaledWidth * DISCARD_RATIO,
                height: scaledHeight * DISCARD_RATIO,
            });
        }
    }

    // render lines from players targeting other players
    const targetLines = [];
    if (targets) {
        targets.forEach(({targeter, target}) => {
            const targeterArea = playerAreas.find((_, i) => playOrder[(playerIDIndex + i) % numPlayers] === targeter);
            const targetArea = playerAreas.find((_, i) => playOrder[(playerIDIndex + i) % numPlayers] === target);
            targetLines.push({
                key: `target-${targeter}-${target}`,
                startX: targeterArea.x + scaledWidth / 2,
                startY: targeterArea.y + scaledHeight / 2,
                endX: targetArea.x + scaledWidth / 2,
                endY: targetArea.y + scaledHeight / 2,
            });
        });
    }

    // render the three starting characters (select one)
    if (stage === 'selectCharacter') {
        const choices = characterChoices[playerID];
        if (choices !== undefined) {
            const startX = (width - choices.length * scaledWidth - (choices.length - 1) * DELTA) / 2;
            choices.forEach((choice, i) => {
                characterCards.push({
                    key: `character-${choice.name}`,
                    name: choice.name,
                    opacity: 1,
                    left: startX + (scaledWidth + DELTA) * i,
                    top: (height - scaledHeight) / 2,
                    onClick: () => moves.selectCharacter(i),
                });
            });
        }
    }

    // render my player area
    backNodes.push(<div
        key='my-region'
        className='my-region'
        style={{
            height: scaledHeight + 2 * DELTA,
        }}
    />);
    // render my cards
    const myHand = hands[playerID];
    if (myHand) {
        const spacing = Math.min(scaledWidth + DELTA, (width - 2 * scaledWidth - 3 * DELTA) / (hands[playerID].length - 1));
        hands[playerID].forEach((card, i) => {
            let onClick = undefined;
            if (stage === 'play' && canPlayCard(G, ctx, playerID, card)) {
                onClick = () => moves.playCard(i);
            } else if (stage === 'brinkOfDeath' && card.type === 'Peach') {
                onClick = () => moves.playPeach(i);
            } else if (stage === 'discard') {
                onClick = () => moves.discardCard(i);
            }
            playerCards.push({
                key: `card-${card.id}`,
                name: card.type,
                opacity: onClick !== undefined ? 1 : 0.3,
                left: spacing * i,
                top: height - scaledHeight - DELTA,
                width: scaledWidth,
                height: scaledHeight,
                onClick: onClick,
            });
        })
    }

    // render an "action button" to do something
    let actionButton = undefined;
    if (stage === 'play') {
        if (activeCardType !== undefined) {
            const { text, miscAction } = CARD_TYPES[activeCardType].current(activeCardData);
            if (miscAction) {
                actionButton = {
                    text,
                    type: 'selectable warn',
                    onClick: () => moves.miscAction(),
                };
            } else {
                actionButton = {
                    text,
                    type: 'disabled',
                };
            }
        } else {
            actionButton = {
                text: 'End turn',
                type: 'selectable warn',
                onClick: () => {
                    events.setStage('discard')

                    // endIf is only checked after move, so do a no-op
                    moves.doNothing();
                },
            }
        }
    } else if (stage === 'brinkOfDeath' && !passedPlayers[playerID]) {
        actionButton = {
            text: 'Pass',
            type: 'selectable warn',
            onClick: () => moves.pass(),
        };
    } else if (stage === 'discard') {
        actionButton = {
            text: 'Discard cards',
            type: 'disabled',
        };
    }
    if (actionButton !== undefined) {
        const ACTION_BUTTON_WIDTH = 160; // pixels
        const ACTION_BUTTON_HEIGHT = 30; // pixels
        const { text, type, onClick } = actionButton;
        backNodes.push(<button
            key='action-button'
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
        </button>);
    }

    return <div>
        {backNodes}
        <AnimatedItems
            items={characterCards}
            from={_ => { return { opacity: 0, left: (width - scaledWidth) / 2, top: (height - scaledHeight) / 2 } }}
            update={item => { return { opacity: item.opacity, left: item.left, top: item.top } }}
            clickable={true}
            animated={(item, props) => <animated.img
                className='positioned item'
                src={`./characters/${item.name}.jpg`}
                alt={item.name}
                style={{
                    opacity: props.opacity,
                    left: props.left,
                    top: props.top,
                    width: scaledWidth,
                    height: scaledHeight,
                }} />}
        />
        <AnimatedItems
            items={healthPoints}
            from={_ => { return { opacity: 0, left: 0, top: 0, width, height } }}
            update={item => { return { opacity: 1, left: item.left, top: item.top, width: item.width, height: item.height } }}
            animated={(item, props) => <animated.img
                key={item.key}
                className='positioned item'
                src={`./health/health-${item.color}.png`}
                alt='health'
                style={{
                    opacity: props.opacity,
                    left: props.left,
                    top: props.top,
                    width: props.width,
                    height: props.height,
                }}
            />}
        />
        <AnimatedItems
            items={playerCards}
            from={_ => { return {opacity: 0, left: width / 2, top: height / 2, width: 0, height: 0 } }}
            update={item => { return { opacity: item.opacity, left: item.left, top: item.top, width: item.width, height: item.height } }}
            clickable={true}
            animated={(item, props) => <animated.img
                className='positioned item'
                src={`./cards/${item.name}.jpg`}
                alt={item.name}
                style={{
                    opacity: props.opacity,
                    left: props.left,
                    top: props.top,
                    width: props.width,
                    height: props.height,
                }}
            />}
        />
        {frontNodes}
        <svg className='positioned target-line' >
            <AnimatedItems
                items={targetLines}
                from={item => { return { opacity: 0, endX: item.startX, endY: item.startY } }}
                update={item => { return { opacity: 1, endX: item.endX, endY: item.endY } }}
                animated={(item, props) => <animated.line
                    key={item.key}
                    className='item'
                    x1={item.startX}
                    y1={item.startY}
                    x2={props.endX}
                    y2={props.endY}
                />}
            />
        </svg>
    </div>;
}

/**
 * Find the player areas (given by their top left coordinates, and their scale) that look the
 * most uniform around the screen.
 */
function findPlayerAreas(numPlayers, { width, height }) {
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
    return findPlayerAreasGivenLayout(maxScale, bestLayout, {width, height});
}

function findPlayerAreasGivenLayout(scale, { numTop, numSide }, { width, height }) {
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
