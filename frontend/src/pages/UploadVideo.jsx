import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileVideo, CheckCircle2, Play, AlertCircle, RefreshCw, Cpu, Activity } from 'lucide-react';
import ExerciseDropdown, { EXERCISE_LIST } from '../components/ExerciseDropdown';

const API_BASE_URL = 'https://thirilojan-smartfit-ai-backend.hf.space';

function UploadVideo() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [exerciseType, setExerciseType] = useState('auto');
  const [isUploading, setIsUploading] = useState(false);
  const [streamFilename, setStreamFilename] = useState(null);
  const [streamKey, setStreamKey] = useState(Date.now());
  const [reps, setReps] = useState(0);
  const [targetReps, setTargetReps] = useState(15);
  const [formStatus, setFormStatus] = useState('Correct Form');
  const [aiDetected, setAiDetected] = useState('Ready');
  const [freePoseCounts, setFreePoseCounts] = useState({});
  const [enableTimer, setEnableTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const fileInputRef = useRef(null);

  // Automatically reset backend score on page load or refresh
  useEffect(() => {
    fetch(`${API_BASE_URL}/reset-score`, { method: 'POST' }).catch(() => {});
  }, []);

  // Poll backend score API while stream is active
  useEffect(() => {
    let interval;
    if (streamFilename) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/get-score`);
          const data = await res.json();
          if (data && data.counter !== undefined) {
            setReps(data.counter);
            setFormStatus(data.status || 'Correct Form');
            setAiDetected(data.ai_detected || 'Ready');
            if (data.free_pose_counts) setFreePoseCounts(data.free_pose_counts);
          }
        } catch (e) {
          // Ignore polling errors
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [streamFilename]);

  // Workout Timer Effect
  useEffect(() => {
    let interval = null;
    if (enableTimer && isTimerRunning && streamFilename) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [enableTimer, isTimerRunning, streamFilename]);

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keybind 'Q' to prompt confirmation and stop video stream
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'q' || e.key === 'Q') && streamFilename) {
        if (window.confirm("Stop active video analysis? Press OK to confirm.")) {
          setStreamFilename(null);
          setReps(0);
          setFreePoseCounts({});
          setTimerSeconds(0);
          fetch(`${API_BASE_URL}/reset-score`, { method: 'POST' }).catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [streamFilename]);

  const resetScore = () => {
    setReps(0);
    setFreePoseCounts({});
    setTimerSeconds(0);
    fetch(`${API_BASE_URL}/reset-score`, { method: 'POST' }).catch(() => {});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setStreamFilename(null);
      resetScore();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setStreamFilename(null);
      resetScore();
    }
  };

  const startBackendAnalysis = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setStreamFilename(null);
    resetScore();

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('exercise_type', exerciseType);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-video`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setIsUploading(false);

      if (data.filename) {
        setStreamKey(Date.now());
        setStreamFilename(data.filename);
        setReps(0);
      }
    } catch (error) {
      console.error('Error uploading video to backend:', error);
      setIsUploading(false);
      alert('Could not connect to backend server on port 5000.');
    }
  };

  return (
    <section className="playground-section" style={{ padding: '16px 24px', maxWidth: '1440px' }}>
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h2 className="glow-text" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>Upload Workout Video</h2>
        <p style={{ fontSize: '0.85rem' }}>Analyze pre-recorded training videos directly embedded inside your browser UI</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '16px', gap: '20px', alignItems: 'stretch' }}>
        {/* Upload & Configuration Column */}
        <div className="glass-card stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <div className="card-title" style={{ marginBottom: '4px' }}>
            <Upload color="#ff7a00" size={18} /> Step 1: Select Video Source
          </div>

          {/* Drag & Drop Box */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed rgba(255, 92, 0, 0.4)',
              borderRadius: '16px',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: selectedFile ? 'rgba(255, 92, 0, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              transition: 'all 0.3s ease'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="video/*" 
              style={{ display: 'none' }} 
            />
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 92, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FileVideo color="#ff7a00" size={32} />
            </div>
            {selectedFile ? (
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{selectedFile.name}</h4>
                <p style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>Ready for Embedded AI Stream ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
              </div>
            ) : (
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Drag & Drop workout video here</h4>
                <p style={{ color: '#a0a4b8', fontSize: '0.85rem' }}>or click to browse local filesystem (.MP4, .MOV, .AVI)</p>
              </div>
            )}
          </div>

          {/* Custom UI/UX Exercise Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a0a4b8', marginBottom: '12px' }}>
              Step 2: Select Target Exercise
            </label>
            <ExerciseDropdown
              selectedExercise={exerciseType}
              onSelect={(id) => { setExerciseType(id); resetScore(); }}
            />
            {/* Workout Options & Timer Toggle */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', marginTop: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, userSelect: 'none' }}>
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
                ⏱️ Enable Workout Timer
              </label>
              {enableTimer && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', background: 'rgba(255,122,0,0.12)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,122,0,0.3)', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800, color: '#ff7a00' }}>
                    ⏱️ {formatTime(timerSeconds)}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => setIsTimerRunning(!isTimerRunning)} 
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}
                    >
                      {isTimerRunning ? '⏸️' : '▶️'}
                    </button>
                    <button 
                      onClick={() => { setTimerSeconds(0); setIsTimerRunning(true); }} 
                      style={{ background: 'rgba(255,59,48,0.15)', border: 'none', color: '#ff3b30', cursor: 'pointer', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}
                      title="Reset Timer"
                    >
                      🔄
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={startBackendAnalysis}
            disabled={!selectedFile || isUploading}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1rem', opacity: (!selectedFile || isUploading) ? 0.5 : 1 }}
          >
            {isUploading ? (
              <>
                <RefreshCw size={18} className="animate-spin" /> Uploading to Edge Server...
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" /> Embed & Analyze on Site
              </>
            )}
          </button>
        </div>

        {/* Results / Embedded Stream Preview Column */}
        <div className="glass-card stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '420px', overflow: 'hidden', padding: 0 }}>
          {isUploading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', margin: 'auto' }}>
              <div className="scanner-ring" style={{ width: '80px', height: '80px', marginBottom: '24px' }}>
                <Cpu color="#ff7a00" size={36} />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Uploading Video Payload...</h3>
              <p style={{ color: '#a0a4b8', fontSize: '0.95rem' }}>Preparing embedded HTTP motion stream.</p>
            </div>
          ) : streamFilename ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Top Stream Header */}
              <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff7a00', fontWeight: 700 }}>
                  EMBEDDED AI STREAM // {exerciseType === 'auto' ? `⚡ AUTO: ${aiDetected}` : exerciseType.toUpperCase()}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(255, 59, 48, 0.2)', color: '#ff3b30', border: '1px solid rgba(255, 59, 48, 0.4)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Press [Q] to Stop
                  </span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 10px', borderRadius: '4px', fontWeight: 600 }}>
                    {formStatus}
                  </span>
                </div>
              </div>

              {/* Embedded Video Stream */}
              <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <img 
                  src={`${API_BASE_URL}/stream-uploaded?filename=${streamFilename}&exercise_type=${exerciseType}&t=${streamKey}`}
                  alt="Embedded AI Workout Stream"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Bottom Real-Time HUD */}
              <div style={{ padding: '16px', background: 'rgba(18,19,27,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#a0a4b8', textTransform: 'uppercase' }}>Live Reps Counted</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                      <span className="glow-text" style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1 }}>{reps}</span>
                      <span 
                        onClick={() => {
                          const val = window.prompt("Set your custom Target Reps for this video:", targetReps);
                          if (val && !isNaN(val) && Number(val) > 0) {
                            setTargetReps(Number(val));
                          }
                        }}
                        style={{ cursor: 'pointer', color: '#ff7a00', fontWeight: 700, background: 'rgba(255,122,0,0.15)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,122,0,0.4)', fontSize: '0.75rem', transition: 'all 0.2s' }}
                        title="Click to customize Target Reps"
                      >
                        🎯 Target: {targetReps} ✏️
                      </span>
                      {reps >= targetReps && (
                        <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.8rem' }}>
                          🏆 GOAL ACHIEVED!
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#a0a4b8', textTransform: 'uppercase' }}>AI Neural Detection</div>
                    <strong style={{ color: '#ff7a00', fontSize: '1.1rem' }}>{aiDetected}</strong>
                  </div>
                </div>

                {exerciseType === 'free-pose' && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#ff7a00', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                      ⚡ Multi-Exercise Count Breakdown:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {Object.entries(freePoseCounts || {}).filter(([_, count]) => count > 0).length > 0 ? (
                        Object.entries(freePoseCounts || {})
                          .filter(([_, count]) => count > 0)
                          .map(([exName, count]) => (
                            <div key={exName} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '6px' }}>
                              <span style={{ color: '#a0a4b8', textTransform: 'capitalize' }}>{exName.replace('-', ' ')}:</span>
                              <strong style={{ color: '#10b981' }}>{count} reps</strong>
                            </div>
                          ))
                      ) : (
                        <span style={{ color: '#a0a4b8', fontSize: '0.75rem', fontStyle: 'italic' }}>
                          Start video playback to see separate rep counters appear here!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#a0a4b8', margin: 'auto' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>No Embedded Stream Active</h4>
              <p style={{ fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>
                Upload a video file on the left to watch the AI pose analysis play directly inside this webpage window!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default UploadVideo;
