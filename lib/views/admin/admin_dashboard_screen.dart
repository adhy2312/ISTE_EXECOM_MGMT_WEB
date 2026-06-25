import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'roster_god_mode.dart';
import 'task_god_mode.dart';
import '../../core/theme.dart';
import '../../core/widgets/clay_container.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  double _baseReward = 10.0;
  double _penaltyMultiplier = 1.5;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent, // Inherits from MainLayout background
      appBar: AppBar(
        title: const Text('Admin God Mode', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.redAccent)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('System Variables Engine', style: TextStyle(color: AppTheme.textSecondary, letterSpacing: 1.2)),
            const SizedBox(height: 16),
            ClayContainer(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildSlider('Base Task Reward Points', _baseReward, 1, 100, (val) => setState(() => _baseReward = val)),
                  _buildSlider('Overdue Penalty Multiplier', _penaltyMultiplier, 1, 5, (val) => setState(() => _penaltyMultiplier = val)),
                ],
              ),
            ),
            
            const SizedBox(height: 32),
            const Text('Destructive Control Modules', style: TextStyle(color: Colors.redAccent, letterSpacing: 1.2)),
            const SizedBox(height: 16),
            
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              children: [
                _buildControlCard(
                  context,
                  'Roster God View',
                  Icons.admin_panel_settings,
                  Colors.redAccent,
                  () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RosterGodModeScreen())),
                ),
                _buildControlCard(
                  context,
                  'Task Overrides',
                  Icons.gavel,
                  AppTheme.warningOrange,
                  () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TaskGodModeScreen())),
                ),
                _buildControlCard(
                  context,
                  'Event Control',
                  Icons.event_busy,
                  AppTheme.primaryBlue,
                  () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Event Overrides coming soon'))),
                ),
                _buildControlCard(
                  context,
                  'Asset Reclamation',
                  Icons.inventory_2,
                  AppTheme.successGreen,
                  () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Asset Reclamation coming soon'))),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildControlCard(BuildContext context, String title, IconData icon, Color color, VoidCallback onTap) {
    return ClayContainer(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: color),
            const SizedBox(height: 12),
            Text(title, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildSlider(String label, double value, double min, double max, ValueChanged<double> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(color: AppTheme.textSecondary)),
            Text(value.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.accentNeon)),
          ],
        ),
        Slider(
          value: value,
          min: min,
          max: max,
          activeColor: AppTheme.primaryBlue,
          onChanged: onChanged,
        ),
      ],
    );
  }
}
