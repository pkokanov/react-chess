import React from 'react';
import PropTypes from 'prop-types'
import Auth from '../modules/Auth.jsx';
import Dashboard from '../views/Dashboard.jsx';


class DashboardPage extends React.Component {

  /**
   * Class constructor.
   */
  constructor(props, context) {
    super(props, context);

    this.state = {
      gameList: [],
      errorMessage: ''
    };

    this.handleTimeout = this.handleTimeout.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
  }

  sendRequest() {
    const xhr = new XMLHttpRequest();
    xhr.open('get', '/api/dashboard');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // set the authorization HTTP header
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        if(xhr.response.joined && xhr.response.joined === true) {
          clearInterval(this.handleTimeout);
          this.context.router.history.replace('game');
          return;
        } else if (xhr.response.host && xhr.response.host === true) {
          clearInterval(this.handleTimeout);
          this.context.router.history.replace('game');
          return;
        }
        this.setState({
          gameList: xhr.response
        });
      } else if (xhr.status === 504) {
        this.setState({
          errorMessage: xhr.response.message
        });
        clearInterval(this.handleTimeout);
      } else {
        this.setState({
          errorMessage: "Unknown error occured"
        });
        clearInterval(this.handleTimeout);
      }
    });
    xhr.send();
  }

  handleTimeout() {
    this.sendRequest();
    console.log("lol");
  }

  /**
   * This method will be executed after initial rendering.
   */
  componentDidMount() {
      this.sendRequest();
      this.timer = setInterval(this.handleTimeout, 10000);    
  }

  componentWillUnmount() {
    clearInterval(this.handleTimeout);
  }

  /**
   * Render the component.
   */
  render() {
    return (<Dashboard gameList={this.state.gameList} errorMessage={this.state.errorMessage}/>);
  }

}

DashboardPage.contextTypes = {
  router: PropTypes.object.isRequired
};

export default DashboardPage;