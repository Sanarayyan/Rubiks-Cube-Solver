import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cube_provider.dart';
import '../widgets/cube_grid_widget.dart';
import '../widgets/solution_display_widget.dart';

class ManualInputScreen extends StatefulWidget {
  const ManualInputScreen({super.key});

  @override
  State<ManualInputScreen> createState() => _ManualInputScreenState();
}

class _ManualInputScreenState extends State<ManualInputScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manual Cube Input'),
        backgroundColor: Colors.blue.shade600,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.blue.shade50,
              Colors.indigo.shade100,
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                // Mode selection
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Solving Mode',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Consumer<CubeProvider>(
                        builder: (context, cubeProvider, child) {
                          return Row(
                            children: [
                              Expanded(
                                child: _buildModeButton(
                                  context,
                                  'Pro',
                                  'fast',
                                  cubeProvider.mode == 'fast',
                                  Colors.purple,
                                  () => cubeProvider.setMode('fast'),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildModeButton(
                                  context,
                                  'Beginner',
                                  'beginner',
                                  cubeProvider.mode == 'beginner',
                                  Colors.green,
                                  () => cubeProvider.setMode('beginner'),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // Input mode selection
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Input Mode',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Consumer<CubeProvider>(
                        builder: (context, cubeProvider, child) {
                          return Row(
                            children: [
                              Expanded(
                                child: _buildModeButton(
                                  context,
                                  'Grid',
                                  'grid',
                                  cubeProvider.inputMode == 'grid',
                                  Colors.pink,
                                  () => cubeProvider.setInputMode('grid'),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: _buildModeButton(
                                  context,
                                  'Net',
                                  'net',
                                  cubeProvider.inputMode == 'net',
                                  Colors.orange,
                                  () => cubeProvider.setInputMode('net'),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: _buildModeButton(
                                  context,
                                  '3D',
                                  '3d',
                                  cubeProvider.inputMode == '3d',
                                  Colors.blue,
                                  () => cubeProvider.setInputMode('3d'),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // Cube input area
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Consumer<CubeProvider>(
                      builder: (context, cubeProvider, child) {
                        return Column(
                          children: [
                            Text(
                              'Cube Configuration',
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Expanded(
                              child: cubeProvider.inputMode == 'grid'
                                  ? const CubeGridWidget()
                                  : cubeProvider.inputMode == 'net'
                                      ? const Center(
                                          child: Text('Net view coming soon!'),
                                        )
                                      : const Center(
                                          child: Text('3D view coming soon!'),
                                        ),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton.icon(
                                    onPressed: () => cubeProvider.resetCube(),
                                    icon: const Icon(Icons.refresh),
                                    label: const Text('Reset'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.grey.shade600,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Consumer<CubeProvider>(
                                    builder: (context, cubeProvider, child) {
                                      return ElevatedButton.icon(
                                        onPressed: cubeProvider.isLoading
                                            ? null
                                            : () => cubeProvider.solveCube(),
                                        icon: cubeProvider.isLoading
                                            ? const SizedBox(
                                                width: 16,
                                                height: 16,
                                                child: CircularProgressIndicator(
                                                  strokeWidth: 2,
                                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                                ),
                                              )
                                            : const Icon(Icons.play_arrow),
                                        label: Text(
                                          cubeProvider.isLoading ? 'Solving...' : 'Solve Cube',
                                        ),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.blue.shade600,
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(vertical: 12),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // Solution display
                Consumer<CubeProvider>(
                  builder: (context, cubeProvider, child) {
                    if (cubeProvider.solution != null) {
                      return SolutionDisplayWidget(solution: cubeProvider.solution!);
                    }
                    return const SizedBox.shrink();
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
  
  Widget _buildModeButton(
    BuildContext context,
    String title,
    String value,
    bool isSelected,
    Color color,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: isSelected ? color : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? color : Colors.grey.shade300,
            width: 2,
          ),
        ),
        child: Text(
          title,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey.shade700,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
