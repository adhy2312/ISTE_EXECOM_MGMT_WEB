import 'package:uuid/uuid.dart';

enum TaskState { pending, inProgress, underReview, completed, blocked }
enum TaskPriority { low, medium, high, critical }

class TaskComment {
  final String id;
  final String authorId;
  final String content;
  final DateTime timestamp;

  TaskComment({
    String? id,
    required this.authorId,
    required this.content,
    DateTime? timestamp,
  }) : id = id ?? const Uuid().v4(),
       timestamp = timestamp ?? DateTime.now();

  Map<String, dynamic> toJson() => {
    'id': id,
    'authorId': authorId,
    'content': content,
    'timestamp': timestamp.toIso8601String(),
  };

  factory TaskComment.fromJson(Map<String, dynamic> json) => TaskComment(
    id: json['id'],
    authorId: json['authorId'],
    content: json['content'],
    timestamp: DateTime.parse(json['timestamp']),
  );
}

class TaskItem {
  final String id;
  final String title;
  final String description;
  final String creatorId; // New
  final String assignedMemberId;
  final DateTime targetDeadline;
  final int potentialPoints;
  final TaskState state;
  
  // Advanced Task Fields
  final TaskPriority priority;
  final int progressPercentage;
  final List<TaskComment> comments;
  final List<String> attachmentUrls;

  TaskItem({
    String? id,
    required this.title,
    required this.description,
    this.creatorId = '',
    required this.assignedMemberId,
    required this.targetDeadline,
    required this.potentialPoints,
    this.state = TaskState.pending,
    this.priority = TaskPriority.medium,
    this.progressPercentage = 0,
    this.comments = const [],
    this.attachmentUrls = const [],
  }) : id = id ?? const Uuid().v4();

  TaskItem copyWith({
    String? id,
    String? title,
    String? description,
    String? creatorId,
    String? assignedMemberId,
    DateTime? targetDeadline,
    int? potentialPoints,
    TaskState? state,
    TaskPriority? priority,
    int? progressPercentage,
    List<TaskComment>? comments,
    List<String>? attachmentUrls,
  }) {
    return TaskItem(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      creatorId: creatorId ?? this.creatorId,
      assignedMemberId: assignedMemberId ?? this.assignedMemberId,
      targetDeadline: targetDeadline ?? this.targetDeadline,
      potentialPoints: potentialPoints ?? this.potentialPoints,
      state: state ?? this.state,
      priority: priority ?? this.priority,
      progressPercentage: progressPercentage ?? this.progressPercentage,
      comments: comments ?? this.comments,
      attachmentUrls: attachmentUrls ?? this.attachmentUrls,
    );
  }

  bool get isOverdue {
    return state != TaskState.completed && DateTime.now().isAfter(targetDeadline);
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'creatorId': creatorId,
      'assignedMemberId': assignedMemberId,
      'targetDeadline': targetDeadline.toIso8601String(),
      'potentialPoints': potentialPoints,
      'state': state.name,
      'priority': priority.name,
      'progressPercentage': progressPercentage,
      'comments': comments.map((c) => c.toJson()).toList(),
      'attachmentUrls': attachmentUrls,
    };
  }

  factory TaskItem.fromJson(Map<String, dynamic> json) {
    return TaskItem(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      creatorId: json['creatorId'] ?? '',
      assignedMemberId: json['assignedMemberId'],
      targetDeadline: DateTime.parse(json['targetDeadline']),
      potentialPoints: json['potentialPoints'],
      state: TaskState.values.firstWhere((e) => e.name == json['state'], orElse: () => TaskState.pending),
      priority: TaskPriority.values.firstWhere((e) => e.name == json['priority'], orElse: () => TaskPriority.medium),
      progressPercentage: json['progressPercentage'] ?? 0,
      comments: (json['comments'] as List<dynamic>?)?.map((c) => TaskComment.fromJson(c)).toList() ?? [],
      attachmentUrls: List<String>.from(json['attachmentUrls'] ?? []),
    );
  }
}

