import 'package:flutter/material.dart';
import '../../core/theme.dart';
import 'events/event_operations_screen.dart';
import 'meetings/meeting_management_screen.dart';
import 'resources/resource_vault_screen.dart';
import 'resources/asset_tracker_screen.dart';

class OperationsHubScreen extends StatelessWidget {
  const OperationsHubScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Operations Hub'),
        backgroundColor: AppTheme.surfaceDark,
        elevation: 0,
      ),
      body: GridView.count(
        padding: const EdgeInsets.all(16),
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        children: [
          _buildHubCard(
            context,
            'Events Ops',
            Icons.event_available,
            AppTheme.primaryBlue,
            const EventOperationsScreen(),
          ),
          _buildHubCard(
            context,
            'Meetings',
            Icons.people_alt,
            AppTheme.warningOrange,
            const MeetingManagementScreen(),
          ),
          _buildHubCard(
            context,
            'Resource Vault',
            Icons.folder_shared,
            AppTheme.accentNeon,
            const ResourceVaultScreen(),
          ),
          _buildHubCard(
            context,
            'Asset Tracker',
            Icons.inventory_2,
            AppTheme.successGreen,
            const AssetTrackerScreen(),
          ),
        ],
      ),
    );
  }

  Widget _buildHubCard(BuildContext context, String title, IconData icon, Color color, Widget? destination) {
    return Card(
      color: AppTheme.surfaceDark,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: color.withOpacity(0.3)),
      ),
      child: InkWell(
        onTap: destination == null
            ? () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Module arriving in Phase 3!')),
                );
              }
            : () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => destination));
              },
        borderRadius: BorderRadius.circular(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: color),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
