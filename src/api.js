const express = require('express');
const User = require('mongoose').model('User');

function getGamesInWaiting() {
  User.aggregate([
    {'$unwind': '$hostedGames'}
  ], function(err, res){
    return res;
  })
}

function createNewGame(gameName, user) {
  const game = {
    id: guid(),
    name: gameName
  };
  user.hostedGames.push(game);
  return user.save((err) => {
    if (err) { 
      console.log(err); 
      return false; }

    return true;
  })
}


const router = new express.Router();

router.get('/dashboard', (req, res) => {
  // const gamesInWaiting = getGamesInWaiting();
  User.aggregate([
    {'$unwind': '$hostedGames'},
    {'$match': {'name': {'$ne': req.user.name}}}
  ], function(err, result){
   res.status(200).json(result);
  })
  
});


router.post('/newgame', (req, res) => {
  if(createNewGame(req.body.gameName, req.user)) {
    const game = req.user.hostedGames;
    res.status(200).json(game[game.length-1]);
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