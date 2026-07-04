import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, ChevronRight, Upload, Zap, ShieldCheck, RefreshCw, Cpu, Layers } from 'lucide-react';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-tag">
          <Sparkles size={16} /> Next-Gen Fitness Computer Vision
        </div>
        <h1>
          Unleash your workout's <br />
          <span className="glow-text">full AI potential</span>
        </h1>
        <p>
          Low-latency real-time joint angle tracking and LSTM neural network posture verification.
          Experience zero-delay rep counting and form feedback processed directly at the edge.
        </p>
        <div className="hero-buttons">
          <NavLink to="/playground" className="btn-primary">
            Experience Playground <ChevronRight size={18} />
          </NavLink>
          <NavLink to="/upload" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <Upload size={18} /> Upload Video
          </NavLink>
        </div>
      </section>

      {/* Feature Architecture Grid */}
      <section className="features-section">
        <div className="section-header">
          <h2>A flexible solution for diverse training</h2>
          <p>Built on ultra-low latency edge compute architecture to process joint angles instantly</p>
        </div>

        <div className="features-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon">
              <Zap color="#ff7a00" size={28} />
            </div>
            <h3>Zero-Delay Rep Counting</h3>
            <p>
              Eliminates latency spikes by processing 33 3D body keypoints locally at over 60 frames per second.
            </p>
          </div>

          <div className="glass-card feature-card" style={{ borderColor: 'rgba(255, 92, 0, 0.4)' }}>
            <div className="feature-icon" style={{ background: 'rgba(255, 92, 0, 0.2)' }}>
              <ShieldCheck color="#ff7a00" size={28} />
            </div>
            <h3>Posture & Plane Validation</h3>
            <p>
              Advanced ground-plane checks distinguish vertical standing or jumping from horizontal plank positions.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon">
              <RefreshCw color="#ff7a00" size={28} />
            </div>
            <h3>Neural Net Integration</h3>
            <p>
              Ready to plug into pre-trained LSTM sequence models for automatic multi-exercise recognition.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="footer">
        <h3>Want to look under the hood?</h3>
        <p>Explore our custom 1D-CNN + LSTM neural network architecture and real-time biomechanical calculation pipeline</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
          <NavLink to="/models" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} /> AI Neural Net Model
          </NavLink>
          <NavLink to="/architecture" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} /> System Architecture
          </NavLink>
        </div>
      </footer>
    </div>
  );
}

export default Home;
