import 'dart:math';
import '../models/cube_state.dart';
import '../models/solution.dart';

class CubeSolverService {
  static const String baseUrl = 'http://localhost:8081'; // Backend URL
  
  Future<Solution?> solveCube(CubeState cubeState, String mode) async {
    try {
      // For now, return a mock solution since we don't have the backend running
      // In production, this would make an HTTP request to your backend
      return _generateMockSolution(cubeState, mode);
      
      // Uncomment this when backend is available:
      /*
      final response = await http.post(
        Uri.parse('$baseUrl/solve'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'cubeState': cubeState.state,
          'mode': mode,
        }),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Solution.fromJson(data);
      } else {
        throw Exception('Failed to solve cube: ${response.statusCode}');
      }
      */
    } catch (e) {
      throw Exception('Error solving cube: $e');
    }
  }
  
  // Mock solution generator for testing
  Solution _generateMockSolution(CubeState cubeState, String mode) {
    final random = Random();
    final moveCount = mode == 'beginner' ? 15 + random.nextInt(10) : 8 + random.nextInt(5);
    
    final moves = <Move>[];
    final notations = ['R', 'L', 'U', 'D', 'F', 'B', 'R\'', 'L\'', 'U\'', 'D\'', 'F\'', 'B\'', 'R2', 'L2', 'U2', 'D2', 'F2', 'B2'];
    
    for (int i = 0; i < moveCount; i++) {
      final notation = notations[random.nextInt(notations.length)];
      moves.add(Move(
        notation: notation,
        description: _getMoveDescription(notation),
        hand: mode == 'beginner' ? _getRandomHand() : null,
        grip: mode == 'beginner' ? _getRandomGrip() : null,
        tip: mode == 'beginner' && random.nextBool() ? _getRandomTip() : null,
      ));
    }
    
    return Solution(
      moves: moves,
      orientationBaseline: 'Hold the cube with white on top and blue in front',
      estimatedTime: mode == 'beginner' ? 120 + random.nextInt(60) : 30 + random.nextInt(20),
      algorithm: 'CFOP',
    );
  }
  
  String _getMoveDescription(String notation) {
    const descriptions = {
      'R': 'Turn the right face clockwise',
      'L': 'Turn the left face clockwise', 
      'U': 'Turn the top face clockwise',
      'D': 'Turn the bottom face clockwise',
      'F': 'Turn the front face clockwise',
      'B': 'Turn the back face clockwise',
      'R\'': 'Turn the right face counter-clockwise',
      'L\'': 'Turn the left face counter-clockwise',
      'U\'': 'Turn the top face counter-clockwise',
      'D\'': 'Turn the bottom face counter-clockwise',
      'F\'': 'Turn the front face counter-clockwise',
      'B\'': 'Turn the back face counter-clockwise',
      'R2': 'Turn the right face 180 degrees',
      'L2': 'Turn the left face 180 degrees',
      'U2': 'Turn the top face 180 degrees',
      'D2': 'Turn the bottom face 180 degrees',
      'F2': 'Turn the front face 180 degrees',
      'B2': 'Turn the back face 180 degrees',
    };
    return descriptions[notation] ?? 'Turn face';
  }
  
  String _getRandomHand() {
    const hands = ['Right', 'Left', 'Both'];
    return hands[Random().nextInt(hands.length)];
  }
  
  String _getRandomGrip() {
    const grips = ['Standard', 'Thumb on top', 'Finger grip', 'Palm grip'];
    return grips[Random().nextInt(grips.length)];
  }
  
  String _getRandomTip() {
    const tips = [
      'Keep your fingers close to the cube',
      'Use your thumb for support',
      'Turn smoothly, not jerky',
      'Practice this move slowly first',
    ];
    return tips[Random().nextInt(tips.length)];
  }
}
