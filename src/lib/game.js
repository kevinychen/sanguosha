import CARD_CATEGORIES from './cardCategories.js';
import setup from './setup.js';
import { drawCard, drawCards, discard, nextAlivePlayerPos } from './helper.js';

/* Moves */

function selectCharacter(G, ctx, index) {
    const { startPlayerIndex, characterChoices, characters, healths } = G;
    const { numPlayers, playerID, playOrder } = ctx;
    const character = characterChoices[playerID][index];
    characterChoices[playerID] = undefined;
    characters[playerID] = character;
    let maxHealth = character.health;
    if (numPlayers >= 4 && playOrder[startPlayerIndex] === playerID) {
        // if >= 4 players, add 1 extra health for the King
        maxHealth++;
    }
    healths[playerID] = {
        max: maxHealth,
        current: maxHealth,
    };
}

function draw(G, ctx) {
    const { hands } = G;
    const { playerID } = ctx;
    const card = drawCard(G, ctx);
    hands[playerID].push(card);
}

function judgment(G, ctx) {
    const card = drawCard(G, ctx);
    discard(G, ctx, card);
}

function play(G, ctx, index, targetPlayerID) {
    const { hands, equipment } = G;
    const { playerID } = ctx;
    const [card] = hands[playerID].splice(index, 1);
    const category = CARD_CATEGORIES[card.type];
    if (category) {
        if (targetPlayerID === undefined) {
            targetPlayerID = playerID;
        }
        if (equipment[targetPlayerID][category]) {
            discard(G, ctx, equipment[targetPlayerID][category]);
        }
        equipment[targetPlayerID][category] = card;
    } else {
        discard(G, ctx, card);
    }
}

function pickUp(G, ctx, index) {
    const { discard, hands } = G;
    const { playerID } = ctx;
    const [card] = discard.splice(index, 1);
    hands[playerID].push(card);
}

function give(G, ctx, index, otherPlayerID) {
    const { hands } = G;
    const { playerID } = ctx;
    const [card] = hands[playerID].splice(index, 1);
    hands[otherPlayerID].push(card);
}

function dismantle(G, ctx, target) {
    const { hands, equipment } = G;
    if (target.index !== undefined) {
        const [card] = hands[target.playerID].splice(target.index, 1);
        discard(G, ctx, card);
    } else {
        const card = equipment[target.playerID][target.category];
        equipment[target.playerID][target.category] = undefined;
        discard(G, ctx, card);
    }
}

function steal(G, ctx, target) {
    const { hands, equipment } = G;
    const { playerID } = ctx;
    if (target.index !== undefined) {
        const [card] = hands[target.playerID].splice(target.index, 1);
        hands[playerID].push(card);
    } else {
        const card = equipment[target.playerID][target.category];
        equipment[target.playerID][target.category] = undefined;
        hands[playerID].push(card);
    }
}

function toggleChain(G, ctx) {
    const { isChained } = G;
    const { playerID } = ctx;
    isChained[playerID] = !isChained[playerID];
}

function harvest(G, ctx) {
    const { isAlive, deck, harvest } = G;
    const { playOrder } = ctx;
    const numPlayers = playOrder.filter(player => isAlive[player]).length;
    if (harvest.length === numPlayers) {
        // undo
        deck.push(...harvest.splice(0, numPlayers));
    } else if (harvest.length === 0) {
        for (let i = 0; i < numPlayers; i++) {
            const card = drawCard(G, ctx);
            harvest.push(card);
        }
    }
}

function pickUpHarvest(G, ctx, index) {
    const { hands, harvest } = G;
    const { playerID } = ctx;
    const [card] = harvest.splice(index, 1);
    hands[playerID].push(card);
}

function passLightning(G, ctx) {
    const { equipment } = G;
    const { numPlayers, playOrder } = ctx;
    for (let i = 0; i < numPlayers; i++) {
        if (equipment[playOrder[i]]['Lightning'] !== undefined) {
            const newPos = nextAlivePlayerPos(G, ctx, i);
            equipment[playOrder[newPos]]['Lightning'] = equipment[playOrder[i]]['Lightning'];
            equipment[playOrder[i]]['Lightning'] = undefined;
            return;
        }
    }
}

function updateHealth(G, ctx, change) {
    const { healths } = G;
    const { playerID } = ctx;
    healths[playerID].current += change;
    if (healths[playerID].current > healths[playerID].max) {
        healths[playerID].current = healths[playerID].max;
    }
    if (healths[playerID].current < 0) {
        healths[playerID].current = 0;
    }
}

function die(G, ctx) {
    const { isAlive } = G;
    const { playerID } = ctx;
    delete isAlive[playerID];
}

function endPlay(G, ctx) {
    const { healths, hands } = G;
    const { events, playerID } = ctx;
    events.setStage('discard');
    if (hands[playerID].length <= healths[playerID].current) {
        events.endTurn();
    }
}

function discardCard(G, ctx, index) {
    const { healths, hands } = G;
    const { events, playerID } = ctx;
    const [card] = hands[playerID].splice(index, 1);
    discard(G, ctx, card);
    if (hands[playerID].length <= healths[playerID].current) {
        events.endTurn();
    }
}

/* Game object */

const turnOrder = {
    first: G => G.startPlayerIndex,
    next: (G, ctx) => nextAlivePlayerPos(G, ctx, ctx.playOrderPos),
};

export const SanGuoSha = {
    name: "san-guo-sha",

    setup,

    playerView: (G, ctx, playerID) => {
        const { roles, isAlive } = G;
        const { numPlayers, playOrder } = ctx;

        const newRoles = { ...roles };
        for (let i = 0; i < numPlayers; i++) {
            if (playOrder[i] !== playerID && isAlive[playOrder[i]] && newRoles[i].name !== 'King') {
                newRoles[i] = {id: roles[i].id};
            }
        }
        return {
            ...G,
            roles: newRoles,
        };
    },

    phases: {
        selectCharacters: {
            start: true,

            onBegin: (G, ctx) => {
                const { startPlayerIndex } = G;
                const { events, playOrder } = ctx;
                events.setActivePlayers({
                    value: {[playOrder[startPlayerIndex]]: 'selectCharacter'},
                    moveLimit: 1,
                    next: {
                        others: 'selectCharacter',
                        moveLimit: 1,
                    }
                });

                // make character choices automatically for easier testing
                // TODO remove
                //playOrder.forEach(player => selectCharacter(G, {...ctx, playerID: player}, 0));
            },

            // end select characters phase if everyone has made a character choice
            endIf: G => Object.values(G.characterChoices).every(choices => choices === undefined),

            next: 'play',

            turn: {
                order: turnOrder,
                stages: {
                    selectCharacter: {
                        moves: { selectCharacter },
                    },
                },
            }
        },

        play: {
            onBegin: (G, ctx) => {
                const { playOrder } = ctx;
                playOrder.forEach(player => drawCards(G, ctx, player, 4));
            },

            turn: {
                order: turnOrder,
                onBegin: (G, ctx) => {
                    const { currentPlayer, events } = ctx;
                    drawCards(G, ctx, currentPlayer, 2);

                    // everyone can play cards in freeform mode
                    events.setActivePlayers({ all: 'play' });
                },
                stages: {
                    play: {
                        moves: {
                            draw,
                            judgment,
                            play,
                            pickUp,
                            give,
                            dismantle,
                            steal,
                            toggleChain,
                            harvest,
                            pickUpHarvest,
                            passLightning,
                            updateHealth,
                            die,
                            endPlay,
                         },
                    },
                    discard: {
                        moves: { discardCard },
                    },
                },
            },
        },
    },

    minPlayers: 2,

    maxPlayers: 8,

    endIf: (G, ctx) => {
        const { isAlive } = G;
        const { playOrder } = ctx;
        return playOrder.filter(player => isAlive[player]).length === 1;
    },
};
