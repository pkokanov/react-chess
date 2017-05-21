import React from 'react';
import PropTypes from 'prop-types'
import { Card, CardTitle, CardText } from 'material-ui/Card';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'


const style = {
  margin: 12,
};

class Dashboard extends React.Component {
  constructor(props) {
    super(props)

    this.createGameAction = this.createGameAction.bind(this);
  }

  createGameAction() {
    console.log("asdf");
  }

  render() {
    var rows = []
    this.props.gameList.forEach(function (element) {
      rows.push(
        <TableRow key={element.id}>
          <TableRowColumn>{element.id}</TableRowColumn>
          <TableRowColumn>{element.name}</TableRowColumn>
          <TableRowColumn>{element.player}</TableRowColumn>
          <TableRow Column><RaisedButton label="Join Game" style={style}/></TableRow>
        </TableRow>
      );
      }, this);

    return (
      <Card className="container">
        <CardTitle className="card-heading" 
          title="Lobby"
        />
        <Table>
          
          <TableBody displayRowCheckbox={false}>
            {rows}
          </TableBody>
        </Table>
        <br /><br /><br />
        <TextField hintText="New Game Name" />
        <RaisedButton label="Create Game" style={style} type="submit" primary onClick={this.createGameAction}/>
      </Card>
    );
  };
}

Dashboard.propTypes = {
  gameList: PropTypes.array.isRequired
};

export default Dashboard;