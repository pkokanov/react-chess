import React from 'react';
import ReactDom from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Router } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory'
import Base from './views/Base.jsx'

// remove tap delay, essential for MaterialUI to work properly
injectTapEventPlugin();

ReactDom.render((
  <MuiThemeProvider muiTheme={getMuiTheme()}>
    
    <Router history={createBrowserHistory()}>
      <div>
        <Base />
      </div>
    </Router>
  </MuiThemeProvider>), document.getElementById('react-app'));