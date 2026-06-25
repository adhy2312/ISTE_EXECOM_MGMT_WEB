import 'package:uuid/uuid.dart';

enum UserRole {
  chapterAdmin, // Chair/Vice
  secretary,
  treasurer,
  techHead,
  prMedia,
  execomCore,
  generalMember,
  facultyAdvisor
}

enum UserStatus { active, idle, reviewRequired }

class ExecomMember {
  final String id;
  final String fullName;
  final String email;
  final String branchBatch;
  final String department; // e.g., CS, EC
  final String contact;
  final List<String> skills;
  final String areasOfExpertise;
  final Map<String, String> socialLinks; // e.g., {'linkedin': 'url'}
  
  final UserRole role;
  final String designation; // "Tech Head", "Media", etc.
  final UserStatus activeStatus;
  final int corePoints;

  ExecomMember({
    String? id,
    required this.fullName,
    required this.email,
    required this.branchBatch,
    this.department = '',
    this.contact = '',
    this.skills = const [],
    this.areasOfExpertise = '',
    this.socialLinks = const {},
    required this.role,
    this.designation = 'General Member',
    this.activeStatus = UserStatus.active,
    this.corePoints = 0,
  }) : id = id ?? const Uuid().v4();

  ExecomMember copyWith({
    String? id,
    String? fullName,
    String? email,
    String? branchBatch,
    String? department,
    String? contact,
    List<String>? skills,
    String? areasOfExpertise,
    Map<String, String>? socialLinks,
    UserRole? role,
    String? designation,
    UserStatus? activeStatus,
    int? corePoints,
  }) {
    return ExecomMember(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      branchBatch: branchBatch ?? this.branchBatch,
      department: department ?? this.department,
      contact: contact ?? this.contact,
      skills: skills ?? this.skills,
      areasOfExpertise: areasOfExpertise ?? this.areasOfExpertise,
      socialLinks: socialLinks ?? this.socialLinks,
      role: role ?? this.role,
      designation: designation ?? this.designation,
      activeStatus: activeStatus ?? this.activeStatus,
      corePoints: corePoints ?? this.corePoints,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'email': email,
      'branchBatch': branchBatch,
      'department': department,
      'contact': contact,
      'skills': skills,
      'areasOfExpertise': areasOfExpertise,
      'socialLinks': socialLinks,
      'role': role.name,
      'designation': designation,
      'activeStatus': activeStatus.name,
      'corePoints': corePoints,
    };
  }

  factory ExecomMember.fromJson(Map<String, dynamic> json) {
    return ExecomMember(
      id: json['id'],
      fullName: json['fullName'],
      email: json['email'],
      branchBatch: json['branchBatch'],
      department: json['department'] ?? '',
      contact: json['contact'] ?? '',
      skills: List<String>.from(json['skills'] ?? []),
      areasOfExpertise: json['areasOfExpertise'] ?? '',
      socialLinks: Map<String, String>.from(json['socialLinks'] ?? {}),
      role: UserRole.values.firstWhere((e) => e.name == json['role'], orElse: () => UserRole.generalMember),
      designation: json['designation'] ?? 'General Member',
      activeStatus: UserStatus.values.firstWhere((e) => e.name == json['activeStatus'], orElse: () => UserStatus.active),
      corePoints: json['corePoints'] ?? 0,
    );
  }
}

