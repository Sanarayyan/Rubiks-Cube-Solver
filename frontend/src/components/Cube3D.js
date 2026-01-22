import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import LoadingSpinner from './LoadingSpinner';

// Real-life Rubik's Cube colors (Left=Red, Right=Orange)
const colorMap = {
  W: '#FFFFFF', // Up
  Y: '#FFD500', // Down
  R: '#C41E3A', // Left (Red)
  O: '#FF5800', // Right (Orange)
  B: '#0051BA', // Front (Blue)
  G: '#009E60', // Back (Green)
};

// Accept both color-letter and face-letter inputs; normalize to a hex color
function resolveStickerColor(symbol) {
  if (!symbol) return '#222';
  const s = String(symbol).toUpperCase().trim();
  // Already a direct hex color like #RRGGBB
  if (/^#([0-9A-F]{3}){1,2}$/.test(s)) return s;
  // If provided as face letters, map to color letters per scheme (L=Red, R=Orange)
  const faceToColor = { U: 'W', D: 'Y', R: 'O', L: 'R', F: 'B', B: 'G' };
  const normalized = colorMap[s] ? s : faceToColor[s] || s;
  return colorMap[normalized] || '#222';
}

// Local face index helpers (U,R,F,D,L,B)
const FACE = { U: 0, R: 1, F: 2, D: 3, L: 4, B: 5 };

// Facelet permutation helpers (must match Solution.js)
// Note: rotateFacelets function removed as it's not used in this component

// Replace applyMoveFacelets implementation with cubie-based
function cubiesToFacelets(cubies) {
  const facelets = Array(54).fill('W'); // default; will be overwritten
  for (const c of cubies) {
    const faces = getCubieFaceMapping(c.x, c.y, c.z);
    for (const f of faces) {
      const faceKey = Object.keys(FACE).find(k => FACE[k] === f.faceIndex);
      const color = c.stickers[faceKey];
      if (color) facelets[f.faceIndex * 9 + f.faceletIndex] = color;
    }
  }
  return facelets;
}

function rotateLayerCubies(cubies, face, cw = true) {
  const rotated = cubies.map(c => ({ ...c, stickers: { ...c.stickers } }));
  const isAffected = (c) => (
    (face === 'R' && c.x === 1) || (face === 'L' && c.x === -1) ||
    (face === 'U' && c.y === 1) || (face === 'D' && c.y === -1) ||
    (face === 'F' && c.z === 1) || (face === 'B' && c.z === -1)
  );
  const rotPos = (c) => {
    let { x, y, z } = c;
    if (face === 'F' && z === 1) { const nx = cw ? y : -y; const ny = cw ? -x : x; return { x: nx, y: ny, z }; }
    if (face === 'B' && z === -1) { const nx = cw ? -y : y; const ny = cw ? x : -x; return { x: nx, y: ny, z }; }
    if (face === 'U' && y === 1) { const nx = cw ? -z : z; const nz = cw ? x : -x; return { x: nx, y, z: nz }; }
    if (face === 'D' && y === -1) { const nx = cw ? z : -z; const nz = cw ? -x : x; return { x: nx, y, z: nz }; }
    if (face === 'R' && x === 1) { const ny = cw ? z : -z; const nz = cw ? -y : y; return { x, y: ny, z: nz }; }
    if (face === 'L' && x === -1) { const ny = cw ? -z : z; const nz = cw ? y : -y; return { x, y: ny, z: nz }; }
    return { x, y, z };
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

// Build cubies from facelets using mapping
function getCubieFaceMapping(x, y, z) {
  const faces = [];
  if (y === 1) { const row = z + 1; const col = x + 1; faces.push({ faceIndex: FACE.U, faceletIndex: row * 3 + col }); }
  if (y === -1) { const row = 1 - z; const col = x + 1; faces.push({ faceIndex: FACE.D, faceletIndex: row * 3 + col }); }
  if (z === 1) { const row = 1 - y; const col = x + 1; faces.push({ faceIndex: FACE.F, faceletIndex: row * 3 + col }); }
  if (z === -1) { const row = 1 - y; const col = 1 - x; faces.push({ faceIndex: FACE.B, faceletIndex: row * 3 + col }); }
  if (x === 1) { const row = 1 - y; const col = 1 - z; faces.push({ faceIndex: FACE.R, faceletIndex: row * 3 + col }); }
  if (x === -1) { const row = 1 - y; const col = z + 1; faces.push({ faceIndex: FACE.L, faceletIndex: row * 3 + col }); }
  return faces;
}

// Convert facelets to cubies
function faceletsToCubies(facelets) {
  const cubies = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    if (x === 0 && y === 0 && z === 0) continue; // skip center
    const faces = getCubieFaceMapping(x, y, z);
    const stickers = {};
    for (const f of faces) {
      const faceKey = Object.keys(FACE).find(k => FACE[k] === f.faceIndex);
      if (faceKey) stickers[faceKey] = facelets[f.faceIndex * 9 + f.faceletIndex];
    }
    cubies.push({ x, y, z, stickers });
  }
  return cubies;
}

// Sticker rendering
const Sticker = ({ position, rotation, color, onClick, isCenter, onCenterBlocked, lockCenters }) => (
  <mesh position={position} rotation={rotation} onClick={() => {
    if (lockCenters && isCenter) { onCenterBlocked && onCenterBlocked(); return; }
    onClick && onClick();
  }}>
    <planeGeometry args={[0.82, 0.82]} />
    <meshBasicMaterial color={resolveStickerColor(color)} />
  </mesh>
);

// Individual cubie component
const Cubie = ({ x, y, z, facelets, onStickerClick, lockCenters = false, onCenterBlocked }) => {
  if (x === 0 && y === 0 && z === 0) return null;
  const faces = getCubieFaceMapping(x, y, z);
  const stickers = faces.map((f, i) => {
    let pos; let rot = [0, 0, 0];
    switch (f.faceIndex) {
      case FACE.U: pos = [0, 0.51, 0]; rot = [-Math.PI / 2, 0, 0]; break;
      case FACE.R: pos = [0.51, 0, 0]; rot = [0, Math.PI / 2, 0]; break;
      case FACE.F: pos = [0, 0, 0.51]; rot = [0, 0, 0]; break;
      case FACE.D: pos = [0, -0.51, 0]; rot = [Math.PI / 2, 0, 0]; break;
      case FACE.L: pos = [-0.51, 0, 0]; rot = [0, -Math.PI / 2, 0]; break;
      case FACE.B: pos = [0, 0, -0.51]; rot = [0, Math.PI, 0]; break;
      default: pos = [0, 0, 0];
    }
    const color = facelets[f.faceIndex * 9 + f.faceletIndex];
    const isCenter = f.faceletIndex === 4;
    const handleClick = () => {
      if (onStickerClick) onStickerClick(f.faceIndex, f.faceletIndex);
    };
    return <Sticker key={i} position={pos} rotation={rot} color={colorMap[color] || '#222'} onClick={handleClick} isCenter={isCenter} onCenterBlocked={onCenterBlocked} lockCenters={lockCenters} />;
  });
  return (
    <group position={[x, y, z]}>
      <mesh><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="#000000" /></mesh>
      {stickers}
    </group>
  );
};

// Parse move notation to get animation parameters
function getAxisAndLayer(move) {
  if (!move) return null;
  const face = move[0];
  const prime = move.includes("'");
  const twice = move.includes('2');
  const quarter = Math.PI / 2;
  const angle = twice ? Math.PI : quarter;
  switch (face) {
    case 'U': return { axis: [0, 1, 0], layer: 1, clockwise: !prime, angle, normalSign: +1 };
    case 'D': return { axis: [0, -1, 0], layer: -1, clockwise: !prime, angle, normalSign: -1 };
    case 'R': return { axis: [1, 0, 0], layer: 1, clockwise: !prime, angle, normalSign: +1 };
    case 'L': return { axis: [-1, 0, 0], layer: -1, clockwise: !prime, angle, normalSign: -1 };
    case 'F': return { axis: [0, 0, 1], layer: 1, clockwise: !prime, angle, normalSign: +1 };
    case 'B': return { axis: [0, 0, -1], layer: -1, clockwise: !prime, angle, normalSign: -1 };
    default: return null;
  }
}

const AnimatedLayer = ({ children, axis, clockwise, angleTarget, durationMs = 800, normalSign = +1, onDone }) => {
  const ref = useRef();
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);
  useFrame((_, delta) => {
    if (!ref.current || doneRef.current) return;
    const duration = Math.max(durationMs, 100) / 1000;
    const speed = angleTarget / duration;
    const next = Math.min(progress + speed * delta, angleTarget);
    const cwDir = clockwise ? -normalSign : normalSign;
    ref.current.rotation.x = axis[0] ? cwDir * next * Math.sign(axis[0]) : 0;
    ref.current.rotation.y = axis[1] ? cwDir * next * Math.sign(axis[1]) : 0;
    ref.current.rotation.z = axis[2] ? cwDir * next * Math.sign(axis[2]) : 0;
    setProgress(next);
    if (next >= angleTarget && !doneRef.current) {
      doneRef.current = true;
      if (onDone) onDone();
    }
  });
  return <group ref={ref}>{children}</group>;
};

const RingHint = ({ axis, layer }) => {
  let position = [0, 0, 0]; let rotation = [0, 0, 0];
  if (axis[1]) { position = [0, layer * 0.51, 0]; rotation = [0, 0, 0]; }
  else if (axis[0]) { position = [layer * 0.51, 0, 0]; rotation = [0, 0, Math.PI / 2]; }
  else if (axis[2]) { position = [0, 0, layer * 0.51]; rotation = [Math.PI / 2, 0, 0]; }
  return (<mesh position={position} rotation={rotation}><torusGeometry args={[0.9, 0.02, 8, 64]} /><meshBasicMaterial color="#22c55e" /></mesh>);
};

const RubiksCube = ({ facelets, onStickerClick, animateMove, onCommit, durationMs, lockCenters = false, onCenterBlocked }) => {
  // internal split of static vs animated by current move
  const all = useMemo(() => {
    const arr = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) if (!(x === 0 && y === 0 && z === 0)) arr.push({ x, y, z });
    return arr;
  }, []);
  const anim = getAxisAndLayer(animateMove);
  const [staticCubies, animatedCubies] = useMemo(() => {
    if (!anim) return [all, []];
    const affected = all.filter(c => (anim.axis[0] && c.x === anim.layer) || (anim.axis[1] && c.y === anim.layer) || (anim.axis[2] && c.z === anim.layer));
    const others = all.filter(c => !affected.includes(c));
    return [others, affected];
  }, [all, anim]);
  const angleTarget = anim?.angle || 0;
  return (
    <group>
      {staticCubies.map((c, i) => (<Cubie key={`s-${i}`} x={c.x} y={c.y} z={c.z} facelets={facelets} onStickerClick={onStickerClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />))}
      {anim && (
        <AnimatedLayer key={`${animateMove || 'none'}`} axis={anim.axis} clockwise={anim.clockwise} angleTarget={angleTarget} durationMs={durationMs} normalSign={anim.normalSign} onDone={onCommit}>
          {animatedCubies.map((c, i) => (<Cubie key={`a-${i}`} x={c.x} y={c.y} z={c.z} facelets={facelets} onStickerClick={onStickerClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />))}
        </AnimatedLayer>
      )}
      {anim && <RingHint axis={anim.axis} layer={anim.layer} />}
    </group>
  );
};

const Cube3D = ({ cubeState, onStickerClick, animateMove, onMoveDone, durationMs = 800, lockCenters = false, autoRotate = false }) => {
  // internal facelets that get committed after each move
  const [facelets, setFacelets] = useState(cubeState);
  // sync when external cubeState changes and no current animation
  useEffect(() => { setFacelets(cubeState); }, [cubeState]);

  const handleCommit = () => {
    if (!animateMove) { onMoveDone && onMoveDone(facelets); return; }
    const next = applyMoveFacelets(facelets, animateMove);
    setFacelets(next);
    onMoveDone && onMoveDone(next);
  };

  return (
    <div className="w-full h-full min-h-[300px] sm:min-h-[360px] md:min-h-[400px]">
      <Suspense fallback={<LoadingSpinner size="md" text="Loading 3D cube..." />}>
        <Canvas
          camera={{ position: [5, 5, 5], fov: 45 }}
          gl={{ powerPreference: 'high-performance', antialias: true, alpha: true }}
          dpr={[1, 2]}
          style={{ background: 'transparent' }}
          frameloop="always"
        >
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <RubiksCube facelets={facelets} onStickerClick={onStickerClick} animateMove={animateMove} onCommit={handleCommit} durationMs={durationMs} lockCenters={lockCenters} />
          <OrbitControls enablePan={false} enableZoom={false} enableRotate={true} autoRotate={autoRotate} autoRotateSpeed={1.0} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 4} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Cube3D; 