import React from 'react';
import PropTypes from 'prop-types'
import { Card, CardTitle, CardText } from 'material-ui/Card';
import Auth from '../modules/Auth.jsx'; 
import RaisedButton from 'material-ui/RaisedButton'

class GamePage extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            squares: Array(9).fill(null),
            user: null,
            otherPlayer: null,
            isHost: false,
            playerTurn: null,
            winningPlayer: null,
            clientLeft: false
        }

        this.socket = new WebSocket('ws://localhost:3000/game');
        this.handleConnectionOpen = this.handleConnectionOpen.bind(this);
        this.handleReceiveMessage = this.handleReceiveMessage.bind(this);
        this.handleRestartAction = this.handleRestartAction.bind(this);

        console.log("called constructor");
    }

    handleRestartAction() {
        this.socket.send(JSON.stringify({
            auth: Auth.getToken(),
            type: "RESTART_GAME"
        }));
    }

    handleQuitAction() {
        this.socket.send(JSON.stringify({
            auth: Auth.getToken(),
            type: "QUIT_GAME"
        }));
    }
    
    handleConnectionOpen() {
        this.socket.send(JSON.stringify({
            auth: Auth.getToken(),
            type: "LOAD_BOARD"
        }));
        console.log("connection_open")
    }

    handleReceiveMessage(event) {
        const message = JSON.parse(event.data);
        console.log(event.data);
        if(message.type == "ERROR") {
            console.log(message.data);
        } else if(message.type === "LOAD_BOARD") {
            const user = message.user;
            const isHost = message.isHost;
            const playerTurn = message.playerTurn;
            const otherPlayer = message.otherPlayer
            const board = message.board;
            const winningPlayer = message.winningPlayer;
            this.setState({
                squares: board,
                user: user,
                otherPlayer: otherPlayer,
                playerTurn: playerTurn,
                isHost: isHost,
                winningPlayer: winningPlayer,
            })
        } else if (message.type === "PLAYER_JOINED") {
            if (message.otherPlayer !== this.state.user) {
                const otherPlayer = message.otherPlayer;
                const playerTurn = message.playerTurn;
                this.setState({
                    otherPlayer: otherPlayer,
                    playerTurn: playerTurn
                });
            }
        } else if (message.type === "BOARD_CLICK") {
            const user = message.user;
            const playerTurn = message.playerTurn;
            const otherPlayer = message.otherPlayer
            const board = message.board;
            const winningPlayer = message.winningPlayer;
            this.setState({
                squares: board,
                user: user,
                otherPlayer: otherPlayer,
                playerTurn: playerTurn,
                winningPlayer: winningPlayer,
            });
        } else if (message.type === "CLIENT_LEFT") {
            if(this.state.isHost) {
                this.setState({
                    otherPlayer: null,
                    clientLeft: true
                })
            } else {
                this.context.router.history.replace('/');
            }           
        } else if (message.type === "HOST_STOPPED_GAME") {
            this.context.router.history.replace('/');
        }
    }

    handleSquareClick(i, row, column) {
        if(this.state.winningPlayer || this.state.clientLeft) {
            return;
        }
        if(this.state.squares[i]) {
            console.log('Square already clicked');
            return;
        }
        const message = {
            auth: Auth.getToken(),
            type: "BOARD_CLICK",
            index: i,
            row: row,
            column: column
        }
        this.socket.send(JSON.stringify(message));
    }

    renderSquare(i) {
        return (
            <button key={i} className = "square" onClick={() => this.handleSquareClick(i, Math.floor(i/3), (i%3))}>
                 {this.state.squares[i] || null}
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
            rows.push(<div  key={i} className="board-row" value={this.squares}> {row_cells} </div>)
        }
        return rows;
    }

    
    componentDidMount() {
        this.socket.addEventListener('open', this.handleConnectionOpen);
        this.socket.addEventListener('message', this.handleReceiveMessage);
    }

    componentWillUnmount() {
        this.socket.close();
    }

    render() {
        let gameStateText = "";
        if(this.state.winningPlayer) {
            gameStateText = "Game Over. Player " + this.state.winningPlayer + " won!";
        } else {
            if(!this.state.otherPlayer) {
                gameStateText = "Waiting for player to join.";
            } else {
                gameStateText = "It's " + this.state.playerTurn + "'s turn";
            }
        }
        if(this.state.clientLeft) {
            gameStateText = "Other player left. Just quit the game and be lonely."
        }
        return (
            <div className="centered">
                <div> {gameStateText} </div>
                <br />
                {this.renderSquares()}
                <br />
                <RaisedButton label="Restart Game" onClick={() => this.handleRestartAction()}/>
                <RaisedButton label="Quit Game" onClick={() => this.handleQuitAction()}></RaisedButton>
            </div>
        )
    }
}

GamePage.contextTypes = {
  router: PropTypes.object.isRequired
};

export default GamePage