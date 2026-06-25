import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme.dart';

class FacultyPortalScreen extends StatefulWidget {
  const FacultyPortalScreen({super.key});

  @override
  State<FacultyPortalScreen> createState() => _FacultyPortalScreenState();
}

class _FacultyPortalScreenState extends State<FacultyPortalScreen> {
  // Mock Live Event Tracker state
  int _currentHallCapacity = 45;
  final int _maxCapacity = 120;
  Timer? _mockStreamTimer;

  @override
  void initState() {
    super.initState();
    // Simulate live event entries
    _mockStreamTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (mounted && _currentHallCapacity < _maxCapacity) {
        setState(() {
          _currentHallCapacity += 1;
        });
      }
    });
  }

  @override
  void dispose() {
    _mockStreamTimer?.cancel();
    super.dispose();
  }

  void _signOffReport() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Report Approved and Signed Off securely.'),
        backgroundColor: AppTheme.successGreen,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Faculty Observatory'),
        backgroundColor: AppTheme.surfaceDark,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Chapter Metrics Suite',
                style: Theme.of(context).textTheme.headlineLarge),
            const SizedBox(height: 16),
            _buildMetricsGrid(),
            const SizedBox(height: 32),
            Text('Live Event Tracker',
                style: Theme.of(context).textTheme.headlineLarge),
            const SizedBox(height: 16),
            _buildLiveEventTracker(),
            const SizedBox(height: 32),
            Text('Meeting Minutes (MoM) Repository',
                style: Theme.of(context).textTheme.headlineLarge),
            const SizedBox(height: 16),
            _buildMoMRepository(),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: _signOffReport,
              icon: const Icon(Icons.verified),
              label: const Text('Approve and Sign-off Report'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryBlue,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricsGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildMetricCard('Total Registrations', '452', Icons.groups),
        _buildMetricCard('Task Velocity', '87%', Icons.speed),
        _buildMetricCard(
            'Pending Budget', '₹12,400', Icons.account_balance_wallet),
        _buildMetricCard('Audit Verifications', '3', Icons.fact_check),
      ],
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: AppTheme.accentNeon, size: 28),
          const SizedBox(height: 8),
          Text(value,
              style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white)),
          const SizedBox(height: 4),
          Text(title,
              style:
                  const TextStyle(fontSize: 10, color: AppTheme.textSecondary),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }

  Widget _buildLiveEventTracker() {
    double progress = _currentHallCapacity / _maxCapacity;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.primaryBlue.withValues(alpha: 0.5)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Current Hall Capacity',
                  style: TextStyle(color: AppTheme.textSecondary)),
              Text('$_currentHallCapacity / $_maxCapacity',
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, color: AppTheme.accentNeon)),
            ],
          ),
          const SizedBox(height: 12),
          LinearProgressIndicator(
            value: progress,
            backgroundColor: AppTheme.backgroundDark,
            color:
                progress > 0.8 ? AppTheme.warningOrange : AppTheme.successGreen,
            minHeight: 12,
            borderRadius: BorderRadius.circular(6),
          ),
          const SizedBox(height: 8),
          const Text('Live updates from entry scanners...',
              style: TextStyle(
                  fontSize: 10,
                  fontStyle: FontStyle.italic,
                  color: AppTheme.textSecondary)),
        ],
      ),
    );
  }

  Widget _buildMoMRepository() {
    return Card(
      color: AppTheme.surfaceDark,
      child: ExpansionTile(
        leading: const Icon(Icons.folder, color: AppTheme.primaryBlue),
        title: const Text('August General Assembly'),
        subtitle: const Text('Generated by automation script'),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            width: double.infinity,
            color: AppTheme.backgroundDark,
            child: const Text(
              "## Minutes of Meeting\n\n- **Date:** Aug 15\n- **Attendees:** 45\n- **Agenda:** Techfest planning.\n- **Resolution:** Budget approved.",
              style: TextStyle(
                  fontFamily: 'monospace',
                  color: AppTheme.textPrimary,
                  fontSize: 12),
            ),
          )
        ],
      ),
    );
  }
}
