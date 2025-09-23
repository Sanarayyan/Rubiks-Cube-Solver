import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, RotateCcw, Play, ArrowLeft, AlertTriangle, CheckCircle, Info, X, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Arrow Button - Mobile Style */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-gray-200 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Manual Cube Input</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">Set the colors for each face of your cube</p>
        </div>

        {/* Validation Status Bar - Only show when validation exists */}
        {validation && (
          <div className="mb-6" ref={summaryRef}>
            <div className={`p-6 rounded-xl border-2 shadow-lg ${
              validation.isValid 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  {validation.isValid ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold">
                      {validation.isValid ? '🎉 Great Job! Your Cube is Ready!' : '🔍 Let\'s Fix Your Cube!'}
                    </h3>
                    {!validation.isValid && (
                      <p className="text-sm opacity-90">Tap buttons to see details. Color counter below.</p>
                    )}
                  </div>
                </div>
                {!validation.isValid && (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setShowErrors(!showErrors)} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{showErrors ? 'Hide Problems' : 'Show Problems'}</button>
                    <button onClick={() => setShowWarnings(!showWarnings)} className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600">{showWarnings ? 'Hide Checks' : 'Things to Check'}</button>
                    <button onClick={() => setShowSuggestions(!showSuggestions)} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">{showSuggestions ? 'Hide Tips' : 'How to Fix'}</button>
                    <button onClick={() => setHighlightErrors(!highlightErrors)} className={`px-3 py-1.5 text-sm rounded-md ${highlightErrors ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>{highlightErrors ? 'Hide Highlights' : 'Show Highlights'}</button>
                  </div>
                )}
              </div>

              {/* Always show Color Count Summary */}
              <div className="mt-2 p-5 sm:p-6 bg-gray-100 rounded-xl">
                <h4 className="text-lg font-bold mb-4 text-gray-800">🎨 Color Count Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {Object.entries(validation.colorCounts).map(([color, count]) => (
                    <div key={color} className={`p-3 rounded-lg border-2 transition-all ${
                      count === 9 
                        ? 'bg-green-100 border-green-300 text-green-800' 
                        : 'bg-red-100 border-red-300 text-red-800'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded border-2 ${getColorClasses(color, 0, 0)}`}></div>
                        <div>
                          <div className="font-bold">{colorNames[color]}</div>
                          <div className="text-sm">
                            {count === 9 ? (
                              <span className="text-green-700">✅ Perfect! (9/9)</span>
                            ) : (
                              <span className="text-red-700">
                                {count > 9 ? '❌ Too many!' : '❌ Not enough!'} ({count}/9)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collapsible Details */}
              {showErrors && validation.errors.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-700"><AlertTriangle className="w-5 h-5" /> Problems to Fix</h4>
                  <div className="grid gap-3">
                    {validation.errors.map((error, index) => (
                      <div key={index} className="p-4 bg-red-100 rounded-lg border-l-4 border-red-500">
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold">{index + 1}.</span>
                          <p className="text-red-800">{makeKidFriendly(error)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showWarnings && validation.warnings.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-orange-700"><Info className="w-5 h-5" /> Things to Check</h4>
                  <div className="grid gap-3">
                    {validation.warnings.map((warning, index) => (
                      <div key={index} className="p-4 bg-orange-100 rounded-lg border-l-4 border-orange-500">
                        <div className="flex items-start gap-3">
                          <span className="text-orange-600 font-bold">{index + 1}.</span>
                          <p className="text-orange-800">{warning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showSuggestions && validation.suggestions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-700"><Info className="w-5 h-5" /> How to Fix</h4>
                  <div className="grid gap-3">
                    {validation.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-4 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold">{index + 1}.</span>
                          <p className="text-blue-800">{suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Cube Configuration */}
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Cube Configuration</h2>

            {/* Mode toggle */}
            <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="text-sm font-medium text-gray-700">Mode:</span>
              <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                <label className="sr-only" htmlFor="mode-fast">Pro</label>
                <input id="mode-fast" type="radio" name="mode" value="fast" checked={mode === 'fast'} onChange={() => setMode('fast')} className="sr-only" />
                <button
                  type="button"
                  onClick={() => setMode('fast')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    mode === 'fast'
                      ? 'text-white bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 shadow-[0_4px_14px_rgba(99,102,241,0.35)]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-pressed={mode === 'fast'}
                >
                  Pro
                </button>
                <label className="sr-only" htmlFor="mode-beginner">Beginner</label>
                <input id="mode-beginner" type="radio" name="mode" value="beginner" checked={mode === 'beginner'} onChange={() => setMode('beginner')} className="sr-only" />
                <button
                  type="button"
                  onClick={() => setMode('beginner')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    mode === 'beginner'
                      ? 'text-white bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 shadow-[0_4px_14px_rgba(13,148,136,0.35)]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-pressed={mode === 'beginner'}
                >
                  Beginner
                </button>
              </div>
            </div>

            {/* 2D input mode toggle */}
            <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="text-sm font-medium text-gray-700">Input Mode:</span>
              <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                <label className="sr-only" htmlFor="input-grid">Face Grid</label>
                <input id="input-grid" type="radio" name="inputMode" value="grid" checked={inputMode === 'grid'} onChange={() => setInputMode('grid')} className="sr-only" />
                <button
                  type="button"
                  onClick={() => setInputMode('grid')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    inputMode === 'grid'
                      ? 'text-white bg-gradient-to-r from-fuchsia-500 via-pink-600 to-rose-600 shadow-[0_4px_14px_rgba(236,72,153,0.35)]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-pressed={inputMode === 'grid'}
                >
                  Face Grid
                </button>
                <label className="sr-only" htmlFor="input-net">Cross Net (image)</label>
                <input id="input-net" type="radio" name="inputMode" value="net" checked={inputMode === 'net'} onChange={() => setInputMode('net')} className="sr-only" />
                <button
                  type="button"
                  onClick={() => setInputMode('net')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    inputMode === 'net'
                      ? 'text-white bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 shadow-[0_4px_14px_rgba(234,179,8,0.35)]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-pressed={inputMode === 'net'}
                >
                  Cross Net (image)
                </button>
                <label className="sr-only" htmlFor="input-3d">3D Clickable</label>
                <input id="input-3d" type="radio" name="inputMode" value="3d" checked={inputMode === '3d'} onChange={() => setInputMode('3d')} className="sr-only" />
                <button
                  type="button"
                  onClick={() => setInputMode('3d')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    inputMode === '3d'
                      ? 'text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 shadow-[0_4px_14px_rgba(59,130,246,0.35)]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-pressed={inputMode === '3d'}
                >
                  3D Clickable
                </button>
              </div>
            </div>

            {inputMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {faces.map((face, faceIndex) => (
                  <div key={face.key} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {face.name} ({face.color})
                    </h3>
                    <div className="grid grid-cols-3 gap-1.5">
                      {Array.from({ length: 9 }, (_, squareIndex) => {
                        const globalIndex = faceIndex * 9 + squareIndex;
                        const currentColor = cubeState[globalIndex];
                        return (
                          <button
                            key={squareIndex}
                            onClick={() => {
                              if (squareIndex === 4) { notifyCenterBlocked(); return; }
                              const currentIndex = colors.indexOf(currentColor);
                              const nextIndex = (currentIndex + 1) % colors.length;
                              handleColorChange(faceIndex, squareIndex, colors[nextIndex]);
                            }}
                            className={`
                              w-9 h-9 sm:w-8 sm:h-8 rounded border-2 transition-all duration-200 active:scale-95 sm:hover:scale-110
                              ${getColorClasses(currentColor, faceIndex, squareIndex)}
                            `}
                            title={`${colorNames[currentColor]} - Click to change`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : inputMode === 'net' ? (
              <div className="w-full aspect-[12/9] rounded-lg overflow-hidden bg-gray-200">
                <CubeNet2D cubeState={cubeState} onCellClick={handleStickerClick} lockCenters={true} onCenterBlocked={notifyCenterBlocked} />
              </div>
            ) : (
              <div className="h-[320px] sm:h-96 rounded-lg overflow-hidden bg-white">
                <Cube3D cubeState={cubeState} onStickerClick={handleStickerClick} lockCenters={true} onCenterBlocked={notifyCenterBlocked} />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
              <button onClick={resetCube} className="tap-target flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 shadow-lg shadow-gray-800/30 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 active:scale-[0.98] transition-all ring-1 ring-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400">
                <RotateCcw className="w-4 h-4" />
                <span className="font-semibold tracking-wide">Reset to Solved</span>
              </button>
              <button 
                onClick={solveCube} 
                disabled={isLoading} 
                className="tap-target flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 shadow-[0_8px_24px_rgba(59,130,246,0.35)] hover:shadow-[0_10px_28px_rgba(99,102,241,0.45)] hover:from-blue-500 hover:via-indigo-500 hover:to-purple-600 active:scale-[0.98] disabled:opacity-50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="font-semibold tracking-wide">{isLoading ? 'Solving...' : 'Solve Cube'}</span>
              </button>
            </div>
          </div>

          {/* Solution Display */}
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Solution</h2>
            {solution ? (
              <div>
                {solution.orientationBaseline && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200 text-yellow-900">
                    <strong>Hold:</strong> {solution.orientationBaseline}
                  </div>
                )}
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Solution Found!</h3>
                  <p className="text-green-700">{solution.moves.length} moves • Estimated time: {solution.estimatedTime}s</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Moves:</h4>
                  <div className="flex flex-col gap-2">
                    {solution.moves.map((move, index) => (
                      <div key={index} className="p-3 rounded border border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-700">{index + 1}. {move.notation}</span>
                          <span className="text-sm text-gray-600">{move.description}</span>
                        </div>
                        {mode === 'beginner' && (
                          <div className="mt-2 text-sm text-gray-700">
                            <div><strong>Hand:</strong> {move.hand || '—'}</div>
                            <div><strong>Grip:</strong> {move.grip || '—'}</div>
                            {move.tip && <div><strong>Tip:</strong> {move.tip}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={viewSolution} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors">
                  <Play className="w-4 h-4" />
                  View 3D Solution
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Save className="w-8 h-8 text-gray-400" />
                </div>
                <p>Choose a mode, configure your cube in Grid or Net view, then click "Solve Cube".</p>
                {validation && !validation.isValid && (
                  <p className="text-sm text-red-500 mt-2">
                    Fix the errors above before you can solve the cube.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualInput; 