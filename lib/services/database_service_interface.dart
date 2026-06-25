import '../models/execom_member.dart';
import '../models/task_item.dart';

abstract class IDatabaseService {
  Future<List<ExecomMember>> getMembers();
  Future<void> addMember(ExecomMember member);
  Future<void> updateMemberPoints(String memberId, int pointsToAdd);
  Future<void> deleteMember(String memberId);
  
  Future<List<TaskItem>> getTasks();
  Future<void> addTask(TaskItem task);
  Future<void> updateTaskState(String taskId, TaskState newState);
  Future<void> deleteTask(String taskId);
  
  // Events
  Future<List<Event>> getEvents();
  Future<void> addEvent(Event event);
  Future<void> updateEvent(Event event);

  // Meetings
  Future<List<Meeting>> getMeetings();
  Future<void> addMeeting(Meeting meeting);
  Future<void> updateMeeting(Meeting meeting);

  // Resources
  Future<List<Resource>> getResources();
  Future<void> addResource(Resource resource);

  // Inventory
  Future<List<InventoryAsset>> getInventory();
  Future<void> addInventoryAsset(InventoryAsset asset);
  Future<void> updateInventoryAsset(InventoryAsset asset);

  // Admin Config Abstractions
  Future<void> updateSystemConfig(Map<String, dynamic> config);
  Future<Map<String, dynamic>> archiveTenure();

  // Faculty Abstractions
  Future<Map<String, dynamic>> fetchChapterMetrics();
  Future<List<Map<String, String>>> fetchMeetingMinutes();
}
