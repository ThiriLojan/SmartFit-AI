import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Playground from './pages/Playground';
import UploadVideo from './pages/UploadVideo';
import Models from './pages/Models';
import Architecture from './pages/Architecture';
import './index.css';

function App() {
  const [isLiveSession, setIsLiveSession] = useState(false);

  return (
    <div className="app-container">
      <Navbar isLiveSession={isLiveSession} setIsLiveSession={setIsLiveSession} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/upload" element={<UploadVideo />} />
          <Route path="/models" element={<Models />} />
          <Route path="/architecture" element={<Architecture />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
