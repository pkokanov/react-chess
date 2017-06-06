const express = require('express');
const User = require('mongoose').model('User');
const Game = require('mongoose').model('Game');
const WebSocket = require('ws');

const router = new express.Router();

router.get('/dashboard', (req, res) => {
  if(req.user.isPlaying) {
    res.status(200).json({isPlaying: true});
    return;
  }
  Game.find({client: null, winningPlayer: null, isOver: false}, function(err, result){
    if(err) {
      res.status(500).json({error: err});
    }
   res.status(200).json(result);
  })
  
});


router.post('/newgame', (req, res) => {
  if(!req.body || typeof req.body.gameName !== 'string' || req.body.gameName.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: "please provide a name for the game"
    });
    return;
  }
  const gameData = {
    host: req.user,
    hostName: req.user.name,
    name: req.body.gameName,
    client: null,
    clientName: null,
    playerTurn: null,
    startingPlayer: null,
    winningPlayer: null,
    isOver: false,
    board: Array(9).fill(null)
  };
  const newGame = new Game(gameData);
  return newGame.save((err, game) => {
    if (err) { 
      console.log(err); 
      response.status(504).json({
        message: "Could not create a new game"
      })
      return; 
    }
    req.user.isPlaying = true;
    req.user.game = game;
    req.user.save((err) => {
      if(err) {
        console.log(err);
        res.status(504).json({
          message:"Could not add host to new game: " + game.name + "!"
        });
      } else {
        res.status(200).json({message: "success"});
      }
    });
  });
})

router.get('/joingame', (req, res) => {
  const gameid = req.query.id;
  const gameName = req.query.name;
  Game.findByIdAndUpdate(gameid, {$set: {client: req.user, clientName: req.user.name, playerTurn: req.user.name, startingPlayer: req.user.name}}, {new: true}, (err, game) => {
    if (err) { 
      console.log(err);
      res.status(404).json({message: "Could not find game!"});
    } else {
      req.user.isPlaying = true;
      req.user.game = game;
      req.user.save((err) => {
        if(err) {
          console.log(err);
          res.status(504).json({
            message:"Could not add client to new game: " + game.name + "!"
          });
        } else {
          res.status(200).json({message: "success"});
        }
      });
    }
  });
});

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}



module.exports = router;