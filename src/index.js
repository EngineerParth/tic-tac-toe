import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

  // class Square extends React.Component {
  //     constructor(props){
  //       super(props);
  //       this.state = {
  //         value:null
  //       };
  //     }
  //     render() {
  //       return (
  //         <button className="square" 
  //                 onClick={()=>{this.props.onClick()}}
  //         >
  //           {this.props.value}
  //         </button>
  //       );
  //     }
  //   }
    
  // This is a functional component. It is written like this
  // as it does not have its state to maintain. The properties
  // from the parent component is passed through the parameter 'props'
  function Square(props){
      return (
        <button className="square" 
                // Because we are working inside the function, the keyword
                // 'this' is not required. Also we can access the property
                // of the parent by its name whether it is a value or a function
                onClick={props.onClick}
                
                // This will change the style of the button if
                // there is a winner and winner is equal to the value
                // of the square
                style = {(props.winnerObj && props.winnerObj.positions.includes(props.index) && props.winnerObj.winner === props.value)?{backgroundColor:'#2F4F4F', color:'white'}:{}}
        >
          {props.value}
        </button>
      );
  }

  // This is a controlled component. As it doesn't have its state
  // and it is maintained by the parent component.
  class Board extends React.Component {
    renderSquare(i) {
      return (<Square value={this.props.squares[i]} key={i} index={i}
                      // the onClick here is the property of Square,
                      // although it has same name as onClick inbuilt property,
                      // it is not the same. We may as well have different name
                      // for it.
                      onClick={()=>{this.props.onClick(i)}}
                      winnerObj = {this.props.winnerObj} 
                />
              );
    }
  
    render() {
      // Creating the board using loops
      let divs = [];
      let squareNo = 0;
      for(let i=0;i<3;i++){
        let divRow = [];
        for(let j=0;j<3;j++){
          divRow.push(this.renderSquare(squareNo));
          squareNo += 1;
        }
        divs.push(<div className="board-row">{divRow}</div>);
      }
      return (
        // rendering the board with the array of squares
        <div>
          {divs}
        </div>
      );
    }
  }
  
  class Game extends React.Component {
    constructor(props){
      super(props);
      this.state={
        // This JSON object is going to maintain the sequence of previous moves
        // in terms of storing values of all 9 locations in an array called squares
        history:[{
            squares: Array(9).fill(null),
            currentCol:null,
            currentRow: null,
          }
        ],
        stepNumber: 0, // To represent the current step number
        xIsNext: true, // To determine the turn
        sortOrder: true, // To indicate current sorting order of the moves' list
        winner: null // To represent the winner of the game
      }
    }
    
    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber]; // JSON object of current values in all 9 locations
      const winnerObj = calculateWinner(current.squares);
      let winner;
      if(winnerObj){
        winner = winnerObj.winner;
    }

      let moves = history.map((step, move)=>{
        const desc = move ? "Go to move #"+ move :
                            "Go to game start";
        
        // Description of current move in (column, row) format
        const moveDesc = !move?'':  "(" + history[move].currentCol 
                                    + ", " + history[move].currentRow 
                                    + ")" ;

        return (
          <li key={move}>
            <button onClick={()=>{
              this.jumpTo(move)}} style={this.state.stepNumber===move?{fontWeight: 700}:{fontWeight:300}}>{desc}</button>&nbsp;
            <span><i>{moveDesc}</i></span>
          </li>
        );
      });

      if(!this.state.sortOrder)
        moves = moves.reverse();

      let status;
      if(winner){
        status = "Winner: " + winner;
        
      } else if(this.state.stepNumber < 9){
        status = 'Next player: '+ (this.state.xIsNext? 'X' : 'O');
      
      } else{
        status = "Draw";
      }
      return (
        <div className="game">
          <div className="game-board">
            <Board squares={current.squares} winnerObj = {winnerObj}
                    // Because single click handler is used for all 9 buttons
                    // we have to pass the index value of each clicked button
                    onClick={(i)=>{this.handleClick(i)}}
            />
          </div>
          <div className="game-info">
            <div style={winner?{fontWeight:'bold'}:{}}>{status}</div>
            <button onClick = {()=>{this.changeOrder()}}>reverse order</button>
            <ol>{moves}</ol>
          </div>
        </div>
      );
    }

    changeOrder(){
      this.setState({sortOrder:!this.state.sortOrder});
    }

    handleClick(i){

      // Instead of retrieving entire history, we retrieve only upto current 
      // step because if we are visiting any previous move and from that we want to
      // change all future moves than we probably don't need the previously
      // played future moves (alternate future!)
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      // (!IMPORTANT!)
      // slice method returns the elements starting from start index upto 'END INDEX - 1'
      
      const current = history[history.length-1];
      
      // slice is called only to create a copy of the array
      // because of this, the updates happen on copy by keeping 
      // original array intact, hence, immutable
      const squares = current.squares.slice();
      var currentCol = current.currentCol;
      var currentRow = current.currentRow;
      
      const winnerObj = calculateWinner(squares);
      let winner;
      if(winnerObj){
        winner = winnerObj.winner;
      }

      if(squares[i]){
        return;
      }

      if(winner){
        this.setState({winner: winner});
        return;
      }
      
      squares[i]=this.state.xIsNext? 'X' : 'O';
      // As we are storing all 9 positions in single dimensional array,
      // we need to map the given position into 3 X 3 matrix
      currentCol = i%3;
      currentRow = Math.trunc(i/3);
      
      this.setState({
        history: history.concat([{squares:squares,currentCol:currentCol,
                                  currentRow:currentRow}]),
        xIsNext: !this.state.xIsNext,
        stepNumber: history.length,

      });
    }

    // To go to a specific past step
    jumpTo(step){
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2)===0, // If X is always first then this will work fine!
      });
    }
  }

  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );

  // to determine the winner
  // input: squares array representing all 9 locations' values
  function calculateWinner(squares){
    
    // winning combination
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

    for(let i=0;i<lines.length;i++){
      const [a, b, c] = lines[i];
      if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]){
        return {winner: squares[a],positions:[a, b, c]};
      }
    }
  }
  