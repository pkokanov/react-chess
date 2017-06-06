import React from 'react';
import PropTypes from 'prop-types'
import Auth from '../modules/Auth.jsx';
import Dashboard from '../views/Dashboard.jsx';


class DashboardPage extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      gameList: [],
      errorMessage: ''
    };

    this.handleTimeout = this.handleTimeout.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.createGameAction = this.createGameAction.bind(this);
    this.joinGameAction = this.joinGameAction.bind(this);
  }

  sendRequest() {
    const xhr = new XMLHttpRequest();
    xhr.open('get', '/api/dashboard');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        if(xhr.response.isPlaying) {
          this.context.router.history.replace('game');
          return;
        } 
        this.setState({
          gameList: xhr.response,
        });
      } else if (xhr.status === 400) {
        this.setState({
          errorMessage: xhr.response.message
        });
      } else {
        this.setState({
          errorMessage: "Unknown error occured"
        });
      }
    });
    xhr.send();
  }

  createGameAction(gameName) {
    const formData = `gameName=${gameName}`
    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/newgame');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        this.context.router.history.replace('/game');
      } else if (xhr.status === 400) {
        this.setState({
          errorMessage: xhr.response.message
        });
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
  }

  handleTimeout() {
    this.sendRequest(); 
  }

  componentDidMount() {
      this.sendRequest();
      this.timer = setInterval(this.handleTimeout, 10000);    
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return (<Dashboard gameList={this.state.gameList} errorMessage={this.state.errorMessage} joinGameAction={(gameId, gameName) => this.joinGameAction(gameId, gameName)} createGameAction={(gameName) => this.createGameAction(gameName)}/>);
  }

}

DashboardPage.contextTypes = {
  router: PropTypes.object.isRequired
};

export default DashboardPage;