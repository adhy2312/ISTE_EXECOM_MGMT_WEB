import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/event.dart';
import '../services/database_service_interface.dart';
import '../services/firestore_database_service.dart';

final eventsProvider = StateNotifierProvider<EventController, AsyncValue<List<Event>>>((ref) {
  return EventController(ref.watch(firestoreDatabaseServiceProvider));
});

class EventController extends StateNotifier<AsyncValue<List<Event>>> {
  final IDatabaseService _db;

  EventController(this._db) : super(const AsyncValue.loading()) {
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    try {
      final events = await _db.getEvents();
      state = AsyncValue.data(events);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addEvent(Event event) async {
    try {
      await _db.addEvent(event);
      final currentList = state.value ?? [];
      state = AsyncValue.data([...currentList, event]);
    } catch (e) {
      // Handle error gracefully
      rethrow;
    }
  }

  Future<void> updateEvent(Event event) async {
    try {
      await _db.updateEvent(event);
      final currentList = state.value ?? [];
      state = AsyncValue.data([
        for (final e in currentList)
          if (e.id == event.id) event else e
      ]);
    } catch (e) {
      rethrow;
    }
  }
}
