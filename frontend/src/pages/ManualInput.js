import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Smartphone, RotateCcw, Play, ArrowLeft, AlertTriangle, CheckCircle, Info, X, Palette, LayoutGrid } from 'lucide-react';
import { cubeAPI, generateSolvedCube, validateCentersAndCounts, validateCubeStateDetailed } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import CubeNet2D from '../components/CubeNet2D';
import Cube3D from '../components/Cube3D';

const ManualInput = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();
  const [cubeState, setCubeState] = useState(generateSolvedCube());
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState(null);
  const [mode, setMode] = useState('fast'); // 'fast' | 'beginner'
  const [inputMode, setInputMode] = useState('grid'); // 'grid' | 'net' | '3d'
  const [validation, setValidation] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightErrors, setHighlightErrors] = useState(false);
  const summaryRef = React.useRef(null);
  const notifyCenterBlocked = () => {
    showInfo("\"The middle squares are locked and can't be changed. Tap the squares around them to pick your colors.\"!", 4200);
  };

  const colors = ['W', 'Y', 'R', 'O', 'B', 'G'];
  const colorNames = {
    W: 'White',
    Y: 'Yellow',
    R: 'Red',
    O: 'Orange',
    B: 'Blue',
    G: 'Green',
  };

  const faces = [
    { name: 'Top', key: 'up', color: 'White' },
    { name: 'Right', key: 'right', color: 'Orange' },
    { name: 'Front', key: 'front', color: 'Blue' },
    { name: 'Bottom', key: 'down', color: 'Yellow' },
    { name: 'Left', key: 'left', color: 'Red' },
    { name: 'Back', key: 'back', color: 'Green' },
  ];

  // Remove the automatic validation - only validate when solve button is clicked
  // useEffect(() => {
  //   const validationResult = validateCubeStateDetailed(cubeState);
  //   setValidation(validationResult);
  // }, [cubeState]);

  const handleColorChange = (faceIndex, squareIndex, newColor) => {
    const newCubeState = [...cubeState];
    const globalIndex = faceIndex * 9 + squareIndex;
    newCubeState[globalIndex] = newColor;
    setCubeState(newCubeState);
    // Clear validation when user makes changes
    setValidation(null);
    setShowErrors(false);
    setShowWarnings(false);
    setShowSuggestions(false);
    setHighlightErrors(false);
  };

  const handleStickerClick = (faceIndex, faceletIndex) => {
    const current = cubeState[faceIndex * 9 + faceletIndex];
    const idx = colors.indexOf(current);
    const next = colors[(idx + 1) % colors.length];
    handleColorChange(faceIndex, faceletIndex, next);
  };

  const resetCube = () => {
    setCubeState(generateSolvedCube());
    setSolution(null);
    setValidation(null);
    setShowErrors(false);
    setShowWarnings(false);
    setShowSuggestions(false);
    setHighlightErrors(false);
  };

  const solveCube = async () => {
    setIsLoading(true);

    // Only validate when solve button is clicked
    const validationResult = validateCubeStateDetailed(cubeState);
    setValidation(validationResult);

    if (!validationResult.isValid) {
      showError('Oops! Something needs fixing. Check the color counter below!');
      setHighlightErrors(true);
      setIsLoading(false);
      setTimeout(() => { summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
      return;
    }

    try {
      const result = await cubeAPI.solveCube(cubeState, mode);
      if (result.success) {
        setSolution(result.solution);
        showSuccess('Cube solved successfully!');
      } else {
        showError('Failed to solve cube: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Solve cube error:', error);
      showError('Error solving cube: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const viewSolution = () => {
    if (solution) {
      navigate(`/solution/${Date.now()}`, {
        state: { solution, cubeState },
      });
    }
  };

  const getColorClasses = (color, faceIndex, squareIndex) => {
    const baseColors = {
      W: 'bg-white border-gray-300',
      Y: 'bg-yellow-400 border-yellow-500',
      R: 'bg-red-500 border-red-600',
      O: 'bg-orange-500 border-orange-600',
      B: 'bg-blue-500 border-blue-600',
      G: 'bg-green-500 border-green-600',
    };

    let baseClass = baseColors[color] || 'bg-gray-300 border-gray-400';

    // Add error highlighting if enabled and this sticker has an error
    if (highlightErrors && validation && !validation.isValid) {
      const globalIndex = faceIndex * 9 + squareIndex;
      const isCenter = [4, 13, 22, 31, 40, 49].includes(globalIndex);

      // Check if this is a center piece with wrong color
      if (isCenter) {
        const expectedCenter = faces[faceIndex].color.charAt(0);
        if (color !== expectedCenter) {
          baseClass += ' animate-pulse ring-4 ring-red-500 ring-opacity-75 shadow-lg';
        }
      }

      // Check if this color has wrong count
      const colorCount = validation.colorCounts[color] || 0;
      if (colorCount !== 9) {
        baseClass += ' ring-2 ring-orange-400 ring-opacity-75';
      }
    }

    return baseClass;
  };

  // Convert technical error messages to kid-friendly ones
  const makeKidFriendly = (error) => {
    const friendlyMessages = {
      'Cube must have exactly 54 stickers': 'Your cube needs exactly 54 squares filled in!',
      'Invalid colors found': 'Oops! You used some colors that don\'t exist on a Rubik\'s cube!',
      'Each face must have a different center color': 'Each face needs a different center color!',
      'Some stickers don\'t match your center colors': 'Some stickers don\'t match the center of their face!',
      'Too many': 'You have too many',
      'stickers instead of 9': 'stickers! You need exactly 9 of each color.',
      'Not enough': 'You don\'t have enough',
      'stickers instead of 9': 'stickers! You need exactly 9 of each color.'
    };

    let friendlyError = error;
    Object.entries(friendlyMessages).forEach(([technical, friendly]) => {
      if (friendlyError.includes(technical)) {
        friendlyError = friendlyError.replace(technical, friendly);
      }
    });

    return friendlyError;
  };

  return (
    <div className="min-h-screen relative bg-[#0D061A] text-slate-200 overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-6 pt-12 pb-24">
        {/* Top Header Section */}
        <div className="w-full max-w-lg flex items-center justify-between mb-12">
          {/* Mode Pill Toggle */}
          <div className="bg-[#2D1B4D] p-1 rounded-2xl flex items-center shadow-inner">
            <button
              onClick={() => setMode('beginner')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${mode === 'beginner'
                ? 'bg-[#E0E7FF] text-[#1E1B4B] shadow-lg'
                : 'text-slate-400 bg-transparent'
                }`}
            >
              BEGINNER
            </button>
            <button
              onClick={() => setMode('fast')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${mode === 'fast'
                ? 'bg-[#E0E7FF] text-[#1E1B4B] shadow-lg'
                : 'text-slate-400 bg-transparent'
                }`}
            >
              PRO
            </button>
          </div>

          {/* Theme Switcher Mock */}
          <div className="w-16 h-8 bg-[#E0E7FF] rounded-full p-1 flex items-center justify-end shadow-lg cursor-pointer">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              <span role="img" aria-label="dark-mode" className="text-xs">🌙</span>
            </div>
          </div>
        </div>

        {/* Main Content Area (Cube / Setup) */}
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          {inputMode === '3d' && (
            <div className="relative w-full aspect-square max-w-[400px] flex items-center justify-center">
              {/* Rotation Ring Overlay */}
              <div className="absolute bottom-[10%] w-[85%] aspect-[2/1] border-[1px] border-slate-500/30 rounded-[100%] pointer-events-none flex items-center justify-center">
                <div className="absolute bottom-[-6px] w-4 h-4 bg-[#E0E7FF] rounded-full border-[3px] border-[#0D061A] shadow-lg shadow-white/20" />
              </div>

              <div className="w-full h-full opacity-100 scale-110">
                <Cube3D cubeState={cubeState} onStickerClick={handleStickerClick} lockCenters={true} onCenterBlocked={notifyCenterBlocked} />
              </div>
            </div>
          )}

          {inputMode === 'grid' && (
            <div className="w-full max-w-md bg-[#1F1235]/40 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/5 shadow-2xl overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                {faces.map((face, faceIndex) => (
                  <div key={face.key} className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">{face.name}</p>
                    <div className="grid grid-cols-3 gap-1">
                      {Array.from({ length: 9 }, (_, sqIdx) => {
                        const globalIdx = faceIndex * 9 + sqIdx;
                        const color = cubeState[globalIdx];
                        return (
                          <button
                            key={sqIdx}
                            onClick={() => {
                              if (sqIdx === 4) { notifyCenterBlocked(); return; }
                              const curIdx = colors.indexOf(color);
                              const nxtIdx = (curIdx + 1) % colors.length;
                              handleColorChange(faceIndex, sqIdx, colors[nxtIdx]);
                            }}
                            className={`w-full aspect-square rounded-md border-[1.5px] border-black/20 ${getColorClasses(color, faceIndex, sqIdx)}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inputMode === 'net' && (
            <div className="w-full flex-1 flex flex-col items-center justify-center">
              {/* Status Badge */}
              <div className="mb-8 px-8 py-3 bg-[#2D1B4D] backdrop-blur-xl border border-white/5 rounded-2xl shadow-lg flex items-center gap-3">
                <span className="text-xl">🎉</span>
                <span className="text-sm font-bold text-white tracking-wide uppercase">Solved</span>
              </div>

              <div className="scale-90 sm:scale-100">
                <CubeNet2D cubeState={cubeState} onCellClick={handleStickerClick} lockCenters={true} onCenterBlocked={notifyCenterBlocked} />
              </div>
            </div>
          )}
        </div>

        {/* Solve Button Section */}
        <div className="mt-8 mb-4 w-full max-w-xs flex flex-col items-center gap-4">
          {validation && !validation.isValid && (
            <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-tight">Cube needs more work • Check counts</p>
            </div>
          )}

          <button
            onClick={() => {
              const validationResult = validateCubeStateDetailed(cubeState);
              navigate('/notfound', { state: { cubeState, validation: validationResult } });
            }}
            disabled={isLoading}
            className={`flex-1 max-w-sm h-16 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_15px_30px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_40px_rgba(139,92,246,0.4)] ${isLoading ? 'bg-slate-800 pointer-events-none' : 'bg-gradient-to-r from-[#F43F5E] via-[#8B5CF6] to-[#3B82F6] text-white'
              }`}
          >
            {isLoading ? (
              <RotateCcw className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex items-center gap-3">
                <Box className="w-6 h-6" />
                <span className="text-sm font-black uppercase tracking-wider">Solve</span>
              </div>
            )}
          </button>
        </div>

        {/* Floating Dock Navigation */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1F1235]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setInputMode('3d')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${inputMode === '3d' ? 'bg-white text-[#1F1235]' : 'text-slate-400 hover:text-white'}`}
          >
            <Box size={22} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => setInputMode('grid')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${inputMode === 'grid' ? 'bg-white text-[#1F1235]' : 'text-slate-400 hover:text-white'}`}
          >
            <LayoutGrid size={22} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => setInputMode('net')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${inputMode === 'net' ? 'bg-white text-[#1F1235]' : 'text-slate-400 hover:text-white'}`}
          >
            <div className="flex flex-col items-center gap-[1px]">
              <div className="w-1.5 h-1.5 rounded-[1px] bg-current" />
              <div className="flex gap-[1px]">
                {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-[1px] bg-current" />)}
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate('/history')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-white`}
          >
            <Smartphone size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Floating Result Nav */}
        {solution && (
          <button
            onClick={viewSolution}
            className="fixed top-32 right-6 p-4 bg-green-500 text-white rounded-full shadow-2xl animate-bounce"
          >
            <Play size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ManualInput; 