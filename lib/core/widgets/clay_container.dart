import 'package:flutter/material.dart';
import '../theme.dart';

class ClayContainer extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final double borderRadius;
  final Color? surfaceColor;

  const ClayContainer({
    Key? key,
    required this.child,
    this.onTap,
    this.borderRadius = 20.0,
    this.surfaceColor,
  }) : super(key: key);

  @override
  State<ClayContainer> createState() => _ClayContainerState();
}

class _ClayContainerState extends State<ClayContainer> with SingleTickerProviderStateMixin {
  bool _isPressed = false;
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
      reverseDuration: const Duration(milliseconds: 100),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails details) {
    if (widget.onTap != null) {
      setState(() => _isPressed = true);
      _controller.forward();
    }
  }

  void _handleTapUp(TapUpDetails details) {
    if (widget.onTap != null) {
      setState(() => _isPressed = false);
      _controller.reverse();
      widget.onTap!();
    }
  }

  void _handleTapCancel() {
    if (widget.onTap != null) {
      setState(() => _isPressed = false);
      _controller.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    final baseColor = widget.surfaceColor ?? AppTheme.surfaceDark;
    
    // Create dark and light shadow colors based on the background to ensure it looks soft
    final darkShadow = Colors.black.withOpacity(0.5);
    final lightShadow = Colors.white.withOpacity(0.05);

    return GestureDetector(
      onTapDown: _handleTapDown,
      onTapUp: _handleTapUp,
      onTapCancel: _handleTapCancel,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 100),
          decoration: BoxDecoration(
            color: baseColor,
            borderRadius: BorderRadius.circular(widget.borderRadius),
            boxShadow: _isPressed
                ? [
                    // Pressed state: Inset shadow simulation
                    BoxShadow(
                      color: darkShadow,
                      offset: const Offset(2, 2),
                      blurRadius: 2,
                    ),
                  ]
                : [
                    // Unpressed state: Dual outer shadows
                    BoxShadow(
                      color: darkShadow,
                      offset: const Offset(6, 6),
                      blurRadius: 12,
                      spreadRadius: 1,
                    ),
                    BoxShadow(
                      color: lightShadow,
                      offset: const Offset(-4, -4),
                      blurRadius: 8,
                      spreadRadius: 1,
                    ),
                  ],
          ),
          child: widget.child,
        ),
      ),
    );
  }
}
