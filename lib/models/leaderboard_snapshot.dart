import 'execom_member.dart';

class LeaderboardSnapshot {
  final List<ExecomMember> rankedMembers;
  final DateTime generatedAt;

  LeaderboardSnapshot({
    required this.rankedMembers,
    DateTime? generatedAt,
  }) : generatedAt = generatedAt ?? DateTime.now();

  /// Gets the top 3 members if available
  List<ExecomMember> get podium => 
      rankedMembers.take(3).toList();

  /// Gets the rest of the members outside top 3
  List<ExecomMember> get restOfRankings => 
      rankedMembers.skip(3).toList();
}
