import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import GamePage from './pages/GamePage/GamePage';
import Presenter from './pages/PresenterPage/Presenter';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/gamepage/:sessionId" element={<GamePage />} />
        <Route path="/Presenter/:sessionId" element={<Presenter />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;