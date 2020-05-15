function IsVictory(cells) {
    const positions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    const isRowComplete = row => {
        const symbols = row.map(i => cells[i]);
        return symbols.every(i => i !== null && i === symbols[0]);
    };

    return positions.map(isRowComplete).some(i => i === true);
}

export const TicTacToe = {
    name: "tic-tac-toe",

    setup: () => ({
        cells: Array(9).fill(null)
    }),

    moves: {
        clickCell(G, ctx, id) {
            if (G.cells[id] === null) {
                G.cells[id] = ctx.currentPlayer;
            }
        }
    },

    turn: { moveLimit: 1 },

    endIf: (G, ctx) => {
        if (IsVictory(G.cells)) {
            return { winner: ctx.currentPlayer };
        }
        if (G.cells.filter(c => c === null).length === 0) {
            return { draw: true };
        }
    }
};
