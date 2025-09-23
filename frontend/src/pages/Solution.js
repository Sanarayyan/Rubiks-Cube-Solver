import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Volume2, VolumeX, Clipboard, ArrowLeft } from 'lucide-react';
import Cube3D from '../components/Cube3D';
import MoveDiagram from '../components/MoveDiagram';

// Helper: facelet indices for each face
const FACE_INDICES = {
  U: [0,1,2,3,4,5,6,7,8],
  R: [9,10,11,12,13,14,15,16,17],
  F: [18,19,20,21,22,23,24,25,26],
  D: [27,28,29,30,31,32,33,34,35],
  L: [36,37,38,39,40,41,42,43,44],
  B: [45,46,47,48,49,50,51,52,53],
};

// Helper: move permutations (for 3x3 cube)
const MOVE_PERMUTATIONS = {
  // Each move is a function that takes a state and returns a new state
  R: state => rotateR(state),
  "R'": state => rotateR(state, true),
  R2: state => rotateR(rotateR(state)),
  L: state => rotateL(state),
  "L'": state => rotateL(state, true),
  L2: state => rotateL(rotateL(state)),
  U: state => rotateU(state),
  "U'": state => rotateU(state, true),
  U2: state => rotateU(rotateU(state)),
  D: state => rotateD(state),
  "D'": state => rotateD(state, true),
  D2: state => rotateD(rotateD(state)),
  F: state => rotateF(state),
  "F'": state => rotateF(state, true),
  F2: state => rotateF(rotateF(state)),
  B: state => rotateB(state),
  "B'": state => rotateB(state, true),
  B2: state => rotateB(rotateB(state)),
};

// --- Move implementation helpers ---
function rotateFace(face, state, clockwise = true) {
  // Rotates a face 90 degrees (clockwise or counterclockwise)
  const idx = FACE_INDICES[face];
  const newFace = [...state];
  if (clockwise) {
    newFace[idx[0]] = state[idx[6]];
    newFace[idx[1]] = state[idx[3]];
    newFace[idx[2]] = state[idx[0]];
    newFace[idx[3]] = state[idx[7]];
    newFace[idx[4]] = state[idx[4]];
    newFace[idx[5]] = state[idx[1]];
    newFace[idx[6]] = state[idx[8]];
    newFace[idx[7]] = state[idx[5]];
    newFace[idx[8]] = state[idx[2]];
  } else {
    newFace[idx[0]] = state[idx[2]];
    newFace[idx[1]] = state[idx[5]];
    newFace[idx[2]] = state[idx[8]];
    newFace[idx[3]] = state[idx[1]];
    newFace[idx[4]] = state[idx[4]];
    newFace[idx[5]] = state[idx[7]];
    newFace[idx[6]] = state[idx[0]];
    newFace[idx[7]] = state[idx[3]];
    newFace[idx[8]] = state[idx[6]];
  }
  return newFace;
}

function rotateR(state, prime = false) {
  let s = [...state];
  s = rotateFace('R', s, !prime);
  const map = !prime
    ? [
        [2, 20, 29, 51],
        [5, 23, 32, 48],
        [8, 26, 35, 45],
      ]
    : [
        [2, 51, 29, 20],
        [5, 48, 32, 23],
        [8, 45, 35, 26],
      ];
  const temp = [s[map[0][0]], s[map[1][0]], s[map[2][0]]];
  for (let i = 0; i < 3; i++) {
    s[map[i][0]] = s[map[i][1]];
    s[map[i][1]] = s[map[i][2]];
    s[map[i][2]] = s[map[i][3]];
    s[map[i][3]] = temp[i];
  }
  return s;
}
function rotateL(state, prime = false) {
  let s = [...state];
  s = rotateFace('L', s, !prime);
  const map = !prime
    ? [
        [0, 53, 27, 18],
        [3, 50, 30, 21],
        [6, 47, 33, 24],
      ]
    : [
        [0, 18, 27, 53],
        [3, 21, 30, 50],
        [6, 24, 33, 47],
      ];
  const temp = [s[map[0][0]], s[map[1][0]], s[map[2][0]]];
  for (let i = 0; i < 3; i++) {
    s[map[i][0]] = s[map[i][1]];
    s[map[i][1]] = s[map[i][2]];
    s[map[i][2]] = s[map[i][3]];
    s[map[i][3]] = temp[i];
  }
  return s;
}
function rotateU(state, prime = false) {
  let s = [...state];
  s = rotateFace('U', s, !prime);
  const map = !prime
    ? [
        [18, 9, 45, 36],
        [19, 10, 46, 37],
        [20, 11, 47, 38],
      ]
    : [
        [18, 36, 45, 9],
        [19, 37, 46, 10],
        [20, 38, 47, 11],
      ];
  const temp = [s[map[0][0]], s[map[1][0]], s[map[2][0]]];
  for (let i = 0; i < 3; i++) {
    s[map[i][0]] = s[map[i][1]];
    s[map[i][1]] = s[map[i][2]];
    s[map[i][2]] = s[map[i][3]];
    s[map[i][3]] = temp[i];
  }
  return s;
}
function rotateD(state, prime = false) {
  let s = [...state];
  s = rotateFace('D', s, !prime);
  const map = !prime
    ? [
        [24, 42, 51, 15],
        [25, 43, 52, 16],
        [26, 44, 53, 17],
      ]
    : [
        [24, 15, 51, 42],
        [25, 16, 52, 43],
        [26, 17, 53, 44],
      ];
  const temp = [s[map[0][0]], s[map[1][0]], s[map[2][0]]];
  for (let i = 0; i < 3; i++) {
    s[map[i][0]] = s[map[i][1]];
    s[map[i][1]] = s[map[i][2]];
    s[map[i][2]] = s[map[i][3]];
    s[map[i][3]] = temp[i];
  }
  return s;
}
function rotateF(state, prime = false) {
  let s = [...state];
  s = rotateFace('F', s, !prime);
  const map = !prime
    ? [
        [6, 9, 29, 44],
        [7, 12, 28, 41],
        [8, 15, 27, 38],
      ]
    : [
        [6, 44, 29, 9],
        [7, 41, 28, 12],
        [8, 38, 27, 15],
      ];
  const temp = [s[map[0][0]], s[map[1][0]], s[map[2][0]]];
  for (let i = 0; i < 3; i++) {
    s[map[i][0]] = s[map[i][1]];
    s[map[i][1]] = s[map[i][2]];
    s[map[i][2]] = s[map[i][3]];
    s[map[i][3]] = temp[i];
  }
  return s;
}
function rotateB(state, prime = false) {
  let s = [...state];
  s = rotateFace('B', s, !prime);
  const map = !prime
    ? [
        [2, 36, 33, 17],
        [1, 39, 34, 14],
        [0, 42, 35, 11],
      ]
    : [
        [2, 17, 33, 36],
        [1, 14, 34, 39],
        [0, 11, 35, 42],
      ];
  const temp = [s[map[0][0]], s[map[1][0]], s[map[2][0]]];
  for (let i = 0; i < 3; i++) {
    s[map[i][0]] = s[map[i][1]];
    s[map[i][1]] = s[map[i][2]];
    s[map[i][2]] = s[map[i][3]];
    s[map[i][3]] = temp[i];
  }
  return s;
}

// Helper to apply a single move to a cube state
function applyMove(cubeState, move) {
  if (!cubeState || cubeState.length !== 54) return cubeState;
  if (!move) return cubeState;
  const fn = MOVE_PERMUTATIONS[move];
  if (!fn) return cubeState;
  return fn(cubeState);
}

// Import the same move functions that Cube3D uses
// This ensures both components use the same move logic
function faceletsToCubies(facelets) {
  const cubies = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue; // skip center
        const faces = getCubieFaceMapping(x, y, z);
        const stickers = {};
        for (const f of faces) {
          const faceKey = ['U', 'R', 'F', 'D', 'L', 'B'][f.faceIndex];
          if (faceKey) stickers[faceKey] = facelets[f.faceIndex * 9 + f.faceletIndex];
        }
        cubies.push({x, y, z, stickers});
      }
    }
  }
  return cubies;
}

function getCubieFaceMapping(x, y, z) {
  const faces = [];
  if (y === 1) { const row = z + 1; const col = x + 1; faces.push({ faceIndex: 0, faceletIndex: row * 3 + col }); }
  if (y === -1) { const row = 1 - z; const col = x + 1; faces.push({ faceIndex: 3, faceletIndex: row * 3 + col }); }
  if (z === 1) { const row = 1 - y; const col = x + 1; faces.push({ faceIndex: 2, faceletIndex: row * 3 + col }); }
  if (z === -1) { const row = 1 - y; const col = 1 - x; faces.push({ faceIndex: 5, faceletIndex: row * 3 + col }); }
  if (x === 1) { const row = 1 - y; const col = 1 - z; faces.push({ faceIndex: 1, faceletIndex: row * 3 + col }); }
  if (x === -1) { const row = 1 - y; const col = z + 1; faces.push({ faceIndex: 4, faceletIndex: row * 3 + col }); }
  return faces;
}

function rotateLayerCubies(cubies, face, cw = true) {
  const rotated = cubies.map(c => ({...c, stickers: { ...c.stickers }}));
  const isAffected = (c) => (
    (face === 'R' && c.x === 1) || (face === 'L' && c.x === -1) ||
    (face === 'U' && c.y === 1) || (face === 'D' && c.y === -1) ||
    (face === 'F' && c.z === 1) || (face === 'B' && c.z === -1)
  );
  const rotPos = (c) => {
    let {x, y, z} = c;
    if (face === 'F' && z === 1) { const nx = cw ? y : -y; const ny = cw ? -x : x; return {x: nx, y: ny, z}; }
    if (face === 'B' && z === -1) { const nx = cw ? -y : y; const ny = cw ? x : -x; return {x: nx, y: ny, z}; }
    if (face === 'U' && y === 1) { const nx = cw ? -z : z; const nz = cw ? x : -x; return {x: nx, y, z: nz}; }
    if (face === 'D' && y === -1) { const nx = cw ? z : -z; const nz = cw ? -x : x; return {x: nx, y, z: nz}; }
    if (face === 'R' && x === 1) { const ny = cw ? z : -z; const nz = cw ? -y : y; return {x, y: ny, z: nz}; }
    if (face === 'L' && x === -1) { const ny = cw ? -z : z; const nz = cw ? y : -y; return {x, y: ny, z: nz}; }
    return {x, y, z};
  };
  const rotStickers = (s) => {
    const ns = { ...s };
    const cycle = (a, b, c, d) => {
      if (cw) { const tmp = ns[d]; ns[d] = ns[c]; ns[c] = ns[b]; ns[b] = ns[a]; ns[a] = tmp; }
      else { const tmp = ns[a]; ns[a] = ns[b]; ns[b] = ns[c]; ns[c] = ns[d]; ns[d] = tmp; }
    };
    if (face === 'F') cycle('U', 'R', 'D', 'L');
    if (face === 'B') cycle('U', 'L', 'D', 'R');
    if (face === 'U') cycle('F', 'R', 'B', 'L');
    if (face === 'D') cycle('F', 'L', 'B', 'R');
    if (face === 'R') cycle('U', 'B', 'D', 'F');
    if (face === 'L') cycle('U', 'F', 'D', 'B');
    return ns;
  };
  for (let i = 0; i < rotated.length; i++) {
    const c = rotated[i];
    if (!isAffected(c)) continue;
    const p = rotPos(c);
    const s = rotStickers(c.stickers);
    rotated[i] = { x: p.x, y: p.y, z: p.z, stickers: s };
  }
  return rotated;
}

function cubiesToFacelets(cubies) {
  const facelets = Array(54).fill('W'); // default; will be overwritten
  for (const c of cubies) {
    const faces = getCubieFaceMapping(c.x, c.y, c.z);
    for (const f of faces) {
      const faceKey = ['U', 'R', 'F', 'D', 'L', 'B'][f.faceIndex];
      if (faceKey) {
        const color = c.stickers[faceKey];
        if (color) facelets[f.faceIndex * 9 + f.faceletIndex] = color;
      }
    }
  }
  return facelets;
}

function applyMoveFacelets(state, move) {
  if (!move) return state;
  const cw = !move.includes("'");
  const twice = move.includes('2');
  const face = move[0];
  // Adjust cw for faces with negative normal (D, L, B) so that
  // the commit permutation matches the visual animation direction
  const isNegativeNormal = face === 'D' || face === 'L' || face === 'B';
  const cwEffective = isNegativeNormal ? !cw : cw;
  let cubies = faceletsToCubies(state);
  cubies = rotateLayerCubies(cubies, face, cwEffective);
  if (twice) cubies = rotateLayerCubies(cubies, face, cwEffective);
  return cubiesToFacelets(cubies);
}

// Updated applyMoves function that uses the same logic as Cube3D
function applyMoves(initialState, moves, upTo) {
  let state = [...initialState];
  for (let i = 0; i < upTo; i++) {
    state = applyMoveFacelets(state, moves[i]?.notation);
  }
  return state;
}

const Solution = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // milliseconds between moves
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  const solution = location.state?.solution;
  const initialCubeState = location.state?.cubeState;

  // Keep the live cube state, start from initial
  const [displayCubeState, setDisplayCubeState] = useState(initialCubeState);

  useEffect(() => {
    if (!solution) {
      navigate('/');
      return;
    }
  }, [solution, navigate]);

  const [pendingMove, setPendingMove] = useState(null);

  useEffect(() => {
    if (isPlaying && solution?.moves && !isAnimating) {
      setIsAnimating(true);
      setPendingMove(solution.moves[currentMoveIndex]?.notation);
    }
  }, [isPlaying, solution?.moves, isAnimating, currentMoveIndex]);

  // Check if cube is solved after each move
  useEffect(() => {
    if (displayCubeState && solution?.moves) {
      // Check if we've applied all moves
      const expectedSolvedState = applyMoves(initialCubeState, solution.moves, solution.moves.length);
      const isCurrentlySolved = JSON.stringify(displayCubeState) === JSON.stringify(expectedSolvedState);
      setIsSolved(isCurrentlySolved);
    }
  }, [displayCubeState, solution?.moves, initialCubeState]);

  const handleMoveDone = (nextFacelets) => {
    // Update the display cube state with the new facelets after the move
    if (nextFacelets) {
      setDisplayCubeState(nextFacelets);
    }
    
    setIsAnimating(false);
    setPendingMove(null);
    
    // If we're playing, move to the next move
    if (isPlaying) {
      if (currentMoveIndex < solution.moves.length - 1) {
        setCurrentMoveIndex(currentMoveIndex + 1);
      } else {
        // We've completed all moves - the cube should now be solved!
        setIsPlaying(false);
        // Show a success message or highlight that the cube is solved
      }
    }
  };

  const playPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextMove = () => {
    if (solution?.moves && currentMoveIndex < solution.moves.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setPendingMove(solution.moves[currentMoveIndex]?.notation);
      // The index will be incremented in handleMoveDone after the animation completes
    }
  };

  const previousMove = () => {
    if (currentMoveIndex > 0 && !isAnimating) {
      const newIndex = currentMoveIndex - 1;
      const newState = applyMoves(initialCubeState, solution.moves, newIndex + 1);
      setDisplayCubeState(newState);
      setCurrentMoveIndex(newIndex);
    }
  };

  const reset = () => {
    setCurrentMoveIndex(0);
    setIsPlaying(false);
    setIsAnimating(false);
    setPendingMove(null);
    setDisplayCubeState(initialCubeState);
  };

  const changeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
  };

  const handleMoveChange = (newIndex) => {
    if (!isAnimating) {
      const newState = applyMoves(initialCubeState, solution.moves, newIndex + 1);
      setDisplayCubeState(newState);
      setCurrentMoveIndex(newIndex);
    }
  };

  const currentMove = solution?.moves?.[currentMoveIndex];

  const copyFacelets = () => {
    try {
      const text = JSON.stringify(displayCubeState);
      navigator.clipboard.writeText(text);
      alert('Current facelets copied to clipboard');
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  if (!solution) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Solution Found</h1>
          <p className="text-gray-600 mb-4">Please go back and solve a cube first.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            3D Solution Viewer
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Watch the solution step by step with animated 3D cube
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* 3D Cube Viewer */}
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              3D Animated Cube
            </h2>
            <div className="h-[320px] sm:h-96 bg-white rounded-lg overflow-hidden relative">
              <Cube3D 
                cubeState={displayCubeState}
                animateMove={pendingMove}
                onMoveDone={handleMoveDone}
                durationMs={speed}
              />
              {isAnimating && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-lg font-semibold">
                    Animating: {currentMove?.notation}
                  </div>
                </div>
              )}
              {isSolved && (
                <div className="absolute inset-0 bg-green-500 bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-4xl font-bold">
                    Solved!
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video-like Controls */}
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Video Controls
            </h2>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Move {currentMoveIndex + 1} of {solution.moves.length}</span>
                <span>{Math.round(((currentMoveIndex + 1) / solution.moves.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 cursor-pointer relative" 
                   onClick={(e) => {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const clickX = e.clientX - rect.left;
                     const percentage = clickX / rect.width;
                     const newIndex = Math.floor(percentage * solution.moves.length);
                     handleMoveChange(Math.max(0, Math.min(newIndex, solution.moves.length - 1)));
                   }}>
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    isSolved ? 'bg-green-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${((currentMoveIndex + 1) / solution.moves.length) * 100}%` }}
                />
                {isSolved && (
                  <div className="absolute -top-8 right-0 text-xs text-green-600 font-semibold">
                    ✅ Complete!
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isSolved ? 'All moves completed - cube is solved!' : 'Solving in progress...'}
              </div>
            </div>

            {/* Current Move Display */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Current Move:</h3>
              <div className="text-2xl sm:text-3xl font-bold text-blue-800 mb-2">
                {currentMove?.notation || 'None'}
              </div>
              <p className="text-blue-700 text-sm">
                {currentMove?.description || ''}
              </p>
              {/* 2D move diagram */}
              {currentMove?.notation && (
                <div className="mt-4 flex justify-center">
                  <MoveDiagram notation={currentMove.notation} />
                </div>
              )}
              <div className="mt-3 flex justify-center">
                <button onClick={copyFacelets} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300">
                  <Clipboard className="w-4 h-4" /> Copy current 54 facelets
                </button>
              </div>
            </div>

            {/* Solved Status */}
            {isSolved && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎉</div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Cube Solved!</h3>
                  <p className="text-green-700">
                    Congratulations! Your cube is now completely solved.
                  </p>
                </div>
              </div>
            )}

            {/* Video Controls */}
            <div className="space-y-4">
              {/* Main Controls */}
              <div className="flex justify-center items-center gap-3 sm:gap-4">
                <button
                  onClick={previousMove}
                  disabled={currentMoveIndex === 0 || isAnimating}
                  className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
                
                <button
                  onClick={playPause}
                  disabled={isAnimating}
                  className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors active:scale-95"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </button>
                
                <button
                  onClick={nextMove}
                  disabled={currentMoveIndex >= solution.moves.length - 1 || isAnimating}
                  className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
                
                <button
                  onClick={reset}
                  disabled={isAnimating}
                  className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
              </div>

              {/* Speed Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Playback Speed: {speed}ms
                </label>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="500"
                  value={speed}
                  onChange={(e) => changeSpeed(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Fast</span>
                  <span>Slow</span>
                </div>
              </div>

              {/* Time Display */}
              <div className="text-center text-sm text-gray-600">
                <span>{Math.floor(currentMoveIndex * speed / 1000)}s</span>
                <span className="mx-2">/</span>
                <span>{Math.floor(solution.moves.length * speed / 1000)}s</span>
              </div>
            </div>

            {/* Solution Summary */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Solution Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700">Total Moves:</span>
                  <span className="font-semibold ml-2">{solution.moves.length}</span>
                </div>
                <div>
                  <span className="text-green-700">Estimated Time:</span>
                  <span className="font-semibold ml-2">{solution.estimatedTime}s</span>
                </div>
                <div>
                  <span className="text-green-700">Difficulty:</span>
                  <span className="font-semibold ml-2">{solution.difficulty}</span>
                </div>
                <div>
                  <span className="text-green-700">Method:</span>
                  <span className="font-semibold ml-2">{solution.solvingMethod}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Move Timeline */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Move Timeline
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {solution.moves.map((move, index) => (
              <button
                key={index}
                onClick={() => handleMoveChange(index)}
                disabled={isAnimating}
                className={`
                  p-3 rounded-lg text-center transition-all duration-200
                  ${index === currentMoveIndex 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                  ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="font-bold">{index + 1}</div>
                <div className="text-sm">{move.notation}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solution; 