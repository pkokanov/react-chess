const mongoose = require('mongoose');

// define the User model schema
const GameSchema = new mongoose.Schema({
    name: {
        type: String,
        index: { unique: true }
    },
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
    playerTurn: String,
    winningPlayer: String,
    board: []
}, {strict: false});

module.exports = mongoose.model('Game', GameSchema);