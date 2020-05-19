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

export function prepareNextPlay(G, ctx) {
    const { events } = ctx;
    events.setActivePlayers({
        currentPlayer: 'play',
    })
    G.activeCardType = undefined;
    G.activeCardData = {};
    G.targets = [];
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
                    canSelectPlayer: _playerID => true,
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
                        const { healths } = G;
                        healths[data.target].current--;
                        // TODO do brink of death and death logic
                        prepareNextPlay(G, ctx);
                    },
                    canPlayCard: card => card.type === 'Dodge',
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
};
