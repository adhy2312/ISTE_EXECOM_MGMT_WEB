import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../controllers/meeting_controller.dart';
import '../../controllers/auth_controller.dart';
import '../../models/meeting.dart';
import '../../core/theme.dart';

class MeetingManagementScreen extends ConsumerWidget {
  const MeetingManagementScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final meetingsAsync = ref.watch(meetingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Meeting Management'),
        backgroundColor: AppTheme.surfaceDark,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_task),
            onPressed: () {
              final newMeeting = Meeting(
                title: 'General Body Meeting',
                date: DateTime.now().add(const Duration(days: 2)),
                agenda:
                    'Discuss Techfest sponsorships and volunteer allocation.',
                actionItems: [
                  MeetingActionItem(
                      description: 'Finalize sponsor deck',
                      assignedToId: 'member-003'),
                  MeetingActionItem(
                      description: 'Book main auditorium',
                      assignedToId: 'member-002'),
                ],
              );
              ref.read(meetingsProvider.notifier).addMeeting(newMeeting);
            },
            tooltip: 'Schedule Meeting',
          )
        ],
      ),
      body: meetingsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: Text('Error: $err')),
        data: (meetings) {
          if (meetings.isEmpty) {
            return const Center(
                child: Text('No meetings scheduled.',
                    style: TextStyle(color: AppTheme.textSecondary)));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: meetings.length,
            itemBuilder: (context, index) {
              return _buildMeetingCard(context, ref, meetings[index]);
            },
          );
        },
      ),
    );
  }

  Widget _buildMeetingCard(
      BuildContext context, WidgetRef ref, Meeting meeting) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ExpansionTile(
        title: Text(meeting.title,
            style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('Scheduled: ${meeting.date.month}/${meeting.date.day}',
            style: const TextStyle(color: AppTheme.primaryBlue)),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppTheme.backgroundDark,
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Agenda',
                    style:
                        TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                const SizedBox(height: 4),
                Text(meeting.agenda),
                const SizedBox(height: 16),
                const Text('Action Items (Tap to convert to Tasks)',
                    style: TextStyle(
                        color: AppTheme.accentNeon,
                        fontSize: 12,
                        fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                if (meeting.actionItems.isEmpty)
                  const Text('No action items.',
                      style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontStyle: FontStyle.italic)),
                ...meeting.actionItems.map((item) {
                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(
                      item.linkedTaskId != null
                          ? Icons.check_circle
                          : Icons.radio_button_unchecked,
                      color: item.linkedTaskId != null
                          ? AppTheme.successGreen
                          : AppTheme.textSecondary,
                    ),
                    title: Text(item.description,
                        style: TextStyle(
                            decoration: item.linkedTaskId != null
                                ? TextDecoration.lineThrough
                                : null)),
                    subtitle: Text(item.linkedTaskId != null
                        ? 'Converted to Task'
                        : 'Assigned: ${item.assignedToId}'),
                    onTap: item.linkedTaskId != null
                        ? null
                        : () async {
                            // Convert to Task!
                            final authUser = ref.read(authProvider);
                            if (authUser != null) {
                              await ref
                                  .read(meetingsProvider.notifier)
                                  .convertActionItemToTask(
                                      meeting, item, authUser.id);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text(
                                        'Action item converted to matrix task!',
                                        style: TextStyle(
                                            color: AppTheme.successGreen))),
                              );
                            }
                          },
                  );
                }),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.picture_as_pdf),
                    label: const Text('Export MoM PDF'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primaryBlue,
                      side: const BorderSide(color: AppTheme.primaryBlue),
                    ),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
