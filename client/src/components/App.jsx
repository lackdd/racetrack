import { BrowserRouter, Route } from 'react-router-dom';


import Header from './Header.jsx'
const frontDesk = () => <h2>Front Desk Interface</h2>
const raceControl = () => <h2>Race Control Interface</h2>
const Landing = () => <h2>Landing</h2>

function App() {

  return (
      <>
          <div>
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
