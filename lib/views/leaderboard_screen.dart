import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../controllers/member_controller.dart';
import '../models/execom_member.dart';
import '../models/leaderboard_snapshot.dart';
import '../core/theme.dart';

class LeaderboardScreen extends ConsumerWidget {
  const LeaderboardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final membersAsync = ref.watch(membersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Velocity Leaderboard'),
        elevation: 0,
      ),
      body: membersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: Text('Error: $err')),
        data: (members) {
          if (members.isEmpty) return const Center(child: Text('No members found.'));

          final snapshot = LeaderboardSnapshot(rankedMembers: members);
          
          return CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      if (snapshot.podium.length > 1) _buildPodiumMember(snapshot.podium[1], 2),
                      if (snapshot.podium.isNotEmpty) _buildPodiumMember(snapshot.podium[0], 1),
                      if (snapshot.podium.length > 2) _buildPodiumMember(snapshot.podium[2], 3),
                    ],
                  ),
                ),
              ),
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final member = snapshot.restOfRankings[index];
                    return _buildStandardMemberRow(member, index + 4);
                  },
                  childCount: snapshot.restOfRankings.length,
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildPodiumMember(ExecomMember member, int rank) {
    List<Color> gradientColors;
    double avatarRadius;
    
    if (rank == 1) {
      gradientColors = [const Color(0xFFFFD700), const Color(0xFFFDB931)]; // Gold
      avatarRadius = 50;
    } else if (rank == 2) {
      gradientColors = [const Color(0xFFC0C0C0), const Color(0xFFE5E4E2)]; // Silver
      avatarRadius = 40;
    } else {
      gradientColors = [const Color(0xFFCD7F32), const Color(0xFF8B4513)]; // Bronze
      avatarRadius = 35;
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(colors: gradientColors),
            boxShadow: [
              BoxShadow(
                color: gradientColors[0].withOpacity(0.5),
                blurRadius: 10,
                spreadRadius: 2,
              )
            ]
          ),
          child: CircleAvatar(
            radius: avatarRadius,
            backgroundColor: AppTheme.surfaceDark,
            child: Text(
              member.fullName.substring(0, 1).toUpperCase(),
              style: TextStyle(fontSize: avatarRadius * 0.8, color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          member.fullName.split(' ').first,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        Text(
          '${member.corePoints} XP',
          style: TextStyle(color: gradientColors[0], fontWeight: FontWeight.bold),
        ),
        Container(
          margin: const EdgeInsets.only(top: 4),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: AppTheme.surfaceDark,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(member.designation, style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
        )
      ],
    );
  }

  Widget _buildStandardMemberRow(ExecomMember member, int rank) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: AppTheme.surfaceDark.withOpacity(0.5),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppTheme.backgroundDark,
          child: Text('#$rank', style: const TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold)),
        ),
        title: Text(member.fullName, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(member.designation, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
        trailing: Text(
          '${member.corePoints} XP',
          style: const TextStyle(color: AppTheme.accentNeon, fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
    );
  }
}
