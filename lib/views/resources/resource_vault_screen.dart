import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../controllers/resource_controller.dart';
import '../../models/resource.dart';
import '../../core/theme.dart';

class ResourceVaultScreen extends ConsumerWidget {
  const ResourceVaultScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resourcesAsync = ref.watch(resourcesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Resource Vault'),
        backgroundColor: AppTheme.surfaceDark,
        actions: [
          IconButton(
            icon: const Icon(Icons.upload_file),
            onPressed: () {
              final newRes = Resource(
                title: 'Event Management SOP 2026',
                description: 'Standard operating procedure for Techfest.',
                category: ResourceCategory.sop,
                uploaderId: 'admin-001',
                url: 'https://drive.google.com/mock-link',
              );
              ref.read(resourcesProvider.notifier).addResource(newRes);
            },
            tooltip: 'Upload Resource',
          )
        ],
      ),
      body: resourcesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: Text('Error: $err')),
        data: (resources) {
          if (resources.isEmpty) {
            return const Center(child: Text('Vault is empty.'));
          }

          // Group by category
          final Map<ResourceCategory, List<Resource>> grouped = {};
          for (var r in resources) {
            grouped.putIfAbsent(r.category, () => []).add(r);
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: grouped.length,
            itemBuilder: (context, index) {
              final category = grouped.keys.elementAt(index);
              final items = grouped[category]!;
              
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Text(
                      category.name.toUpperCase(),
                      style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                    ),
                  ),
                  ...items.map((r) => _buildResourceTile(r)),
                ],
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildResourceTile(Resource r) {
    IconData icon;
    switch (r.category) {
      case ResourceCategory.sop: icon = Icons.rule_folder; break;
      case ResourceCategory.designAsset: icon = Icons.brush; break;
      case ResourceCategory.template: icon = Icons.description; break;
      case ResourceCategory.handbook: icon = Icons.menu_book; break;
      case ResourceCategory.pastEventData: icon = Icons.archive; break;
    }

    return Card(
      color: AppTheme.backgroundDark,
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppTheme.surfaceDark),
      ),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.accentNeon),
        title: Text(r.title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(r.description, maxLines: 1, overflow: TextOverflow.ellipsis),
        trailing: IconButton(
          icon: const Icon(Icons.open_in_browser, color: AppTheme.primaryBlue),
          onPressed: () {
            // Launch URL logic
          },
        ),
      ),
    );
  }
}
