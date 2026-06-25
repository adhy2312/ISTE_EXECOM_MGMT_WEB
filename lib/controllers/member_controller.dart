import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/execom_member.dart';
import '../services/database_service_interface.dart';
import '../services/firestore_database_service.dart';

final membersProvider = StateNotifierProvider<MemberController, AsyncValue<List<ExecomMember>>>((ref) {
  return MemberController(ref.watch(firestoreDatabaseServiceProvider));
});

class MemberController extends StateNotifier<AsyncValue<List<ExecomMember>>> {
  final IDatabaseService _db;

  MemberController(this._db) : super(const AsyncValue.loading()) {
    fetchMembers();
  }

  Future<void> fetchMembers() async {
    state = const AsyncValue.loading();
    try {
      final members = await _db.getMembers();
      // Mutable copy to sort
      final sortedMembers = List<ExecomMember>.from(members);
      sortedMembers.sort((a, b) => b.corePoints.compareTo(a.corePoints));
      state = AsyncValue.data(sortedMembers);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addMember(ExecomMember member) async {
    try {
      await _db.addMember(member);
      await fetchMembers(); // Refresh list
    } catch (e) {
      // Handle error visually in a real app
    }
  }
}
