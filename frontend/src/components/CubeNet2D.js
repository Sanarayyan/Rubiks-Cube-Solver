import React from 'react';

const colorHex = {
  W: '#FFFFFF',
  Y: '#FACC15', // Yellow-400
  O: '#FB923C', // Orange-400
  R: '#F87171', // Red-400
  B: '#60A5FA', // Blue-400
  G: '#4ADE80', // Green-400
};

const Face = ({ faceIndex, cubeState, onCellClick, lockCenters = true, onCenterBlocked }) => {
  return (
    <div className="grid grid-cols-3 gap-1 p-1">
      {Array.from({ length: 9 }, (_, i) => {
        const color = cubeState[faceIndex * 9 + i];
        const isCenter = i === 4;
        return (
          <div
            key={i}
            onClick={() => {
              if (lockCenters && isCenter) {
                onCenterBlocked && onCenterBlocked();
                return;
              }
              onCellClick && onCellClick(faceIndex, i);
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
            style={{
              backgroundColor: colorHex[color] || '#334155',
              cursor: lockCenters && isCenter ? 'default' : 'pointer'
            }}
          >
            {lockCenters && isCenter && (
              <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
            )}
          </div>
        );
      })}
    </div>
  );
};

const CubeNet2D = ({ cubeState, onCellClick, lockCenters = true, onCenterBlocked }) => {
  return (
    <div className="flex flex-col items-center gap-1 scale-90 sm:scale-100">
      {/* Up face */}
      <div className="flex justify-center">
        <Face faceIndex={0} cubeState={cubeState} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
      </div>

      {/* Middle row: L, F, R, B */}
      <div className="flex items-center gap-1">
        <Face faceIndex={4} cubeState={cubeState} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
        <Face faceIndex={2} cubeState={cubeState} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
        <Face faceIndex={1} cubeState={cubeState} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
        <Face faceIndex={5} cubeState={cubeState} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
      </div>

      {/* Down face */}
      <div className="flex justify-center">
        <Face faceIndex={3} cubeState={cubeState} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
      </div>
    </div>
  );
};

export default CubeNet2D;
