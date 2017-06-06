const mongoose = require('mongoose');

// define the User model schema
const GameSchema = new mongoose.Schema({
    name: String,
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    hostName: String,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    clientName: String,
    startingPlayer: String,
    playerTurn: String,
    winningPlayer: String,
    isOver: Boolean,
    board: []
}, {strict: false});

module.exports = mongoose.model('Game', GameSchema);