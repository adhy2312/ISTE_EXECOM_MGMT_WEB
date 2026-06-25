import 'package:uuid/uuid.dart';

enum AssetStatus { available, checkedOut, maintenance, lost }

class InventoryAsset {
  final String id;
  final String name;
  final String sku; // E.g., ISTE-BAN-01
  final String description;
  final AssetStatus status;
  final String? checkedOutById;
  final DateTime? expectedReturnDate;
  final String location; // E.g., CS Dept Cabinet

  InventoryAsset({
    String? id,
    required this.name,
    required this.sku,
    required this.description,
    this.status = AssetStatus.available,
    this.checkedOutById,
    this.expectedReturnDate,
    required this.location,
  }) : id = id ?? const Uuid().v4();

  InventoryAsset copyWith({
    String? id,
    String? name,
    String? sku,
    String? description,
    AssetStatus? status,
    String? checkedOutById,
    DateTime? expectedReturnDate,
    String? location,
  }) {
    return InventoryAsset(
      id: id ?? this.id,
      name: name ?? this.name,
      sku: sku ?? this.sku,
      description: description ?? this.description,
      status: status ?? this.status,
      checkedOutById: checkedOutById ?? this.checkedOutById,
      expectedReturnDate: expectedReturnDate ?? this.expectedReturnDate,
      location: location ?? this.location,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'sku': sku,
      'description': description,
      'status': status.name,
      'checkedOutById': checkedOutById,
      'expectedReturnDate': expectedReturnDate?.toIso8601String(),
      'location': location,
    };
  }

  factory InventoryAsset.fromJson(Map<String, dynamic> json) {
    return InventoryAsset(
      id: json['id'],
      name: json['name'],
      sku: json['sku'],
      description: json['description'],
      status: AssetStatus.values.firstWhere((e) => e.name == json['status'], orElse: () => AssetStatus.available),
      checkedOutById: json['checkedOutById'],
      expectedReturnDate: json['expectedReturnDate'] != null ? DateTime.parse(json['expectedReturnDate']) : null,
      location: json['location'],
    );
  }
}
