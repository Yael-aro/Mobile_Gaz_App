class Bottle {
  final String id;
  final String serialNumber;
  final String gasBrand;
  final int gasVolume;
  final String bottleType;
  final double weight;
  final String currentLocation;
  final String? locationId;
  final String status;

  Bottle({
    required this.id,
    required this.serialNumber,
    required this.gasBrand,
    required this.gasVolume,
    required this.bottleType,
    required this.weight,
    required this.currentLocation,
    this.locationId,
    required this.status,
  });

  factory Bottle.fromJson(Map<String, dynamic> json) {
    return Bottle(
      id: json['id'] ?? '',
      serialNumber: json['serialNumber'] ?? '',
      gasBrand: json['gasBrand'] ?? '',
      gasVolume: json['gasVolume'] ?? 0,
      bottleType: json['bottleType'] ?? '',
      weight: (json['weight'] ?? 0).toDouble(),
      currentLocation: json['currentLocation'] ?? '',
      locationId: json['locationId'],
      status: json['status'] ?? '',
    );
  }
}
