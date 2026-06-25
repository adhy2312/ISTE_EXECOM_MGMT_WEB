import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'chairperson_panel.dart';
import 'task_matrix.dart';
import 'leaderboard_screen.dart';
import 'digital_id_screen.dart';
import 'operations_hub_screen.dart';
import 'admin/admin_dashboard_screen.dart';
import 'faculty/faculty_portal_screen.dart';
import 'search/global_search_delegate.dart';
import '../core/theme.dart';
import '../core/widgets/animated_gradient_bg.dart';
import '../controllers/auth_controller.dart';
import '../models/execom_member.dart';

class MainLayout extends ConsumerStatefulWidget {
  const MainLayout({super.key});

  @override
  ConsumerState<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends ConsumerState<MainLayout> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final currentUser = ref.watch(authProvider);
    if (currentUser == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    // Define core screens for everyone
    final List<Widget> screens = [
      const LeaderboardScreen(),
      const TaskMatrixScreen(),
      const OperationsHubScreen(),
      const DigitalIdScreen(),
    ];
    final List<BottomNavigationBarItem> navItems = [
      const BottomNavigationBarItem(icon: Icon(Icons.leaderboard_rounded), label: 'Velocity'),
      const BottomNavigationBarItem(icon: Icon(Icons.assignment_rounded), label: 'Matrix'),
      const BottomNavigationBarItem(icon: Icon(Icons.hub), label: 'Hub'),
      const BottomNavigationBarItem(icon: Icon(Icons.badge_rounded), label: 'ID Pass'),
    ];

    // Apply RBAC filters
    if (currentUser.role == UserRole.chapterAdmin) {
      screens.add(const ChairpersonPanel());
      navItems.add(const BottomNavigationBarItem(icon: Icon(Icons.person_add), label: 'Provision'));
      
      screens.add(const AdminDashboardScreen());
      navItems.add(const BottomNavigationBarItem(icon: Icon(Icons.settings_applications), label: 'Admin'));
    }

    if (currentUser.role == UserRole.facultyAdvisor) {
      screens.add(const FacultyPortalScreen());
      navItems.add(const BottomNavigationBarItem(icon: Icon(Icons.school), label: 'Observatory'));
    }

    // Clamp index to prevent out-of-bounds error when switching roles to a lower tier
    if (_currentIndex >= screens.length) {
      _currentIndex = 0;
    }

    return AnimatedGradientBg(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          title: const Text('ISTE SC MBCET'),
          backgroundColor: Colors.transparent,
          elevation: 0,
          flexibleSpace: ClipRRect(
            child: BackdropFilter(
              filter: ui.ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(color: AppTheme.surfaceDark.withValues(alpha: 0.5)),
            ),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () {
                showSearch(context: context, delegate: GlobalSearchDelegate(ref));
              },
              tooltip: 'Global Search',
            ),
            PopupMenuButton<UserRole>(
              icon: const Icon(Icons.switch_account, color: AppTheme.accentNeon),
              tooltip: 'Debug Role Switcher',
              onSelected: (role) {
                ref.read(authProvider.notifier).switchRole(role);
              },
              itemBuilder: (context) => UserRole.values.map((r) => PopupMenuItem(value: r, child: Text(r.name))).toList(),
            ),
          ],
        ),
        body: screens[_currentIndex],
        bottomNavigationBar: Container(
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, -5)),
            ],
          ),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) => setState(() => _currentIndex = index),
            backgroundColor: AppTheme.surfaceDark.withValues(alpha: 0.8),
            selectedItemColor: AppTheme.accentNeon,
            unselectedItemColor: AppTheme.textSecondary,
            type: BottomNavigationBarType.fixed,
            showSelectedLabels: false,
            showUnselectedLabels: false,
            items: navItems,
          ),
        ),
      ),
    );
  }

