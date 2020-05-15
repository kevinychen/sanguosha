import { Client } from 'boardgame.io/react';
import { TicTacToe } from '../lib/game';
import { TicTacToeBoard } from './board';

export default Client({
    game: TicTacToe,
    board: TicTacToeBoard,
});
