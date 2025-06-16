import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import GamePage from './pages/GamePage/GamePage';
import AppRoutes from './router';


function App() {
  return (
    <BrowserRouter>
      
        <AppRoutes/>
     
    </BrowserRouter>
  );
}

export default App;