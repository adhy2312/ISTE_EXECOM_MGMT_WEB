import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/execom_member.dart';

final authProvider = StateNotifierProvider<AuthController, ExecomMember?>((ref) {
  return AuthController();
});

class AuthController extends StateNotifier<ExecomMember?> {
  AuthController() : super(
    // Default mock user
    ExecomMember(
      id: 'chair-001',
      fullName: 'Alice Chairperson',
      email: 'alice@mbcet.ac.in',
      branchBatch: 'S7 CS',
      role: UserRole.chapterAdmin,
      designation: 'Chairperson',
      corePoints: 1000,
    )
  );

  void switchRole(UserRole newRole) {
    if (state != null) {
      state = state!.copyWith(role: newRole);
    }
  }
}
