class CubeState {
  final List<String> _state;
  
  CubeState(this._state) {
    if (_state.length != 54) {
      throw ArgumentError('Cube state must have exactly 54 stickers');
    }
  }
  
  // Create a solved cube
  factory CubeState.solved() {
    return CubeState([
      // Top face (White)
      'W', 'W', 'W',
      'W', 'W', 'W', 
      'W', 'W', 'W',
      // Right face (Orange)
      'O', 'O', 'O',
      'O', 'O', 'O',
      'O', 'O', 'O',
      // Front face (Blue)
      'B', 'B', 'B',
      'B', 'B', 'B',
      'B', 'B', 'B',
      // Bottom face (Yellow)
      'Y', 'Y', 'Y',
      'Y', 'Y', 'Y',
      'Y', 'Y', 'Y',
      // Left face (Red)
      'R', 'R', 'R',
      'R', 'R', 'R',
      'R', 'R', 'R',
      // Back face (Green)
      'G', 'G', 'G',
      'G', 'G', 'G',
      'G', 'G', 'G',
    ]);
  }
  
  // Copy constructor
  CubeState copyWith() {
    return CubeState(List.from(_state));
  }
  
  // Get color at specific position
  String getColor(int faceIndex, int squareIndex) {
    final globalIndex = faceIndex * 9 + squareIndex;
    return _state[globalIndex];
  }
  
  // Set color at specific position
  void setColor(int faceIndex, int squareIndex, String color) {
    final globalIndex = faceIndex * 9 + squareIndex;
    _state[globalIndex] = color;
  }
  
  // Get the entire state as a list
  List<String> get state => List.unmodifiable(_state);
  
  // Get state for a specific face
  List<String> getFaceState(int faceIndex) {
    final startIndex = faceIndex * 9;
    return _state.sublist(startIndex, startIndex + 9);
  }
  
  // Validate cube state
  ValidationResult validate() {
    final errors = <String>[];
    final warnings = <String>[];
    final suggestions = <String>[];
    
    // Check if we have exactly 54 stickers
    if (_state.length != 54) {
      errors.add('Cube must have exactly 54 stickers');
      return ValidationResult(false, errors, warnings, suggestions, {});
    }
    
    // Check for valid colors
    const validColors = ['W', 'Y', 'R', 'O', 'B', 'G'];
    final invalidColors = _state.where((color) => !validColors.contains(color)).toSet();
    if (invalidColors.isNotEmpty) {
      errors.add('Invalid colors found: ${invalidColors.join(', ')}');
    }
    
    // Count colors
    final colorCounts = <String, int>{};
    for (final color in _state) {
      colorCounts[color] = (colorCounts[color] ?? 0) + 1;
    }
    
    // Check if each color appears exactly 9 times
    for (final color in validColors) {
      final count = colorCounts[color] ?? 0;
      if (count != 9) {
        if (count > 9) {
          errors.add('Too many $color stickers: $count instead of 9');
        } else {
          errors.add('Not enough $color stickers: $count instead of 9');
        }
      }
    }
    
    // Check center colors are different
    final centerColors = <String>[];
    for (int i = 0; i < 6; i++) {
      centerColors.add(getColor(i, 4)); // Center is always index 4
    }
    
    if (centerColors.toSet().length != 6) {
      errors.add('Each face must have a different center color');
    }
    
    // Check that stickers match their center color
    for (int faceIndex = 0; faceIndex < 6; faceIndex++) {
      final centerColor = getColor(faceIndex, 4);
      for (int squareIndex = 0; squareIndex < 9; squareIndex++) {
        final stickerColor = getColor(faceIndex, squareIndex);
        if (stickerColor != centerColor) {
          errors.add('Some stickers don\'t match their center colors');
          break;
        }
      }
      if (errors.isNotEmpty && errors.last.contains('Some stickers don\'t match')) {
        break;
      }
    }
    
    return ValidationResult(
      errors.isEmpty,
      errors,
      warnings,
      suggestions,
      colorCounts,
    );
  }
}

class ValidationResult {
  final bool isValid;
  final List<String> errors;
  final List<String> warnings;
  final List<String> suggestions;
  final Map<String, int> colorCounts;
  
  ValidationResult(this.isValid, this.errors, this.warnings, this.suggestions, this.colorCounts);
}
