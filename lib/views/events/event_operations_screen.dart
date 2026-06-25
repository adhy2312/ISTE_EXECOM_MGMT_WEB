import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../controllers/event_controller.dart';
import '../../models/event.dart';
import '../../core/theme.dart';
import 'event_detail_screen.dart';

class EventOperationsScreen extends ConsumerWidget {
  const EventOperationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final eventsAsync = ref.watch(eventsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Event Operations Center'),
        backgroundColor: AppTheme.surfaceDark,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_box),
            onPressed: () {
              // Stub to create new event
              final newEvent = Event(
                name: 'New Mock Event',
                description: 'Planning a tech workshop',
                startDate: DateTime.now().add(const Duration(days: 10)),
                endDate: DateTime.now().add(const Duration(days: 11)),
                budgetAllocated: 5000.0,
                status: EventStatus.upcoming,
              );
              ref.read(eventsProvider.notifier).addEvent(newEvent);
            },
            tooltip: 'Create Event',
          )
        ],
      ),
      body: eventsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: Text('Error: $err')),
        data: (events) {
          if (events.isEmpty) {
            return const Center(
                child: Text('No events found.',
                    style: TextStyle(color: AppTheme.textSecondary)));
          }

          final upcoming =
              events.where((e) => e.status == EventStatus.upcoming).toList();
          final ongoing =
              events.where((e) => e.status == EventStatus.ongoing).toList();
          final completed =
              events.where((e) => e.status == EventStatus.completed).toList();

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildSectionHeader('Ongoing Events', AppTheme.warningOrange),
              ...ongoing.map(
                  (e) => _buildEventCard(context, e, AppTheme.warningOrange)),
              const SizedBox(height: 24),
              _buildSectionHeader('Upcoming Events', AppTheme.primaryBlue),
              ...upcoming.map(
                  (e) => _buildEventCard(context, e, AppTheme.primaryBlue)),
              const SizedBox(height: 24),
              _buildSectionHeader('Completed Events', AppTheme.successGreen),
              ...completed.map(
                  (e) => _buildEventCard(context, e, AppTheme.successGreen)),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 14,
          fontWeight: 'bold'.hashCode == 0
              ? FontWeight.normal
              : FontWeight.bold, // Trick for const compatibility
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildEventCard(
      BuildContext context, Event event, Color highlightColor) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: highlightColor.withValues(alpha: 0.3)),
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => EventDetailScreen(event: event)),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(event.name,
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                  const Icon(Icons.chevron_right,
                      color: AppTheme.textSecondary),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '${event.startDate.month}/${event.startDate.day} - ${event.endDate.month}/${event.endDate.day} | ${event.venue}',
                style: const TextStyle(
                    color: AppTheme.textSecondary, fontSize: 12),
              ),
              const SizedBox(height: 12),
              LinearProgressIndicator(
                value: event.budgetAllocated > 0
                    ? event.expensesIncurred / event.budgetAllocated
                    : 0,
                backgroundColor: AppTheme.backgroundDark,
                color: highlightColor,
              ),
              const SizedBox(height: 4),
              Text(
                'Budget Used: ₹${event.expensesIncurred} / ₹${event.budgetAllocated}',
                style: const TextStyle(
                    fontSize: 10, color: AppTheme.textSecondary),
              )
            ],
          ),
        ),
      ),
    );
  }
}
