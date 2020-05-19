export function drawCards(G, ctx, player, count) {
    const { deck, discard, hands } = G;
    const { random } = ctx;

    for (let i = 0; i < count; i++) {
        if (deck.length === 0) {
            // shuffle cards in discard back into the deck
            if (discard.length === 0) {
                console.error('No cards left!');
            }
            deck.push(...random.Shuffle(discard.splice(0, discard.length)));
        }
        hands[player].push(G.deck.pop());
    }
}

export function loseHealth(G, _ctx, player, count) {
    // TODO do brink of death and death logic
    const { healths } = G;
    healths[player].current -= count;
}

export function prepareNextPlay(G, ctx) {
    const { events } = ctx;
    events.setActivePlayers({
        currentPlayer: 'play',
    })
    G.activeCardType = undefined;
    G.activeCardData = {};
    G.targets = [];
}

function roundRobinAttack(defendingCard) {
    return {
        canPlayCard: () => true,
        playCard: (G, ctx) => {
            const { activeCardData, targets } = G;
            const { currentPlayer, events, numPlayers, playOrder, playOrderPos } = ctx;
            activeCardData.index = 0;
            targets.push(...[...Array(numPlayers - 1)]
                .map((_, i) => {
                    return {
                        targeter: currentPlayer,
                        target: playOrder[(playOrderPos + i + 1) % numPlayers],
                    };
                }));
            events.setActivePlayers({
                value: { [playOrder[(playOrderPos + activeCardData.index + 1) % numPlayers]]: 'play' },
                moveLimit: 1,
            });
        },
        current: _data => {
            const next = (G, ctx) => {
                const { activeCardData, targets } = G;
                const { events, numPlayers, playOrder, playOrderPos } = ctx;
                targets.splice(0, 1);
                activeCardData.index++;
                if (activeCardData.index < numPlayers - 1) {
                    events.setActivePlayers({
                        value: { [playOrder[(playOrderPos + activeCardData.index + 1) % numPlayers]]: 'play' },
                        moveLimit: 1,
                    });
                } else {
                    prepareNextPlay(G, ctx);
                }
            };
            return {
                text: 'Take the hit',
                miscAction: (G, ctx) => {
                    const { activeCardData } = G;
                    const { numPlayers, playOrder, playOrderPos } = ctx;
                    loseHealth(G, ctx, playOrder[(playOrderPos + activeCardData.index + 1) % numPlayers], 1);
                    next(G, ctx);
                },
                canPlayCard: (_G, _ctx, _playerID, card) => card.type === defendingCard,
                playCard: (G, ctx, _card) => {
                    next(G, ctx);
                },
            };
        },
    };
}

export const CARD_TYPES = {
    'Attack': {
        canPlayCard: () => true,
        playCard: (_G, ctx) => {
            const { events } = ctx;
            events.setActivePlayers({
                currentPlayer: 'play',
                moveLimit: 1,
            });
        },
        current: data => {
            if (data.target === undefined) {
                return {
                    text: 'Select player',
                    canSelectPlayer: (_G, _ctx, playerID, selectedPlayerID) => {
                        // TODO take range into account
                        return playerID !== selectedPlayerID;
                    },
                    selectPlayer: (G, ctx, selectedPlayerID) => {
                        const { activeCardData, targets } = G;
                        const { events, playerID } = ctx;
                        activeCardData.target = selectedPlayerID;
                        targets.push({ targeter: playerID, target: selectedPlayerID });
                        events.setActivePlayers({
                            value: { [selectedPlayerID]: 'play' },
                            moveLimit: 1,
                        });
                    }
                };
            } else {
                return {
                    text: 'Take the hit',
                    miscAction: (G, ctx) => {
                        loseHealth(G, ctx, data.target, 1);
                        prepareNextPlay(G, ctx);
                    },
                    canPlayCard: (_G, _ctx, _playerID, card) => card.type === 'Dodge',
                    playCard: prepareNextPlay,
                };
            }
        },
    },
    'Dodge': {
        canPlayCard: () => false,
    },
    'Peach': {
        canPlayCard: () => true,
        playCard: (G, ctx) => {
            const { healths } = G;
            const { currentPlayer } = ctx;
            healths[currentPlayer].current = Math.min(healths[currentPlayer].current + 1, healths[currentPlayer].max);
            prepareNextPlay(G, ctx);
        },
    },
    'Barbarians': roundRobinAttack('Attack'),
    'Hail of Arrows': roundRobinAttack('Dodge'),
};
