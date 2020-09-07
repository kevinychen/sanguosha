export function drawCard(G, ctx) {
    const { deck, discard, isFlipped } = G;
    const { random } = ctx;

    const card = deck.pop();
    if (deck.length === 0) {
        // shuffle cards in discard back into the deck
        deck.push(...random.Shuffle(discard.splice(0, discard.length)));
    }
    if (isFlipped[card.id]) {
        delete isFlipped[card.id];
    }
    return card;
}

export function drawCards(G, ctx, playerID, count) {
    const { hands } = G;
    for (let i = 0; i < count; i++) {
        const card = drawCard(G, ctx);
        hands[playerID].push(card);
    }
}

export function discard(G, ctx, card) {
    const { deck, discard } = G;
    const { random } = ctx;

    discard.push(card);
    if (deck.length === 0) {
        deck.push(...random.Shuffle(discard.splice(0, discard.length)));
    }
}

export function nextAlivePlayerPos(G, ctx, pos) {
    const { isAlive } = G;
    const { numPlayers, playOrder } = ctx;
    let newPos = pos;
    do {
        newPos = (newPos + 1) % numPlayers;
    } while (!isAlive[playOrder[newPos]]);
    return newPos;
}
