import React from 'react';
import PropTypes from 'prop-types'
import GameView from '../views/GameView.jsx'
import { Card, CardTitle, CardText } from 'material-ui/Card';

class GamePage extends React.Component {
    constructor(props) {
        super(props)
    }


    render() {
        return (
            <Card className="container">
                <CardTitle title="React Chess" subtitle="New Game" />
            </Card>
        )
    }
}

export default GamePage