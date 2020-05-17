import CHARACTERS from './characters.js';
import CARD_TYPES from './cardTypes.js';

// Recommended role distribution for different numbers of players
// http://www.englishsanguosha.com/rules/roles
const ROLE_DIST_LABELS = ['King', 'Rebel', 'Loyalist', 'Spy'];
const ROLE_DIST = {
    2: [1, 1, 0, 0],
    3: [1, 1, 0, 1],
    4: [1, 2, 0, 1],
    5: [1, 2, 1, 1],
    6: [1, 3, 1, 1],
    7: [1, 3, 2, 1],
    8: [1, 4, 2, 1],
    9: [1, 4, 3, 1],
    10: [1, 5, 3, 1],
};

const NUM_CHARACTER_CHOICES = 3;

function findKingPlayer(G) {
    return G.roles.findIndex(role => role.name === 'King');
}

/* Moves */

function selectCharacter(G, ctx, index) {
    const { characterChoices, characters } = G;
    const { playerID } = ctx;
    characters[playerID] = characterChoices[playerID][index];
    characterChoices[playerID] = undefined;
}

function playCard(G, ctx, index) {
    const { hands } = G;
    const { playerID } = ctx;
    const [card] = hands[playerID].splice(index, 1);
    G.activeCard = {
        ...card,
        step: 0,
    };
}

function selectPlayer(G, _ctx, playerID) {
    const { activeCard } = G;
    activeCard.step++;
    activeCard.player = playerID;
}

/* Game object helper functions */

function onBeforeMove(G, ctx) {
    const { hands } = G;
    const { currentPlayer, playOrder } = ctx;
    playOrder.forEach(player => {
        hands[player].forEach(card => {
            card.selectable = player === currentPlayer && CARD_TYPES[card.type].canStart;
        });
    });
}

const turn = {
    order: {
        first: findKingPlayer,
        next: (_G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
    },

    stages: {
        selectCharacter: {
            moves: { selectCharacter },
        },

        play: {
            moves: { playCard },
        },

        targetOtherPlayer: {
            moves: { selectPlayer },
        },
    },
};

/* Game object */

export const SanGuoSha = {
    name: "san-guo-sha",

    setup: ctx => {
        const { numPlayers, playOrder, random } = ctx;

        const unshuffledRoles = [];
        ROLE_DIST_LABELS.forEach((role, i) => {
            for (let j = 0; j < ROLE_DIST[numPlayers][i]; j++) {
                unshuffledRoles.push({ name: role });
            }
        });
        const roles = random.Shuffle(unshuffledRoles);
        for (let i = 0; i < roles.length; i++) {
            roles[i].id = `role-${i}`;
        }

        const allCharacterChoices = random.Shuffle(CHARACTERS);
        const characterChoices = Object.fromEntries(playOrder.map((player, i) =>
            [player, allCharacterChoices.slice(NUM_CHARACTER_CHOICES * i, NUM_CHARACTER_CHOICES * (i + 1))]));
        const characters = {};

        const unshuffledDeck = [];
        // TODO use more than one card lol
        for (let i = 0; i < 20; i++) {
            unshuffledDeck.push({
                value: '10',
                suit: 'CLUB',
                type: 'Attack',
            });
        }
        const deck = random.Shuffle(unshuffledDeck);
        for (let i = 0; i < deck.length; i++) {
            deck[i].id = `card-${i}`;
        }

        const hands = Object.fromEntries(playOrder.map(player => [player, []]));
        const activeCard = undefined;

        return {
            roles,
            characterChoices,
            characters,
            deck,
            hands,
            activeCard,
        };
    },

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
                const { playOrder, events } = ctx;
                events.setActivePlayers({
                    // first the king selects a character
                    value: {[playOrder[findKingPlayer(G)]]: 'selectCharacter'},
                    moveLimit: 1,
                    next: {
                        // then everyone else selects a character
                        others: 'selectCharacter',
                        moveLimit: 1,
                    }
                });

                // make choices automatically for easier testing
                // TODO remove
                playOrder.forEach(player => {
                    G.characters[player] = G.characterChoices[player][0];
                    G.characterChoices[player] = undefined;
                });
            },
            // end select characters phase if everyone has made a character choice
            endIf: G => Object.values(G.characterChoices).every(choices => choices === undefined),
            next: 'play',
        },

        play: {
            onBegin: (G, ctx) => {
                // Deal 4 cards to each person at beginning of game
                const { deck, hands } = G;
                const { playOrder } = ctx;
                playOrder.map(player => hands[player].push(...deck.splice(0, 4)));
            },

            turn: {
                ...turn,
                onBegin: (G, ctx) => {
                    const { events } = ctx;

                    // TODO run begin phase powers
                    // TODO run judgment
                    // TODO draw cards

                    events.setActivePlayers({
                        currentPlayer: 'play',
                    })

                    onBeforeMove(G, ctx);
                },
                onEnd: () => {
                    // TODO run end phase powers
                },
                onMove: (G, ctx) => {
                    const { activeCard } = G;
                    const { events } = ctx;
                    if (activeCard) {
                        switch (activeCard.type) {
                            case 'Attack': {
                                if (activeCard.step === 0) {
                                    events.setActivePlayers({
                                        currentPlayer: 'targetOtherPlayer',
                                        moveLimit: 1,
                                    });
                                }
                                break;
                            }
                            default: {

                            }
                        }
                    }

                    onBeforeMove(G, ctx);
                }
            },
        },
    },

    turn,
};
