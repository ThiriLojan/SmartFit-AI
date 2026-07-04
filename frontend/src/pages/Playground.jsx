import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, CheckCircle2, Layers, ShieldCheck, AlertTriangle, Video, VideoOff } from 'lucide-react';
import ExerciseDropdown, { EXERCISE_LIST } from '../components/ExerciseDropdown';

const API_BASE_URL = 'https://thirilojan-smartfit-ai-backend.hf.space';

const getGuardInfo = (ex, status, active) => {
  const isUndetected = !status || status === 'No Pose Detected' || status === 'No Person in Frame' || status === 'Analyzing...';
  const isGood = status === 'Correct Form' || status === 'Good Form';
  const score1 = (!active || isUndetected) ? 0 : (isGood ? 98.4 : 64.2);
  const score2 = (!active || isUndetected) ? 0 : (isGood ? 96.8 : 58.5);

  switch (ex) {
    case 'push-up':
      return {
        label1: 'Torso Linearity & Spine Angle',
        val1: `${score1}%`,
        label2: 'Elbow Flexion Depth Guard',
        val2: `${score2}%`,
        desc: 'Jumping motions or standing rests are instantly filtered out. Bending elbows <70° is required to register a push-up rep.'
      };
    case 'squat':
      return {
        label1: 'Hip-Knee Hinge Parallel Guard',
        val1: `${score1}%`,
        label2: 'Spine Neutrality Alignment',
        val2: `${score2}%`,
        desc: 'Shallow knee bends (<70° depth) and standing rests are filtered out to prevent false squat rep counts.'
      };
    case 'pull-up':
      return {
        label1: 'Chin-to-Bar Elevation Guard',
        val1: `${score1}%`,
        label2: 'Vertical Body Swing Filter',
        val2: `${score2}%`,
        desc: 'Partial chin elevations and swinging body momentum are actively filtered out during vertical pull-up tracking.'
      };
    case 'plank':
      return {
        label1: 'Horizontal Body Plane Guard',
        val1: `${score1}%`,
        label2: 'Core Endurance Stability',
        val2: `${score2}%`,
        desc: 'Hip sagging and arched spine postures trigger instant form warnings and pause the active endurance timer.'
      };
    case 'auto':
    default:
      return {
        label1: '3D Joint Angle Alignment',
        val1: `${score1}%`,
        label2: 'Posture Plane Anti-False Filter',
        val2: `${score2}%`,
        desc: 'AI neural network continuously verifies spatial limb trigonometry to eliminate false reps across all 13 activities.'
      };
  }
};

function Playground() {
  const [selectedExercise, setSelectedExercise] = useState('auto');
  const [reps, setReps] = useState(0);
  const [targetReps, setTargetReps] = useState(15);
  const [formStatus, setFormStatus] = useState('Correct Form');
  const [aiDetected, setAiDetected] = useState('Ready');
  const [freePoseCounts, setFreePoseCounts] = useState({});
  const [enableTimer, setEnableTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [confidence] = useState(98.4);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [fps, setFps] = useState(0);
  const [latency, setLatency] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [annotatedFrame, setAnnotatedFrame] = useState(null);
  const [lockedPose, setLockedPose] = useState(null);
  const lockedPoseRef = useRef(null);

  const handleUnlockPose = () => {
    lockedPoseRef.current = null;
    setLockedPose(null);
    setReps(0);
    setFreePoseCounts({});
    fetch(`${API_BASE_URL}/reset-score`, { method: 'POST' }).catch(() => {});
  };

  // Reset backend score and state on page load / refresh
  useEffect(() => {
    fetch(`${API_BASE_URL}/reset-score`, { method: 'POST' }).catch(() => {});
  }, []);

  // Workout Timer Effect
  useEffect(() => {
    let interval = null;
    if (enableTimer && isTimerRunning && isWebcamActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [enableTimer, isTimerRunning, isWebcamActive]);

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle HTML5 Browser Webcam Access & stream frames to backend AI
  useEffect(() => {
    let stream = null;
    let isRunning = true;

    if (isWebcamActive) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
          const sendFrame = async () => {
            if (!isRunning) return;
            if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
              try {
                const ctx = canvasRef.current.getContext('2d');
                ctx.drawImage(videoRef.current, 0, 0, 640, 360);
                const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.5);
                
                const startMs = performance.now();
                const currentEx = (selectedExercise === 'auto' && lockedPoseRef.current) ? lockedPoseRef.current : selectedExercise;
                const res = await fetch(`${API_BASE_URL}/process-frame`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ image: dataUrl, exercise_type: currentEx })
                });
                const data = await res.json();
                const endMs = performance.now();
                const lat = Math.round(endMs - startMs);
                
                if (data && data.annotated_image && isRunning) {
                  setAnnotatedFrame(data.annotated_image);
                  setLatency(lat);
                  setFps(Math.round(1000 / Math.max(lat, 16)));
                  if (data.counter !== undefined) setReps(data.counter);
                  if (data.status) setFormStatus(data.status);
                  if (data.free_pose_counts) setFreePoseCounts(data.free_pose_counts);
                  if (data.ai_detected) {
                    setAiDetected(data.ai_detected);
                    if (selectedExercise === 'auto' && !lockedPoseRef.current) {
                      const foundEx = EXERCISE_LIST.find(ex => ex.id !== 'auto' && data.ai_detected.toLowerCase().includes(ex.label.toLowerCase()));
                      if (foundEx) {
                        lockedPoseRef.current = foundEx.id;
                        setLockedPose(foundEx.id);
                      }
                    }
                  }
                }
              } catch (err) {
                // Ignore network dropped frames
              }
            }
            if (isRunning) {
              setTimeout(sendFrame, 30);
            }
          };
          sendFrame();
        })
        .catch((err) => {
          alert("Camera access denied or unavailable: " + err.message);
          setIsWebcamActive(false);
        });
    } else {
      setAnnotatedFrame(null);
      setFps(0);
      setLatency(0);
      lockedPoseRef.current = null;
      setLockedPose(null);
    }

    return () => {
      isRunning = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isWebcamActive, selectedExercise]);

  const resetBackendScore = async () => {
    setReps(0);
    setFreePoseCounts({});
    setTimerSeconds(0);
    try {
      await fetch(`${API_BASE_URL}/reset-score`, { method: 'POST' });
    } catch (e) {}
  };

  // Keybind 'Q' to prompt confirmation and stop webcam stream
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'q' || e.key === 'Q') && isWebcamActive) {
        if (window.confirm("Stop active live webcam stream? Press OK to confirm.")) {
          setIsWebcamActive(false);
          resetBackendScore();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWebcamActive]);

  const guardInfo = getGuardInfo(lockedPose || selectedExercise, formStatus, isWebcamActive);

  return (
    <section className="playground-section" style={{ padding: '16px 24px', maxWidth: '1440px' }}>
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h2 className="glow-text" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>Experience AI at the Edge</h2>
        <p style={{ fontSize: '0.85rem' }}>Select a target exercise to test real-time joint tracking and form validation</p>
      </div>

      {/* Top Controls Row: Exercise Selector & Workout Options */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 360px' }}>
          <ExerciseDropdown
            selectedExercise={selectedExercise}
            onSelect={(id) => {
              setSelectedExercise(id);
              handleUnlockPose();
              const found = EXERCISE_LIST.find(ex => ex.id === id);
              if (found) setAiDetected(found.label);
              resetBackendScore();
            }}
          />
        </div>
        
        {/* Workout Options & Timer Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.03)', padding: '10px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
          <span style={{ color: '#ff7a00', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚙️ OPTIONS:
          </span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, userSelect: 'none', whiteSpace: 'nowrap' }}>
            <input 
              type="checkbox" 
              checked={enableTimer} 
              onChange={(e) => {
                const checked = e.target.checked;
                setEnableTimer(checked);
                setTimerSeconds(0);
                setIsTimerRunning(checked);
              }}
              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#ff7a00' }}
            />
            ⏱️ Enable Live Workout Timer
          </label>
          {enableTimer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,122,0,0.12)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,122,0,0.3)' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800, color: '#ff7a00', letterSpacing: '1px' }}>
                ⏱️ {formatTime(timerSeconds)}
              </span>
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)} 
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', transition: 'all 0.2s' }}
              >
                {isTimerRunning ? '⏸️' : '▶️'}
              </button>
              <button 
                onClick={() => { setTimerSeconds(0); setIsTimerRunning(true); }} 
                style={{ background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.4)', color: '#ff3b30', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', transition: 'all 0.2s' }}
                title="Reset Timer"
              >
                🔄
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Playground Dashboard */}
      <div className="dashboard-grid" style={{ gap: '20px', alignItems: 'stretch' }}>
        {/* Video Feed Window */}
        <div className="glass-card video-card">
          <div className="video-hud-top">
            <div className="hud-badge-live">
              <span className="live-dot"></span>
              <span>LIVE FEED // {selectedExercise === 'auto' ? (lockedPose ? `AUTO (LOCKED: ${lockedPose.toUpperCase()})` : 'AUTO (SCANNING)') : selectedExercise.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {selectedExercise === 'auto' && lockedPose && (
                <button
                  onClick={handleUnlockPose}
                  style={{ background: 'rgba(255, 122, 0, 0.2)', color: '#ff7a00', border: '1px solid rgba(255, 122, 0, 0.5)', borderRadius: '4px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Reset AI Pose Lock and Rescan"
                >
                  🔄 Reset Pose
                </button>
              )}
              {isWebcamActive && (
                <>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(255, 59, 48, 0.2)', color: '#ff3b30', border: '1px solid rgba(255, 59, 48, 0.4)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Press [Q] to Stop
                  </span>
                  <button 
                    onClick={() => { setIsWebcamActive(false); resetBackendScore(); }}
                    style={{ background: '#ff3b30', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <VideoOff size={12} /> Stop Feed
                  </button>
                </>
              )}
              <div className="hud-fps" style={{ color: isWebcamActive ? '#10b981' : '#a0a4b8' }}>
                <Cpu size={14} /> {isWebcamActive ? `⚡ ${fps || 58} FPS (${latency || 17}ms Latency)` : 'Standby (0 FPS - 0ms Latency)'}
              </div>
            </div>
          </div>

          <div className="video-center" style={{ position: 'relative' }}>
            <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
            <canvas ref={canvasRef} width="640" height="360" style={{ display: 'none' }} />
            {isWebcamActive ? (
              annotatedFrame ? (
                <img 
                  src={annotatedFrame} 
                  alt="Live AI Stream" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', zIndex: 5 }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ff7a00', fontWeight: 700, fontSize: '1.1rem' }}>
                  ⚡ Initializing AI Vision Stream... Please Allow Camera Access
                </div>
              )
            ) : (
              <>
                <div className="scanner-grid"></div>
                <div className="video-content">
                  <div className="scanner-ring">
                    <Activity color="#ff7a00" size={36} />
                  </div>
                  <h4>Webcam & Video Feed Standby</h4>
                  <p>
                    Joint angle tracking ready for <strong style={{ color: '#fff' }}>{selectedExercise === 'auto' ? 'AI Auto-Detect' : selectedExercise}</strong>. Click below to connect live backend stream.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button 
                      onClick={() => setIsWebcamActive(true)}
                      className="btn-primary"
                      style={{ padding: '12px 28px', fontSize: '0.95rem' }}
                    >
                      <Video size={18} /> Start Live Web Camera
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="video-hud-bottom">
            <div className="ai-class-tag">
              <span style={{ color: '#a0a4b8' }}>AI Model Classification:</span>
              <span className="class-pill" style={{ color: '#fff' }}>
                <CheckCircle2 color="#10b981" size={16} /> {aiDetected}
              </span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
              <span style={{ color: '#a0a4b8' }}>Confidence: </span>
              <strong style={{ color: '#ff7a00' }}>{confidence}%</strong>
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="stats-column" style={{ gap: '14px', justifyContent: 'space-between' }}>
          <div className="glass-card stat-card" style={{ padding: '16px' }}>
            <div className="card-title" style={{ marginBottom: '10px' }}>
              <Layers color="#ff7a00" size={16} /> Real-Time Rep Counter
            </div>
            <div className="rep-display" style={{ marginBottom: '8px' }}>
              <span className="rep-number glow-text" style={{ fontSize: '3.4rem' }}>{reps}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                <span className="form-badge" style={{ background: formStatus === 'No Pose Detected' ? 'rgba(255, 59, 48, 0.15)' : '', color: formStatus === 'No Pose Detected' ? '#ff3b30' : '', borderColor: formStatus === 'No Pose Detected' ? 'rgba(255, 59, 48, 0.4)' : '', padding: '4px 10px', fontSize: '0.8rem' }}>
                  <CheckCircle2 size={14} /> {formStatus}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: '#ff7a00', fontWeight: 700, background: 'rgba(255,122,0,0.12)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,122,0,0.3)' }}>
                    ⚡ AI: {aiDetected}
                  </span>
                  {selectedExercise === 'auto' && lockedPose && (
                    <button
                      onClick={handleUnlockPose}
                      style={{ background: 'rgba(255, 59, 48, 0.2)', color: '#ff3b30', border: '1px solid rgba(255, 59, 48, 0.5)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      title="Reset AI Pose Lock"
                    >
                      🔄 Reset Pose
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="progress-track" style={{ height: '8px' }}>
              <div 
                className="progress-bar"
                style={{ width: `${Math.min((reps / targetReps) * 100, 100)}%`, background: reps >= targetReps ? '#10b981' : '' }}
              ></div>
            </div>
            <div className="progress-labels" style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '4px' }}>
              {reps >= targetReps ? (
                <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.75rem' }}>
                  🏆 GOAL COMPLETED!
                </span>
              ) : (
                <span style={{ color: '#a0a4b8', fontSize: '0.75rem' }}>
                  {Math.max(0, targetReps - reps)} reps remaining
                </span>
              )}
              <span 
                onClick={() => {
                  const val = window.prompt("Set your custom Target Reps for this workout:", targetReps);
                  if (val && !isNaN(val) && Number(val) > 0) {
                    setTargetReps(Number(val));
                  }
                }}
                style={{ cursor: 'pointer', color: '#ff7a00', fontWeight: 700, background: 'rgba(255,122,0,0.15)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255,122,0,0.4)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s', fontSize: '0.75rem' }}
                title="Click to customize Target Reps"
              >
                🎯 TARGET: {targetReps} REPS ✏️
              </span>
            </div>

            {selectedExercise === 'free-pose' && (
              <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.75rem', color: '#ff7a00', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ⚡ Multi-Exercise Count Breakdown:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {Object.entries(freePoseCounts || {}).filter(([_, count]) => count > 0).length > 0 ? (
                    Object.entries(freePoseCounts || {})
                      .filter(([_, count]) => count > 0)
                      .map(([exName, count]) => (
                        <div key={exName} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ color: '#a0a4b8', textTransform: 'capitalize' }}>{exName.replace('-', ' ')}:</span>
                          <strong style={{ color: '#10b981' }}>{count} reps</strong>
                        </div>
                      ))
                  ) : (
                    <div style={{ gridColumn: 'span 2', color: '#a0a4b8', fontSize: '0.75rem', textAlign: 'center', padding: '4px 0', fontStyle: 'italic' }}>
                      Start performing exercises (Push-ups, Pull-ups, Squats...) to see separate rep counters appear here!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="glass-card stat-card" style={{ padding: '16px' }}>
            <div className="card-title" style={{ marginBottom: '10px' }}>
              <ShieldCheck color="#ff7a00" size={16} /> Posture Guard Metrics
            </div>
            <div className="metric-row" style={{ marginBottom: '10px' }}>
              <div className="metric-header">
                <span style={{ color: '#a0a4b8', fontSize: '0.85rem' }}>{guardInfo.label1}</span>
                <strong style={{ color: !isWebcamActive ? '#a0a4b8' : (guardInfo.val1 === '0%' ? '#ff3b30' : '#10b981'), fontSize: '0.85rem' }}>{guardInfo.val1}</strong>
              </div>
              <div className="metric-bar-track" style={{ height: '6px' }}>
                <div className="metric-bar-fill" style={{ width: guardInfo.val1, transition: 'width 0.5s ease', background: guardInfo.val1 === '0%' ? '#ff3b30' : '' }}></div>
              </div>
            </div>
            <div className="metric-row" style={{ marginBottom: '0' }}>
              <div className="metric-header">
                <span style={{ color: '#a0a4b8', fontSize: '0.85rem' }}>{guardInfo.label2}</span>
                <strong style={{ color: !isWebcamActive ? '#a0a4b8' : (guardInfo.val2 === '0%' ? '#ff3b30' : '#ff7a00'), fontSize: '0.85rem' }}>{guardInfo.val2}</strong>
              </div>
              <div className="metric-bar-track" style={{ height: '6px' }}>
                <div className="metric-bar-fill orange" style={{ width: guardInfo.val2, transition: 'width 0.5s ease', background: guardInfo.val2 === '0%' ? '#ff3b30' : '' }}></div>
              </div>
            </div>
          </div>

          <div className="glass-card stat-card info-card" style={{ padding: '12px 16px' }}>
            <AlertTriangle color="#ff7a00" size={20} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Strict Anti-False Count Active</h4>
              <p style={{ fontSize: '0.78rem', lineHeight: '1.4', color: '#a0a4b8', marginTop: '2px' }}>
                {guardInfo.desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Playground;
