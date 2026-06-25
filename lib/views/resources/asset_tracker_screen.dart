import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../controllers/inventory_controller.dart';
import '../../models/inventory_asset.dart';
import '../../core/theme.dart';

class AssetTrackerScreen extends ConsumerWidget {
  const AssetTrackerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inventoryAsync = ref.watch(inventoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Asset Inventory'),
        backgroundColor: AppTheme.surfaceDark,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_shopping_cart),
            onPressed: () {
              final newAsset = InventoryAsset(
                name: 'Main ISTE Banner',
                sku: 'ISTE-BAN-01',
                description: 'Large 6x3 ft vinyl banner',
                location: 'CS Dept Cabinet A',
              );
              ref.read(inventoryProvider.notifier).addAsset(newAsset);
            },
            tooltip: 'Add Asset',
          )
        ],
      ),
      body: inventoryAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: Text('Error: $err')),
        data: (assets) {
          if (assets.isEmpty) {
            return const Center(child: Text('No assets tracked.'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: assets.length,
            itemBuilder: (context, index) {
              final a = assets[index];
              return _buildAssetCard(context, ref, a);
            },
          );
        },
      ),
    );
  }

  Widget _buildAssetCard(
      BuildContext context, WidgetRef ref, InventoryAsset a) {
    Color statusColor;
    IconData statusIcon;

    switch (a.status) {
      case AssetStatus.available:
        statusColor = AppTheme.successGreen;
        statusIcon = Icons.check_circle;
        break;
      case AssetStatus.checkedOut:
        statusColor = AppTheme.warningOrange;
        statusIcon = Icons.front_hand;
        break;
      case AssetStatus.maintenance:
        statusColor = Colors.orangeAccent;
        statusIcon = Icons.build;
        break;
      case AssetStatus.lost:
        statusColor = Colors.redAccent;
        statusIcon = Icons.error;
        break;
    }

    return Card(
      color: AppTheme.surfaceDark,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ExpansionTile(
        leading: Icon(statusIcon, color: statusColor),
        title:
            Text(a.name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(a.sku,
            style:
                const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Location:',
                        style: TextStyle(color: AppTheme.textSecondary)),
                    Text(a.location,
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 8),
                Text('Description: ${a.description}',
                    style: const TextStyle(
                        color: AppTheme.textSecondary, fontSize: 12)),
                const SizedBox(height: 16),
                if (a.status == AssetStatus.available)
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        // Mock Checkout
                        final updated = a.copyWith(
                          status: AssetStatus.checkedOut,
                          checkedOutById: 'current-user-mock',
                          expectedReturnDate:
                              DateTime.now().add(const Duration(days: 1)),
                        );
                        ref
                            .read(inventoryProvider.notifier)
                            .updateAsset(updated);
                      },
                      style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryBlue),
                      child: const Text('Check Out Asset'),
                    ),
                  )
                else if (a.status == AssetStatus.checkedOut)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () {
                        // Mock Return
                        final updated = a.copyWith(
                            status: AssetStatus.available,
                            checkedOutById: null,
                            expectedReturnDate: null);
                        ref
                            .read(inventoryProvider.notifier)
                            .updateAsset(updated);
                      },
                      style: OutlinedButton.styleFrom(
                          foregroundColor: AppTheme.successGreen,
                          side: const BorderSide(color: AppTheme.successGreen)),
                      child: const Text('Return Asset'),
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
