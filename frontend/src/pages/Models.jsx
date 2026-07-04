import React from 'react';
import { Cpu, CheckCircle2, Layers, Database, Zap, ShieldCheck, BarChart3, Award } from 'lucide-react';

function Models() {
  const modelClasses = [
    'bicep-curl', 'crunches', 'deadlift', 'dumbbell-shoulder-press',
    'jumping-jacks', 'lunges', 'plank', 'pull-up', 'push-up',
    'russian-twist', 'sit-up', 'squat', 'walk'
  ];

  return (
    <section className="playground-section">
      <div className="section-header">
        <h2 className="glow-text" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>How Our AI Recognizes Exercises</h2>
        <p>A smart AI system trained to instantly detect 13 different workout activities from your video feed</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '40px', gap: '24px' }}>
        <div className="glass-card stat-card">
          <div className="card-title">
            <Cpu color="#ff7a00" size={18} /> How The AI Model Works
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>
            Real-Time Movement Recognition
          </h3>
          <p style={{ color: '#a0a4b8', lineHeight: '1.6', marginBottom: '24px' }}>
            Our AI watches your movement over a continuous rolling window of 30 video frames (about half a second). By tracking 33 key points on your body, it instantly recognizes which exercise you are performing!
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: '#a0a4b8' }}>Input Video Window</span>
              <strong style={{ fontFamily: 'monospace', color: '#ff7a00', fontSize: '0.9rem' }}>30 Frames (~0.5 Seconds of Movement)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: '#a0a4b8' }}>Body Joints Tracked</span>
              <strong style={{ color: '#fff', fontSize: '0.9rem' }}>33 Keypoints (Shoulders, Elbows, Knees, etc.)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: '#a0a4b8' }}>AI Engine Type</span>
              <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Deep Learning Sequence Classifier</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <span style={{ color: '#a0a4b8' }}>Recognition Speed</span>
              <strong style={{ color: '#10b981', fontSize: '0.9rem' }}>&lt; 16 milliseconds (Instant Feedback)</strong>
            </div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="card-title">
            <Database color="#ff7a00" size={18} /> Recognized Activities ({modelClasses.length} Exercises)
          </div>
          <p style={{ color: '#a0a4b8', marginBottom: '20px', fontSize: '0.95rem' }}>
            The AI automatically detects and classifies any of the following 13 training movements:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {modelClasses.map((cls) => (
              <div key={cls} className="class-pill" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px' }}>
                <CheckCircle2 color="#ff7a00" size={16} />
                <span style={{ textTransform: 'capitalize', color: '#fff', fontSize: '0.9rem' }}>{cls.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simple & Clear Training Section */}
      <div className="glass-card stat-card" style={{ marginTop: '24px', borderColor: 'rgba(255, 122, 0, 0.3)' }}>
        <div className="card-title" style={{ marginBottom: '16px' }}>
          <BarChart3 color="#ff7a00" size={20} /> How We Trained The AI
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', color: '#a0a4b8', lineHeight: '1.6' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', borderLeft: '3px solid #ff7a00' }}>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} color="#ff7a00" /> Trained on Real Workout Videos
            </h4>
            <p style={{ fontSize: '0.9rem' }}>
              We built our dataset by analyzing over <strong>10,300+ movement clips</strong> across all 13 exercises. The AI learned by watching people of different heights and body types perform each exercise from various camera angles and lighting conditions.
            </p>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', borderLeft: '3px solid #10b981' }}>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} color="#10b981" /> High Reliability & Accuracy (&gt;98.4%)
            </h4>
            <p style={{ fontSize: '0.9rem' }}>
              During training, the AI was rigorously tested on unseen workout videos to ensure it doesn't just memorize data. This allows our system to achieve over <strong>98.4% recognition accuracy</strong> in real-world environments without getting confused by background noise!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Models;
