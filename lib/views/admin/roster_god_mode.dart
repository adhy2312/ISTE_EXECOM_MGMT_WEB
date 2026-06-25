import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/execom_member.dart';
import '../../controllers/member_controller.dart';
import '../../core/theme.dart';

class RosterGodModeScreen extends ConsumerWidget {
  const RosterGodModeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final membersAsync = ref.watch(membersProvider);

    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        title: const Text('Roster God View', style: TextStyle(color: Colors.redAccent)),
        backgroundColor: AppTheme.surfaceDark,
        elevation: 0,
      ),
      body: membersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: Text('Error: $err')),
        data: (members) {
          if (members.isEmpty) return const Center(child: Text('No members found.'));
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: members.length,
            itemBuilder: (context, index) {
              final m = members[index];
              return Card(
                color: AppTheme.surfaceDark,
                shape: RoundedRectangleBorder(
                  side: const BorderSide(color: Colors.redAccent, width: 0.5),
                  borderRadius: BorderRadius.circular(12),
                ),
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppTheme.primaryBlue,
                    child: Text(m.fullName.substring(0, 1), style: const TextStyle(color: Colors.white)),
                  ),
                  title: Text(m.fullName, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${m.designation} • Points: ${m.corePoints}'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.add_circle, color: AppTheme.successGreen),
                        onPressed: () {
                          // God mode point injection
                          ref.read(membersProvider.notifier).awardPoints(m.id, 50);
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Injected 50 points to ${m.fullName}')));
                        },
                        tooltip: 'Inject Points',
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_forever, color: Colors.redAccent),
                        onPressed: () {
                          // God mode annihilation
                          _showDeleteConfirm(context, ref, m);
                        },
                        tooltip: 'Annihilate Record',
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

  void _showDeleteConfirm(BuildContext context, WidgetRef ref, ExecomMember m) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Annihilate Member?', style: TextStyle(color: Colors.redAccent)),
        content: Text('Are you sure you want to permanently delete ${m.fullName} from the database? This cannot be undone.'),
        backgroundColor: AppTheme.surfaceDark,
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () {
              ref.read(membersProvider.notifier)._db.deleteMember(m.id);
              Navigator.pop(ctx);
              // Optimistically reload or let stream handle it
            },
            child: const Text('ANNIHILATE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
