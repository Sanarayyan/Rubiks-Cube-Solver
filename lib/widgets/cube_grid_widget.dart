import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cube_provider.dart';
import '../models/cube_state.dart';

class CubeGridWidget extends StatelessWidget {
  const CubeGridWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CubeProvider>(
      builder: (context, cubeProvider, child) {
        return GridView.builder(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 1.2,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
          ),
          itemCount: CubeProvider.faces.length,
          itemBuilder: (context, faceIndex) {
            final face = CubeProvider.faces[faceIndex];
            return _buildFaceGrid(context, faceIndex, face, cubeProvider);
          },
        );
      },
    );
  }
  
  Widget _buildFaceGrid(
    BuildContext context,
    int faceIndex,
    Map<String, String> face,
    CubeProvider cubeProvider,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        children: [
          Text(
            '${face['name']} (${face['color']})',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 2,
                mainAxisSpacing: 2,
              ),
              itemCount: 9,
              itemBuilder: (context, squareIndex) {
                return _buildColorSquare(
                  context,
                  faceIndex,
                  squareIndex,
                  cubeProvider,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildColorSquare(
    BuildContext context,
    int faceIndex,
    int squareIndex,
    CubeProvider cubeProvider,
  ) {
    final currentColor = cubeProvider.cubeState.getColor(faceIndex, squareIndex);
    final isCenter = squareIndex == 4;
    
    return GestureDetector(
      onTap: isCenter
          ? () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Center squares are locked and cannot be changed'),
                  duration: Duration(seconds: 2),
                ),
              );
            }
          : () {
              final currentIndex = CubeProvider.colors.indexOf(currentColor);
              final nextIndex = (currentIndex + 1) % CubeProvider.colors.length;
              final nextColor = CubeProvider.colors[nextIndex];
              cubeProvider.changeColor(faceIndex, squareIndex, nextColor);
            },
      child: Container(
        decoration: BoxDecoration(
          color: _getColorValue(currentColor),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: isCenter ? Colors.black : Colors.grey.shade400,
            width: isCenter ? 2 : 1,
          ),
          boxShadow: isCenter
              ? [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 2,
                    offset: const Offset(0, 1),
                  ),
                ]
              : null,
        ),
        child: isCenter
            ? Icon(
                Icons.lock,
                size: 12,
                color: Colors.grey.shade600,
              )
            : null,
      ),
    );
  }
  
  Color _getColorValue(String color) {
    switch (color) {
      case 'W':
        return Colors.white;
      case 'Y':
        return Colors.yellow.shade400;
      case 'R':
        return Colors.red.shade500;
      case 'O':
        return Colors.orange.shade500;
      case 'B':
        return Colors.blue.shade500;
      case 'G':
        return Colors.green.shade500;
      default:
        return Colors.grey.shade300;
    }
  }
}
