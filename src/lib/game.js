import setup from './setup.js';
import { drawCards, nextAlivePlayerPos, drawCard } from './helper.js';

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

function drawFromDeck(G, ctx) {
    const { hands } = G;
    const { playerID } = ctx;
    const card = drawCard(G, ctx);
    hands[playerID].push(card);
}

function judgment(G, ctx) {
    const { discard } = G;
    const card = drawCard(G, ctx);
    discard.push(card);
}

function play(G, ctx, index) {
    const { discard, hands } = G;
    const { playerID } = ctx;
    const [card] = hands[playerID].splice(index, 1);
    discard.push(card);
}

function give(G, ctx, index, otherPlayerID) {

}

/** { playerID, type: (index|'weapon'|'shield'|'+1'|'-1'|'starvation'|'capture'|'lightning') } */
function dismantle(G, ctx, target) {

}

function steal(G, ctx, target) {

}

function toggleChain(G, ctx, playerID) {

}

/** Special card types: Harvest, Lightning (move to next player) */
function specialAction(G, ctx, cardType) {
    
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

}

function discardCard(G, ctx, index) {
    const { discard, hands } = G;
    const { playerID } = ctx;
    const [card] = hands[playerID].splice(index, 1);
    discard.push(card);
}

function doNothing() {}

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
                playOrder.forEach(player => selectCharacter(G, {...ctx, playerID: player}, 0));
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

                    // TODO everyone can play cards in freeform mode
                    events.setActivePlayers({ all: 'play' });
                },
                endIf: (G, ctx) => {
                    const { healths, hands } = G;
                    const { currentPlayer, activePlayers } = ctx;
                    return activePlayers
                        && activePlayers[currentPlayer] === 'discard'
                        && hands[currentPlayer].length <= healths[currentPlayer].current;
                },
                stages: {
                    play: {
                        moves: { drawFromDeck, judgment, play, give, dismantle, steal, toggleChain, specialAction, updateHealth, die },
                    },
                    discard: {
                        moves: { discardCard, doNothing },
                    },
                },
            },
        },
    },

    endIf: (G, ctx) => {
        const { isAlive } = G;
        const { playOrder } = ctx;
        return playOrder.filter(player => isAlive[player]).length === 1;
    },
};
