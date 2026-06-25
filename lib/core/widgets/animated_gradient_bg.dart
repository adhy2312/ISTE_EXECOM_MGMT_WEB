import 'package:flutter/material.dart';
import 'dart:math' as math;

class AnimatedGradientBg extends StatefulWidget {
  final Widget child;

  const AnimatedGradientBg({Key? key, required this.child}) : super(key: key);

  @override
  State<AnimatedGradientBg> createState() => _AnimatedGradientBgState();
}

class _AnimatedGradientBgState extends State<AnimatedGradientBg> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    // A slow, continuous 10-second animation loop
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 15),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Stack(
          children: [
            // Base dark background
            Container(color: const Color(0xFF0F172A)),
            
            // Rotating Mesh Orb 1 (Top Left)
            Positioned(
              left: -100 + (math.sin(_controller.value * 2 * math.pi) * 50),
              top: -100 + (math.cos(_controller.value * 2 * math.pi) * 50),
              child: _buildOrb(const Color(0xFF3B82F6).withOpacity(0.4), 400),
            ),
            
            // Rotating Mesh Orb 2 (Bottom Right)
            Positioned(
              right: -100 + (math.cos(_controller.value * 2 * math.pi) * 50),
              bottom: -100 + (math.sin(_controller.value * 2 * math.pi) * 50),
              child: _buildOrb(const Color(0xFF06B6D4).withOpacity(0.3), 500),
            ),

            // Rotating Mesh Orb 3 (Center moving)
            Positioned(
              left: MediaQuery.of(context).size.width / 2 - 150 + (math.sin(_controller.value * math.pi) * 100),
              top: MediaQuery.of(context).size.height / 2 - 150 + (math.cos(_controller.value * math.pi) * 100),
              child: _buildOrb(const Color(0xFF8B5CF6).withOpacity(0.2), 300),
            ),

            // App Content Layer
            SafeArea(child: widget.child),
          ],
        );
      },
      child: widget.child,
    );
  }

  Widget _buildOrb(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            color,
            color.withOpacity(0.0),
          ],
        ),
      ),
    );
  }
}
