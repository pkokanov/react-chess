import React from 'react';
import PropTypes from 'prop-types'
import { Link, NavLink } from 'react-router-dom';
import { Route } from 'react-router';
import HomePage from '../views/HomePage.jsx'
import LoginPage from '../containers/LoginPage.jsx'
import SignUpPage from '../containers/SignUpPage.jsx'
import Auth from '../modules/Auth.jsx'
import Dashboard from '../containers/Dashboard.jsx'

class LogoutView extends React.Component {
  constructor(props, context){
    super(props, context);
  }

  componentWillMount() {
    Auth.deauthenticateUser();
    this.context.router.history.push('/');
  }

  render() {
    return null;
  }
}

LogoutView.contextTypes = {
  router: PropTypes.object.isRequired
};

const Base = () => (
  <div>
    <div className="top-bar">
      <div className="top-bar-left">
        <NavLink to="/">React Chess</NavLink>
      </div>

      <div className="top-bar-right">
        {Auth.isUserAuthenticated() ? (
        <div className="top-bar-right">
          <Link to="/logout">Log out</Link>
        </div>
      ) : (
        <div className="top-bar-right">
          <Link to="/login">Log in</Link>
          <Link to="/signup">Sign up</Link>
        </div>
      )}

      </div>

    </div>

    <Route path="/" render = {function() {   
      if(Auth.isUserAuthenticated()) {
        return <Dashboard/>;
      } else {
        return <HomePage/>;
      }
    }}/>
    <Route path="/login" render = {function() {   
      if(!Auth.isUserAuthenticated()) {
        return <LoginPage/>;
      }
      return null;
    }}/>
    <Route path="/signup" render = {function() {   
      if(!Auth.isUserAuthenticated()) {
        return <SignUpPage/>;
      }
      return null;
    }}/>
    <Route path="/logout" component = {LogoutView}/>
    

  </div>
);

export default Base;