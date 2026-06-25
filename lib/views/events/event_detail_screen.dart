import 'package:flutter/material.dart';
import '../../models/event.dart';
import '../../core/theme.dart';

class EventDetailScreen extends StatelessWidget {
  final Event event;

  const EventDetailScreen({Key? key, required this.event}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(event.name),
        backgroundColor: AppTheme.surfaceDark,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildInfoTile(Icons.info_outline, 'Description', event.description),
            const SizedBox(height: 16),
            _buildFinancials(),
            const SizedBox(height: 16),
            _buildChecklist(),
            const SizedBox(height: 16),
            _buildDocumentsList(),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String title, String content) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppTheme.primaryBlue),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                const SizedBox(height: 4),
                Text(content, style: const TextStyle(fontSize: 16)),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildFinancials() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.warningOrange.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Financial Overview', style: TextStyle(color: AppTheme.warningOrange, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Allocated Budget'),
              Text('₹${event.budgetAllocated}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.successGreen)),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Expenses Incurred'),
              Text('₹${event.expensesIncurred}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.redAccent)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChecklist() {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Operations Checklist', style: TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          if (event.checklist.isEmpty)
            const Text('No checklist items.', style: TextStyle(color: AppTheme.textSecondary)),
          ...event.checklist.map((item) {
            return CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(item.task, style: TextStyle(decoration: item.isCompleted ? TextDecoration.lineThrough : null)),
              value: item.isCompleted,
              onChanged: null, // Read-only for this prototype view
              activeColor: AppTheme.primaryBlue,
            );
          }),
        ],
      ),
    );
  }

  Widget _buildDocumentsList() {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Sponsorship & Documents', style: TextStyle(color: AppTheme.accentNeon, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          if (event.documentUrls.isEmpty && event.sponsorInfo.isEmpty)
            const Text('No assets uploaded yet.', style: TextStyle(color: AppTheme.textSecondary)),
        ],
      ),
    );
  }
}
