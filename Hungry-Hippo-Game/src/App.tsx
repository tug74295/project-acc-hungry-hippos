import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LandingPage from './pages/LandingPage/LandingPage';
import Presenter from './pages/PresenterPage/Presenter';
import RoleSelect from './pages/RoleSelection/RoleSelect';
import PhaserPage from './pages/PhaserPage/PhaserPage';
import AacPage from './pages/AacPage/AacPage';
import PresenterGamePage from './pages/PresenterGamePage/PresenterGame';
import Victory from './pages/Victory/Victory';

import { Navigate, useNavigate } from 'react-router-dom';

function RejoinHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const saved = sessionStorage.getItem('rejoinDetails');
    if (saved) {
      const { sessionId, userId, role, color } = JSON.parse(saved);
      if (sessionId && userId && role) {
        if (role === 'Hippo Player') {
          navigate(`/hippo/${sessionId}/${userId}/${role}`, { state: { role, color }, replace: true });
        } else if (role === 'AAC User') {
          navigate(`/aac/${sessionId}/${userId}/${role}`, { state: { role, color }, replace: true });
        } else if (role === 'Spectator') {
          navigate(`/spectator/${sessionId}/${userId}`, { state: { role, color }, replace: true });
        }
      }
    }
  }, [navigate]);

  return null;
}

function App() {
  const navigate = useNavigate();

  // Auto-navigate a player back into their session if details were saved
  useEffect(() => {
    const saved = sessionStorage.getItem('rejoinDetails');
    if (saved) {
      const { sessionId, userId, role, color } = JSON.parse(saved);
      if (sessionId && userId && role) {
        if (role === 'Hippo Player') {
          navigate(`/hippo/${sessionId}/${userId}/${role}`, { state: { role, color }, replace: true });
        } else if (role === 'AAC User') {
          navigate(`/aac/${sessionId}/${userId}/${role}`, { state: { role, color }, replace: true });
        } else if (role === 'Spectator') {
          navigate(`/spectator/${sessionId}/${userId}`, { state: { role, color }, replace: true });
        }
      }
    }
  }, [navigate]);

  return (
    <BrowserRouter>
      <RejoinHandler />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/presenter/:sessionId" element={<Presenter />} />
        <Route path="/roleselect/:sessionId" element={<RoleSelect />} />
        <Route path="/hippo/:sessionId/:userId/:role" element={<PhaserPage />} />
        <Route path="/aac/:sessionId/:userId/:role" element={<AacPage />} />
        <Route path="/game" element={<PhaserPage />} />
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