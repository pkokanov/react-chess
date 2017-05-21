const express = require('express');

var games = [];

function getGamesInWaiting() {
  var gamesInWaiting = [];
  games.forEach(function(element) {
    if(!element.isFull) {
      gamesInWaiting.push(element)
    }
  }, this);
  return gamesInWaiting;
}

function createNewGame(gameName, playerName) {
  game = {
    id: games.length,
    name: gameName,
    playerOne: playerName,
    playerTwo: '',
    isFull: false
  }
  games.push(game)
}


const router = new express.Router();

router.get('/dashboard', (req, res) => {
  const gamesInWaiting = getGamesInWaiting();
  res.status(200).json(gamesInWaiting);
});


router.post('/newgame', (req, res) => {
  if(games.createNewGame(req.getPlayerId, req.gameName)) {
    res.status(200).json({
      gameName: "asdf"
    });
  } else {
    res.status(504).json({
      message:"Could not create a new game"
    });
  }
})

router.get('/game/:id', (req, res) => {
  const gameid = req.params.id;
  games.findGame()
});

module.exports = router;