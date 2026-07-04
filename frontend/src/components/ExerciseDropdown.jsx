import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, CheckCircle2, Sparkles, Activity, Layers, Cpu } from 'lucide-react';

export const EXERCISE_LIST = [
  { 
    id: 'auto', 
    label: 'AI Auto-Detect', 
    icon: '🤖', 
    category: 'Neural Network Model',
    desc: '1D-CNN + LSTM real-time pose sequence classification',
    badge: 'AI EDGE'
  },
  { 
    id: 'free-pose', 
    label: 'Free Pose (Multi-Exercise Workout)', 
    icon: '⚡', 
    category: 'Neural Network Model',
    desc: 'Perform multiple exercises (Push-ups, Pull-ups, Squats, etc.) in one session with separate rep counters!',
    badge: 'MULTI-AI'
  },
  { 
    id: 'push-up', 
    label: 'Push-up', 
    icon: '🏃‍♂️', 
    category: 'Upper Body & Chest',
    desc: 'Elbow flexion (70°-160°) & torso linearity validation',
    badge: '3D ANGLE'
  },
  { 
    id: 'pull-up', 
    label: 'Pull-up', 
    icon: '🤸‍♂️', 
    category: 'Upper Body & Back',
    desc: 'Chin-to-bar elevation & vertical pull tracking',
    badge: '3D ANGLE'
  },
  { 
    id: 'squat', 
    label: 'Squat', 
    icon: '🦵', 
    category: 'Lower Body & Legs',
    desc: 'Knee & hip hinge depth validation (< 70° parallel)',
    badge: '3D ANGLE'
  },
  { 
    id: 'plank', 
    label: 'Plank', 
    icon: '🧘‍♂️', 
    category: 'Core & Stability',
    desc: 'Spine-hip-leg alignment & endurance timer',
    badge: 'TIMER'
  },
  { 
    id: 'lunges', 
    label: 'Lunges', 
    icon: '🚶‍♂️', 
    category: 'Lower Body & Legs',
    desc: 'Unilateral knee flexion & stride balance tracking',
    badge: '3D ANGLE'
  },
  { 
    id: 'deadlift', 
    label: 'Deadlift', 
    icon: '🏋️‍♂️', 
    category: 'Full Body & Posterior',
    desc: 'Spine neutrality & hip hinge posture safety',
    badge: 'POSTURE'
  },
  { 
    id: 'bicep-curl', 
    label: 'Bicep Curl', 
    icon: '💪', 
    category: 'Arms & Isolation',
    desc: 'Elbow contraction & extension tracking (40°-150°)',
    badge: '3D ANGLE'
  },
  { 
    id: 'dumbbell-shoulder-press', 
    label: 'Dumbbell Shoulder Press', 
    icon: '🙆‍♂️', 
    category: 'Shoulders & Arms',
    desc: 'Overhead extension & 90° shoulder press tracking',
    badge: '3D ANGLE'
  },
  { 
    id: 'crunches', 
    label: 'Crunches', 
    icon: '🤸', 
    category: 'Core & Abdominals',
    desc: 'Abdominal contraction angle tracking (< 45°)',
    badge: '3D ANGLE'
  },
  { 
    id: 'russian-twist', 
    label: 'Russian Twist', 
    icon: '🔄', 
    category: 'Core & Obliques',
    desc: 'Torso rotational angle & core twist tracking',
    badge: 'ROTATION'
  },
  { 
    id: 'jumping-jacks', 
    label: 'Jumping Jacks', 
    icon: '🏃', 
    category: 'Cardio & Full Body',
    desc: 'Wrist-to-shoulder elevation & coordination tracking',
    badge: 'CARDIO'
  },
  { 
    id: 'sit-up', 
    label: 'Sit-up', 
    icon: '🛌', 
    category: 'Core & Abdominals',
    desc: 'Full torso elevation & hip angle tracking',
    badge: '3D ANGLE'
  }
];

export default function ExerciseDropdown({ selectedExercise, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const dropdownRef = useRef(null);

  const currentExercise = EXERCISE_LIST.find(ex => ex.id === selectedExercise) || EXERCISE_LIST[0];

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Group exercises by category
  const categories = [];
  EXERCISE_LIST.forEach((ex) => {
    if (!categories.includes(ex.category)) {
      categories.push(ex.category);
    }
  });

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', zIndex: 50 }}>
      {/* Trigger Header Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: isOpen 
            ? 'linear-gradient(135deg, rgba(255, 122, 0, 0.25), rgba(255, 59, 48, 0.15))' 
            : 'rgba(19, 21, 31, 0.9)',
          border: isOpen ? '2px solid #ff7a00' : '2px solid rgba(255, 122, 0, 0.5)',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: isOpen 
            ? '0 0 30px rgba(255, 122, 0, 0.35), 0 10px 25px rgba(0,0,0,0.5)' 
            : '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isOpen ? 'scale(1.01)' : 'scale(1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Icon Badge */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: currentExercise.id === 'auto' 
              ? 'linear-gradient(135deg, #ff7a00, #ff3b30)' 
              : 'rgba(255, 122, 0, 0.15)',
            border: '1px solid rgba(255, 122, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            boxShadow: currentExercise.id === 'auto' ? '0 4px 15px rgba(255, 122, 0, 0.5)' : 'none'
          }}>
            {currentExercise.icon}
          </div>

          {/* Title and Subtitle */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>
                {currentExercise.label}
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: currentExercise.id === 'auto' ? '#ff3b30' : 'rgba(255, 122, 0, 0.2)',
                color: currentExercise.id === 'auto' ? '#fff' : '#ff7a00',
                border: currentExercise.id === 'auto' ? 'none' : '1px solid rgba(255, 122, 0, 0.4)'
              }}>
                {currentExercise.badge}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#a0a4b8', marginTop: '2px', fontWeight: 500 }}>
              {currentExercise.desc}
            </div>
          </div>
        </div>

        {/* Right Arrow / Action Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            color: '#ff7a00',
            background: 'rgba(255, 122, 0, 0.1)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 122, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={13} /> Change Exercise
          </div>
          <div style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            color: '#ff7a00'
          }}>
            <ChevronDown size={24} />
          </div>
        </div>
      </div>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          left: 0,
          right: 0,
          background: 'rgba(15, 17, 26, 0.98)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 122, 0, 0.4)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(255, 122, 0, 0.15)',
          padding: '16px',
          maxHeight: '250px',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          animation: 'dropdownFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Custom Styles for Scrollbar & Animation */}
          <style>{`
            @keyframes dropdownFadeIn {
              from { opacity: 0; transform: translateY(-10px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            div::-webkit-scrollbar {
              width: 8px;
            }
            div::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.02);
              border-radius: 10px;
            }
            div::-webkit-scrollbar-thumb {
              background: rgba(255, 122, 0, 0.3);
              border-radius: 10px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 122, 0, 0.6);
            }
          `}</style>

          <div style={{ padding: '0 8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0a4b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="#ff7a00" /> Supported Exercise Workouts ({EXERCISE_LIST.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={12} /> Edge Tracking Ready
            </span>
          </div>

          {categories.map((cat) => (
            <div key={cat} style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#ff7a00',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '4px 8px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: 0.9
              }}>
                <Cpu size={12} /> {cat}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                {EXERCISE_LIST.filter(ex => ex.category === cat).map((ex) => {
                  const isSelected = ex.id === selectedExercise;
                  const isHovered = hoveredId === ex.id;

                  return (
                    <div
                      key={ex.id}
                      onClick={() => {
                        onSelect(ex.id);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setHoveredId(ex.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '14px',
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(255, 122, 0, 0.2), rgba(255, 59, 48, 0.1))' 
                          : isHovered 
                            ? 'rgba(255, 255, 255, 0.06)' 
                            : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected 
                          ? '1px solid #ff7a00' 
                          : isHovered 
                            ? '1px solid rgba(255, 122, 0, 0.3)' 
                            : '1px solid rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: isHovered ? 'translateX(6px)' : 'translateX(0)',
                        boxShadow: isSelected ? '0 4px 15px rgba(255, 122, 0, 0.15)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: isSelected ? '#ff7a00' : 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.4rem',
                          transition: 'background 0.2s'
                        }}>
                          {ex.icon}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '0.98rem',
                              fontWeight: 700,
                              color: isSelected ? '#ff7a00' : '#fff',
                              transition: 'color 0.2s'
                            }}>
                              {ex.label}
                            </span>
                            <span style={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: ex.id === 'auto' ? '#ff3b30' : 'rgba(255, 255, 255, 0.08)',
                              color: '#fff'
                            }}>
                              {ex.badge}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#a0a4b8', marginTop: '2px' }}>
                            {ex.desc}
                          </div>
                        </div>
                      </div>

                      {/* Selection Status */}
                      <div>
                        {isSelected ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff7a00', fontWeight: 700, fontSize: '0.8rem', background: 'rgba(255, 122, 0, 0.15)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255, 122, 0, 0.4)' }}>
                            <CheckCircle2 size={16} /> Selected
                          </div>
                        ) : (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '2px solid rgba(255, 255, 255, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: isHovered ? 1 : 0.4,
                            transition: 'all 0.2s'
                          }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
