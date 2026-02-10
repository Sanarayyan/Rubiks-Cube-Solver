import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft } from 'lucide-react';
import Cube3D from '../components/Cube3D';
import '../solution.css';

const Solution = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800); // Animation duration in ms
  const [isAnimating, setIsAnimating] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);

  const solution = location.state?.solution;
  const initialCubeState = location.state?.cubeState;
  const [displayCubeState, setDisplayCubeState] = useState(initialCubeState);

  const timelineRef = useRef(null);

  useEffect(() => {
    if (!solution) {
      navigate('/');
      return;
    }
  }, [solution, navigate]);



  // Use a ref for isPlaying to access the latest value inside callbacks/timeouts without dependency issues
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const handleMoveDone = useCallback((nextFacelets) => {
    if (nextFacelets) {
      setDisplayCubeState(nextFacelets);
    }

    // Small stabilization window to let React and Three.js sync their states
    setTimeout(() => {
      setIsAnimating(false);
      setPendingMove(null);
    }, 30);
  }, []);

  const handleStepForward = useCallback(() => {
    if (isAnimating || !solution?.moves) return;

    if (currentMoveIndex < solution.moves.length - 1) {
      const nextIdx = currentMoveIndex + 1;
      const move = solution.moves[nextIdx];

      setIsAnimating(true);
      setPendingMove(move.notation);
      setCurrentMoveIndex(nextIdx);
    } else {
      setIsPlaying(false);
    }
  }, [currentMoveIndex, isAnimating, solution]);

  // Main Playback Loop
  useEffect(() => {
    let timer;
    if (isPlaying && !isAnimating) {
      // Pause duration scales with speed for a more natural feel
      const pauseDuration = Math.max(50, speed * 0.1);

      timer = setTimeout(() => {
        if (isPlayingRef.current) {
          handleStepForward();
        }
      }, pauseDuration);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, isAnimating, handleStepForward, speed]);

  const togglePlay = () => {
    if (!isPlaying && currentMoveIndex >= solution.moves.length - 1) {
      // Restart if reached end
      setCurrentMoveIndex(-1);
      setDisplayCubeState(initialCubeState);
    }
    setIsPlaying(!isPlaying);
  };

  const skipBack = () => {
    if (isAnimating) return;
    setCurrentMoveIndex(-1);
    setDisplayCubeState(initialCubeState);
    setIsPlaying(false);
  };

  const resetCube = () => {
    skipBack();
  };

  if (!solution) return null;

  return (
    <div className="h-screen w-full bg-[#0D061A] text-white font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto flex flex-col flex-1 w-full p-6 pt-10 pb-12 overflow-y-auto custom-scrollbar">

        {/* Header with volume & reset */}
        <div className="w-full h-10 flex items-center justify-end gap-3 mb-6">

          <button
            onClick={resetCube}
            className="w-10 h-10 bg-blue-500/20 backdrop-blur-md rounded-xl flex items-center justify-center text-blue-400 border border-white/5 active:scale-90 transition-all"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* 3D Cube Player Viewport */}
        <div className="w-full aspect-[4/3] bg-gradient-to-b from-blue-900/20 to-transparent rounded-[2.5rem] p-4 flex items-center justify-center relative mb-8 border border-white/5 group shadow-2xl">
          <div className="w-full h-full">
            <Cube3D
              cubeState={displayCubeState}
              animateMove={pendingMove}
              onMoveDone={handleMoveDone}
              durationMs={speed}
            />
          </div>
        </div>

        {/* Playback Progress Slider (Speed) */}
        <div className="w-full px-4 mb-8">
          <div className="flex justify-between text-[10px] font-black text-slate-500 tracking-widest uppercase mb-3">
            <span>Fast</span>
            <span>Speed: {speed}ms</span>
            <span>Slow</span>
          </div>
          <div className="relative group">
            <input
              type="range"
              min="200"
              max="1500"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-6 mb-12">
          <button
            onClick={skipBack}
            className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
          >
            <SkipBack size={24} fill="white" />
          </button>
          <button
            onClick={togglePlay}
            className="w-18 h-18 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl flex items-center justify-center text-white shadow-[0_15px_35px_rgba(99,102,241,0.4)] active:scale-95 transition-all p-5"
          >
            {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
          </button>
          <button
            onClick={handleStepForward}
            className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
          >
            <SkipForward size={24} fill="white" />
          </button>
        </div>

        {/* Time Lines Section */}
        <div className="w-full flex flex-col mb-8 h-auto">
          <h3 className="text-sm font-black text-slate-300 tracking-widest uppercase mb-6 flex items-center gap-3 px-2">
            Time Lines <div className="h-px flex-1 bg-white/5"></div>
          </h3>
          <div
            ref={timelineRef}
            className="pr-2 space-y-4"
          >
            {solution.moves.map((move, i) => (
              <div
                key={i}
                className={`relative group transition-all duration-500 ${i === currentMoveIndex ? 'scale-[1.02] z-20' : 'opacity-60'}`}
              >
                <div className={`p-5 rounded-[1.5rem] border flex items-center justify-between transition-all duration-500 bg-[#1F1235]/40 ${i === currentMoveIndex
                  ? 'border-blue-500/50 shadow-[0_10px_30px_rgba(59,130,246,0.15)] bg-blue-500/10'
                  : 'border-white/5'}`}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-base font-black text-blue-400 w-8">{i + 1}.</span>
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-white">{move.notation}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                      ROTATE {move.notation[0]} FACE {move.notation.includes("'") ? 'COUNTER-CLOCKWISE' : 'CLOCKWISE'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Bar */}
        <div className="w-full bg-[#1F1235]/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 mb-8 mt-auto grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Total Moves</span>
            <span className="text-lg font-black text-white">{solution.moves.length}</span>
          </div>
          <div className="flex flex-col items-center border-x border-white/5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Estimate Time</span>
            <span className="text-lg font-black text-white">{solution.estimatedTime || (solution.moves.length * 2)} sec</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Method</span>
            <span className="text-lg font-black text-white truncate w-full text-center">{solution.solvingMethod || 'Two Phase'}</span>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/manual')}
          className="w-full h-16 bg-gradient-to-r from-rose-500 via-indigo-600 to-blue-700 rounded-[2rem] flex items-center justify-center p-0.5 group active:scale-[0.98] transition-all shadow-xl shadow-indigo-900/20"
        >
          <div className="w-full h-full bg-[#0D061A]/10 rounded-[2rem] flex items-center justify-center gap-3 text-white">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-[0.2em]">Back to Game</span>
          </div>
        </button>

      </div>
    </div>
  );
};

export default Solution;