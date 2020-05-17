import CHARACTERS from './characters.js';

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
    return G.roles.indexOf('King');
}

function selectCharacter(G, ctx, index) {
    const { playerID } = ctx;
    G.characters[playerID] = G.characterChoices[playerID][index];
    G.characterChoices[playerID] = undefined;
}

function playCard(G, ctx, card) {
    // TODO
}

function discard(G, ctx, cards) {
    // TODO
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

        action: {
            moves: { playCard },
            next: 'discard',
        },

        maybeDiscard: {
            moves: { discard },
        },
    },
};

export const SanGuoSha = {
    name: "san-guo-sha",

    setup: ctx => {
        const { numPlayers, playOrder, random } = ctx;

        const roles = random.Shuffle(ROLE_DIST_LABELS.flatMap((role, i) => Array(ROLE_DIST[numPlayers][i]).fill(role)));

        const shuffledCharacters = random.Shuffle(CHARACTERS);
        const characterChoices = Object.fromEntries(playOrder.map((player, i) =>
            [player, shuffledCharacters.slice(NUM_CHARACTER_CHOICES * i, NUM_CHARACTER_CHOICES * (i + 1))]));
        const characters = {};

        const deck = [];
        // TODO use more than one card lol
        for (let i = 0; i < 20; i++) {
            deck.push({
                value: '10',
                suit: 'CLUB',
                type: 'Attack',
            });
        }
        const hands = Object.fromEntries(playOrder.map(player => [player, []]));

        return {
            roles,
            characterChoices,
            characters,
            deck,
            hands,
        };
    },

    playerView: (G, ctx, playerID) => {
        const { roles } = G;
        const { numPlayers, playOrder } = ctx;

        const newRoles = { ...roles };
        for (let i = 0; i < numPlayers; i++) {
            // TODO show role if dead
            if (playOrder[i] !== playerID && newRoles[i] !== 'King') {
                newRoles[i] = undefined;
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
                const { events, playOrder } = ctx;
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
                onBegin: (_G, ctx) => {
                    const { events } = ctx;

                    // TODO run begin phase powers
                    // TODO run judgment
                    // TODO draw cards

                    events.setActivePlayers({
                        currentPlayer: 'action',
                    })
                },
                onEnd: () => {
                    // TODO run end phase powers
                }
            },
        },
    },

    turn,
};
