import React from 'react';
import PropTypes from 'prop-types'
import { Card, CardTitle, CardText } from 'material-ui/Card';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import Auth from '../modules/Auth.jsx';
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'

const style = {
  margin: 12,
};

class Dashboard extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.gameName = ''
    this.createGameAction = this.createGameAction.bind(this);
    this.joinGameAction = this.joinGameAction.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.gameName = event.target.value;
  }

  createGameAction(event) {
    const formData = `gameName=${this.gameName}`
    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/newgame');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
       
        this.context.router.history.replace('/game');
      } 
    });
    xhr.send(formData);
  }

  joinGameAction(gameId, gameName) {
    const xhr = new XMLHttpRequest();
    xhr.open('get', '/api/joingame?id=' + gameId + "&name=" + gameName);
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        this.context.router.history.replace('game');
      }
    });
    xhr.send();
    console.log("clicked");
  }

  render() {
    var rows = []
    this.props.gameList.forEach(function (element) {
      rows.push(
        <TableRow key={element.hostedGame.id}>
          <TableRowColumn>{element.hostedGame.id}</TableRowColumn>
          <TableRowColumn>{element.hostedGame.name}</TableRowColumn>
          <TableRowColumn>{element.name}</TableRowColumn>
          <TableRowColumn><RaisedButton label="Join Game" style={style} onClick={() => this.joinGameAction(element.hostedGame.id, element.hostedGame.name)}/></TableRowColumn>
        </TableRow>
      );
      }, this);

    return (
      <Card className="container">
        <CardTitle className="card-heading" 
          title="Lobby"
        />
        <Table>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableRowColumn>ID</TableRowColumn>
              <TableRowColumn>Name</TableRowColumn>
              <TableRowColumn>Player</TableRowColumn>
              <TableRowColumn></TableRowColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {rows}
          </TableBody>
        </Table>
        <br /><br /><br />
        <TextField hintText="New Game Name" onChange={this.onChange}/>
        <RaisedButton label="Create Game" style={style} type="submit" primary onClick={this.createGameAction}/>
      </Card>
    );
  };
}

Dashboard.contextTypes = {
  router: PropTypes.object.isRequired
};
Dashboard.propTypes = {
  gameList: PropTypes.array.isRequired
};

export default Dashboard;
