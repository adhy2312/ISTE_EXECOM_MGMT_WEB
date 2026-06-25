import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/task_item.dart';
import '../services/database_service_interface.dart';
import '../services/firestore_database_service.dart';
import 'member_controller.dart';

final tasksProvider = StateNotifierProvider<TaskController, AsyncValue<List<TaskItem>>>((ref) {
  return TaskController(ref.watch(firestoreDatabaseServiceProvider), ref);
});

class TaskController extends StateNotifier<AsyncValue<List<TaskItem>>> {
  final IDatabaseService _db;
  final Ref _ref;

  TaskController(this._db, this._ref) : super(const AsyncValue.loading()) {
    fetchTasks();
  }

  Future<void> fetchTasks() async {
    state = const AsyncValue.loading();
    try {
      final tasks = await _db.getTasks();
      // Sort tasks by deadline
      final sortedTasks = List<TaskItem>.from(tasks);
      sortedTasks.sort((a, b) => a.targetDeadline.compareTo(b.targetDeadline));
      state = AsyncValue.data(sortedTasks);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addTask(TaskItem task) async {
    try {
      await _db.addTask(task);
      await fetchTasks();
    } catch (e) {
      // Handle error
    }
  }

  Future<void> updateTaskState(String taskId, TaskState newState, {int? pointsToAward, String? memberId}) async {
    try {
      await _db.updateTaskState(taskId, newState);
      
      // If a task is marked completed, credit the points to the assigned member.
      if (newState == TaskState.completed && pointsToAward != null && memberId != null) {
        await _db.updateMemberPoints(memberId, pointsToAward);
        _ref.read(membersProvider.notifier).fetchMembers(); // Refresh leaderboard
      }
      
      await fetchTasks();
    } catch (e) {
      // Handle error
    }
  }
}
