import 'package:uuid/uuid.dart';

class MeetingActionItem {
  final String id;
  final String description;
  final String assignedToId; // Could map to ExecomMember.id
  final String? linkedTaskId; // Maps to TaskItem.id if auto-converted
  final bool isCompleted;

  MeetingActionItem({
    String? id,
    required this.description,
    this.assignedToId = '',
    this.linkedTaskId,
    this.isCompleted = false,
  }) : id = id ?? const Uuid().v4();

  Map<String, dynamic> toJson() => {
    'id': id,
    'description': description,
    'assignedToId': assignedToId,
    'linkedTaskId': linkedTaskId,
    'isCompleted': isCompleted,
  };

  factory MeetingActionItem.fromJson(Map<String, dynamic> json) => MeetingActionItem(
    id: json['id'],
    description: json['description'],
    assignedToId: json['assignedToId'] ?? '',
    linkedTaskId: json['linkedTaskId'],
    isCompleted: json['isCompleted'] ?? false,
  );
}

class Meeting {
  final String id;
  final String title;
  final DateTime date;
  final String agenda;
  final List<String> attendedMemberIds;
  final List<String> discussionPoints;
  final List<MeetingActionItem> actionItems;
  final String meetingMinutesMarkdown;

  Meeting({
    String? id,
    required this.title,
    required this.date,
    this.agenda = '',
    this.attendedMemberIds = const [],
    this.discussionPoints = const [],
    this.actionItems = const [],
    this.meetingMinutesMarkdown = '',
  }) : id = id ?? const Uuid().v4();

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'date': date.toIso8601String(),
      'agenda': agenda,
      'attendedMemberIds': attendedMemberIds,
      'discussionPoints': discussionPoints,
      'actionItems': actionItems.map((a) => a.toJson()).toList(),
      'meetingMinutesMarkdown': meetingMinutesMarkdown,
    };
  }

  factory Meeting.fromJson(Map<String, dynamic> json) {
    return Meeting(
      id: json['id'],
      title: json['title'],
      date: DateTime.parse(json['date']),
      agenda: json['agenda'] ?? '',
      attendedMemberIds: List<String>.from(json['attendedMemberIds'] ?? []),
      discussionPoints: List<String>.from(json['discussionPoints'] ?? []),
      actionItems: (json['actionItems'] as List<dynamic>?)?.map((a) => MeetingActionItem.fromJson(a)).toList() ?? [],
      meetingMinutesMarkdown: json['meetingMinutesMarkdown'] ?? '',
    );
  }
}
