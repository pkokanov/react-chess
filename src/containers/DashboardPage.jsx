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
  }

  /**
   * This method will be executed after initial rendering.
   */
  componentDidMount() {
    const xhr = new XMLHttpRequest();
    xhr.open('get', '/api/dashboard');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // set the authorization HTTP header
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        if(xhr.response.joined && xhr.response.joined === true) {
          this.context.router.history.replace('game');
          return;
        } else if (xhr.response.host && xhr.response.host === true) {
          this.context.router.history.replace('game');
          return;
        }
        this.setState({
          gameList: xhr.response
        })
      } else if (xhr.status === 504) {
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

  /**
   * Render the component.
   */
  render() {
    return (<Dashboard gameList={this.state.gameList} />);
  }

}

DashboardPage.contextTypes = {
  router: PropTypes.object.isRequired
};

export default DashboardPage;