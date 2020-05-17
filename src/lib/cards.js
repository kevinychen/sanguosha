
export function isCardSelectable(_G, ctx, myPlayer, card) {
    const { currentPlayer, activePlayers } = ctx;

    const myStage = activePlayers ? activePlayers[myPlayer] : undefined;
    switch (myStage) {
        case 'play':
            if (myPlayer === currentPlayer) {
                return ['Attack'].includes(card.type);
            }
            break;
        case 'tryDodge':
            return ['Dodge'].includes(card.type);
        default:
            return false;
    }
}
