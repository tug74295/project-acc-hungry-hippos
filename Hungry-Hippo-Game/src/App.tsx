import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import Presenter from './pages/PresenterPage/Presenter';
import RoleSelect from './pages/RoleSelection/RoleSelect';
import PhaserPage from './pages/PhaserPage/PhaserPage';
import AacPage from './pages/AacPage/AacPage';
import PresenterGamePage from './pages/PresenterGamePage/PresenterGame';
import Victory from './pages/Victory/Victory';

import { Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/presenter/:sessionId" element={<Presenter />} />
        <Route path="/roleselect/:sessionId" element={<RoleSelect />} />
        <Route path="/hippo/:sessionId/:userId/:role" element={<PhaserPage />} />
        <Route path="/aac/:sessionId/:userId/:role" element={<AacPage />} />
        <Route path="/game" element={<PhaserPage />} /> {}
        <Route path="/spectator/:sessionId/:userId" element={<PhaserPage />} />


        <Route path="/presenter-game/:sessionId" element={<PresenterGamePage />} />
        <Route path="/victory/:sessionId" element={<Victory />} />

        {/* Redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;