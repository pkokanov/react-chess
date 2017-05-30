const express = require('express');
const User = require('mongoose').model('User');

function getGamesInWaiting() {
  User.aggregate([
    {'$unwind': '$hostedGame'}
  ], function(err, res){
    return res;
  })
}

function createNewGame(gameName, user) {
  const game = {
    id: guid(),
    name: gameName
  };
  user.hostedGame = game;
  return user.save((err) => {
    if (err) { 
      console.log(err); 
      return false; }

    return true;
  })
}

function findGame(gameid) {

}

const router = new express.Router();

router.get('/dashboard', (req, res) => {
  // const gamesInWaiting = getGamesInWaiting(); 
  if ( req.user.hostedGame && req.user.hostedGame.name !== "") {
    res.status(200).json({host: true})
    return ;
  } else if (req.user.joinedGame && req.user.joinedGame.name !== "") {
    res.status(200).json({joined: true});
    return;
  }
  User.aggregate([
    {'$unwind': '$hostedGame'},
    {'$match': {'name': {'$ne': req.user.name}}}
  ], function(err, result){
   res.status(200).json(result);
  })
  
});


router.post('/newgame', (req, res) => {
  if(createNewGame(req.body.gameName, req.user)) {
    const game = req.user.hostedGames;
    res.status(200).json(game);
  } else {
    res.status(504).json({
      message:"Could not create a new game"
    });
  }
})

router.get('/joingame', (req, res) => {
  const gameid = req.query.id;
  const gameName = req.query.name;
  User.findOne({hostedGame: {name: gameName, id: gameid}}, (err, user) => {
    if (err) { 
      res.status(404).json(err);
    } else {
      var curUser = req.user;
      curUser.joinedGame = user.hostedGame;
      curUser.save((err) => {
        if (err) { 
          console.log(err); 
          res.status(500).json(err);
        } else {
          res.status(200).json(user.hostedGame);
        }
      });
    }
  })
});

router.get('/game', (req, res) => {
  const user = req.user;
  res.status(200).json({
    playerName: user.name
  })
})

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