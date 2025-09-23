import React from 'react';

// Color map matching our scheme (U=W, D=Y, R=R, L=O, F=B, B=G)
const colorHex = {
  W: '#FFFFFF',
  Y: '#FFD500',
  O: '#FF5800',
  R: '#C41E3A',
  B: '#0051BA',
  G: '#009E60',
};

// Face indices: U0, R1, F2, D3, L4, B5

// Helper to render one 3x3 face at a grid position
function Face({ title, faceIndex, cubeState, startCol, startRow, onCellClick, lockCenters = true, onCenterBlocked }) {
  const cells = [];
  for (let i = 0; i < 9; i++) {
    const color = cubeState[faceIndex * 9 + i];
    const bg = colorHex[color] || '#222';
    const r = Math.floor(i / 3);
    const c = i % 3;
    const isCenter = i === 4;
    cells.push(
      <div
        key={i}
        onClick={() => {
          if (lockCenters && isCenter) {
            onCenterBlocked && onCenterBlocked();
            return;
          }
          onCellClick && onCellClick(faceIndex, i);
        }}
        style={{
          gridColumn: startCol + c,
          gridRow: startRow + r,
          background: bg,
          border: '2px solid #000',
          width: '100%',
          height: '100%',
          cursor: lockCenters && isCenter ? 'not-allowed' : 'pointer',
        }}
        title={`${title} (${color})${lockCenters && isCenter ? ' (center locked)' : ''}`}
      />
    );
  }
  return cells;
}

const CubeNet2D = ({ cubeState, onCellClick, lockCenters = true, onCenterBlocked }) => {
  // Grid is 12 columns x 9 rows of unit stickers; each sticker cell is square via aspect in parent
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: 'repeat(9, 1fr)',
        gap: '2px',
        background: '#e0e0e0',
        width: '100%',
        height: '100%',
        padding: '8px',
        boxSizing: 'border-box',
      }}
    >
      {/* U on top center (cols 4-6, rows 1-3) */}
      <Face title="Up" faceIndex={0} cubeState={cubeState} startCol={4} startRow={1} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
      {/* L, F, R, B in middle row (rows 4-6) */}
      <Face title="Left" faceIndex={4} cubeState={cubeState} startCol={1} startRow={4} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
      <Face title="Front" faceIndex={2} cubeState={cubeState} startCol={4} startRow={4} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
      <Face title="Right" faceIndex={1} cubeState={cubeState} startCol={7} startRow={4} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
      <Face title="Back" faceIndex={5} cubeState={cubeState} startCol={10} startRow={4} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
      {/* D at bottom center (cols 4-6, rows 7-9) */}
      <Face title="Down" faceIndex={3} cubeState={cubeState} startCol={4} startRow={7} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
    </div>
  );
};

export default CubeNet2D;
