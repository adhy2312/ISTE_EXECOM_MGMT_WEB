import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../models/task_item.dart';
import '../controllers/task_controller.dart';
import '../controllers/member_controller.dart';
import '../core/theme.dart';

class TaskMatrixScreen extends ConsumerWidget {
  const TaskMatrixScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasksAsyncValue = ref.watch(tasksProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Autonomous Task Matrix'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showAddTaskDialog(context, ref),
          )
        ],
      ),
      body: tasksAsyncValue.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (tasks) {
          if (tasks.isEmpty) {
            return const Center(child: Text('No tasks available.'));
          }
          return ListView.builder(
            itemCount: tasks.length,
            itemBuilder: (context, index) {
              final task = tasks[index];
              return _TaskCard(task: task);
            },
          );
        },
      ),
    );
  }

  void _showAddTaskDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => ProviderScope(
        parent: ProviderScope.containerOf(context),
        child: const _AddTaskDialog(),
      ),
    );
  }
}

class _TaskCard extends ConsumerWidget {
  final TaskItem task;
  const _TaskCard({Key? key, required this.task}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Color statusColor;
    switch (task.state) {
      case TaskState.pending: statusColor = Colors.grey; break;
      case TaskState.inProgress: statusColor = AppTheme.primaryBlue; break;
      case TaskState.underReview: statusColor = AppTheme.warningOrange; break;
      case TaskState.completed: statusColor = AppTheme.successGreen; break;
    }

    return Card(
      child: ExpansionTile(
        title: Text(task.title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('Due: ${DateFormat.yMd().format(task.targetDeadline)}'),
        trailing: Chip(
          label: Text(task.state.name.toUpperCase()),
          backgroundColor: statusColor.withOpacity(0.2),
          labelStyle: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(task.description),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Bounty: ${task.potentialPoints} XP', style: const TextStyle(color: AppTheme.accentNeon, fontWeight: FontWeight.bold)),
                    _buildActionButtons(context, ref),
                  ],
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, WidgetRef ref) {
    if (task.state == TaskState.underReview) {
      return Row(
        children: [
          TextButton(
            onPressed: () {
              ref.read(tasksProvider.notifier).updateTaskState(task.id, TaskState.inProgress);
            },
            child: const Text('Revert', style: TextStyle(color: Colors.redAccent)),
          ),
          ElevatedButton(
            onPressed: () {
              ref.read(tasksProvider.notifier).updateTaskState(
                task.id, 
                TaskState.completed, 
                pointsToAward: task.potentialPoints, 
                memberId: task.assignedMemberId
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.successGreen),
            child: const Text('Approve'),
          ),
        ],
      );
    } else if (task.state == TaskState.pending || task.state == TaskState.inProgress) {
      return ElevatedButton(
        onPressed: () {
          ref.read(tasksProvider.notifier).updateTaskState(task.id, TaskState.underReview);
        },
        child: const Text('Submit for Review'),
      );
    }
    return const SizedBox.shrink();
  }
}

class _AddTaskDialog extends ConsumerStatefulWidget {
  const _AddTaskDialog({Key? key}) : super(key: key);

  @override
  ConsumerState<_AddTaskDialog> createState() => _AddTaskDialogState();
}

class _AddTaskDialogState extends ConsumerState<_AddTaskDialog> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _pointsCtrl = TextEditingController();
  String? _selectedMemberId;

  @override
  Widget build(BuildContext context) {
    final membersAsync = ref.watch(membersProvider);

    return AlertDialog(
      title: const Text('Allocate Task'),
      backgroundColor: AppTheme.surfaceDark,
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: _titleCtrl, decoration: const InputDecoration(labelText: 'Title')),
            const SizedBox(height: 8),
            TextField(controller: _descCtrl, decoration: const InputDecoration(labelText: 'Description')),
            const SizedBox(height: 8),
            TextField(controller: _pointsCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Points Bounty')),
            const SizedBox(height: 8),
            membersAsync.when(
              data: (members) => DropdownButtonFormField<String>(
                value: _selectedMemberId,
                hint: const Text('Assign Member'),
                items: members.map((m) => DropdownMenuItem(value: m.id, child: Text(m.fullName))).toList(),
                onChanged: (val) => setState(() => _selectedMemberId = val),
              ),
              loading: () => const CircularProgressIndicator(),
              error: (err, st) => const Text('Failed to load members'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        ElevatedButton(
          onPressed: () {
            if (_titleCtrl.text.isNotEmpty && _selectedMemberId != null) {
              final task = TaskItem(
                title: _titleCtrl.text,
                description: _descCtrl.text,
                assignedMemberId: _selectedMemberId!,
                targetDeadline: DateTime.now().add(const Duration(days: 7)),
                potentialPoints: int.tryParse(_pointsCtrl.text) ?? 10,
              );
              ref.read(tasksProvider.notifier).addTask(task);
              Navigator.pop(context);
            }
          },
          child: const Text('Dispatch'),
        ),
      ],
    );
  }
}
