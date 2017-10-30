import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick} style={props.style}>
      {props.value}
    </button>
  );
} 

function Toggle(props) {
  return(
    <button onClick={props.onClick}>
      Reverse
    </button>
  )
}

class Board extends React.Component {

  renderSquare(i, style) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        style = {style}
      />
    );
  }

  render(){
    var rows = [];
    var cells = [];
    for (let x=0; x<3; x++) {
      for (var y=0; y<3; y++) {
        var idx = (x * 3) + y
        if (this.props.winners.includes(idx)) {
          cells.push(this.renderSquare(idx, {'background-color': '#2ecc71'}));
        } else {
          cells.push(this.renderSquare(idx, {'background-color': 'white'}));
        }
      }
      rows.push(<div className="board-row">{cells}</div>)
      cells = [];
    }
    return (<div>{rows}</div>)
  }
}

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        idx: null
      }],
      xIsNext: true,
      stepNumber: 0,
      reverseOrder: false,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        idx: i
      }]),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length,
    });
  }

  toggle() {
    this.setState({
      reverseOrder: !this.state.reverseOrder
    })
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const result = calculateWinner(current.squares);
    var winner = null;
    var winnerCoords = [];
    if (result) {
      winner = result[0];
      winnerCoords = result[1];
    }

    let status;

    if (winner) {
      status = 'Winner is: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    const moves = history.map((step, move) => {
      let x = step.idx ? Math.floor(step.idx/3) : ''
      let y = step.idx ? step.idx % 3 : ''
      let desc = move ? ('Go to move ' + move + ' (' + x + ', ' + y + ')') : 'Go to game start';

      return (
        <li key={move}>
          <button 
            style={this.state.stepNumber === move ? {'fontWeight': 'bold'} : {'fontWeight': 'initial'}}
            onClick={() => {this.jumpTo(move)}}>{desc}
          </button>
        </li>
      )
    })

    const reversed = this.state.reverseOrder;
    const list = reversed ? moves.slice().reverse() : moves.slice();

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            xIsNext={this.state.xIsNext}
            onClick={i => this.handleClick(i)}
            winners={winnerCoords ? winnerCoords : []}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol reversed={reversed}>{list}</ol>
        </div>
        <Toggle onClick={() => this.toggle()}/>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

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
      return [squares[a], lines[i]];
    }
  }
  return null;
}
