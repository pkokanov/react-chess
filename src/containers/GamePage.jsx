import React from 'react';
import PropTypes from 'prop-types'
import { Card, CardTitle, CardText } from 'material-ui/Card';
import Auth from '../modules/Auth.jsx'; 
import RaisedButton from 'material-ui/RaisedButton'

class GamePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            squares: Array(9).fill(null),
            curPlayer: null,
            gameOver: false,
            winningPlayer: null
        }
    }

    handleQuitAction() {

    }

    handleSquareClick(i, row, column) {
        if(this.state.squares[i]) {
            Console.log('Square already clicked');
            return;
        }
        console.log('Clicked column: ' + column + ', row: ' + row + ', index: ' + i);
    }

    renderSquare(i) {
        return (
            <button key={i} className = "square" onClick={() => this.handleSquareClick(i, Math.floor(i/3), (i%3))}>
                 {}
            </button>
        )
    }

    renderSquares() {
        let rows = [];
        for (let i = 0; i<3; ++i) {
            let row_cells = [];
            for(let j = 0; j<3; j++) {
                row_cells.push(this.renderSquare(i*3 + j))
            }
            rows.push(<div  key={i} className="board-row"> {row_cells} </div>)
        }
        return rows;
    }

    
    componentDidMount() {
        const xhr = new XMLHttpRequest();
        xhr.open('get', '/api/game');
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        // set the authorization HTTP header
        xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
        xhr.responseType = 'json';
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                
            } else if (xhr.status === 504) {
            
            } else {
              
            }
        });
        xhr.send();    
  
    }

    render() {
        let gameStateText = "";
        if(this.state.gameOver) {
            gameStateText = "Game Over. Player " + this.state.winningPlayer + " won!";
        } else {
            gameStateText = "It's " + this.state.curPlayer + "'s turn"
        }
        return (
            <div className="centered">
                <div> {gameStateText} </div>
                <br />
                {this.renderSquares()}
                <br />
                <RaisedButton label="Quit Game" onClick={() => this.handleQuitAction()}></RaisedButton>
            </div>
        )
    }
}

export default GamePage