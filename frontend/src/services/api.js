import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API service functions
export const cubeAPI = {
  // Solve cube from color data
  solveCube: async (colors, mode = 'fast') => {
    try {
      const response = await api.post('/api/solve', { colors, mode });
      return response.data;
    } catch (error) {
      console.error('Solve cube error:', error);
      throw new Error(error.response?.data?.error || 'Failed to solve cube');
    }
  },

  // Upload and process image(s)
  // Accepts either a single File or an object mapping face keys to Files: { U,R,F,D,L,B }
  uploadImage: async (imageInput) => {
    try {
      const formData = new FormData();
      if (imageInput instanceof File) {
        formData.append('image', imageInput);
      } else if (imageInput && typeof imageInput === 'object') {
        const faces = ['U','R','F','D','L','B'];
        faces.forEach(face => {
          const file = imageInput[face];
          if (file instanceof File) {
            formData.append(`face_${face}`, file);
          }
        });
      } else {
        throw new Error('No image(s) provided');
      }

      const response = await api.post('/api/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Upload image error:', error);
      throw new Error(error.response?.data?.error || 'Failed to process image');
    }
  },

  // Get solving history
  getHistory: async () => {
    try {
      const response = await api.get('/api/history');
      return response.data;
    } catch (error) {
      console.error('Get history error:', error);
      // Return empty history instead of throwing error for better UX
      return { history: [] };
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw new Error('Backend server is not responding');
    }
  },
};

// Utility functions
export const generateSolvedCube = () => {
  // Generate a solved cube state (54 colors) in order U, R, F, D, L, B
  const colors = [];
  
  // U (Up) - White
  colors.push(...Array(9).fill('W'));
  
  // R (Right) - Orange
  colors.push(...Array(9).fill('O'));
  
  // F (Front) - Blue
  colors.push(...Array(9).fill('B'));
  
  // D (Down) - Yellow
  colors.push(...Array(9).fill('Y'));
  
  // L (Left) - Red
  colors.push(...Array(9).fill('R'));
  
  // B (Back) - Green
  colors.push(...Array(9).fill('G'));
  
  return colors;
};

export const generateScrambledCube = () => {
  // Generate a scrambled cube state for testing
  const colors = generateSolvedCube();
  
  // For now, just return the solved state
  // TODO: Implement actual scrambling logic
  
  return colors;
};

export const validateCubeState = (colors) => {
  if (!Array.isArray(colors) || colors.length !== 54) {
    return false;
  }
  const distinct = new Set(colors);
  if (distinct.size !== 6) return false;
  const counts = {};
  for (const c of colors) counts[c] = (counts[c] || 0) + 1;
  return Object.values(counts).every(n => n === 9);
};

export const validateCentersAndCounts = (colors) => {
  if (!Array.isArray(colors) || colors.length !== 54) {
    return { ok: false, error: 'Expected 54 stickers' };
  }
  const centerIdx = [4, 13, 22, 31, 40, 49];
  const centers = centerIdx.map(i => colors[i]);
  const centerSet = new Set(centers);
  if (centerSet.size !== 6) {
    return { ok: false, error: `Centers must be 6 distinct colors. Got: ${centers.join(', ')}` };
  }
  // Ensure all stickers belong to the center set
  for (const c of colors) {
    if (!centerSet.has(c)) {
      return { ok: false, error: `Sticker color ${c} not in center set ${Array.from(centerSet).join(', ')}` };
    }
  }
  // Ensure 9 of each center color
  const counts = {};
  for (const c of colors) counts[c] = (counts[c] || 0) + 1;
  for (const center of centerSet) {
    if (counts[center] !== 9) {
      return { ok: false, error: `Color ${center} count ${counts[center] || 0} != 9` };
    }
  }
  return { ok: true };
};

export const validateCubeStateDetailed = (colors) => {
  const errors = [];
  const warnings = [];
  
  // Basic structure validation
  if (!Array.isArray(colors) || colors.length !== 54) {
    return {
      isValid: false,
      errors: ['Cube must have exactly 54 stickers'],
      warnings: [],
      suggestions: ['Make sure you have filled in all 54 squares']
    };
  }

  // Check for valid colors
  const validColors = ['W', 'Y', 'R', 'O', 'B', 'G'];
  const invalidColors = colors.filter(c => !validColors.includes(c));
  if (invalidColors.length > 0) {
    errors.push(`Invalid colors found: ${invalidColors.join(', ')}`);
  }

  // Check center pieces (these should be unique and define the face colors)
  const centerIdx = [4, 13, 22, 31, 40, 49];
  const centers = centerIdx.map(i => colors[i]);
  const centerSet = new Set(centers);
  
  if (centerSet.size !== 6) {
    errors.push(`Each face must have a different center color. You have ${centerSet.size} different center colors instead of 6.`);
    errors.push(`Center colors found: ${centers.join(', ')}`);
  }

  // Check if all stickers match the center colors
  const invalidStickers = colors.filter(c => !centerSet.has(c));
  if (invalidStickers.length > 0) {
    errors.push(`Some stickers don't match your center colors. Check for stickers that aren't: ${Array.from(centerSet).join(', ')}`);
  }

  // Count each color
  const counts = {};
  for (const c of colors) counts[c] = (counts[c] || 0) + 1;
  
  // Check if each color appears exactly 9 times
  for (const color of validColors) {
    const count = counts[color] || 0;
    if (count !== 9) {
      if (count > 9) {
        errors.push(`Too many ${color} stickers: ${count} instead of 9`);
      } else if (count < 9) {
        errors.push(`Not enough ${color} stickers: ${count} instead of 9`);
      }
    }
  }

  // Check for impossible corner combinations
  const cornerIdx = [0, 2, 6, 8, 9, 11, 15, 17, 18, 20, 24, 26, 27, 29, 33, 35, 36, 38, 42, 44, 45, 47, 51, 53];
  const corners = cornerIdx.map(i => colors[i]);
  
  // Check for impossible edge combinations
  const edgeIdx = [1, 3, 5, 7, 10, 12, 14, 16, 19, 21, 23, 25, 28, 30, 32, 34, 37, 39, 41, 43, 46, 48, 50, 52];
  const edges = edgeIdx.map(i => colors[i]);

  // Check for impossible face patterns (like all white stickers on one face)
  const faceIndices = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8],      // Up
    [9, 10, 11, 12, 13, 14, 15, 16, 17], // Right
    [18, 19, 20, 21, 22, 23, 24, 25, 26], // Front
    [27, 28, 29, 30, 31, 32, 33, 34, 35], // Down
    [36, 37, 38, 39, 40, 41, 42, 43, 44], // Left
    [45, 46, 47, 48, 49, 50, 51, 52, 53]  // Back
  ];

  for (let i = 0; i < faceIndices.length; i++) {
    const face = faceIndices[i];
    const faceColors = face.map(idx => colors[idx]);
    const faceCenter = faceColors[4]; // Center of the face
    
    // Check if face has too many of the wrong color
    const wrongColorCount = faceColors.filter(c => c !== faceCenter).length;
    if (wrongColorCount > 4) { // Allow some mixed colors for realistic cube states
      warnings.push(`Face ${i + 1} (${faceCenter}) has many different colors - make sure this is correct`);
    }
  }

  // Provide helpful suggestions
  const suggestions = [];
  if (errors.length > 0) {
    suggestions.push('Check that each face has exactly 9 stickers');
    suggestions.push('Make sure the center sticker of each face is the main color of that face');
    suggestions.push('Count each color - you should have exactly 9 of each color');
    suggestions.push('Look for stickers that might be in the wrong place');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    colorCounts: counts,
    centerColors: centers
  };
};

export default api; 