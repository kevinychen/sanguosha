import React from 'react';
import PropTypes from 'prop-types';
import './board.css';

export class TicTacToeBoard extends React.Component {
    static propTypes = {
        G: PropTypes.any.isRequired,
        ctx: PropTypes.any.isRequired,
        moves: PropTypes.any.isRequired,
        playerID: PropTypes.string,
        isActive: PropTypes.bool,
        isMultiplayer: PropTypes.bool,
    };

    onClick = id => {
        if (this.isActive(id)) {
            this.props.moves.clickCell(id);
        }
    };

    isActive(id) {
        if (!this.props.isActive) return false;
        if (this.props.G.cells[id] !== null) return false;
        return true;
    }

    render() {
        let tbody = [];
        for (let i = 0; i < 3; i++) {
            let cells = [];
            for (let j = 0; j < 3; j++) {
                const id = 3 * i + j;
                cells.push(
                    <td
                        key={id}
                        className={this.isActive(id) ? 'active' : ''}
                        onClick={() => this.onClick(id)}
                    >
                        {this.props.G.cells[id]}
                    </td>
                );
            }
            tbody.push(<tr key={i}>{cells}</tr>);
        }

        let winner = null;
        if (this.props.ctx.gameover) {
            winner =
                this.props.ctx.gameover.winner !== undefined ? (
                    <div id="winner">Winner: {this.props.ctx.gameover.winner}</div>
                ) : (
                        <div id="winner">Draw!</div>
                    );
        }

        return (
            <div>
                <table id="board">
                    <tbody>{tbody}</tbody>
                </table>
                {winner}
            </div>
        );
    }
}
