class Client {
  final String id;
  final String name;
  final String phone;
  final String? address;
  final String? email;
  final int bottlesCount;
  final List<String> activeBottles;

  Client({
    required this.id,
    required this.name,
    required this.phone,
    this.address,
    this.email,
    this.bottlesCount = 0,
    this.activeBottles = const [],
  });

  factory Client.fromJson(Map<String, dynamic> json) {
    return Client(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      address: json['address'],
      email: json['email'],
      bottlesCount: json['bottlesCount'] ?? 0,
      activeBottles: List<String>.from(json['activeBottles'] ?? []),
    );
  }
}
