import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  const style = "square" + (props.shouldHighlight ? " highlight" : "");
  return (
    <button className={style} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function Board(props) {
  const renderSquare = (i, shouldHighlight) => {
    return (
      <Square
        key={i}
        value={props.squares[i]}
        shouldHighlight={shouldHighlight}
        onClick={() => props.onClick(i)}
      />
    );
  };

  const winnerSquares = calculateWinner(props.squares);
  let rows = [];
  for (let row = 0; row < 9; row = row + 3) {
    let cols = [];
    for (let col = 0; col < 3; col++) {
      const squarePos = row + col;
      const shouldHighlight =
        winnerSquares && winnerSquares.some((e) => e === squarePos);
      cols.push(renderSquare(squarePos, shouldHighlight));
    }
    rows.push(
      <div key={`rowdiv_${row}`} className="board-row">
        {cols}
      </div>
    );
  }
  return <div>{rows}</div>;
}

function MoveHistory(props) {
  const [ascend, setAscend] = useState(true);
  const history = props.history;
  const sortedEntries = Array.from(history).sort(
    (a, b) => (a.move - b.move) * (ascend ? 1 : -1)
  );

  const moves = sortedEntries.map((step) => {
    const move = step.move;
    let desc;
    if (move > 0) {
      const prev = history.find((h) => h.move === move - 1).squares;
      const lastsq = step.squares.findIndex((sq, index) => sq && !prev[index]);
      desc = `Go to move #${move} (${parseInt(lastsq / 3)}, ${lastsq % 3})`;
    } else {
      desc = "Go to game start";
    }

    const style = props.stepNumber === move ? "current_move" : null;
    return (
      <li key={move}>
        <button className={style} onClick={() => props.onToggleClicked(move)}>
          {desc}
        </button>
      </li>
    );
  });

  return (
    <div>
      <div>
        <button onClick={() => setAscend(!ascend)}>
          {ascend ? "ascend" : "descend"}
        </button>
      </div>
      <ol>{moves}</ol>
    </div>
  );
}

function Game(props) {
  const [history, setHistory] = useState([
    {
      squares: Array(9).fill(null),
      move: 0,
    },
  ]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);

  const handleClick = (i) => {
    const newHistory = history.slice(0, stepNumber + 1);
    const current = newHistory[newHistory.length - 1];

    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = xIsNext ? "X" : "O";
    setHistory(
      newHistory.concat([
        {
          squares: squares,
          move: stepNumber + 1,
        },
      ])
    );
    setStepNumber(newHistory.length);
    setXIsNext(!xIsNext);
  };

  const jumpTo = (step) => {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
  };

  const current = history[stepNumber];

  let status;
  const winner = calculateWinner(current.squares);
  if (winner) {
    status = "Winner:" + current.squares[winner[0]];
  } else {
    if (stepNumber === 9) {
      status = "Draw";
    } else {
      status = "Next player: " + (xIsNext ? "X" : "O");
    }
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={current.squares} onClick={(i) => handleClick(i)} />
      </div>
      <div className="game-info">
        <div>{status}</div>
        <MoveHistory
          history={history}
          stepNumber={stepNumber}
          onToggleClicked={jumpTo}
        />
      </div>
    </div>
  );
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
      return lines[i];
    }
  }
  return null;
}
