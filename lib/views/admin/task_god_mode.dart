import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/task_item.dart';
import '../../controllers/task_controller.dart';
import '../../core/theme.dart';

class TaskGodModeScreen extends ConsumerWidget {
  const TaskGodModeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasksAsync = ref.watch(tasksProvider);

    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        title: const Text('Task Matrix Overrides',
            style: TextStyle(color: AppTheme.warningOrange)),
        backgroundColor: AppTheme.surfaceDark,
        elevation: 0,
      ),
      body: tasksAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: Text('Error: $err')),
        data: (tasks) {
          if (tasks.isEmpty)
            return const Center(child: Text('No tasks found.'));
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: tasks.length,
            itemBuilder: (context, index) {
              final t = tasks[index];
              return Card(
                color: AppTheme.surfaceDark,
                shape: RoundedRectangleBorder(
                  side: const BorderSide(
                      color: AppTheme.warningOrange, width: 0.5),
                  borderRadius: BorderRadius.circular(12),
                ),
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  title: Text(t.title,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(
                      'Status: ${t.state.name} • Points: ${t.bountyPoints}'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (t.state != TaskState.completed)
                        IconButton(
                          icon: const Icon(Icons.done_all,
                              color: AppTheme.successGreen),
                          onPressed: () {
                            ref
                                .read(tasksProvider.notifier)
                                .updateTaskState(t.id, TaskState.completed);
                            ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content:
                                        Text('Task forcefully completed!')));
                          },
                          tooltip: 'Force Complete',
                        ),
                      IconButton(
                        icon: const Icon(Icons.delete_forever,
                            color: Colors.redAccent),
                        onPressed: () {
                          // God mode annihilation
                          _showDeleteConfirm(context, ref, t);
                        },
                        tooltip: 'Delete Task',
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  void _showDeleteConfirm(BuildContext context, WidgetRef ref, TaskItem t) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Destroy Task?',
            style: TextStyle(color: Colors.redAccent)),
        content: Text('Permanently delete "${t.title}" from the database?'),
        backgroundColor: AppTheme.surfaceDark,
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () {
              ref.read(tasksProvider.notifier)._db.deleteTask(t.id);
              Navigator.pop(ctx);
            },
            child: const Text('DESTROY',
                style: TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
