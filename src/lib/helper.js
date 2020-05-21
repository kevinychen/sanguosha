export function drawCard(G, ctx) {
    const { deck, discard } = G;
    const { random } = ctx;

    if (deck.length === 0) {
        // shuffle cards in discard back into the deck
        if (discard.length === 0) {
            console.error('No cards left!');
        }
        deck.push(...random.Shuffle(discard.splice(0, discard.length)));
    }
    return deck.pop();
}

export function drawCards(G, ctx, playerID, count) {
    const { hands } = G;
    for (let i = 0; i < count; i++) {
        const card = drawCard(G, ctx);
        hands[playerID].push(card);
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
