import 'package:uuid/uuid.dart';

enum EventStatus { upcoming, ongoing, completed }

class EventChecklistItem {
  final String id;
  final String task;
  final bool isCompleted;

  EventChecklistItem({String? id, required this.task, this.isCompleted = false})
      : id = id ?? const Uuid().v4();

  Map<String, dynamic> toJson() => {'id': id, 'task': task, 'isCompleted': isCompleted};

  factory EventChecklistItem.fromJson(Map<String, dynamic> json) => EventChecklistItem(
        id: json['id'],
        task: json['task'],
        isCompleted: json['isCompleted'] ?? false,
      );
}

class Event {
  final String id;
  final String name;
  final String description;
  final EventStatus status;
  final DateTime startDate;
  final DateTime endDate;
  final String venue;
  
  // Financials
  final double budgetAllocated;
  final double expensesIncurred;
  
  // Arrays
  final List<String> coreTeamIds;
  final List<String> volunteerIds;
  final List<EventChecklistItem> checklist;
  final List<String> documentUrls;
  final List<String> sponsorInfo;

  Event({
    String? id,
    required this.name,
    required this.description,
    this.status = EventStatus.upcoming,
    required this.startDate,
    required this.endDate,
    this.venue = '',
    this.budgetAllocated = 0.0,
    this.expensesIncurred = 0.0,
    this.coreTeamIds = const [],
    this.volunteerIds = const [],
    this.checklist = const [],
    this.documentUrls = const [],
    this.sponsorInfo = const [],
  }) : id = id ?? const Uuid().v4();

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'status': status.name,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'venue': venue,
      'budgetAllocated': budgetAllocated,
      'expensesIncurred': expensesIncurred,
      'coreTeamIds': coreTeamIds,
      'volunteerIds': volunteerIds,
      'checklist': checklist.map((c) => c.toJson()).toList(),
      'documentUrls': documentUrls,
      'sponsorInfo': sponsorInfo,
    };
  }

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'],
      name: json['name'],
      description: json['description'] ?? '',
      status: EventStatus.values.firstWhere((e) => e.name == json['status'], orElse: () => EventStatus.upcoming),
      startDate: DateTime.parse(json['startDate']),
      endDate: DateTime.parse(json['endDate']),
      venue: json['venue'] ?? '',
      budgetAllocated: (json['budgetAllocated'] ?? 0.0).toDouble(),
      expensesIncurred: (json['expensesIncurred'] ?? 0.0).toDouble(),
      coreTeamIds: List<String>.from(json['coreTeamIds'] ?? []),
      volunteerIds: List<String>.from(json['volunteerIds'] ?? []),
      checklist: (json['checklist'] as List<dynamic>?)?.map((c) => EventChecklistItem.fromJson(c)).toList() ?? [],
      documentUrls: List<String>.from(json['documentUrls'] ?? []),
      sponsorInfo: List<String>.from(json['sponsorInfo'] ?? []),
    );
  }
}
