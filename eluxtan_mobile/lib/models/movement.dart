class Movement {
  final String id;
  final String bottleId;
  final String fromLocation;
  final String? fromLocationId;
  final String toLocation;
  final String? toLocationId;
  final String performedBy;
  final String? performedByUserId;
  final String? notes;
  final DateTime? movementDate;

  Movement({
    required this.id,
    required this.bottleId,
    required this.fromLocation,
    this.fromLocationId,
    required this.toLocation,
    this.toLocationId,
    required this.performedBy,
    this.performedByUserId,
    this.notes,
    this.movementDate,
  });

  factory Movement.fromJson(Map<String, dynamic> json) {
    return Movement(
      id: json['id'] ?? '',
      bottleId: json['bottleId'] ?? '',
      fromLocation: json['fromLocation'] ?? '',
      fromLocationId: json['fromLocationId'],
      toLocation: json['toLocation'] ?? '',
      toLocationId: json['toLocationId'],
      performedBy: json['performedBy'] ?? '',
      performedByUserId: json['performedByUserId'],
      notes: json['notes'],
      movementDate: json['movementDate'] != null 
          ? DateTime.parse(json['movementDate'].toString())
          : null,
    );
  }
}
