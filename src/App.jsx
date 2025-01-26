import LandingPage from './pages/LandingPage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ThankYouPage from './pages/ThankYouPage'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />}></Route>
          <Route path="/thank-you" element={<ThankYouPage />}></Route>
        </Routes>
      </Router>
      
    </>
  )
}

export default App
