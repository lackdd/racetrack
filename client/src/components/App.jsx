import { BrowserRouter, Route } from 'react-router-dom';


import Header from './Header.jsx'
import Landing from './Landing'
const frontDesk = () => <h2>Front Desk Interface</h2>
const raceControl = () => <h2>Race Control Interface</h2>

function App() {

  return (
      <>
          <div className="container">
              <BrowserRouter>
                  <div>
                      <Header />
                      <Route exact path="/" component={Landing} />
                      <Route path="/front-desk" component={frontDesk} />
                      <Route path="/race-control" component={raceControl} />
                  </div>
              </BrowserRouter>
          </div>
      </>
  )
}

export default App
