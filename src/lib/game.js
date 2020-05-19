import setup from './setup.js';
import { prepareNextPlay, drawCards, CARD_TYPES } from './cards.js';

/* Moves */

function selectCharacter(G, ctx, index) {
    const { characterChoices, characters, healths } = G;
    const { playerID } = ctx;
    const character = characterChoices[playerID][index];
    characterChoices[playerID] = undefined;
    characters[playerID] = character;
    // TODO if >= 4 players, add 1 extra health for the King
    healths[playerID] = {
        max: character.health,
        current: character.health,
    };
}

function playCard(G, ctx, index) {
    const { discard, hands, activeCardType, activeCardData } = G;
    const { playerID } = ctx;
    const [card] = hands[playerID].splice(index, 1);
    discard.push(card);

    if (activeCardType === undefined) {
        G.activeCardType = card.type;
        CARD_TYPES[card.type].playCard(G, ctx);
    } else {
        CARD_TYPES[activeCardType].current(activeCardData).playCard(G, ctx, card);
    }
}

function selectPlayer(G, ctx, selectedPlayer) {
    const { activeCardType, activeCardData } = G;
    CARD_TYPES[activeCardType].current(activeCardData).selectPlayer(G, ctx, selectedPlayer);
}

function miscAction(G, ctx) {
    const { activeCardType, activeCardData } = G;
    CARD_TYPES[activeCardType].current(activeCardData).miscAction(G, ctx);
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
    next: (_G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
};

export const SanGuoSha = {
    name: "san-guo-sha",

    setup,

    playerView: (G, ctx, playerID) => {
        const { roles } = G;
        const { numPlayers, playOrder } = ctx;

        const newRoles = { ...roles };
        for (let i = 0; i < numPlayers; i++) {
            // TODO show role if dead
            if (playOrder[i] !== playerID && newRoles[i].name !== 'King') {
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
                ctx.playOrder.forEach(player => selectCharacter(G, {...ctx, playerID: player}, 0));
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
                    const { currentPlayer } = ctx;

                    // TODO run begin phase powers
                    // TODO run judgment

                    drawCards(G, ctx, currentPlayer, 2);

                    prepareNextPlay(G, ctx);
                },
                onEnd: () => {
                    // TODO run end phase powers
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
                        moves: { playCard, selectPlayer, miscAction },
                    },

                    discard: {
                        moves: { discardCard, doNothing },
                    },
                },
            },
        },
    },
};
