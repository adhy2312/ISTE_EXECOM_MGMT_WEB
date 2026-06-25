import 'package:uuid/uuid.dart';

enum ResourceCategory { sop, designAsset, template, handbook, pastEventData }

class Resource {
  final String id;
  final String title;
  final String description;
  final ResourceCategory category;
  final String uploaderId;
  final String url; // URL to Google Drive, Firebase Storage, etc.
  final DateTime dateAdded;
  final bool isPublic; // True if accessible by general members

  Resource({
    String? id,
    required this.title,
    required this.description,
    required this.category,
    required this.uploaderId,
    required this.url,
    DateTime? dateAdded,
    this.isPublic = false,
  })  : id = id ?? const Uuid().v4(),
        dateAdded = dateAdded ?? DateTime.now();

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category.name,
      'uploaderId': uploaderId,
      'url': url,
      'dateAdded': dateAdded.toIso8601String(),
      'isPublic': isPublic,
    };
  }

  factory Resource.fromJson(Map<String, dynamic> json) {
    return Resource(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      category: ResourceCategory.values.firstWhere((e) => e.name == json['category'], orElse: () => ResourceCategory.handbook),
      uploaderId: json['uploaderId'],
      url: json['url'],
      dateAdded: DateTime.parse(json['dateAdded']),
      isPublic: json['isPublic'] ?? false,
    );
  }
}
