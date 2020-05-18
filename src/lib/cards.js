export function getStage(ctx, myPlayerID) {
    const { playerID, currentPlayer, activePlayers } = ctx;
    if (activePlayers) {
        return activePlayers[playerID || myPlayerID || currentPlayer];
    }
}

export function isCardSelectable(_G, ctx, myPlayer, card) {
    const { currentPlayer } = ctx;

    const myStage = getStage(ctx, myPlayer);
    switch (myStage) {
        case 'play':
            if (myPlayer === currentPlayer) {
                return ['Attack', 'Peach'].includes(card.type);
            }
            break;
        case 'discard':
            return true;
        case 'tryDodge':
            return ['Dodge'].includes(card.type);
        default:
            return false;
    }
}
