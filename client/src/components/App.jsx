import {BrowserRouter, Switch, Route} from 'react-router-dom';

import Landing from './Landing'
import FrontDesk from './front-desk/front-desk.jsx'
import RaceControl from './race-control/race-control.jsx'
import Login from "./login-and-main/login.jsx";
import NavigatorLayout from "./login-and-main/navigatorLayout.jsx";
import PageNotFound404 from "./login-and-main/pageNotFound404.jsx";
import Spectator from "./spectator/spectator.jsx";
import Flag from "./login-and-main/flag.jsx";


function App() {
    return (
      <>
          <div className="container">
              <BrowserRouter>
                  <NavigatorLayout />
                  <Switch>
                      <Route exact path="/" component={Landing}/>
                      <Route path="/worker" component={Login}/>
                      <Route path="/front-desk" component={FrontDesk}/>
                      <Route path="/spectator" component={Spectator}/>
                      <Route path="/race-control" component={RaceControl}/>
                      <Route path="*" component={PageNotFound404}/>
                  </Switch>
              </BrowserRouter>
          </div>
      </>
    )
}

export default App
