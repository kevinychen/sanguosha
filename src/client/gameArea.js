import * as classNames from 'classnames';
import React from 'react';
import { animated, useTransition } from 'react-spring';
import { isCardSelectable } from '../lib/cards';

const PLAYER_AREA_WIDTH = 200;
const PLAYER_AREA_HEIGHT = 300;

// Minimum number of pixels needed between two characters
const DELTA = 10;

// Number of pixels between info objects inside the character card to the character card's border
const INFO_DELTA = 4;

export default props => {
    const { G, ctx, moves, playerID: myPlayer, clientRect } = props;
    const { roles, characterChoices, characters, hands } = G;
    const { numPlayers, playOrder, phase, activePlayers } = ctx;
    const { selectCharacter, playCard, selectPlayer } = moves;

    const { width, height } = clientRect;
    const { playerAreas, scale } = findPlayerAreas(numPlayers, clientRect);
    const scaledWidth = PLAYER_AREA_WIDTH * scale;
    const scaledHeight = PLAYER_AREA_HEIGHT * scale;
    const myPlayerIndex = Math.max(playOrder.indexOf(myPlayer), 0);
    const myStage = activePlayers ? activePlayers[myPlayer] : undefined;

    const characterBacks = [];
    const characterCards = [];
    const roleCards = [];
    const playerCards = [];
    const playerCardLabels = [];

    playerAreas.forEach((playerArea, i) => {
        const playerIndex = (myPlayerIndex + i) % numPlayers;
        const player = playOrder[playerIndex];

        // Render each player's character
        const character = characters[playerIndex];
        characterBacks.push(<img
            key={`character-back-${i}`}
            className='positioned'
            src={`./characters/Character Back.jpg`}
            alt={'Character Back'}
            style={{
                left: playerArea.x,
                top: playerArea.y,
                width: scaledWidth,
                height: scaledHeight,
            }}
        />);
        if (character) {
            characterCards.push({
                key: character ? `character-${character.name}` : `character-back-${i}`,
                name: character ? character.name : 'Character Back',
                left: playerArea.x,
                top: playerArea.y,
                // TODO this ignores the range criteria
                onClick: myStage === 'targetOtherPlayerInRange' ? () => selectPlayer(player) : undefined,
            });
        }

        // Ratio of role card size in top right of character card, to character card size
        const ROLE_RATIO = 0.25;
        const role = roles[playerIndex];
        const roleName = role.name || 'Role Back';
        roleCards.push(<img
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

        const CARD_RATIO = 0.3;
        // Show other player's hands
        if (player !== myPlayer) {
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
                playerCardLabels.push(<div
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

    // render the three starting characters (select one)
    if (phase === 'selectCharacters') {
        if (myStage === 'selectCharacter') {
            const choices = characterChoices[myPlayer];
            const startX = (width - choices.length * scaledWidth - (choices.length - 1) * DELTA) / 2;
            choices.forEach((choice, i) => {
                characterCards.push({
                    key: `character-${choice.name}`,
                    name: choice.name,
                    left: startX + (scaledWidth + DELTA) * i,
                    top: (height - scaledHeight) / 2,
                    onClick: () => selectCharacter(i),
                });
            });
        }
    }

    if (phase === 'play') {
        // render my cards
        const myHand = hands[myPlayer];
        if (myHand) {
            hands[myPlayer].forEach((card, i) => {
                const selectable = isCardSelectable(G, ctx, myPlayer, card);
                playerCards.push({
                    key: `card-${card.id}`,
                    name: card.type,
                    opacity: selectable ? 1 : 0.3,
                    left: (scaledWidth + DELTA) * i,
                    top: height - scaledHeight - DELTA,
                    width: scaledWidth,
                    height: scaledHeight,
                    onClick: selectable ? () => playCard(i) : undefined,
                });
            })
        }
    }

    const characterTransitions = useTransition(characterCards, card => card.key, {
        from: {opacity: 0, left: (width - scaledWidth) / 2, top: (height - scaledHeight) / 2 },
        enter: card => { return { opacity: 1, left: card.left, top: card.top } },
        update: card => { return { opacity: 1, left: card.left, top: card.top } },
        leave: {opacity: 0, left: (width - scaledWidth) / 2, top: (height - scaledHeight) / 2 },
        unique: true,
    });

    const cardTransitions = useTransition(playerCards, card => card.key, {
        from: {opacity: 0, left: width / 2, top: height / 2, width: 0, height: 0 },
        enter: card => { return { opacity: card.opacity, left: card.left, top: card.top, width: card.width, height: card.height } },
        update: card => { return { opacity: card.opacity, left: card.left, top: card.top, width: card.width, height: card.height } },
        leave: {opacity: 0, left: width / 2, top: height / 2, scale: 1, width: 0, height: 0 },
        unique: true,
    });

    return <div>
        <div
            className='my-region'
            style={{
                height: scaledHeight + 2 * DELTA,
            }}
        />
        {characterBacks}
        {characterTransitions.map(({ item, props }) => {
            return <div
                key={item.key}
                className={classNames('positioned', {'selectable': item.onClick !== undefined})}
                onClick={item.onClick}
            >
                <animated.img
                    className='positioned item'
                    src={`./characters/${item.name}.jpg`}
                    alt={item.name}
                    style={{
                        opacity: props.opacity,
                        left: props.left,
                        top: props.top,
                        width: scaledWidth,
                        height: scaledHeight,
                    }}
                />
            </div>
        })}
        {roleCards}
        {cardTransitions.map(({ item, props }) => {
            return <div
                key={item.key}
                className={classNames('positioned', { 'selectable': item.onClick !== undefined })}
                onClick={item.onClick}
            >
                <animated.img
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
                />
            </div>
        })}
        {playerCardLabels}
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
