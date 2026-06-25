import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/meeting.dart';
import '../models/task_item.dart';
import '../services/database_service_interface.dart';
import '../services/firestore_database_service.dart';
import 'task_controller.dart';

final meetingsProvider = StateNotifierProvider<MeetingController, AsyncValue<List<Meeting>>>((ref) {
  return MeetingController(ref.watch(firestoreDatabaseServiceProvider), ref);
});

class MeetingController extends StateNotifier<AsyncValue<List<Meeting>>> {
  final IDatabaseService _db;
  final StateNotifierProviderRef _ref;

  MeetingController(this._db, this._ref) : super(const AsyncValue.loading()) {
    _loadMeetings();
  }

  Future<void> _loadMeetings() async {
    try {
      final meetings = await _db.getMeetings();
      state = AsyncValue.data(meetings);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addMeeting(Meeting meeting) async {
    try {
      await _db.addMeeting(meeting);
      final currentList = state.value ?? [];
      state = AsyncValue.data([...currentList, meeting]);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateMeeting(Meeting meeting) async {
    try {
      await _db.updateMeeting(meeting);
      final currentList = state.value ?? [];
      state = AsyncValue.data([
        for (final m in currentList)
          if (m.id == meeting.id) meeting else m
      ]);
    } catch (e) {
      rethrow;
    }
  }

  // Automatic conversion logic
  Future<void> convertActionItemToTask(Meeting meeting, MeetingActionItem item, String assignerId) async {
    if (item.assignedToId.isEmpty) return;

    final newTask = TaskItem(
      title: 'Action Item: ${meeting.title}',
      description: item.description,
      creatorId: assignerId,
      assignedMemberId: item.assignedToId,
      targetDeadline: DateTime.now().add(const Duration(days: 3)),
      potentialPoints: 50,
      priority: TaskPriority.high,
    );

    // Call TaskController to add the task
    await _ref.read(tasksProvider.notifier).addTask(newTask);

    // Update meeting action item to link the taskId
    final updatedItem = MeetingActionItem(
      id: item.id,
      description: item.description,
      assignedToId: item.assignedToId,
      linkedTaskId: newTask.id,
      isCompleted: item.isCompleted,
    );

    final updatedActionItems = [
      for (final a in meeting.actionItems)
        if (a.id == item.id) updatedItem else a
    ];

    final updatedMeeting = Meeting(
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      agenda: meeting.agenda,
      attendedMemberIds: meeting.attendedMemberIds,
      discussionPoints: meeting.discussionPoints,
      actionItems: updatedActionItems,
      meetingMinutesMarkdown: meeting.meetingMinutesMarkdown,
    );

    await updateMeeting(updatedMeeting);
  }
}
