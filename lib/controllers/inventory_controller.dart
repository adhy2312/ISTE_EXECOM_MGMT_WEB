import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/inventory_asset.dart';
import '../services/database_service_interface.dart';
import '../services/firestore_database_service.dart';

final inventoryProvider = StateNotifierProvider<InventoryController, AsyncValue<List<InventoryAsset>>>((ref) {
  return InventoryController(ref.watch(firestoreDatabaseServiceProvider));
});

class InventoryController extends StateNotifier<AsyncValue<List<InventoryAsset>>> {
  final IDatabaseService _db;

  InventoryController(this._db) : super(const AsyncValue.loading()) {
    _loadInventory();
  }

  Future<void> _loadInventory() async {
    try {
      final assets = await _db.getInventory();
      state = AsyncValue.data(assets);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addAsset(InventoryAsset asset) async {
    try {
      await _db.addInventoryAsset(asset);
      final currentList = state.value ?? [];
      state = AsyncValue.data([...currentList, asset]);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateAsset(InventoryAsset asset) async {
    try {
      await _db.updateInventoryAsset(asset);
      final currentList = state.value ?? [];
      state = AsyncValue.data([
        for (final a in currentList)
          if (a.id == asset.id) asset else a
      ]);
    } catch (e) {
      rethrow;
    }
  }
}
