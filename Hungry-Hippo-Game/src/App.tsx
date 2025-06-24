import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import GamePage from './pages/GamePage/GamePage';
import Presenter from './pages/PresenterPage/Presenter';
import RoleSelect from './pages/RoleSelection/RoleSelect';
import PhaserPage from './pages/PhaserPage/PhaserPage';
import AacPage from './pages/AacPage/AacPage';

import { Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/presenter/:sessionId" element={<Presenter />} />
        <Route path="/roleselect/:sessionId" element={<RoleSelect />} />
        <Route path="/hippo/:sessionId/:userId" element={<PhaserPage />} />
        <Route path="/aac/:sessionId/:userId" element={<AacPage />} />

        {/* Redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;