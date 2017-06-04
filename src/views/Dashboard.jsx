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
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.gameName = event.target.value;
  }

  render() {
    var rows = []
    this.props.gameList.forEach(function (element) {
      rows.push(
        <TableRow key={element._id}>
          <TableRowColumn>{element._id}</TableRowColumn>
          <TableRowColumn>{element.name}</TableRowColumn>
          <TableRowColumn>{element.hostName}</TableRowColumn>
          <TableRowColumn><RaisedButton label="Join Game" style={style} onClick={() => this.props.joinGameAction(element._id, element.name)}/></TableRowColumn>
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
        <RaisedButton label="Create Game" style={style} type="submit" primary onClick={() => this.props.createGameAction(this.gameName)}/>
      </Card>
    );
  };
}

Dashboard.contextTypes = {
  router: PropTypes.object.isRequired
};
Dashboard.propTypes = {
  gameList: PropTypes.array.isRequired,
  createGameAction: PropTypes.func.isRequired,
  joinGameAction: PropTypes.func.isRequired
};

export default Dashboard;
