import '../models/execom_member.dart';
import '../models/task_item.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'database_service_interface.dart';

final mockDatabaseServiceProvider = Provider<IDatabaseService>((ref) => MockDatabaseService());

class MockDatabaseService implements IDatabaseService {
  final List<ExecomMember> _members = [
    ExecomMember(
      id: 'chair-001',
      fullName: 'Alice Chairperson',
      email: 'alice@mbcet.ac.in',
      branchBatch: 'S7 CS',
      role: UserRole.chapterAdmin,
      designation: 'Chairperson',
      corePoints: 1000,
    ),
    ExecomMember(
      id: 'member-002',
      fullName: 'Bob Tech Head',
      email: 'bob@mbcet.ac.in',
      branchBatch: 'S5 CS Alpha',
      role: UserRole.execomCore,
      designation: 'Tech Coordinator',
      corePoints: 450,
    ),
    ExecomMember(
      id: 'member-003',
      fullName: 'Charlie Media',
      email: 'charlie@mbcet.ac.in',
      branchBatch: 'S5 CS Beta',
      role: UserRole.execomCore,
      designation: 'Media Head',
      corePoints: 320,
    ),
    ExecomMember(
      id: 'faculty-001',
      fullName: 'Dr. Soumya',
      email: 'soumya@mbcet.ac.in',
      branchBatch: 'Faculty',
      role: UserRole.facultyAdvisor,
      designation: 'Faculty Advisor',
      corePoints: 0,
    ),
  ];

  final List<TaskItem> _tasks = [
    TaskItem(
      id: 'task-001',
      title: 'Design App Mockups',
      description: 'Create initial figma mockups for the new mobile client.',
      assignedMemberId: 'member-003',
      targetDeadline: DateTime.now().add(const Duration(days: 3)),
      potentialPoints: 50,
      state: TaskState.inProgress,
    ),
    TaskItem(
      id: 'task-002',
      title: 'Setup Firebase Authentication',
      description: 'Implement auth with google sign in for mbcet emails.',
      assignedMemberId: 'member-002',
      targetDeadline: DateTime.now().add(const Duration(days: 1)),
      potentialPoints: 100,
      state: TaskState.underReview,
    ),
  ];

  // Members API
  Future<List<ExecomMember>> getMembers() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return List.unmodifiable(_members);
  }

  Future<void> addMember(ExecomMember member) async {
    await Future.delayed(const Duration(milliseconds: 500));
    _members.add(member);
  }

  Future<void> updateMemberPoints(String memberId, int pointsToAdd) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _members.indexWhere((m) => m.id == memberId);
    if (index != -1) {
      final updated = _members[index].copyWith(
        corePoints: _members[index].corePoints + pointsToAdd,
      );
      _members[index] = updated;
    }
  }

  // Tasks API
  Future<List<TaskItem>> getTasks() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return List.unmodifiable(_tasks);
  }

  Future<void> addTask(TaskItem task) async {
    await Future.delayed(const Duration(milliseconds: 500));
    _tasks.add(task);
  }

  Future<void> updateTaskState(String taskId, TaskState newState) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _tasks.indexWhere((t) => t.id == taskId);
    if (index != -1) {
      _tasks[index] = _tasks[index].copyWith(state: newState);
    }
  }

  // Events Mock
  final List<Event> _events = [];

  @override
  Future<List<Event>> getEvents() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _events;
  }

  @override
  Future<void> addEvent(Event event) async {
    _events.add(event);
  }

  @override
  Future<void> updateEvent(Event event) async {
    final index = _events.indexWhere((e) => e.id == event.id);
    if (index != -1) _events[index] = event;
  }

  // Meetings Mock
  final List<Meeting> _meetings = [];

  @override
  Future<List<Meeting>> getMeetings() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _meetings;
  }

  @override
  Future<void> addMeeting(Meeting meeting) async {
    _meetings.add(meeting);
  }

  @override
  Future<void> updateMeeting(Meeting meeting) async {
    final index = _meetings.indexWhere((m) => m.id == meeting.id);
    if (index != -1) _meetings[index] = meeting;
  }

  // Admin Config Abstractions
  @override
  Future<void> updateSystemConfig(Map<String, dynamic> config) async {
    await Future.delayed(const Duration(milliseconds: 300));
    // Mock save to shared preferences or secure storage
  }

  @override
  Future<Map<String, dynamic>> archiveTenure() async {
    await Future.delayed(const Duration(milliseconds: 500));
    final payload = {
      "timestamp": DateTime.now().toIso8601String(),
      "event": "TENURE_ARCHIVE",
      "records": _members.map((m) => m.toJson()).toList()
    };
    _members.clear(); // Purge state
    _tasks.clear(); // Purge tasks
    return payload;
  }

  // Faculty Abstractions
  @override
  Future<Map<String, dynamic>> fetchChapterMetrics() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return {
      "totalRegistrations": 452,
      "taskVelocity": 87,
      "pendingBudget": 12400,
      "auditVerifications": 3
    };
  }

  @override
  Future<List<Map<String, String>>> fetchMeetingMinutes() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return [
      {
        "title": "August General Assembly",
        "content": "## Minutes of Meeting\n\n- **Date:** Aug 15\n- **Attendees:** 45\n- **Agenda:** Techfest planning.\n- **Resolution:** Budget approved."
      }
    ];
  }
}
