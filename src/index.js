import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let rows = [];
    for (let row = 0; row < 9; row = row + 3) {
      let cols = [];
      for (let col = 0; col < 3; col++) {
        cols.push(this.renderSquare(row + col));
      }
      rows.push(<div className="board-row">{cols}</div>);
    }

    return <div>{rows}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          move: 0,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      historySortAscend: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];

    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          move: this.state.stepNumber + 1,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  toggleSort() {
    this.setState({
      historySortAscend: !this.state.historySortAscend,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const ascend = this.state.historySortAscend ? 1 : -1;
    const sortedEntries = Array.from(history).sort(
      (a, b) => (a.move - b.move) * ascend
    );

    const moves = sortedEntries.map((step) => {
      const move = step.move;
      let desc;
      if (move > 0) {
        const prev = history.find((h) => h.move === move - 1).squares;
        const lastsq = step.squares.findIndex(
          (sq, index) => sq && !prev[index]
        );
        desc = `Go to move #${move} (${parseInt(lastsq / 3)}, ${lastsq % 3})`;
      } else {
        desc = "Go to game start";
      }

      const style = this.state.stepNumber === move ? "current_move" : null;
      return (
        <li key={move}>
          <button className={style} onClick={() => this.jumpTo(move)}>
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner:" + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    const sortToggle = (
      <button onClick={() => this.toggleSort()}>
        {this.state.historySortAscend ? "ascend" : "descend"}
      </button>
    );

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>{sortToggle}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
