const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('./config');
const http = require('http');
const WebSocket = require('ws');

// connect to the database and load models
if(process.env.HEROKU) {
  require('./models').connect(config.dbUri);
} else {
  require('./models').connect(config.dbUri);
}

const User = require('mongoose').model('User');
const Game = require('mongoose').model('Game');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function getAuthenticatedUser(token, ws, message, callback) {
  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      console.log(err); 
      callback(err, null, ws, message);
      return; 
    }
    const userId = decoded.sub;
    return User.findById(userId, (userErr, user) => {
      if (userErr || !user) {
        console.log(userErr);
        callback(userErr, null, ws, message);
        return;
      }
      if (!user.isPlaying) {
        console.log("User has no created or joined games, should not get here!")
        userErr = "User has no created or joined games, should not get here!";
        callback(userErr, null, ws, message);
        return;
      }
      callback(userErr, user, ws, message);
      return;
    });
  });
}

function handleGameQuit(err, user, ws, message) {
  if(err) {
    console.log(err);
    let message = {
      type: "ERROR",
      data: err
    };
    ws.send(JSON.stringify(message));
  } else {
    Game.findById(user.game, (err, game) => {
      if(err) {
        let message = {
          type: "ERROR",
          data: err
        };
        ws.send(JSON.stringify(message));
      } else {
        const isHost = (user._id.toString() === game.host.toString());
        //this should be done with a single transaction 
        if(isHost) {
          User.findByIdAndUpdate(game.host, {$set: {isPlaying: false, game: null}},  {new: true}, (err, user) => {
            if (err) { 
              console.log(err);
              ws.send(JSON.stringify({type: "ERROR", data: err}));
            } else {
              User.findByIdAndUpdate(game.client, {$set: {isPlaying: false, game: null}}, {new: true}, (err, user) => {
              if (err) { 
              console.log(err);
              ws.send(JSON.stringify({type: "ERROR", data: err}));
              } else {
                wss.clients.forEach(function each(client) {
                  client.send(JSON.stringify({type: "HOST_STOPPED_GAME"}))
                });
              }
            });
            }
          });
        } else {
          User.findByIdAndUpdate(game.client, {$set: {isPlaying: false, game: null}}, {new: true}, (err, game) => {
            if (err) { 
              console.log(err);
              ws.send(JSON.stringify({type: "ERROR", data: err}));
            } else {
              wss.clients.forEach(function each(client) {
                const message = {
                  type: "CLIENT_LEFT"
                }
                client.send(JSON.stringify(message))
              });
            }
          });
        }
      }
    });
  }
}

function handleGameRestart(err, user, ws, message) {
  if(err) {
    console.log(err);
    let message = {
      type: "ERROR",
      data: err
    };
    ws.send(JSON.stringify(message));
  } else {
    Game.findById(user.game, (err, game) => {
      if(err) {
        console.log(err);
        let message = {
          type: "ERROR",
          data: err
        };
        ws.send(JSON.stringify(message));
      } else {
        game.playerTurn = game.clientName;
        game.board = Array(9).fill(null);
        game.winningPlayer = null;
        game.save((err) => {
          if(err) {
            console.log(err);
            let message = {
              type: "ERROR",
              data: err
            };
            ws.send(JSON.stringify(message));
          } else {
            let message = {
              type: "LOAD_BOARD",
              user: user.name,
              otherPlayer: game.clientName,
              isHost: true,
              board: game.board,
              playerTurn: game.clientName,
              winningPlayer: null
            }
            wss.clients.forEach(function sendall(client) {
              client.send(JSON.stringify(message));
            });
          }
        });
      }
  });
  }
}

function sendGameStateInitial(err, user, ws) {
  if(err) {
    console.log(err);
    let message = {
      type: "ERROR",
      data: err
    };
    ws.send(JSON.stringify(message));
  } else {
    Game.findById(user.game, (err, game) => {
      if(err) {
        let message = {
          type: "ERROR",
          data: err
        };
        ws.send(JSON.stringify(message));
      } else {
        const isHost = (user._id.toString() === game.host.toString());
        let message = {
          type: "LOAD_BOARD",
          user: user.name,
          otherPlayer: isHost? game.clientName : game.hostName,
          isHost: isHost,
          board: game.board,
          playerTurn: game.playerTurn,
          winningPlayer: game.winningPlayer
        }
        ws.send(JSON.stringify(message));
        //if we are joining player notify host of our pressence
        if(!isHost) {
          let message_to_host = {
            type: "PLAYER_JOINED",
            otherPlayer: user.name,
            playerTurn: game.playerTurn
          }
          wss.clients.forEach(function each(client) {
            client.send(JSON.stringify(message_to_host))
          });
        }
      }
    });  
  }
}

function checkWin(board) {
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
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return true;
        }
    }
    return false;
}


function handleBoardClick(err, user, ws, message) {
  if(err) {
    console.log(err);
    let message = {
      type: "ERROR",
      data: err
    };
    ws.send(JSON.stringify(message));
  } else {
    Game.findById(user.game, (err, game) => {
      if(err) {
        let message = {
          type: "ERROR",
          data: err
        };
        ws.send(JSON.stringify(message));
      } else {
        if(game.winningPlayer) {
          return;
        }
        if(user.name === game.playerTurn) {
          const index = message.index;
          const row = message.row;
          const column = message.column;
          let tempBoard = game.board.slice();
          const isHost = (user._id.toString() === game.host.toString());
          tempBoard[index] = isHost? 'O' : 'X';
          if(checkWin(tempBoard)) {
            game.winningPlayer = game.playerTurn;  
          }
          game.board = tempBoard;
          if(game.playerTurn == game.hostName) {
            game.playerTurn = game.clientName;
          } else {
            game.playerTurn = game.hostName;
          }
          game.save((err) => {
            if(err) {
              console.log(err);
              ws.send(JSON.stringify({
                type: "ERROR", 
                data:"Could not add client to new game: " + game.name + "!"
              }));
            } else {
              let message = {};
              message = {
                type: "BOARD_CLICK",
                user: user.name,
                otherPlayer: isHost? game.clientName : game.hostName,
                board: game.board,
                playerTurn: game.playerTurn,
                winningPlayer: game.winningPlayer
              };
              wss.clients.forEach(function each(client) {
                client.send(JSON.stringify(message))
              });
            }
          });
        }
      }
    });
  }
}

wss.on('connection', function connection(ws, req) {
  
  ws.on('message', function incoming(message) {
    var received = JSON.parse(message);
    var auth = received.auth;
    if(received.type === "LOAD_BOARD") {
      getAuthenticatedUser(auth, ws, received, sendGameStateInitial);
    }
    else if (received.type === "BOARD_CLICK") {
      getAuthenticatedUser(auth, ws, received, handleBoardClick);
    } else if(received.type === "QUIT_GAME") {
      getAuthenticatedUser(auth, ws, received, handleGameQuit);
    } else if(received.type === "RESTART_GAME") {
      getAuthenticatedUser(auth, ws, received, handleGameRestart);
    }
  });

  ws.on('close', function closing(code, reason){
    console.log("closed");
  });

});

// tell the app to look for static files in these directories
app.use(express.static(path.join(__dirname, '../build/')));
app.use(express.static(path.join(__dirname, '../public/')));
app.use('/login', express.static(path.join(__dirname, '../build/')));
app.use('/login', express.static(path.join(__dirname, '../public/')));
app.use('/signup', express.static(path.join(__dirname, '../build/')));
app.use('/signup', express.static(path.join(__dirname, '../public/')));
app.use('/game', express.static(path.join(__dirname, '../build/')));
app.use('/game', express.static(path.join(__dirname, '../public/')));
// tell the app to parse HTTP body messages
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

// load passport strategies
const localSignupStrategy = require('./local-signup');
const localLoginStrategy = require('./local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// pass the authenticaion checker middleware
const authCheckMiddleware = require('./auth-check');
app.use('/api', authCheckMiddleware);

// routes
const authRoutes = require('./auth');
const apiRoutes = require('./api');
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// start the server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000 or http://127.0.0.1:3000');
});