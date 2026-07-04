import React from 'react';
import { Zap, ShieldCheck, RefreshCw, Server, Cpu, Activity, Eye } from 'lucide-react';

function Architecture() {
  const flowSteps = [
    {
      step: "01",
      title: "Video Capture",
      desc: "Your webcam captures live video frames and optimizes their size so they can be sent and analyzed without any lag.",
      icon: <Eye size={20} color="#ff7a00" />
    },
    {
      step: "02",
      title: "Send to Python Backend",
      desc: "The video frames are streamed to our Python server in real-time, where our vision engine prepares them for analysis.",
      icon: <Server size={20} color="#ff7a00" />
    },
    {
      step: "03",
      title: "Track 33 Body Joints",
      desc: "Our computer vision engine scans each frame to locate 33 exact points on your body, tracking the position of every limb.",
      icon: <Activity size={20} color="#ff7a00" />
    },
    {
      step: "04",
      title: "Recognize The Exercise",
      desc: "Our AI model looks at your movement over the last half-second to automatically identify which of the 13 exercises you are doing.",
      icon: <Cpu size={20} color="#10b981" />
    },
    {
      step: "05",
      title: "Check Form & Count Reps",
      desc: "Simultaneously, our smart geometry rules measure the angles between your joints to ensure proper form and count completed reps.",
      icon: <ShieldCheck size={20} color="#10b981" />
    },
    {
      step: "06",
      title: "Live Screen Update",
      desc: "The digital skeleton overlay, rep count, and form advice are sent straight back to your screen in under 16 milliseconds!",
      icon: <Zap size={20} color="#ff7a00" />
    }
  ];

  return (
    <section className="features-section" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="section-header">
        <h2 className="glow-text" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>System Architecture</h2>
        <p>A simple, step-by-step breakdown of how our system processes your webcam video in real-time</p>
      </div>

      {/* 3 Core Stage Cards */}
      <div className="features-grid" style={{ marginBottom: '50px' }}>
        <div className="glass-card feature-card">
          <div className="feature-icon">
            <Zap color="#ff7a00" size={28} />
          </div>
          <h3>Stage 1: Body Landmark Tracking</h3>
          <p>
            When you turn on your camera, our system scans each frame to locate 33 key points on your body (like your wrists, elbows, hips, and knees) at over 60 frames per second.
          </p>
        </div>

        <div className="glass-card feature-card" style={{ borderColor: 'rgba(255, 92, 0, 0.4)' }}>
          <div className="feature-icon" style={{ background: 'rgba(255, 92, 0, 0.2)' }}>
            <ShieldCheck color="#ff7a00" size={28} />
          </div>
          <h3>Stage 2: Smart Form & Rep Counting</h3>
          <p>
            Using simple geometry between your joints, the system checks if your form is correct (like bending your elbows enough during a push-up) and accurately counts your completed reps.
          </p>
        </div>

        <div className="glass-card feature-card">
          <div className="feature-icon">
            <RefreshCw color="#ff7a00" size={28} />
          </div>
          <h3>Stage 3: Instant Visual Feedback</h3>
          <p>
            The system draws a glowing digital skeleton over your body and displays your live rep count and posture status directly on your screen without any lag!
          </p>
        </div>
      </div>

      {/* End-to-End Technical Data Flow */}
      <div className="glass-card" style={{ padding: '36px', borderRadius: '24px', border: '1px solid rgba(255, 122, 0, 0.3)', background: 'rgba(15, 17, 26, 0.85)' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h3 className="glow-text" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            Step-by-Step System Flow
          </h3>
          <p style={{ color: '#a0a4b8', fontSize: '0.95rem' }}>
            How a single video frame is analyzed and returned to your screen in less than 16 milliseconds
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {flowSteps.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '22px',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'rgba(255, 122, 0, 0.4)', fontFamily: 'monospace' }}>
                  {item.step}
                </span>
                <div style={{ background: 'rgba(255, 122, 0, 0.1)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(255, 122, 0, 0.2)' }}>
                  {item.icon}
                </div>
              </div>
              <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
                {item.title}
              </h4>
              <p style={{ color: '#a0a4b8', fontSize: '0.85rem', lineHeight: '1.6' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Architecture;
