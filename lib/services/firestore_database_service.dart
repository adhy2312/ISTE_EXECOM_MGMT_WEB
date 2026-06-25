import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/execom_member.dart';
import '../models/task_item.dart';
import '../models/event.dart';
import '../models/meeting.dart';
import '../models/resource.dart';
import '../models/inventory_asset.dart';
import 'database_service_interface.dart';

final firestoreDatabaseServiceProvider = Provider<IDatabaseService>((ref) => FirestoreDatabaseService());

class FirestoreDatabaseService implements IDatabaseService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  @override
  Future<List<ExecomMember>> getMembers() async {
    final snapshot = await _firestore.collection('members').get();
    return snapshot.docs.map((doc) => ExecomMember.fromJson(doc.data())).toList();
  }

  @override
  Future<void> addMember(ExecomMember member) async {
    await _firestore.collection('members').doc(member.id).set(member.toJson());
  }

  @override
  Future<void> updateMemberPoints(String memberId, int pointsToAdd) async {
    await _firestore.collection('members').doc(memberId).update({
      'corePoints': FieldValue.increment(pointsToAdd),
    });
  }

  @override
  Future<void> deleteMember(String memberId) async {
    await _firestore.collection('members').doc(memberId).delete();
  }

  @override
  Future<List<TaskItem>> getTasks() async {
    final snapshot = await _firestore.collection('tasks').get();
    return snapshot.docs.map((doc) => TaskItem.fromJson(doc.data())).toList();
  }

  @override
  Future<void> addTask(TaskItem task) async {
    await _firestore.collection('tasks').doc(task.id).set(task.toJson());
  }

  @override
  Future<void> updateTaskState(String taskId, TaskState newState) async {
    await _firestore.collection('tasks').doc(taskId).update({
      'state': newState.name,
    });
  }

  @override
  Future<void> deleteTask(String taskId) async {
    await _firestore.collection('tasks').doc(taskId).delete();
  }

  // Events
  @override
  Future<List<Event>> getEvents() async {
    final snapshot = await _firestore.collection('events').get();
    return snapshot.docs.map((doc) => Event.fromJson(doc.data())).toList();
  }

  @override
  Future<void> addEvent(Event event) async {
    await _firestore.collection('events').doc(event.id).set(event.toJson());
  }

  @override
  Future<void> updateEvent(Event event) async {
    await _firestore.collection('events').doc(event.id).update(event.toJson());
  }

  // Meetings
  @override
  Future<List<Meeting>> getMeetings() async {
    final snapshot = await _firestore.collection('meetings').get();
    return snapshot.docs.map((doc) => Meeting.fromJson(doc.data())).toList();
  }

  @override
  Future<void> addMeeting(Meeting meeting) async {
    await _firestore.collection('meetings').doc(meeting.id).set(meeting.toJson());
  }

  @override
  Future<void> updateMeeting(Meeting meeting) async {
    await _firestore.collection('meetings').doc(meeting.id).update(meeting.toJson());
  }

  // Resources
  @override
  Future<List<Resource>> getResources() async {
    final snapshot = await _firestore.collection('resources').get();
    return snapshot.docs.map((doc) => Resource.fromJson(doc.data())).toList();
  }

  @override
  Future<void> addResource(Resource resource) async {
    await _firestore.collection('resources').doc(resource.id).set(resource.toJson());
  }

  // Inventory
  @override
  Future<List<InventoryAsset>> getInventory() async {
    final snapshot = await _firestore.collection('inventory').get();
    return snapshot.docs.map((doc) => InventoryAsset.fromJson(doc.data())).toList();
  }

  @override
  Future<void> addInventoryAsset(InventoryAsset asset) async {
    await _firestore.collection('inventory').doc(asset.id).set(asset.toJson());
  }

  @override
  Future<void> updateInventoryAsset(InventoryAsset asset) async {
    await _firestore.collection('inventory').doc(asset.id).update(asset.toJson());
  }

  // Admin Config Abstractions
  @override
  Future<void> updateSystemConfig(Map<String, dynamic> config) async {
    await _firestore.collection('config').doc('system').set(config, SetOptions(merge: true));
  }

  @override
  Future<Map<String, dynamic>> archiveTenure() async {
    // In a real app, this would trigger a Cloud Function or complex batch move.
    // We simulate by returning a snapshot map.
    final snapshot = await _firestore.collection('members').get();
    final records = snapshot.docs.map((doc) => doc.data()).toList();
    
    return {
      "timestamp": DateTime.now().toIso8601String(),
      "event": "TENURE_ARCHIVE_FIRESTORE",
      "records": records
    };
  }

  // Faculty Abstractions (Mocked for now as metrics require Cloud Functions aggregations)
  @override
  Future<Map<String, dynamic>> fetchChapterMetrics() async {
    final snapshot = await _firestore.collection('config').doc('metrics').get();
    if (snapshot.exists) {
      return snapshot.data()!;
    }
    return {
      "totalRegistrations": 0,
      "taskVelocity": 0,
      "pendingBudget": 0,
      "auditVerifications": 0
    };
  }

  @override
  Future<List<Map<String, String>>> fetchMeetingMinutes() async {
    final snapshot = await _firestore.collection('meetings').get();
    return snapshot.docs.map((doc) {
      final data = doc.data();
      return {
        "title": data['title']?.toString() ?? 'Meeting',
        "content": data['content']?.toString() ?? ''
      };
    }).toList();
  }
}
