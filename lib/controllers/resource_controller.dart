import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/resource.dart';
import '../services/database_service_interface.dart';
import '../services/firestore_database_service.dart';

final resourcesProvider = StateNotifierProvider<ResourceController, AsyncValue<List<Resource>>>((ref) {
  return ResourceController(ref.watch(firestoreDatabaseServiceProvider));
});

class ResourceController extends StateNotifier<AsyncValue<List<Resource>>> {
  final IDatabaseService _db;

  ResourceController(this._db) : super(const AsyncValue.loading()) {
    _loadResources();
  }

  Future<void> _loadResources() async {
    try {
      final resources = await _db.getResources();
      state = AsyncValue.data(resources);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addResource(Resource resource) async {
    try {
      await _db.addResource(resource);
      final currentList = state.value ?? [];
      state = AsyncValue.data([...currentList, resource]);
    } catch (e) {
      rethrow;
    }
  }
}
