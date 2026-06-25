import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../controllers/member_controller.dart';
import '../../controllers/task_controller.dart';
import '../../core/theme.dart';

class GlobalSearchDelegate extends SearchDelegate<String> {
  final WidgetRef ref;

  GlobalSearchDelegate(this.ref) : super(
    searchFieldStyle: const TextStyle(color: Colors.white),
    searchFieldDecorationTheme: const InputDecorationTheme(
      border: InputBorder.none,
      hintStyle: TextStyle(color: AppTheme.textSecondary),
    ),
  );

  @override
  ThemeData appBarTheme(BuildContext context) {
    final theme = Theme.of(context);
    return theme.copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: AppTheme.surfaceDark,
        elevation: 0,
      ),
      inputDecorationTheme: const InputDecorationTheme(
        border: InputBorder.none,
      ),
    );
  }

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      if (query.isNotEmpty)
        IconButton(
          icon: const Icon(Icons.clear),
          onPressed: () => query = '',
        ),
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () => close(context, ''),
    );
  }

  @override
  Widget buildResults(BuildContext context) => _buildSearchResults();

  @override
  Widget buildSuggestions(BuildContext context) => _buildSearchResults();

  Widget _buildSearchResults() {
    if (query.isEmpty) {
      return const Center(child: Text('Search ExeCom Directory & Task Matrix', style: TextStyle(color: AppTheme.textSecondary)));
    }

    final lowerQuery = query.toLowerCase();
    
    // Member Search
    final membersAsync = ref.watch(membersProvider);
    final members = membersAsync.value ?? [];
    final matchedMembers = members.where((m) => 
      m.fullName.toLowerCase().contains(lowerQuery) || 
      m.designation.toLowerCase().contains(lowerQuery)
    ).toList();

    // Task Search
    final tasksAsync = ref.watch(tasksProvider);
    final tasks = tasksAsync.value ?? [];
    final matchedTasks = tasks.where((t) => 
      t.title.toLowerCase().contains(lowerQuery) || 
      t.description.toLowerCase().contains(lowerQuery)
    ).toList();

    if (matchedMembers.isEmpty && matchedTasks.isEmpty) {
      return const Center(child: Text('No results found.', style: TextStyle(color: AppTheme.textSecondary)));
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (matchedMembers.isNotEmpty) ...[
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 8),
            child: Text('MEMBERS', style: TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          ),
          ...matchedMembers.map((m) => Card(
            color: AppTheme.surfaceDark,
            child: ListTile(
              leading: const Icon(Icons.person, color: AppTheme.accentNeon),
              title: Text(m.fullName),
              subtitle: Text(m.designation),
            ),
          )),
          const SizedBox(height: 16),
        ],
        
        if (matchedTasks.isNotEmpty) ...[
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 8),
            child: Text('TASKS', style: TextStyle(color: AppTheme.warningOrange, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          ),
          ...matchedTasks.map((t) => Card(
            color: AppTheme.surfaceDark,
            child: ListTile(
              leading: const Icon(Icons.assignment, color: AppTheme.warningOrange),
              title: Text(t.title),
              subtitle: Text(t.state.name.toUpperCase(), style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10)),
            ),
          )),
        ],
      ],
    );
  }
}
