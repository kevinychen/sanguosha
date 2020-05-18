import setup from './setup.js';

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
    const { discard, hands, activeCard } = G;
    const { playerID } = ctx;
    const [card] = hands[playerID].splice(index, 1);
    discard.push(card);
    if (activeCard === undefined) {
        G.activeCard = {
            ...card,
            responseCards: [],
        };
    } else {
        activeCard.responseCards.push(card);
    }
}

function targetPlayer(G, ctx, target) {
    const { playerID } = ctx;
    G.targets.push({ targeter: playerID, target });
}

function ignore() {}

/* Game object helper functions */

function findKingPlayer(G) {
    return G.roles.findIndex(role => role.name === 'King');
}

const turnOrder = {
    first: findKingPlayer,
    next: (_G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
};

function prepareNextPlay(G, ctx) {
    const { events } = ctx;
    events.setActivePlayers({
        currentPlayer: 'play',
    })
    G.activeCard = undefined;
    G.targets = [];
}

/* Game object */

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
                    const character = G.characterChoices[player][0];
                    G.characters[player] = character;
                    G.characterChoices[player] = undefined;
                    G.healths[player] = { max: character.health, current: character.health };
                });
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
                // Deal 4 cards to each person at beginning of game
                const { deck, hands } = G;
                const { playOrder } = ctx;
                playOrder.map(player => hands[player].push(...deck.splice(0, 4)));
            },

            turn: {
                order: turnOrder,
                onBegin: (G, ctx) => {
                    // TODO run begin phase powers
                    // TODO run judgment
                    // TODO draw cards

                    prepareNextPlay(G, ctx);
                },
                onEnd: () => {
                    // TODO run end phase powers
                },
                onMove: (G, ctx) => {
                    const { healths, activeCard, targets } = G;
                    const { currentPlayer, events } = ctx;
                    if (activeCard) {
                        activeCard.step = (activeCard.step + 1) || 0;
                        switch (activeCard.type) {
                            case 'Attack':
                                if (activeCard.step === 0) {
                                    events.setActivePlayers({
                                        currentPlayer: 'targetOtherPlayerInRange',
                                        moveLimit: 1,
                                    });
                                } else if (activeCard.step === 1) {
                                    events.setActivePlayers({
                                        value: { [targets[0].target]: 'tryDodge' },
                                        moveLimit: 1,
                                    });
                                } else {
                                    if (activeCard.responseCards.length === 0) {
                                        // TODO do brink of death and death logic
                                        healths[targets[0].target].current--;
                                    } else {
                                        console.log('Attack dodged.');
                                    }
                                    prepareNextPlay(G, ctx);
                                }
                                break;
                            case 'Peach':
                                healths[currentPlayer].current = Math.min(healths[currentPlayer].current + 1, healths[currentPlayer].max);
                                prepareNextPlay(G, ctx);
                                break;
                            default: {
                            }
                        }
                    }
                },
                stages: {
                    play: {
                        moves: { playCard },
                    },

                    targetOtherPlayerInRange: {
                        moves: { targetPlayer },
                    },

                    tryDodge: {
                        moves: { playCard, ignore },
                    },
                },
            },
        },
    },
};
